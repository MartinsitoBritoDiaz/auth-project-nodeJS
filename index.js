const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jsonWebToken = require('jsonwebtoken');
const { expressjwt: jwt} = require('express-jwt');
const User = require('./user');

mongoose.connect('mongodb+srv://martinsitobd:RwbBI8ZIdZFB12jy@cluster0.4qe63.mongodb.net/auth?retryWrites=true&w=majority');

const app = express();

app.use(express.json());
const signToken = _id => jsonWebToken.sign({ _id }, process.env.SECRET);

//Middleware for validating a jwt
const validatedJwt = jwt( {secret: process.env.SECRET, algorithms: ['HS256'] });

//End Point to register
app.post('/register', async (req, res) => {
    const { body } = req;
    console.log({ body });

    try{
        const isUser = await User.findOne({ email: body.email });
        
        if(isUser){
            return res.status(403).send('User is already created');
        }

        const salt = await bcrypt.genSalt();
        const hashed = await bcrypt.hash(body.password, salt);
        const user = await User.create( { email:body.email, password: hashed, salt });
        
        const signed = signToken(user._id);
        
        res.status(201).send(signed);

    }catch(err){
        console.log(err);
        res.status(500).send(err.message);
    }
});

//End Point to login
app.post('/login', async (req,res) => {
    const { body } = req;
    const user = await User.findOne( {email: body.email});

    if(!user){
        res.status(403).send('User and password not found');
    }else {
        const isMatch = await bcrypt.compare(body.password, user.password);

        if(isMatch){
            const signed = signToken(user._id);
            res.status(200).send(signed);
        }else{
            res.status(403).send('User and password not found');
        }
    }

    try{

    }catch(err){
        res.status(500).send(err.message);
    }
});

const findAndAssignUser =  async (req, res, next) => {
    try{
        const user = await User.findById(req.auth);

        if(!user){
            return res.status(401).end();
        }

        req.user = user;
        next();
    }catch(e){
        next(e);
    }
}

const isAuthenticated = express.Router().use(validatedJwt, findAndAssignUser);

//End point 
app.get('/main', isAuthenticated, (req, res, next) => {
    res.send(req.user);
});


app.listen(3000, () =>{
    console.log('Listening in port 3000');
})