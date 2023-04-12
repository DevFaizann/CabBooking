const User = require('../models/user');
const jwt = require('jsonwebtoken');
const bcrypt = require("bcrypt");
const logger = require('../logger');
const _ = require('lodash');


//@desc Register a User
const registerUser = async (req,res) => {
    try{

        logger.info("inside registerUser");

        const {name, email, password, phoneNumber, role, licenseNumber, carModel, carNumber} = req.body;
        
        if(_.isEmpty(name) || _.isEmpty(email) || _.isEmpty(password) ||  _.isEmpty(phoneNumber) || _.isEmpty(role)){
            logger.error(`All fields are mandatory. Error: ${error.message}`);
            res.status(400).send({error: "All fields are mandatory"});
            return;
        }
        
        const userAvailable = await User.findOne({email});
        if(!_.isEmpty(userAvailable)){
            logger.error(`User with ${email} already registered`);
            res.status(400).send({error: "User already registerd"});
            return;
        }
        
        const hashedPassword = await bcrypt.hash(password,10);
        logger.info(`Password hashed successfully for user with email: ${email}`);
        
        const user = await User.create({
            name,
            email,
            password: hashedPassword,
            phoneNumber,
            role,
            licenseNumber,
            carModel,
            carNumber
        });
        
        if(user){
            logger.info(`User created successfully: ${user}`);
            return res.status(201).json({_id: user.id, email: user.email});

  
        }
        else{
            logger.error("User data is not valid");
            return res.status(400).send({error: "User data is not valid"});
        }


    }catch(error){
        logger.error(`error in userRegistration ${error.message}`);
        res.status(500).json({message: 'Server error'});
    }
};



//@desc Login a User
const loginUser =  async(req,res) => {
    try{

        logger.info("inside loginUser");

          const {email,password} = req.body;
          if(_.isEmpty(email) || _.isEmpty(password)){
              logger.error(`All fields are mandatory. Error: ${error.message}`);
              res.status(400).send({error:"All fields are mandatory"});
              return;
          }
          
          const user = await User.findOne({email});

          //new code here
          if(user.isDeleted) {
            return res.status(404).json({message: "Credentials not found. User deleted"});
          }

          //new code here
          
          //compare password with hashed password
          //user.password is the hashed password from db
          if(user && (await bcrypt.compare(password, user.password))){
              const accessToken = jwt.sign({
                  user:{
                      name: user.name,
                      email: user.email,
                      phoneNumber: user.phoneNumber,
                      role: user.role,
                      id: user.id,
                  },
              }, process.env.ACCESS_TOKEN_SECRET,
              {
                  expiresIn: "24h"
              });
              logger.info("ACCESS TOKEN successfully generated")
              res.status(200).json({accessToken});
              return;
          } 
          else{
              logger.error(`Email or Password is not valid. Error: ${error.message}`)
              res.status(401).send({error: "Email or Password is not valid"})
          }
        } catch(err)  {
            logger.error('Error in User login');
            res.status(500).json({message: 'server error'});
        }
};



//@desc Reset Password
const resetPassword = async (req, res) => {
  try {

    logger.info('Inside resetPassword');
    const { currentPassword, newPassword } = req.body;
    const { id, email } = req.user;

    // Check if email and password are provided
    if (_.isEmpty(currentPassword) || _.isEmpty(newPassword)) {
      logger.error('All fields are required');
      res.status(400).send({ error: 'All fields are required' });
      return;
    }

    // Check if user with email exists
    const user = await User.findOne({ email });
    if (!user) {
      logger.error(`User with email ${email} not found`);
      res.status(404).send({ error: `User with email ${email} not found` });
      return;
    }

    if(currentPassword == newPassword){
      return res.status(401).json({ error: "New Password cannot be same as Current Password" });
    }

    const passwordMatch = await bcrypt.compare(currentPassword, user.password);
    if (!passwordMatch) {
      return res.status(401).json({ error: "Current password is incorrect" });
    }

    // Hash the new password and update it in the database
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    logger.info(`New Password hashed successfully for user with email: ${email}`);
    const updatedUser = await User.findOneAndUpdate(
      { _id: id },
      { password: hashedPassword },
      { new: true }
    );

    return res.status(200).json(updatedUser);
    logger.info('Password reset successfully');
  } catch (error) {
    logger.error(`Error in resetPassword: ${err.message}`);
    return res.status(500).json({ error: "Server error" });
  }
};

module.exports = {registerUser, loginUser, resetPassword};