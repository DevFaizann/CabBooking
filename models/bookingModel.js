const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({

    booking_id: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true,
        type: String,
    },

    statusTransition:[

    {
        pickup_location: {

            latitude: {
                type: mongoose.Schema.ObjectId,
                required: true,
            },

            longitude: {
                type: mongoose.Schema.ObjectId,
                required: true,
            },

            address: {
                type: String,
                required: true,
            },
        },

        dropoff_location: {
            latitude: {
                type: mongoose.Schema.ObjectId,
                required: true,
            },
            longitude: {
                type: mongoose.Schema.ObjectId,
                required: true,
            },
            address: {
                type: String,
                required: true,
            },
        }
    }
],

    isDeleted: {
        type: Boolean,
        required: true,
    },

    booking_status: {
        type: String,
        required: true,
        default: available,
    }
},
{
    timestamps: true
});

module.exports = mongoose.model("Booking", bookingSchema);