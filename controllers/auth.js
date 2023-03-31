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


//@desc Register a Driver
// const registerDriver = async(req, res) => {
//   try{

//     logger.info("inside registerDriver");

//         const {
//         name,
//         email,
//         password,
//         phone_number,
//         license_number,
//         car_model,
//         car_number
//       } = req.body;

//       if(_.isEmpty(name) || 
//         _.isEmpty(email) || 
//         _.isEmpty(password) ||  
//         _.isEmpty(phone_number) || 
//         _.isEmpty(license_number) ||
//         _.isEmpty(car_model) ||
//         _.isEmpty(car_number)){

//             logger.error(`All fields are mandatory. Error: ${error.message}`);
//             res.status(400).send({error: "All fields are mandatory"});
//             return;
//         }

//         const driverAvailable = await Driver.findOne({email});
//         if(!_.isEmpty(driverAvailable)){
//             logger.error(`Driver with ${email} already registered`);
//             res.status(400).send({error: "Driver already registerd"});
//             return;
//         }
        
//         const hashedPassword = await bcrypt.hash(password,10);
//         logger.info(`Password hashed successfully for driver with email: ${email}`);
        
//         const driver = await Driver.create({
//             name,
//             email,
//             password: hashedPassword,
//             phone_number,
//             license_number,
//             car_number,
//             car_model,
//         });
        
//         if(driver){
//             logger.info(`Driver created successfully: ${driver}`);
//             return res.status(201).json({_id: driver.id, email: driver.email});
//         }
//         else{
//             logger.error("Driver data is not valid");
//             return res.status(400).send({error: "Driver data is not valid"});
//         }
//     }catch(error){
//         logger.error(`error in registerDriver ${error.message}`);
//         res.status(500).json({message: 'Server error'});
//     }

//   }

//@desc Login a Driver
// const loginDriver = async(req,res) => {
//     try{

//         logger.info("inside loginDriver");

//           const {email,password} = req.body;
//           if(_.isEmpty(email) || _.isEmpty(password)){
//               logger.error(`All fields are mandatory. Error: ${error.message}`);
//               res.status(400).send({error:"All fields are mandatory"});
//               return;
//           }
          
//           const driver = await Driver.findOne({email});
          
//           //compare password with hashed password
//           //user.password is the hashed password from db
//           if(driver && (await bcrypt.compare(password, driver.password))){
//               const accessToken = jwt.sign({
//                   user:{
//                       name: driver.name,
//                       email: driver.email,
//                       phone_number: driver.phone_number,
//                       license_number: driver.license_number,
//                       car_number: driver.car_number,
//                       car_model: driver.car_model, 
//                       id: driver.id,
//                   },
//               }, process.env.ACCESS_TOKEN_SECRET,
//               {
//                   expiresIn: "14m"
//               });
//               logger.info("ACCESS TOKEN successfully generated")
//               res.status(200).json({accessToken});
//               return;
//           } 
//           else{
//               logger.error(`Email or Password is not valid. Error: ${error.message}`)
//               res.status(401).send({error: "Email or Password is not valid"})
//           }
//         } catch(err)  {
//             logger.error('Error in Driver login');
//             res.status(500).json({message: 'server error'});
//         }
// };



//@desc Reset Password
const resetPassword = async (req, res) => {
  try {

    logger.info('Inside resetPassword');
    const { email, currentPassword, newPassword } = req.body;

    // Check if email and password are provided
    if (_.isEmpty(email) || _.isEmpty(currentPassword) || _.isEmpty(newPassword)) {
      logger.error('Email and Passwords are required');
      res.status(400).send({ error: 'Email and Password are required' });
      return;
    }

    // Check if user with email exists
    const user = await User.findOne({ email });
    if (!user) {
      logger.error(`User with email ${email} not found`);
      res.status(404).send({ error: `User with email ${email} not found` });
      return;
    }

    const passwordMatch = await bcrypt.compare(currentPassword, user.password);
    if (!passwordMatch) {
      return res.status(401).json({ error: "Current password is incorrect" });
    }

    // Hash the new password and update it in the database
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    logger.info(`New Password hashed successfully for user with email: ${email}`);
    const updatedUser = await User.findOneAndUpdate(
      { email },
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