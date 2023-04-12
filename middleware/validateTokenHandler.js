const jwt = require("jsonwebtoken");
const logger = require('../logger');
const _ = require('lodash');

const validateToken = async (req, res, next) => {

  logger.info("Inside validateToken");

  try{

  let token;
  let authHeader = req.headers.Authorization || req.headers.authorization;

  if (authHeader && authHeader.startsWith("Bearer")) {
    token = authHeader.split(" ")[1];
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
      if (err) {
        logger.error("User is not authorized");
        res.status(401).send({error:"User is not authorized"});
      } else{
            // console.log("decoded.user", decoded.user);
            req.user = decoded.user;
            next();
          }
    });

  } else{
    logger.error("User is not authorized or token is missing in the header");
      res.status(401).send({error: "User is not authorized or token is missing in the header"});

  }

} catch(error) {
    logger.error(`Error in validateToken: ${error.message}`);
    res.status(500).json({
      message : 'Server error',
    });
  }

  };


const verifyTokenAndAuthorization = (req, res, next) => {

  logger.info("Inside verifyTokenAndAuthorization");

  try{

  validateToken(req, res, () => {
    if(req.user.id || req.driver.id === req.query.id || req.user.isAdmin){
      next();
    } else{
      res.status(403).json("You are not allowed to do that!");
    }
  })
}
 catch(error) {
    logger.error(`Error in verifyTokenAndAuthorization: ${error.message}`);
    res.status(500).json({
      message : 'Server error',
    });
  }
}


const verifyTokenAndAuthorizationQuery = (req, res, next) => {
  logger.info("Inside verifyTokenAndAuthorizationQuery");

  try{

  validateToken(req, res, () => {
    const userIdFromToken = req.user.id;
    const userIdFromQuery = req.query.id || userIdFromToken;


    if (userIdFromToken === userIdFromQuery || req.user.isAdmin) {
      req.userId = userIdFromQuery;
      next();
    } else {
      res.status(403).json("You are not allowed to do that!");
    }
  });

}
  catch(error) {
      logger.error(`Error in verifyTokenAndAuthorizationQuery: ${error.message}`);
      res.status(500).json({
        message : 'Server error',
      });
    }
};



const verifyTokenAndAdmin = (req, res, next) => {
  logger.info("Inside verifyTokenAndAdmin");

  try{

  validateToken(req, res, () => {
    // console.log("req.user in validateTokenandAdmin", req.user);
    if(req.user){
      if(req.user.role === "admin"){
        next();
      } else{
        res.status(403).json("You are not the admin")
      }

    } else{
      res.status(401).json("Unauthorized");
    }
    
  });
} catch(error) {
    logger.error(`Error in createBooking: ${error.message}`);
    res.status(500).json({
      message : 'Server error',
    });
  }
};

module.exports = {validateToken, verifyTokenAndAuthorization, verifyTokenAndAdmin, verifyTokenAndAuthorizationQuery};
