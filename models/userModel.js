const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({

    email: {
        type: String,
        required: [true, "Please add the user email address"],
        unique: [true,"Email address already taken"]
    },

    password: {
        type: String,
        required: [true, "Please add the password"],
    },

    first_name: {
        type: String,
        required: [true, "Please add the password"],
    },

    last_name: {
        type: String,
        required: [true, "Please add the password"],
    },

    phone_number: {
        type: String,
        required: [true, "Please add the password"],
    }
},
{
    timestamps: true
});

module.exports = mongoose.model("User", userSchema);