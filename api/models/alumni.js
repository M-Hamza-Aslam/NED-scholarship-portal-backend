const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const alumniSchema = new Schema({
    firstName: {
        type: String,
        required: true,
    },
    lastName: {
        type: String,
        required: true,
    },
    userRole: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
    },
    password: {
        type: String,
        required: true,
    },
    phoneNumber: {
        type: String,
        required: true,
    },
    profileImg: {
        type: String,
    },
    profileStatus: {
        type: Number,
        required: true,
    },
    personalInfo: {
        type: Object,
        required: true,
    },
    isVerified: {
        type: Boolean,
        required: true,
    },
    verificationCode: String,
    verificationCodeExpiration: Date,
    resetToken: String,
    resetTokenExpiration: Date,
});

module.exports = mongoose.model("Alumni", alumniSchema);
