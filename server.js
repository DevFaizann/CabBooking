const express = require('express');
const connectDb = require('./config/dbConnection');
const cors = require("cors")
const axios = require('axios');
const path = require('path');
const dotenv = require('dotenv').config();
const logger = require('./logger');

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

var PUBLISHABLE_KEY = 'pk_test_51Mq8vQSIegHdIc97QAIMGPnaoeQHWDOJ93BOCVlBATrpCSJz8kuW62wEb12uk1RWKUxYmVuP6CHnm8llXbCq4MGL00ceVJOPI5'
// var STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY
axios.defaults.baseURL = process.env.GOOGLE_MAPS_API_URL


connectDb();

const app = express();

const port = process.env.PORT || 5000;

app.use(cors());

app.use(express.static(path.join(__dirname, 'views')));
// app.set("view engine", "ejs")

app.use(express.json());

app.use("/api/v1/user", require("./routes/user"));
app.use("/api/v1/auth", require("./routes/auth"));
app.use("/api/v1/booking", require("./routes/booking"));
app.use("/api/v1/distance", require("./routes/location"));
app.use("/api/v1/address", require("./routes/location"));

app.listen(port, () => {
    logger.info(`Server runnning on port ${port}`);
});


app.post("/payment", async (req, res) => {
    const { product } = req.body;
    const session = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        line_items: [
            {
                price_data: {
                    currency: "inr",
                    product_data: {
                        name: product.name,
                        images: [product.image],
                    },
                    unit_amount: product.amount * 100,
                },
                quantity: product.quantity,
            },
        ],
        mode: "payment",
        success_url: `http://localhost:5001/success.html`,
        cancel_url: `http://localhost:5001/cancel.html`,
    });

    res.json({ id: session.id });
});
