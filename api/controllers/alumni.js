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
const randomatic = require("randomatic");
const nodemailer = require("nodemailer");
const sendgridTransport = require("nodemailer-sendgrid-transport");
const transporter = nodemailer.createTransport(
  sendgridTransport({
    auth: {
      api_key: process.env.SendsGrid_API_Key,
    },
  })
);
const crypto = require("crypto");

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
          userId: alumniDetails._id.toString(),
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
        isVerified: alumniDetails.isVerified,
      };
      res.status(200).json({
        message: "Login successful",
        userDetails: alumniData,
        userId: alumniDetails._id.toString(),
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
          userId: alumniDetails._id.toString(),
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
        userDetails: alumniData,
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
  emailVerification: async (req, res) => {
    try {
      //finding user
      const userId = req.userId;
      const alumni = await Alumni.findById(userId);
      if (!alumni) {
        return res.status(401).json({
          message: "Alumni not found",
        });
      }
      //creating 4-digit verification code
      const emailVerificationCode = randomatic("0", 4);
      //saving code in database
      alumni.verificationCode = emailVerificationCode;
      alumni.verificationCodeExpiration = new Date().getTime() + 900000;
      await alumni.save();
      //sending verification code inside email
      transporter.sendMail(
        {
          to: alumni.email,
          from: "hamza.prolink@gmail.com",
          subject: "Email Verification",
          html: `
    <p>Have you requested for Email Verification ?</p>
    <p>Here is your code: ${emailVerificationCode} </p>
    <p>Remember it is valid for 15 minutes only!</p>
`,
        },
        (err) => {
          console.log(err);
        }
      );
      res.status(201).json({
        message: "Verification Code has been sent to Email!",
      });
    } catch (error) {
      console.log(error);
      res.status(400).json({
        message: error.message,
      });
    }
  },
  verifyCode: async (req, res, next) => {
    try {
      const userId = req.userId;
      const code = req.body.code;
      //extracting user
      const alumni = await Alumni.findById(userId);
      if (!alumni) {
        return res.status(401).json({
          message: "Alumni not found",
        });
      }
      //checking code
      if (
        code !== alumni.verificationCode ||
        new Date().getTime() >= alumni.verificationCodeExpiration
      ) {
        return res.status(401).json({
          message: "invalid verification code",
        });
      }
      //updating databse
      alumni.isVerified = true;
      alumni.verificationCode = undefined;
      alumni.verificationCodeExpiration = undefined;
      await alumni.save();

      res.status(201).json({
        message: "Your account has been verified!",
      });
    } catch (error) {
      res.status(400).json({
        message: error.message,
      });
    }
  },
  getLoginData: async (req, res) => {
    try {
      const userDetails = await Alumni.findById(req.userId);
      if (!userDetails) {
        return res.status(404).json({ message: "Alumni not found" });
      }

      const token = jwt.sign(
        {
          userId: userDetails._id.toString(),
          userRole: userDetails.userRole,
          expiration: Date.now() + 3600000,
        },
        process.env.JWT_SecretKey,
        { expiresIn: "1h" }
      );

      const userData = {
        email: userDetails.email,
        firstName: userDetails.firstName,
        lastName: userDetails.lastName,
        phoneNumber: userDetails.phoneNumber,
        profileStatus: userDetails.profileStatus,
        userRole: userDetails.userRole,
        profileImg: userDetails.profileImg,
        isVerified: userDetails.isVerified,
      };
      res.status(200).json({
        message: "User Credentials fetched successfully",
        userDetails: userData,
        userId: userDetails._id.toString(),
        token: token,
      });
    } catch (error) {
      console.log(error);
      res.status(500).json({
        message: "Internal server error",
      });
    }
  },
  //For student forget password
  forgotPassword: async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(422).json({ errors: errors.array() });
      }
      const alumni = await Alumni.findOne({ email: req.body.email });
      if (!alumni) {
        return res.status(401).json({
          message: "alumni not found",
        });
      }
      crypto.randomBytes(32, async (err, buf) => {
        if (err) {
          throw new Error("token generation failed");
        } else {
          const token = buf.toString("hex");
          alumni.resetToken = token;
          alumni.resetTokenExpiration = Date.now() + 3600000;
          await alumni.save();
          //sending Email
          transporter.sendMail(
            {
              to: req.body.email,
              from: "hamza.prolink@gmail.com",
              subject: "Reset Password",
              html: `
          <p>Have you requested for resetting your password ?</p>
          <p>Click this <a href="http://localhost:3000/auth/reset-password/${token}" >Link</a>  to reset your password</p>
        `,
            },
            (err) => {
              console.log(err);
            }
          );
          res.status(200).json({
            message:
              "Reset password link has been sent to your provided Email!",
          });
        }
      });
    } catch (error) {
      res.status(400).json({
        message: error.message,
      });
    }
  },

  //For student reset password
  resetPassword: async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(422).json({ errors: errors.array() });
      }
      const token = req.body.token;
      const alumni = await Alumni.findOne({
        resetToken: token,
        resetTokenExpiration: { $gt: Date.now() },
      });
      if (!alumni) {
        return res.status(401).json({
          message: "alumni not found",
        });
      }
      const newPassword = req.body.newPassword;
      const newHashedPassword = await bcrypt.hash(newPassword, 10);
      alumni.password = newHashedPassword;
      alumni.resetToken = undefined;
      alumni.resetTokenExpiration = undefined;
      await alumni.save();
      res.status(201).json({
        message: "Password has been updated successfully!",
      });
    } catch (error) {
      res.status(400).json({
        message: error.message,
      });
    }
  },
};
