const winston = require('winston');
//creating new instance of logger using createLogger() method
const logger = winston.createLogger({
    level: 'info',
    format: winston.format.json(),
    transports:[
        new winston.transports.Console(), //logs messages to the console
        new winston.transports.File({filename: 'error.log', level:'error'}),//logs error messages to a file named error.log
        new winston.transports.File({filename: 'combined.log'}),//logs all messages to a file named combined.log

    ],
});

module.exports = logger;