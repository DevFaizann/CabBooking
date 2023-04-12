const jwt = require('jsonwebtoken');
const _ = require('lodash');
const logger = require('../logger');

const decodeAccessToken = async(req, res) => {
	try{

		logger.info('Inside decodeAccessToken');

		let bearerToken = req.headers.Authorization || req.headers.authorization;

		if(_.isEmpty(bearerToken)){
			return res.status(401).json({error: "Bearer token is required"});
		}

		const accessToken = bearerToken.split(' ')[1];

		const decoded = await jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET);

		logger.info('AccessToken successfully decoded');
		res.status(200).json({decoded});
		return;

	} catch(error){
		  logger.error(`Error in decodeAccessToken: ${error.message}`);
		  return res.status(401).json({
		    error : 'Invalid access token',
		  });
		

	}
}

module.exports = {decodeAccessToken};