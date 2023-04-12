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
			dropoffLocation
		} = req.body;		

		const pickupGeocode = await geocodeAddress(pickupLocation);
		const dropoffGeocode = await geocodeAddress(dropoffLocation);
	
	
		if(_.isEmpty(dropoffLocation) || _.isEmpty(pickupLocation)) {
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

		    const driver = await User.findById(driverId);

		    // const { longitude, latitude } = req.body;
		    await User.findByIdAndUpdate(driverId, {
		    	location: {
		    		type: 'Point',
		    		coordinates: [72.8184519, 18.9528049]
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

		 const distanceData = await getDistance(pickupLocation, dropoffLocation);
	
		 const booking = await Booking.create({
		 	user: userId,
		 	driver:driverId,
		 	pickupLocation: pickupGeocode,
		 	dropoffLocation: dropoffGeocode,
		 	fare: 266,
		 	bookingStatus: "Available",
		 	distance: distanceData.distance,
		 	duration: distanceData.duration
		 });
	
		  // await User.findByIdAndUpdate(userId, {
		  // 	$push: {
		  // 		currentBooking: booking._id
		  // 	},
		  // });
	
		  logger.info(`New booking created with id: ${booking.id}`);
		  res.status(201).json({booking,
			distance: distanceData.distance,
			duration: distanceData.duration
			});

	} catch(error) {
	  logger.error(`Error in createBooking: ${error.message}`);
	  res.status(500).json({
	  	message : 'Server error',
	  });
	}
};


const getDistance = async (pickupLocation, dropoffLocation) => {
	try{
		logger.info("Calculating the distance between pickup and dropoff location");

		const origins = encodeURIComponent(pickupLocation);
		const destinations = encodeURIComponent(dropoffLocation);
		const units = "imperial";
		const apiKey = process.env.GOOGLE_MAPS_API_KEY;

		const url = `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${origins}&destinations=${destinations}&units=${units}&key=${apiKey}`;

		const response = await axios.get(url);

		if (response.data.status === "OK") {
					const result = response.data.rows[0].elements[0];
					const distance = result.distance.text;
					const duration = result.duration.text;
					return { distance, duration };
				} else {
					logger.error(`Failed to calculate distance. Error: ${response.data.status}`);
				}
	} catch(error) {
		logger.error(`Error in getDistance: ${error.message}`);
		res.status(500).json({
			message: 'Server Error',
		});
	}
}

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