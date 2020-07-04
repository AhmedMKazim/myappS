var express = require('express');
var router = express.Router();
const User = require('../models/User.model');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { registerValidation, loginValidation } = require('../validation');
const randomstring = require("randomstring");
const EmialHash = require('../models/emailHash.model');

const sendEmail = (to, subject, text) => {
    const from = process.env.email;
    const pass = process.env.password;
    const nodemailer = require('nodemailer'),
          transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: from,
        pass
      }
    }),
    
    mailOptions = {
      from,
      to,
      subject,
      text
    };
    
    transporter.sendMail(mailOptions, function(error, info){
      if (error) {
        console.log('email send error', error);
      } else {
        console.log('Email sent: ' + info.response);
      }
    });
  };
router.post('/register', async (req, res, next) => {
    
    if(registerValidation(req.body).error) return res.status(400).json({error: registerValidation(req.body).error.details[0].message});

    // check email in database
    const emailExist = await User.findOne({email: req.body.email});
    if (emailExist) return res.status(400).json({error: 'Email already exists'});

    // Hash passwords
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(req.body.password, salt);
    // create new user
    const user = new User({
        username: req.body.username,
        email: req.body.email,
        phone: req.body.phone,
        password: hashedPassword
    });
    const activeCode = randomstring.generate({
        length: 24,
        charset: user.email
      });
      const emailHash = new EmialHash({
        email: user.email,
        activeCode
      });
    try {
        const savedUser = await user.save();
        const savedEmailHash = await emailHash.save();

        sendEmail(user.email, 'registeration in' + process.env.APPNAME,
        'hello if you are registered in ' + process.env.APPNAME + 'follow this link: ' + process.env.SERVERURL + 'api/auth/active?code=' + savedEmailHash.activeCode);
        res.send(savedUser);
    } catch (error) {
        res.status(400);
    }
});

router.post('/login', async (req, res, next) => {
    if(loginValidation(req.body).error) return res.status(400).json({error: loginValidation(req.body).error.details[0].message});

    // check email in database
    const user = await User.findOne({email: req.body.email});
    if (!user) return res.status(400).json({error: "Email or password is wrong"});
    
    // check password is correct
    const validPass = await bcrypt.compare(req.body.password, user.password);
    if (!validPass) return res.status(400).json({error: "Email or password is wrong"});
    
    // Create and assign a token
    const token = jwt.sign({data: user}, process.env.TOKEN_SECRET);
    res.header('auth-token', token).json({token});
});

router.get('/active', async (req, res) => {
    const activeCode = req.query.code;
    const emailHash = await EmialHash.findOne({activeCode});
    if (!emailHash) return res.status(400).json({error: "Active code is wrong"});
    const user = await User.findOne({email: emailHash.email});
    user.active = true;
    await user.save();
    emailHash.remove();
    res.json({message: 'Your email "' + emailHash.email + '" is Active now'});
});

module.exports = router;
