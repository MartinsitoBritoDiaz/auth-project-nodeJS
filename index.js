const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const expressJwt = require('express-jwt');
const User = require('./user');

mongoose.connect('mongodb+srv://martinsitobd:RwbBI8ZIdZFB12jy@cluster0.4qe63.mongodb.net/auth?retryWrites=true&w=majority');

const app = express();

app.use(express.json());

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

        res.send( { _id: user._id } );

    }catch(err){
        console.log(err);
        res.status(500).send(err.message);
    }
});


app.listen(3000, () =>{
    console.log('Listening in port 3000');
})