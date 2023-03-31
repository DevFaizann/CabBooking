const _ = require('lodash');
const logger = require('../logger');
const axios = require('axios');

axios.defaults.baseURL = process.env.GOOGLE_MAPS_API_URL

//@desc Address Predictions
const addressPredictions = async(req, res) => {
	try{

		logger.info("inside addressPredictions");

		if(
		   req.params.address === null ||
		   req.params.address === ''||
		   req.params.address === 'null'
		   ) return ''

			let data = await axios.get(
				'place/autocomplete/json' +
				'?input=' + req.params.address +
				'&types=address' +
				'&key=' + process.env.GOOGLE_MAPS_API_KEY
				)

		res.status(200).json(data.data.predictions)

	} catch(error){
		logger.error(`error`);
		console.log(error);
	}

}


//@desc Distance 
const distance = async(req, res) => {
	try{

		logger.info("inside distance api");

			let data = await axios.get(
				'distancematrix/json' +
				'?origins=' + req.params.pickup +
				'&destinations=' + req.params.destination +
				'&units=imperial' +
				'&key=' + process.env.GOOGLE_MAPS_API_KEY
				)

		res.status(200).json(data.data)

	} catch(error){
		logger.error(`error`);
		console.log(error);
	}

}

module.exports = {addressPredictions, distance};