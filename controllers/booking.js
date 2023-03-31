const Booking = require('../models/booking');
const User = require('../models/user');
const jwt = require('jsonwebtoken');
const bcrypt = require("bcrypt");
const logger = require('../logger');
const _ = require('lodash');
const axios = require('axios');
const nodemailer = require('nodemailer');

//@desc Create a Booking
const createBooking = async (req,res) => {
	try{
		const {
			pickupLocation,
			dropoffLocation,
			fare,
			bookingStatus
		} = req.body;

		
	
		// console.log("req.body:", req.body);

		const pickupGeocode = await geocodeAddress(pickupLocation);
		const dropoffGeocode = await geocodeAddress(dropoffLocation);
	
	
		if(_.isEmpty(dropoffLocation) || _.isEmpty(pickupLocation) || _.isEmpty(fare) || _.isEmpty(bookingStatus)) {
			logger.error(`All fields are mandatory. Error: ${error.message}`);
			res.status(400).send({
				error: "All fields are mandatory"
			});
			return;
		}
		const userId = req.query.userId;
		const driverId = req.query.driverId;



		if (!userId || !driverId) {
		      logger.error(`Both user and driver IDs are required. Error: ${error.message}`);
		      res.status(404).send({ error: `User with ID ${userId} not found` });
		      return;
		    }

		//     console.log("user: ", user);

		    const driver = await User.findById(driverId);

		    const { longitude, latitude } = req.body;
		    await User.findByIdAndUpdate(driverId, {
		    	location: {
		    		type: 'Point',
		    		coordinates: [longitude, latitude]
		    	}
		    });

		    const driversWithin2km = await User.find({
		    	_id: driverId,
		    	location: {
		    		$near: {
		    			$geometry: {
		    				type: "Point",
		    				coordinates: [pickupGeocode.longitude, pickupGeocode.latitude],

		    			},
		    			$maxDistance: 2000,
		    		},
		    	},
		    });

		    if(driversWithin2km.length === 0){
		    	
		    	logger.info(`No drivers availble within 2km of range of pickup location: ${pickupGeocode.address}`);

		    	res.status(404).send({
		    		bookingStatus: "Failed",
		    		pickupLocation: {
		    			latitude: pickupGeocode.latitude,
		    			longitude: pickupGeocode.longitude
		    		}
		    	});

		    	return;
		    	
		    } else {
		    	logger.info(`Found ${driversWithin2km.length} drivers within 2 km of range of pickup location: ${pickupGeocode.address}`);
		    	//send notification to driver
		    	sendEmail();
		    };
	
		 const booking = await Booking.create({
		 	user: userId,
		 	driver:driverId,
		 	pickupLocation: pickupGeocode,
		 	dropoffLocation: dropoffGeocode,
		 	fare,
		 	bookingStatus
		 });

		 console.log("booking ", booking);
	
		  await User.findByIdAndUpdate(userId, {
		  	$push: {
		  		currentBooking: booking._id
		  	},
		  });
	
		  logger.info(`New booking created with id: ${booking.id}`);
		  res.status(201).json(booking);
	} catch(error) {
	  logger.error(`Error in createBooking: ${error.message}`);
	  res.status(500).json({
	  	message : 'Server error',
	  });
	}
};



async function geocodeAddress(address) {
	const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
    address)}&key=${process.env.GOOGLE_MAPS_API_KEY}`;

    const response = await axios.get(url);

    if(response.data.status === "OK"){
    	const result = response.data.results[0];
    	return {
    		latitude: result.geometry.location.lat,
    		longitude: result.geometry.location.lng,
    		address: result.formatted_address,
    	};
    } else {
    	throw new Error(`Geocoding error: ${response.data.status}`);
    }
}
// const { id: userId } = req.user;
		// const userId = req.user.id;
		// const user = await User.findById(userId);
	
		// if (_.isEmpty(user)) {
		//   logger.error(`User with id ${userId} not found`);
		//   res.status(404).send({ error: `User with id ${userId} not found` });
		//   return;
		// }
	
		// const booking = new Booking({
		// 	user_id: userId,
		// 	pickup_location,
		// 	dropoff_location,
		// 	fare,
		// 	booking_status,
		// });
		// const savedBooking = await booking.save();
	
		
	
		// logger.info(`New booking created with id: ${savedBooking.id}`);
		// res.status(201).json(savedBooking);
		// const user = await User.findById(userId);
		// user.booking_history.push(savedBooking._id);	
	// });
  // const token = req.headers.authorization.split(' ')[1];
		  // const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
	
		  // console.log("decodedToken:", decodedToken);
	
		  // const userId = decodedToken.id;

//@desc Get Bookings By ID
const getBookings = async (req,res) => {
	try{
		logger.info('Inside getBookingsByID');

		const bookings = await Booking.find({user : req.user.id});
		if(_.isEmpty(bookings)){
			logger.error("No bookings found.");
			res.status(404).send({error: "No bookings found"})
		}

		res.send({bookings});

	} catch(error){
		logger.error(`Error in getBookings: ${error.message}`);
	}
	

};

//Send Email to driver nearby
const sendEmail = () => {
      const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'faizanmansuri316@gmail.com',
        pass: 'eejevistvviuzqjn'
      }
    });

    const mailOptions= {
      from:'faizanmansuri316@gmailcom',
      to: "faizanmansuri.work@gmail.com",
      subject:"Mail from nodeJS",
      text: "There are passengers nearby!"
    };

    transporter.sendMail(mailOptions, function(error, info){
      if(error){
        console.log(error);
      } else{
        logger.info("Email Sent", + info.response);
      }
    });

  }



//@desc Get All Bookings (ADMIN only)
const getAllBookings = async(req, res) => {
	try{

		logger.info('Inside getAllBookings');

		const bookings = await Booking.find().populate('user driver');
		res.status(200).json({bookings});


	} catch(error){

		logger.error(`Error in getAllBookings: ${error.message}`);
		res.status(500).json({
			message: 'Server Error',
		});
	}
};

module.exports = {createBooking, getBookings, getAllBookings};