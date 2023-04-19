const { validationResult } = require("express-validator");
const path = require("path");
const fs = require("fs");
const { createReadStream } = require("fs");

const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const { getContentType } = require("../../util/contentType");
const User = require("../models/user");
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
  //For student login
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
      };

      res.status(200).json({
        message: "Login successful",
        userDetails: userData,
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
        profileStatus: 0,
        profileImg: "",
        personalInfo: { isInitial: true },
        familyDetails: { isInitial: true },
        education: {
          educationalDetails: [],
          documents: [],
        },
        dependantDetails: [],
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

  //For student forget password
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

  //For student reset password
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
  getLoginData: async (req, res) => {
    try {
      const userDetails = await User.findById(req.userId);
      if (!userDetails) {
        return res.status(404).json({ message: "User not found" });
      }
      const userData = {
        email: userDetails.email,
        firstName: userDetails.firstName,
        lastName: userDetails.lastName,
        phoneNumber: userDetails.phoneNumber,
        profileStatus: userDetails.profileStatus,
        userRole: userDetails.userRole,
        profileImg: userDetails.profileImg,
      };
      res.status(200).json({
        message: "User Credentials fetched successfully",
        userDetails: userData,
        userId: userDetails._id.toString(),
      });
    } catch (error) {
      console.log(error);
      res.status(500).json({
        message: "Internal server error",
      });
    }
  },
  updatePersonalInfo: async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        console.log(errors.array());
        return res.status(422).json({ errors: errors.array() });
      }
      const { firstName, lastName, phoneNumber, personalInfo } = req.body;

      const user = await User.findById(req.userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      if (user.personalInfo.isInitial) {
        user.profileStatus += 25;
        user.personalInfo.isInitial = false;
      }
      //update info
      user.firstName = firstName;
      user.lastName = lastName;
      user.phoneNumber = phoneNumber;
      user.personalInfo = { isInitial: false, ...personalInfo };
      const updatedUser = await user.save();
      res.status(201).json({
        message: "Personal information updated",
        updatedUserData: {
          personalInfo: updatedUser.personalInfo,
          profileStatus: updatedUser.profileStatus,
        },
      });
    } catch (error) {
      console.log(error);
      res.status(500).json({
        message: "Internal server error",
      });
    }
  },

  updateFamilyDetails: async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        console.log(errors.array());
        return res.status(422).json({ errors: errors.array() });
      }
      const { familyDetails } = req.body;

      const user = await User.findById(req.userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      if (user.familyDetails.isInitial) {
        user.profileStatus += 25;
        user.familyDetails.isInitial = false;
      }
      //update info
      user.familyDetails = { isInitial: false, ...familyDetails };
      const updatedUser = await user.save();
      res.status(201).json({
        message: "Family details updated",
        updatedUserData: {
          familyDetails: updatedUser.familyDetails,
          profileStatus: updatedUser.profileStatus,
        },
      });
    } catch (error) {
      console.log(error);
      res.status(500).json({
        message: "Internal server error",
      });
    }
  },
  updateEducationDetails: async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        console.log(errors.array());
        return res.status(422).json({ errors: errors.array() });
      }
      const { educationData, index } = req.body;

      const user = await User.findById(req.userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      //update database
      if (user.education.educationalDetails.length === 0) {
        user.education.educationalDetails = [educationData];
        user.profileStatus = user.profileStatus + 15;
      } else if (index === -1) {
        user.education.educationalDetails.unshift(educationData);
      } else {
        user.education.educationalDetails[index] = educationData;
      }
      const updatedUser = await user.save();
      const education = {
        hasFetched: true,
        ...updatedUser.education,
      };
      res.status(201).json({
        message: "educational details updated",
        updatedUserData: {
          education,
          profileStatus: updatedUser.profileStatus,
        },
      });
    } catch (error) {
      console.log(error);
      res.status(500).json({
        message: "Internal server error",
      });
    }
  },

  updateDependantDetails: async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        console.log(errors.array());
        return res.status(422).json({ errors: errors.array() });
      }
      const { dependantData, index } = req.body;

      const user = await User.findById(req.userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      //update database
      if (user.dependantDetails.length === 0) {
        user.dependantDetails = [dependantData];
        user.profileStatus = user.profileStatus + 25;
      } else if (index === -1) {
        user.dependantDetails.unshift(dependantData);
      } else {
        user.dependantDetails[index] = dependantData;
      }
      const updatedUser = await user.save();
      res.status(201).json({
        message: "dependant details updated",
        updatedUserData: {
          dependantDetails: {
            hasFetched: true,
            dependantDetailsArr: updatedUser.dependantDetails,
          },
          profileStatus: updatedUser.profileStatus,
        },
      });
    } catch (error) {
      console.log(error);
      res.status(500).json({
        message: "Internal server error",
      });
    }
  },
  getPersonalInfo: async (req, res, next) => {
    try {
      //finding user from database
      const user = await User.findById(req.userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      //sending data to front-end
      let personalInfo;
      if (!user.personalInfo) {
        personalInfo = {};
      }
      personalInfo = user.personalInfo;
      res.status(200).json({
        userData: {
          personalInfo: personalInfo,
          profileStatus: user.profileStatus,
        },
      });
    } catch (error) {
      console.log(error);
      res.status(500).json({
        message: "Internal server error",
      });
    }
  },
  getFamilyDetails: async (req, res) => {
    try {
      //finding user from database
      const user = await User.findById(req.userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      //extracting data
      let familyDetails;
      if (!user.familyDetails) {
        familyDetails = {};
      }
      familyDetails = user.familyDetails;
      //sending data to front-end
      res.status(200).json({
        userData: {
          familyDetails,
          profileStatus: user.profileStatus,
        },
      });
    } catch (error) {
      console.log(error);
      res.status(500).json({
        message: "Internal server error",
      });
    }
  },
  getEducationalDetails: async (req, res) => {
    try {
      //finding user from database
      const user = await User.findById(req.userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      //sending data to front-end
      const education = {
        hasFetched: true,
        ...user.education,
      };
      res.status(200).json({
        userData: {
          education,
          profileStatus: user.profileStatus,
        },
      });
    } catch (error) {
      console.log(error);
      res.status(500).json({
        message: "Internal server error",
      });
    }
  },
  getDependantDetails: async (req, res) => {
    try {
      //finding user from database
      const user = await User.findById(req.userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      //sending data to front-end
      let dependantDetails = {
        hasFetched: true,
        dependantDetailsArr: [],
      };
      if (user.dependantDetails) {
        dependantDetails.dependantDetailsArr = user.dependantDetails;
      }
      res.status(200).json({
        userData: {
          dependantDetails: dependantDetails,
          profileStatus: user.profileStatus,
        },
      });
    } catch (error) {
      console.log(error);
      res.status(500).json({
        message: "Internal server error",
      });
    }
  },
  deleteEducationalDetails: async (req, res) => {
    try {
      //finding user from database
      const user = await User.findById(req.userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      //deleteing education
      const { index } = req.body;
      user.education.educationalDetails.splice(index, 1);
      if (user.education.educationalDetails.length === 0) {
        user.profileStatus -= 15;
      }
      const updatedUser = await user.save();
      //sending response
      const education = {
        hasFetched: true,
        ...updatedUser.education,
      };
      res.status(201).json({
        message: "educational details deleted",
        updatedUserData: {
          education,
          profileStatus: updatedUser.profileStatus,
        },
      });
    } catch (error) {
      console.log(error);
      res.status(500).json({
        message: "Internal server error",
      });
    }
  },
  deleteDependantDetails: async (req, res) => {
    try {
      //finding user from database
      const user = await User.findById(req.userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      //deleteing depandant
      const { index } = req.body;
      user.dependantDetails.splice(index, 1);
      if (user.dependantDetails.length === 0) {
        user.profileStatus -= 25;
      }
      const updatedUser = await user.save();
      res.status(201).json({
        message: "dependant details deleted",
        updatedUserData: {
          dependantDetails: {
            hasFetched: true,
            dependantDetailsArr: updatedUser.dependantDetails,
          },
          profileStatus: updatedUser.profileStatus,
        },
      });
    } catch (error) {
      console.log(error);
      res.status(500).json({
        message: "Internal server error",
      });
    }
  },
  uploadProfileImg: async (req, res) => {
    try {
      const image = req.file;
      if (!image) {
        return res.status(415).json({
          message: "Invalid File",
        });
      }
      const user = await User.findById(req.userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      if (user.profileImg !== "") {
        // Remove image from the file storage
        fs.unlink(user.profileImg, function (err) {
          if (err) {
            console.error(err);
          } else {
            console.log("File deleted successfully");
          }
        });
      }
      const imageUrl = image.path.replace(/\\/g, "/");
      user.profileImg = imageUrl;
      const updatedUser = await user.save();
      res.status(201).json({
        message: "file Uploaded",
        profileImg: updatedUser.profileImg,
      });
    } catch (error) {
      console.log(error);
      res.status(500).json({
        message: "Internal server error",
      });
    }
  },
  sendProfileImg: async (req, res) => {
    try {
      const user = await User.findById(req.userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      const filePath = path.resolve(user.profileImg);
      if (!fs.existsSync(filePath)) {
        return res.status(401).json({
          message: "Invalid File",
        });
      }
      const contentType = getContentType(filePath);
      res.set("Content-Type", contentType);
      const fileStream = createReadStream(filePath);

      fileStream.on("error", (error) => {
        console.error(error);
        res.status(500).end();
      });

      fileStream.pipe(res);
    } catch (error) {
      console.log(error);
      res.status(500).json({
        message: "Internal server error",
      });
    }
  },
  uploadDocuments: async (req, res) => {
    try {
      //extracting files coming from frontend
      const files = req.files;
      console.log(files);
      if (!files) {
        return res.status(415).json({
          message: "Invalid Files",
        });
      }
      //finding user from database
      const user = await User.findById(req.userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      if (user.education.documents.length === 0) {
        user.profileStatus += 10;
      }
      //extracting fileNames
      const fileNames = files.map((file) => {
        return file.filename;
      });
      console.log(fileNames);
      //updating database
      user.education.documents = [...user.education.documents, ...fileNames];
      const updatedUser = await user.save();
      //sending response
      const education = {
        hasFetched: true,
        ...updatedUser.education,
      };
      res.status(201).json({
        message: "files Uploaded successfully",
        updatedUserData: {
          education,
          profileStatus: updatedUser.profileStatus,
        },
      });
    } catch (error) {
      console.log(error);
      res.status(500).json({
        message: "Internal server error",
      });
    }
  },
  sendDocument: async (req, res) => {
    try {
      //geting document path from client
      documentPath = req.query.documentPath;
      //extracting user form database
      const user = await User.findById(req.userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      //checking if required document exists in database
      if (!user.education.documents.includes(documentPath)) {
        return res.status(404).json({ message: "File not found" });
      }
      const filePath = path.resolve(`images/documents/${documentPath}`);
      if (!fs.existsSync(filePath)) {
        return res.status(401).json({
          message: "Invalid File",
        });
      }
      const contentType = getContentType(filePath);
      res.set("Content-Type", contentType);
      const fileStream = createReadStream(filePath);

      fileStream.on("error", (error) => {
        console.error(error);
        res.status(500).end();
      });

      fileStream.pipe(res);
    } catch (error) {
      console.log(error);
      res.status(500).json({
        message: "Internal server error",
      });
    }
  },
  deleteDocument: async (req, res) => {
    try {
      //geting document path from client
      const documentPath = req.query.documentPath;
      //extracting user form database
      const user = await User.findById(req.userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      //checking if required document exists in database
      if (!user.education.documents.includes(documentPath)) {
        return res.status(404).json({ message: "File not found" });
      }
      //removing document from database
      const updatedDocuments = user.education.documents.filter(
        (document) => document !== documentPath
      );
      user.education.documents = updatedDocuments;
      if (user.education.documents.length === 0) {
        user.profileStatus -= 10;
      }
      const updatedUser = await user.save();
      //removing file from server
      fs.unlink(`images/documents/${documentPath}`, function (err) {
        if (err) {
          console.error(err);
        } else {
          console.log("File deleted successfully");
        }
      });
      //sending response
      const education = {
        hasFetched: true,
        ...updatedUser.education,
      };
      res.status(201).json({
        message: "file deleted successfully",
        updatedUserData: {
          education,
          profileStatus: updatedUser.profileStatus,
        },
      });
    } catch (error) {
      res.status(500).json({
        message: "Internal server error",
      });
    }
  },
};
