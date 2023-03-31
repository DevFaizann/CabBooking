const User = require('../models/user');
const jwt = require('jsonwebtoken');
const CryptoJS = require("crypto-js");
const logger = require('../logger');
const _ = require('lodash');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);


// @desc User Profile
const getUserProfile = async(req, res) => {
    
    logger.info("inside getUserProfile");

    try{

        let queryParam = {};

        if(req.query.id){
            queryParam={_id: req.query.id};

        } else if(req.query.email){
            queryParam = {email: req.query.email};

        } else{
            logger.error('Either id or email is required to get the user info');
            return res.status(400).json({message: 'Either id or email is required to get the user info'});
        }
        // const userId = req.query.id;
        // console.log(userId);
        const user = await User.findOne(queryParam);
        // console.log(user);

        if(!user){
            return res.status(404).json({message: "User not found"});
        }
        logger.info('User info retrieved successfully');
        res.status(200).json(user);
    } catch(err){
        res.status(500).json(err);
    }
};

// @desc User Profiles
const getAllUsers = async(req, res) => {
    
    logger.info("inside getAllUsers");

    try{
        const { page = 1, limit = 10, name, role } = req.query;


        const filter = {};

        if (name) {
            filter.name = { $regex: name, $options: 'i' };
          }

          if(role){
            filter.role = role;
          }


        const users = await User.find(filter)
        .limit(limit)
        .skip((page - 1) * limit)
        .sort({createdAt: -1})
        .lean()
        .exec();

        const count = await User.countDocuments(filter);

        const totalPages = Math.ceil(count / limit);

        res.status(200).json({users, totalPages, currentPage: +page});
    } catch(err){
        logger.error(error);
        res.status(500).json(err);
    }

}


//@desc Update Profile By Admin
const updateProfileByAdmin = async(req, res) => {

    logger.info('Inside updateProfile');

        try{
            const updatedUser = await User.findByIdAndUpdate(
                req.query.id, 
                {
                    $set: req.body,
                }, 
                {new: true}
            );

            res.status(200).json(updatedUser);

        } catch(err){
            res.status(500).json(err);
        }
          
}

//@desc Update Profile By User
const updateProfileByUser = async(req, res) => {

    logger.info('Inside updateProfile');

        try{

            const user = await User.findById(req.query.id);
            if(_.isEmpty(user)){
                logger.error('User not found')
                res.status(404).json({message: "User not found"});
            }

            if(req.body.role && req.body.role === "admin"){
                return res.status(403).json({message:"You cannot be admin."})

            }

            const updatedUser = await User.findByIdAndUpdate(
                req.query.id, 
                {
                    $set: {
                        name: req.body.name,
                        email: req.body.email,
                        phone_number: req.body.phone_number
                    }
                }, 
                {new: true}
            );

            res.status(200).json(updatedUser);

        } catch(err){
            res.status(500).json({message: "Internal server error"});
        }
          
}

//@desc Delete Profile
const deleteUser = async(req, res) => {
    try{
        //new code here
        const user = await User.findByIdAndDelete(req.params.id)

        if(_.isEmpty(user)){
            return res.status(404).json({message: "User not found"});
        }

        user.isDeleted = true;
        await user.save();

        //new code here
        
        res.status(200).json("User has been deleted")
    } catch (err){
        logger.error(error);
        res.status(500).json(err);
    }
}

//@desc Booking History
//not in use
const bookingHistory = async(req,res) => {
    try{
        logger.info('Inside bookingHistory');

        const userId = req.params.userId;
        const user = await User.findById(userId).populate('booking_history');
        // const booking = await Booking.findById(userId).populate('booking_history');
        // if(!user){
        //     logger.error('User not found');
        //     res.status(404).json({error: "User not found"});
        // }
        if(_.isEmpty(booking)){
            logger.error('No such booking!');
            res.status(404).json({error: "Booking not found"});
        }
        res.status(200).json(user.booking_history);
    } catch(error) {
      logger.error(`Error in bookingHistory: ${error.message}`);
      res.status(500).json({
        message : 'Server error'
      });
    }
}

//@desc Payment api
const processPayment = async(req, res) => {
    // try{

    //     logger.info("inside processPayment");

    //     const {amount, token, bookingId} = req.body;

    //     if(_.isEmpty(amount) || _.isEmpty(token) || _.isEmpty(bookingId)){
    //         logger.error("All fields are mandatory");
    //         res.status(400).send({
    //             error: "All fields are mandatory"
    //         });
    //         return;
    //     }

    //     const charge = await stripe.charges.create({
    //         amount: amount,
    //         currency: "inr",
    //         source: token.id,
    //     });

    //     res.status(200).json({message: "Payment processed successfully", charge});

    //     await Booking.findByIdAndUpdate(
    //         bookingId,
    //         {booking_status: "paid"},
    //         {new: true}
    //         );

    // } catch(error) {
    //     logger.error(error);
    //     res.status(500).json({error: "Payment processing failed"});
    // }

    stripe.charges.create({
        source: req.body.tokenId,
        amount: req.body.amount,
        currency: "inr",
    },
    (stripeErr, stripeRes) => {
        if(stripeErr){
            res.status(500).json(stripeErr);
        } else {
            res.status(200).json(stripeRes);
        }
    }

    )
};



module.exports = {
    bookingHistory, 
    processPayment, 
    deleteUser, 
    updateProfileByAdmin, 
    updateProfileByUser, 
    getUserProfile, 
    getAllUsers
};