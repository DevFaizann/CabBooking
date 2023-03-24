const asyncHandler = require('express-async-handler');
const User = require('../models/userModel');
const jwt = require('jsonwebtoken');
const bcrypt = require("bcrypt");
const logger = require('../logger');

//@desc Register a User
//@route POST /api/v1/users/register
//@access public
const registerUser = asyncHandler(async (req,res) => {
    const {email, password, first_name, last_name, phone_number} = req.body;
    
    if(!email || !password || !first_name || !last_name || !phone_number){
        logger.error("Please fill the mandatory fields");
        res.status(400).send({error: "All fields are mandatory"});
        return;
    }
    
    const userAvailable = await User.findOne({email});
    if(userAvailable){
        logger.error(`User with ${email} already registered`);
        res.status(400).send({error: "User already registerd"});
        return;
    }
    
    const hashedPassword = await bcrypt.hash(password,10);
    logger.info(`Password hashed successfully for user with email: ${email}`);
    
    const user = await User.create({
        email,
        password: hashedPassword,
        first_name,
        last_name,
        phone_number,
    });
    
    if(user){
        logger.info(`User created successfully: ${user}`);
        return res.status(201).json({_id: user.id, email: user.email});
    }
    else{
        logger.error("User data is not valid");
        return res.status(400).send({error: "User data is not valid"});
    }
});


//@desc Login a User
//@route POST /api/v1/users/login
//@access public
const loginUser = asyncHandler(async(req,res) => {
    const {email,password} = req.body;
    if(!email || !password){
        logger.error("All fields are mandatory");
        res.status(400).send({error:"All fields are mandatory"});
        return;
    }
    
    const user = await User.findOne({email});
    
    //compare password with hashed password
    //user.password is the hashed password from db
    if(user && (await bcrypt.compare(password, user.password))){
        const accessToken = jwt.sign({
            user:{
                email: user.email,
                id: user.id,
            },
        }, process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn: "14m"
        });
        logger.info("ACCESS TOKEN successfully generated")
        res.status(200).json({accessToken});
        return;
    } 
    else{
        logger.error("Email or Password is not valid")
        res.status(401).send({error: "Emal or Password is not valid"})
    }
});


//@desc User Profile
//@route GET /api/v1/users/profile
//@access private
const userProfile = asyncHandler(async(req, res) => {
    res.json(req.user);
});

module.exports = {registerUser, loginUser, userProfile};