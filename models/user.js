const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({

    name: {
        type: String,
        required: [true, "Please add your Name"],
        trim: true
    },
    email: {
        type: String,
        required: [true, "Please add the user email address"],
        unique: [true,"Email address already taken"],
        trim: true
    },

    password: {
        type: String,
        required: [true, "Please add the password"],
        trim: true,
    },

    phoneNumber: {
        type: String,
        required: [true, "Please add Phone Number"],
        trim: true
    },

    role: {
        type: String,
        required: true,
        default: 'user',
        enum: ['admin', 'user', 'driver'],
    },

    licenseNumber: {
        type: String,
        trim: true
    },

    carModel: {
        type: String,
        trim: true
    },

    carNumber: {
        type: String,
        trim: true
    },

    isDeleted: {
        type: Boolean,
        default: false
    },

    isAvailable: {
        type: Boolean,
        default: false
    },

    currentBooking: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Booking'
    },

    location: {
        type: {
            type: String,
            enum: ['Point']
        },
        coordinates: {
            type: [Number] //lat and long
        }
    },

},
{
    timestamps: true
});

// Index the location field for geospatial queries
userSchema.index({ location: '2dsphere' });

module.exports = mongoose.model("User", userSchema);


// currentBooking: {
    //     type: mongoose.Schema.Types.ObjectId,
    //     ref: 'Booking'
    // }

    // bookingHistory: [
    //     {
    //         type: mongoose.Schema.Types.ObjectId,
    //         ref: 'Booking'
    //     }

    // ]