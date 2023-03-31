const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({

    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },

    driver: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },

    pickupLocation: {
        address: {
            type: String,
            required: true
        },

        latitude: {
            type: Number 
        },

        longitude: {
            type: Number  
        },
    },

    dropoffLocation: {
        address: {
            type: String,
            required: true,
        },

        latitude: {
            type: Number,    
        },

        longitude: {
            type: Number,    
        },
    },


    fare: {
        type: String,
        required: true,
    },

    bookingStatus: {
        type: String,
        required: true,
        default: 'available',
    }
},
{
    timestamps: true
});

module.exports = mongoose.model("Booking", bookingSchema);

//     statusTransition:[

//     {
//         pickup_location: {

//             latitude: {
//                 type: mongoose.Schema.ObjectId,
//                 required: true,
//             },

//             longitude: {
//                 type: mongoose.Schema.ObjectId,
//                 required: true,
//             },

//             address: {
//                 type: String,
//                 required: true,
//             },
//         },

//         dropoff_location: {
//             latitude: {
//                 type: mongoose.Schema.ObjectId,
//                 required: true,
//             },
//             longitude: {
//                 type: mongoose.Schema.ObjectId,
//                 required: true,
//             },
//             address: {
//                 type: String,
//                 required: true,
//             },
//         }
//     }
// ],

// booking_id: {
    //     type: mongoose.Schema.ObjectId,
    //     ref: 'User',
    //     // required: true,
    // },