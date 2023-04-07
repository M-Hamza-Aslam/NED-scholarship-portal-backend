const { validationResult } = require("express-validator");

const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const User = require("../modules/user");

const nodemailer = require("nodemailer");
const sendgridTransport = require("nodemailer-sendgrid-transport");

const transporter = nodemailer.createTransport(
  sendgridTransport({
    auth: {
      api_key: process.env.SendsGrid_API_Key,
    },
  })
);

module.exports = {
  login: async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(422).json({ errors: errors.array() });
      }
      const { email, password, userRole } = req.body;

      const userDetails = await User.findOne({
        email: email,
        userRole: userRole,
      });

      if (!userDetails) {
        return res.status(401).json({
          message: "User not found",
        });
      }

      const isMatch = await bcrypt.compare(password, userDetails.password);

      if (!isMatch) {
        return res.status(401).json({
          message: "Invalid password",
        });
      }

      const token = jwt.sign(
        { userId: userDetails._id.toString(), userRole: userDetails.userRole },
        process.env.JWT_SecretKey,
        { expiresIn: "1h" }
      );

      res.status(200).json({
        message: "Login successful",
        userDetails,
        userId: userDetails._id.toString(),
        token: token,
      });
    } catch (error) {
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
      const existingUser = await User.findOne({ email: email });

      if (existingUser) {
        return res.status(409).json({
          message: "User with this email already exists",
        });
      }
      //Password encription
      const hashedPassword = await bcrypt.hash(password, 10);

      // Creating a new user document
      const newUser = new User({
        firstName,
        lastName,
        email,
        password: hashedPassword,
        phoneNumber,
        userRole: "student",
      });
      const result = await newUser.save();

      // Returning success message
      res.status(201).json({
        message: "User created successfully",
        userDetails: result,
      });
    } catch (error) {
      res.status(400).json({
        message: error.message,
      });
    }
  },
  forgotPassword: async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(422).json({ errors: errors.array() });
      }
      const user = await User.findOne({ email: req.body.email });
      if (!user) {
        return res.status(401).json({
          message: "User not found",
        });
      }
      crypto.randomBytes(32, async (err, buf) => {
        if (err) {
          throw new Error("token generation failed");
        } else {
          const token = buf.toString("hex");
          user.resetToken = token;
          user.resetTokenExpiration = Date.now() + 3600000;
          await user.save();
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
  resetPassword: async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(422).json({ errors: errors.array() });
      }
      const token = req.body.token;
      const user = await User.findOne({
        resetToken: token,
        resetTokenExpiration: { $gt: Date.now() },
      });
      if (!user) {
        return res.status(401).json({
          message: "User not found",
        });
      }
      const newPassword = req.body.newPassword;
      const newHashedPassword = await bcrypt.hash(newPassword, 10);
      user.password = newHashedPassword;
      user.resetToken = undefined;
      user.resetTokenExpiration = undefined;
      await user.save();
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
