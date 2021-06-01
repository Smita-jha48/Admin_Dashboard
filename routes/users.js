const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const passport = require('passport');

//User Model
const User = require('../models/User');
const { route } = require('.');
//login
router.get('/login',(req,res)=> res.render('signin'));
//register
router.get('/register',(req,res)=> res.render('signup'));

//register handle
router.post('/register', (req, res)=> {
    const {name, email, password} = req.body;
    let errors = [];
    //check 
    if (!name || !email || !password ) {
        errors.push({ msg: 'Please enter all fields' });
      }
    //check pass length
    if(password.length < 6) {
        errors.push({msg: 'Passowrd should be atleast 6 charcs'});
    }
    const l =errors.length;
    if(errors.length > 0){
        res.render('signup',{
            errors,
            name,
            email,
            password
        });
     } else {
            //Validate passed
            User.findOne({ email: email})
            .then(user => {
                if(user) {
                    //user exist
                    errors.push({msg: 'Email is already registered'})
                    res.render('signup',{
                        errors,
                        name,
                        email,
                        password
                    });
                }
                else{
                      const newUser = new User({
                      name,
                      email,
                      password
                      });
                      //Hash Password
                      bcrypt.genSalt(10, (err,salt) =>
                      bcrypt.hash(newUser.password, salt, (err,hash)=>{
                      if(err) throw err;
                      //Set Password to hashed
                      newUser.password = hash;
                      //Save user
                      newUser.save()
                      .then(user => {
                          req.flash('success_msg','You are now registered and can login');
                          res.redirect('/users/login');
                      })
                      .catch(err => console.log(err));
                      
                      
                      })
                      );
                }
            });

        }
    
});

//Login Handle
router.post('/login',(req,res,next)=>{
    passport.authenticate('local',{
        successRedirect: '/dashboard',
        failureRedirect: '/users/login',
        failureFlash: true
    })(req,res,next);

});

module.exports = router;