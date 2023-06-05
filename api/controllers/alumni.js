const Alumni = require("../models/alumni");
// const Scholarship = require("../models/scholarship");
// const User = require("../models/user");

const { validationResult } = require("express-validator");
// const { getContentType } = require("../../util/contentType");
// const { createReadStream } = require("fs");
// const { default: mongoose } = require("mongoose");

const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
// const path = require("path");
// const fs = require("fs");
// const PDFDocument = require("pdfkit");

module.exports = {
    //For alumni login
    login: async (req, res) => {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(422).json({ errors: errors.array() });
            }
            const { email, password, userRole } = req.body;

            const alumniDetails = await Alumni.findOne({
                email: email,
                userRole: userRole,
            });

            if (!alumniDetails) {
                return res.status(401).json({
                    message: "Alumni not found",
                });
            }

            const isMatch = await bcrypt.compare(password, alumniDetails.password);

            if (!isMatch) {
                return res.status(401).json({
                    message: "Invalid password",
                });
            }

            const token = jwt.sign(
                {
                    adminId: alumniDetails._id.toString(),
                    userRole: alumniDetails.userRole,
                    expiration: Date.now() + 3600000,
                },
                process.env.JWT_SecretKey,
                { expiresIn: "1h" }
            );
            const alumniData = {
                email: alumniDetails.email,
                firstName: alumniDetails.firstName,
                lastName: alumniDetails.lastName,
                phoneNumber: alumniDetails.phoneNumber,
                userRole: alumniDetails.userRole,
            };
            res.status(200).json({
                message: "Login successful",
                alumniDetails: alumniData,
                adminId: alumniDetails._id.toString(),
                token: token,
            });
        } catch (error) {
            console.log(error);
            res.status(500).json({
                message: "Internal server error",
            });
        }
    },
    signUp: async (req, res) => {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(422).json({
                    errors: errors.array(),
                });
            }
            const { firstName, lastName, email, password, phoneNumber } = req.body;

            // Check if user already exists with this email
            const existingAlumni = await Alumni.findOne({ email: email });

            if (existingAlumni) {
                return res.status(409).json({
                    message: "Alumni with this email already exists",
                });
            }
            //Password encription
            const hashedPassword = await bcrypt.hash(password, 10);

            // Creating a new alumni document
            const newAlumni = new Alumni({
                firstName,
                lastName,
                email,
                password: hashedPassword,
                isVerified: false,
                phoneNumber,
                userRole: "alumni",
                profileStatus: 0,
                profileImg: "",
                personalInfo: { isInitial: true },
            });
            const alumniDetails = await newAlumni.save();

            //creating token
            const token = jwt.sign(
                {
                    alumniId: alumniDetails._id.toString(),
                    userRole: alumniDetails.userRole,
                    expiration: Date.now() + 3600000,
                },
                process.env.JWT_SecretKey,
                { expiresIn: "1h" }
            );

            const alumniData = {
                email: alumniDetails.email,
                firstName: alumniDetails.firstName,
                lastName: alumniDetails.lastName,
                phoneNumber: alumniDetails.phoneNumber,
                profileStatus: alumniDetails.profileStatus,
                userRole: alumniDetails.userRole,
                profileImg: alumniDetails.profileImg,
            };

            // Returning success message
            res.status(201).json({
                message: "Alumni created successfully, please verify your Email!",
                alumniDetails: alumniData,
                userId: alumniDetails._id.toString(),
                token: token,
            });
        } catch (error) {
            console.log(error);
            res.status(400).json({
                message: error.message,
            });
        }
    },
};
