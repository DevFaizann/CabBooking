const express = require('express');
const connectDb = require('./config/dbConnection');
const errorHandler = require('./middleware/errorHandler')
const dotenv = require('dotenv').config();
const logger = require('./logger');

connectDb();

const app = express();

const port = process.env.PORT || 5000;

app.use(express.json());
app.use("/api/v1/users", require("./routes/userRoutes"));
app.use(errorHandler);

app.listen(port, () => {
    logger.info(`Server runnning on port ${port}`);
});