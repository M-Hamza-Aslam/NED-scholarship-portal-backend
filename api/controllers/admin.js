const Admin = require("../models/admin");
const Scholarship = require("../models/scholarship");
const Alumni = require("../models/alumni");
const User = require("../models/user");

const { getContentType } = require("../../util/contentType");
const { validationResult } = require("express-validator");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const path = require("path");
const fs = require("fs");
const { createReadStream } = require("fs");
const { default: mongoose } = require("mongoose");
const PDFDocument = require("pdfkit");

module.exports = {
  //For admin login
  login: async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(422).json({ errors: errors.array() });
      }
      const { email, password, userRole } = req.body;

      const adminDetails = await Admin.findOne({
        email: email,
        userRole: userRole,
      });

      if (!adminDetails) {
        return res.status(401).json({
          message: "Admin not found",
        });
      }

      const isMatch = await bcrypt.compare(password, adminDetails.password);

      if (!isMatch) {
        return res.status(401).json({
          message: "Invalid password",
        });
      }

      const token = jwt.sign(
        {
          userId: adminDetails._id.toString(),
          userRole: adminDetails.userRole,
          expiration: Date.now() + 3600000,
        },
        process.env.JWT_SecretKey,
        { expiresIn: "1h" }
      );
      const adminData = {
        email: adminDetails.email,
        firstName: adminDetails.firstName,
        lastName: adminDetails.lastName,
        phoneNumber: adminDetails.phoneNumber,
        userRole: adminDetails.userRole,
      };
      res.status(200).json({
        message: "Login successful",
        userDetails: adminData,
        userId: adminDetails._id.toString(),
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
      const existingUser = await Admin.findOne({ email: email });

      if (existingUser) {
        return res.status(409).json({
          message: "Admin with this email already exists",
        });
      }
      //Password encription
      const hashedPassword = await bcrypt.hash(password, 10);

      // Creating a new user document
      const newAdmin = new Admin({
        firstName,
        lastName,
        email,
        password: hashedPassword,
        phoneNumber,
        userRole: "admin",
      });
      const result = await newAdmin.save();

      // Returning success message
      res.status(201).json({
        message: "Admin created successfully",
        userDetails: result,
      });
    } catch (error) {
      res.status(400).json({
        message: error.message,
      });
    }
  },
  getLoginData: async (req, res) => {
    try {
      const userDetails = await Admin.findById(req.userId);
      if (!userDetails) {
        return res.status(404).json({ message: "Admin not found" });
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
        userRole: userDetails.userRole,
      };
      res.status(200).json({
        message: "admin Credentials fetched successfully",
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
  createMeritScholarship: async (req, res) => {
    try {
      //extracting Admin just for verification
      const userDetails = await Admin.findById(req.userId);
      if (!userDetails) {
        return res.status(404).json({ message: "Admin not found" });
      }
      //creating a new scholarship
      const newScholarship = new Scholarship({
        ...req.body,
        image: "",
        issueDate: Date.now(),
        status: "active",
        creator: {
          name: `${userDetails.firstName} ${userDetails.lastName}`,
          email: userDetails.email,
          role: "admin",
        },
      });
      const scholarshipDetails = await newScholarship.save();

      //preparing response
      let responseData = {
        _id: scholarshipDetails._id.toString(),
        type: scholarshipDetails.type,
        title: scholarshipDetails.title,
        issueDate: scholarshipDetails.issueDate,
        closeDate: scholarshipDetails.closeDate,
        image: scholarshipDetails.image,
        status: scholarshipDetails.status,
        matricPercentage: scholarshipDetails.matricPercentage,
        intermediatePercentage: scholarshipDetails.intermediatePercentage,
        bachelorCGPA: scholarshipDetails.bachelorCGPA,
        description: scholarshipDetails.description,
        eligibilityCriteria: scholarshipDetails.eligibilityCriteria,
        instructions: scholarshipDetails.instructions,
        otherRequirements: scholarshipDetails.otherRequirements,
        creator: scholarshipDetails.creator,
      };
      // Returning success message
      res.status(201).json({
        message: "Scholarship created successfully",
        scholarshipDetails: responseData,
      });
    } catch (error) {
      console.log(error);
      res.status(500).json({
        message: "Internal server error",
      });
    }
  },
  createNeedScholarship: async (req, res) => {
    try {
      //extracting Admin just for verification
      const userDetails = await Admin.findById(req.userId);
      if (!userDetails) {
        return res.status(404).json({ message: "Admin not found" });
      }
      //creating a new scholarship
      const newScholarship = new Scholarship({
        ...req.body,
        image: "",
        issueDate: new Date(),
        status: "active",
        creator: {
          name: `${userDetails.firstName} ${userDetails.lastName}`,
          email: userDetails.email,
          role: "admin",
        },
      });
      const scholarshipDetails = await newScholarship.save();

      //preparing response
      let responseData = {
        _id: scholarshipDetails._id.toString(),
        type: scholarshipDetails.type,
        title: scholarshipDetails.title,
        issueDate: scholarshipDetails.issueDate,
        closeDate: scholarshipDetails.closeDate,
        image: scholarshipDetails.image,
        status: scholarshipDetails.status,
        familyIncome: scholarshipDetails.familyIncome,
        description: scholarshipDetails.description,
        eligibilityCriteria: scholarshipDetails.eligibilityCriteria,
        instructions: scholarshipDetails.instructions,
        otherRequirements: scholarshipDetails.otherRequirements,
        creator: scholarshipDetails.creator,
      };

      // Returning success message
      res.status(201).json({
        message: "Scholarship created successfully",
        scholarshipDetails: responseData,
      });
    } catch (error) {
      console.log(error);
      res.status(500).json({
        message: "Internal server error",
      });
    }
  },
  updateMeritScholarship: async (req, res) => {
    try {
      //getting data
      const scholarshipId = req.query.scholarshipId;
      const scholarshipType = req.body.scholarshipData;
      const {
        title,
        closeDate,
        description,
        eligibilityCriteria,
        instructions,
      } = req.body;
      //extracting scholarship
      const scholarship = await Scholarship.findById(scholarshipId);
      if (!scholarship) {
        return res.status(404).json({ message: "Scholarship not found" });
      }
      //updating scholarship
      scholarship.title = title;
      scholarship.closeDate = closeDate;
      scholarship.description = description;
      scholarship.eligibilityCriteria = eligibilityCriteria;
      scholarship.instructions = instructions;
      scholarship.matricPercentage = req.body.matricPercentage;
      scholarship.intermediatePercentage = req.body.intermediatePercentage;
      scholarship.bachelorCGPA = req.body.bachelorCGPA;
      scholarship.otherRequirements = req.body.otherRequirements;
      //deleting image from file system
      fs.unlink(`images/scholarshipImg/${scholarship.image}`, function (err) {
        if (err) {
          console.error(err);
        } else {
          console.log("Scholarship Img deleted successfully");
          scholarship.image = "";
        }
      });
      const scholarshipDetails = await scholarship.save();
      //preparing response
      let responseData = {
        _id: scholarshipDetails._id.toString(),
        type: scholarshipDetails.type,
        title: scholarshipDetails.title,
        issueDate: scholarshipDetails.issueDate,
        closeDate: scholarshipDetails.closeDate,
        image: scholarshipDetails.image,
        status: scholarshipDetails.status,
        matricPercentage: scholarshipDetails.matricPercentage,
        intermediatePercentage: scholarshipDetails.intermediatePercentage,
        bachelorCGPA: scholarshipDetails.bachelorCGPA,
        description: scholarshipDetails.description,
        eligibilityCriteria: scholarshipDetails.eligibilityCriteria,
        instructions: scholarshipDetails.instructions,
        otherRequirements: scholarshipDetails.otherRequirements,
        creator: scholarshipDetails.creator,
      };
      // Returning success message
      res.status(201).json({
        message: "Scholarship updated successfully",
        scholarshipDetails: responseData,
      });
    } catch (error) {
      console.log(error);
      res.status(500).json({
        message: "Internal server error",
      });
    }
  },
  updateNeedScholarship: async (req, res) => {
    try {
      //getting data
      const scholarshipId = req.query.scholarshipId;
      const scholarshipType = req.body.scholarshipData;
      const {
        title,
        closeDate,
        description,
        eligibilityCriteria,
        instructions,
      } = req.body;
      //extracting scholarship
      const scholarship = await Scholarship.findById(scholarshipId);
      if (!scholarship) {
        return res.status(404).json({ message: "Scholarship not found" });
      }
      //updating scholarship
      scholarship.title = title;
      scholarship.closeDate = closeDate;
      scholarship.description = description;
      scholarship.eligibilityCriteria = eligibilityCriteria;
      scholarship.instructions = instructions;
      scholarship.familyIncome = req.body.familyIncome;
      scholarship.otherRequirements = req.body.otherRequirements;
      //deleting image from file system
      fs.unlink(`images/scholarshipImg/${scholarship.image}`, function (err) {
        if (err) {
          console.error(err);
        } else {
          console.log("Scholarship Img deleted successfully");
          scholarship.image = "";
        }
      });
      const scholarshipDetails = await scholarship.save();
      //preparing response
      let responseData = {
        _id: scholarshipDetails._id.toString(),
        type: scholarshipDetails.type,
        title: scholarshipDetails.title,
        issueDate: scholarshipDetails.issueDate,
        closeDate: scholarshipDetails.closeDate,
        image: scholarshipDetails.image,
        status: scholarshipDetails.status,
        familyIncome: scholarshipDetails.familyIncome,
        description: scholarshipDetails.description,
        eligibilityCriteria: scholarshipDetails.eligibilityCriteria,
        instructions: scholarshipDetails.instructions,
        otherRequirements: scholarshipDetails.otherRequirements,
        creator: scholarshipDetails.creator,
      };
      // Returning success message
      res.status(201).json({
        message: "Scholarship updated successfully",
        scholarshipDetails: responseData,
      });
    } catch (error) {
      console.log(error);
      res.status(500).json({
        message: "Internal server error",
      });
    }
  },

  deleteScholarship: async (req, res) => {
    try {
      const scholarshipId = req.query.scholarshipId;
      //extracting scholarship
      const scholarship = await Scholarship.findByIdAndRemove(scholarshipId);
      if (!scholarship) {
        return res.status(404).json({ message: "Scholarship not found" });
      }
      //deleting image from file system
      fs.unlink(`images/scholarshipImg/${scholarship.image}`, function (err) {
        if (err) {
          console.error(err);
        } else {
          console.log("Scholarship Img deleted successfully");
          scholarship.image = "";
        }
      });
      //sending response
      res.status(201).json({
        message: "Scholarship deleted successfully!",
      });
    } catch (error) {
      console.log(error);
      res.status(500).json({
        message: "Internal server error",
      });
    }
  },
  uploadScholarshipImg: async (req, res) => {
    try {
      //extracting image file and scholarshipId coming from frontEnd
      const scholarshipId = req.body.scholarshipId;
      const image = req.file;
      if (!image) {
        return res.status(415).json({
          message: "Invalid File",
        });
      }
      //extracting user from DB just for validation
      const admin = await Admin.findById(req.userId);
      if (!admin) {
        return res.status(404).json({ message: "Admin not found" });
      }
      //extracting scholarship
      const scholarship = await Scholarship.findById(scholarshipId);
      if (!scholarship) {
        return res.status(404).json({ message: "Scholarship not found" });
      }
      //saving image path
      scholarship.image = image.filename;

      const updatedscholarship = await scholarship.save();
      res.status(201).json({
        message: "scholarship image Uploaded",
        image: updatedscholarship.image,
      });
    } catch (error) {
      console.log(error);
      res.status(500).json({
        message: "Internal server error",
      });
    }
  },
  getUserData: async (req, res) => {
    try {
      //getting userId from client
      const userId = req.query.userId;
      //extracting user
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      //structuring userDetails;
      const userDetails = {
        userId: user._id.toString(),
        sideBar: {
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          phoneNumber: user.phoneNumber,
          profileStatus: user.profileStatus,
          profileImg: user.profileImg,
        },
        personalInfo: {
          firstName: user.firstName,
          lastName: user.lastName,
          phoneNumber: user.phoneNumber,
          personalInfo: user.personalInfo,
        },
        familyDetails: user.familyDetails,
        education: user.education,
        dependantDetails: user.dependantDetails,
      };
      //sending user data to front end
      res.status(200).json({
        message: "User details has been fetched",
        userDetails,
      });
    } catch (error) {
      console.log(error);
      res.status(500).json({
        message: "Internal server error",
      });
    }
  },
  sendUserProfileImg: async (req, res) => {
    try {
      const user = await User.findById(req.query.userId);
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
  sendDocument: async (req, res) => {
    try {
      //geting document path from client
      const documentPath = req.query.documentPath;
      const userId = req.query.userId;
      //extracting user form database
      const user = await User.findById(userId);
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
  appliedUsersList: async (req, res) => {
    try {
      //getting scholarship Id from client
      const scholarshipId = req.query.scholarshipId;
      console.log("scholarshipId", scholarshipId);
      //finding users
      let users = await User.find({
        appliedScholarship: {
          $elemMatch: {
            scholarshipId: scholarshipId,
          },
        },
      });
      console.log("users: ", users);
      //Extracting Information from User
      const education = users[0].education;
      const matricPercentage = education.matric.percentage;
      const intermediatePercentage = education.intermediate.percentage;
      const cgpaPercentage = (education.bachelor.obtainedCGPA / 4.0) * 100;
      const merit =
        0.5 * cgpaPercentage +
        0.25 * matricPercentage +
        0.25 * intermediatePercentage;

      const familyIncome = users[0].familyDetails.grossIncome;
      const noOfDependents = users[0].dependantDetails.length;
      const incomePerDependent = familyIncome / noOfDependents;

      users = users.map((user) => {
        return {
          _id: user._id.toString(),
          firstName: user.firstName,
          lastName: user.lastName,
          merit: merit,
          meritFormula: "CGPA(%): 50% + Intermediate(%): 25% + Matric(%): 25%",
          matricPercentage: matricPercentage,
          intermediatePercentage: intermediatePercentage,
          CGPA: cgpaPercentage,
          need: incomePerDependent,
          status: user.appliedScholarship.find(
            (s) => s.scholarshipId.toString() === scholarshipId
          ).status,
        };
      });

      res.status(200).json({ users });
    } catch (error) {
      console.log(error);
      res.status(500).json({
        message: "Internal server error",
      });
    }
  },
  updateScholarshipStatus: async (req, res) => {
    try {
      const { userId, scholarshipId, updatedStatus } = req.body;

      // Find user with given userId
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({
          message: "User not found",
        });
      }

      // Check if updated status is "approved" and user has already approved scholarship
      for (const scholarship of user.appliedScholarship) {
        if (
          scholarship.status === "approved" &&
          scholarship.scholarshipId.toString() !== scholarshipId
        ) {
          return res.status(403).json({
            message: "User already has an approved scholarship",
          });
        }
      }

      // Find scholarship and change status
      for (const scholarship of user.appliedScholarship) {
        if (scholarship.scholarshipId.toString() === scholarshipId) {
          scholarship.status = updatedStatus;
        }
      }

      await user.save();

      return res.status(201).json({
        user: user,
        message: "Scholarship status updated successfully",
      });
    } catch (err) {
      console.error(err);
      return res.status(500).json({
        error: err.message,
        message: "Internal server error",
      });
    }
  },
  getMarksheet: async (req, res) => {
    try {
      //geting education and marksheet Name from client
      const educationName = req.query.educationName;
      const marksheetName = req.query.marksheetName;
      const userId = req.query.userId;
      //extracting user form database
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      //checking if required document exists in database
      if (!user.education[educationName].marksheet === marksheetName) {
        return res.status(404).json({ message: "File not found" });
      }
      const filePath = path.resolve(`images/marksheets/${marksheetName}`);
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
  generateReport: async (req, res) => {
    try {
      const scholarshipId = req.body.id;
      console.log("scholarshipId:", scholarshipId);
      const scholarship = await Scholarship.findById(scholarshipId);
      console.log("scholarship:", scholarship);

      if (!scholarship) {
        return res.status(404).send("Scholarship not found");
      }

      const doc = new PDFDocument();

      res.setHeader("Content-Type", "application/pdf");
      res.setHeader(
        "Content-Disposition",
        'attachment; filename="scholarship_report.pdf"'
      );

      doc.pipe(res);

      doc.fontSize(16).text("Scholarship Report", { align: "center" });
      doc.moveDown();

      doc
        .fontSize(14)
        .text(`Scholarship Name: ${scholarship.title}`, { underline: true });
      doc.moveDown();

      // Add Applied Users
      doc.moveDown();
      doc.fontSize(16).text("Awaiting Users:", { underline: true });

      const awaitingUsers = await User.find({
        appliedScholarship: {
          $elemMatch: {
            scholarshipId: scholarshipId,
            status: "awaiting",
          },
        },
      });
      console.log("awaitingUsers", awaitingUsers);
      if (awaitingUsers.length === 0) {
        doc.moveDown().fontSize(10).text("No awaiting users found");
      } else {
        for (let i = 0; i < awaitingUsers.length; i++) {
          const user = awaitingUsers[i];
          doc
            .moveDown()
            .fontSize(12)
            .text(`${i + 1}. Name: ${user.firstName} ${user.lastName}`);
          doc.fontSize(10).text(`Email: ${user.email}`);
          doc.fontSize(10).text(`Contact Number: ${user.phoneNumber}`);
        }
      }
      // Add Approved Users
      doc.moveDown();
      doc.fontSize(16).text("Approved Users:", { underline: true });

      const approvedUsers = await User.find({
        appliedScholarship: {
          $elemMatch: {
            scholarshipId: scholarshipId,
            status: "approved",
          },
        },
      });
      console.log("approvedUsers", approvedUsers);
      if (approvedUsers.length === 0) {
        doc.moveDown().fontSize(10).text("No approved users found");
      } else {
        for (let i = 0; i < approvedUsers.length; i++) {
          const user = approvedUsers[i];
          doc
            .moveDown()
            .fontSize(12)
            .text(`${i + 1}. Name: ${user.firstName} ${user.lastName}`);
          doc.fontSize(10).text(`Email: ${user.email}`);
          doc.fontSize(10).text(`Contact Number: ${user.phoneNumber}`);
        }
      }
      // Add Declined Users
      doc.moveDown();
      doc.fontSize(16).text("Declined Users:", { underline: true });

      const declinedUsers = await User.find({
        appliedScholarship: {
          $elemMatch: {
            scholarshipId: scholarshipId,
            status: "declined",
          },
        },
      });
      console.log("declinedUsers", declinedUsers);
      if (declinedUsers.length === 0) {
        doc.moveDown().fontSize(10).text("No declined users found");
      } else {
        for (let i = 0; i < declinedUsers.length; i++) {
          const user = declinedUsers[i];
          doc
            .moveDown()
            .fontSize(12)
            .text(`${i + 1}. Name: ${user.firstName} ${user.lastName}`);
          doc.fontSize(10).text(`Email: ${user.email}`);
          doc.fontSize(10).text(`Contact Number: ${user.phoneNumber}`);
        }
      }
      doc.end();
    } catch (err) {
      console.error(err);
      res.status(500).send("Server error");
    }
  },
  appliedScholarshipReport: async (req, res) => {
    try {
      const userId = req.params.userId;
      // console.log("UserId123:", userId);

      const user = await User.findById(userId);
      console.log("user:", user);

      if (!user) {
        return res.status(404).send("User not found");
      }

      const doc = new PDFDocument();

      res.setHeader("Content-Type", "application/pdf");
      res.setHeader(
        "Content-Disposition",
        `attachment; filename="${user.firstName} ${user.lastName}_applied_scholarship_report.pdf"`
      );

      doc.pipe(res);

      doc.fontSize(16).text("Applied Scholarship Report", { align: "center" });
      doc.moveDown();

      doc.fontSize(12).text(`Student Name: ${user.firstName} ${user.lastName}`);
      doc.fontSize(10).text(`Roll Number: ${user.personalInfo.rollNo}`);
      doc.fontSize(10).text(`Cloud Id: ${user.email}`);
      doc.fontSize(10).text(`Discipline: ${user.personalInfo.discipline}`);
      doc.fontSize(10).text(`Batch: ${user.personalInfo.batch}`);
      doc.fontSize(10).text(`Contact Number: ${user.phoneNumber}`);
      doc.moveDown();

      // Add Applied Scholarships
      doc.moveDown();
      doc.fontSize(16).text("Applied Scholarships:", { underline: true });

      const userAppliedScholarship = user.appliedScholarship;
      console.log("userAppliedScholarship", userAppliedScholarship);

      if (userAppliedScholarship.length === 0) {
        doc.moveDown().fontSize(10).text("No applied scholarships found...");
      } else {
        for (let i = 0; i < userAppliedScholarship.length; i++) {
          const ScholarshipId = userAppliedScholarship[i].scholarshipId;
          const scholarshipStatus = userAppliedScholarship[i].status;
          const scholarship = await Scholarship.findById(ScholarshipId);

          // Formating dates
          const issueDate = scholarship.issueDate.toLocaleDateString("en-GB", {
            day: "2-digit",
            month: "short",
            year: "numeric",
          });
          const closeDate = scholarship.closeDate.toLocaleDateString("en-GB", {
            day: "2-digit",
            month: "short",
            year: "numeric",
          });

          doc
            .moveDown()
            .fontSize(12)
            .text(`${i + 1}. Scholarship Name: ${scholarship.title}`);
          doc.fontSize(10).text(`Issue Date: ${issueDate}`);
          doc.fontSize(10).text(`Close Date: ${closeDate}`);
          doc.fontSize(10).text(`Status: ${scholarshipStatus}`);
        }
      }

      doc.end(); // move this line to the end of the pipe chain
    } catch (err) {
      console.error(err);
      res.status(500).send("Server error");
    }
  },
  getAlumniScholarship: async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(422).json({ errors: errors.array() });
      }

      const scholarships = await Scholarship.find({
        "creator.role": "alumni",
      });

      console.log(scholarships);

      res.json(scholarships);
    } catch (error) {
      console.error("Error in getCreatedScholarships", error);
      res.status(500).json({
        message: "Something went wrong with the API",
        error: error.message,
      });
    }
  },
  getAlumniByEmail: async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(422).json({ errors: errors.array() });
      }

      const email = req.params.email;

      const alumni = await Alumni.findOne({ email: email });
      if (!alumni) {
        return res.status(401).json({
          message: "Alumni not found",
        });
      }

      res.json({ alumni });
    } catch (error) {
      console.error("Error in getAlumniByEmail", error);
      res.status(500).json({
        message: "Something went wrong with the API",
        error: error.message,
      });
    }
  },
  alumniScholarshipStatus: async (req, res) => {
    try {
      const { alumniEmail, scholarshipId, updatedStatus } = req.body;

      const scholarships = await Scholarship.find({
        "creator.role": "alumni",
      });

      if (!scholarships || scholarships.length === 0) {
        return res.status(404).json({
          message: "Scholarship not found",
        });
      }

      const alumni = await Alumni.findOne({ email: alumniEmail });

      if (!alumni) {
        return res.status(401).json({
          message: "Alumni not found",
        });
      }

      let scholarshipFound = false;
      for (const scholarship of scholarships) {
        if (scholarship._id.toString() === scholarshipId.toString()) {
          scholarship.status = updatedStatus;
          await scholarship.save();
          scholarshipFound = true;
          break;
        }
      }

      if (!scholarshipFound) {
        return res.status(404).json({
          message: "Scholarship not found",
        });
      }

      let createdScholarshipFound = false;
      for (const createdScholarship of alumni.createdScholarships) {
        if (
          createdScholarship.scholarshipId.toString() ===
          scholarshipId.toString()
        ) {
          if (updatedStatus === "active") {
            createdScholarship.status = "approved";
          } else {
            createdScholarship.status = updatedStatus;
          }
          createdScholarshipFound = true;
          break;
        }
      }

      if (!createdScholarshipFound) {
        return res.status(404).json({
          message: "Created scholarship not found for the alumni",
        });
      }

      await alumni.save();

      return res.status(201).json({
        message: "Alumni Created Scholarship status updated successfully",
      });
    } catch (err) {
      console.error(err);
      return res.status(500).json({
        error: err.message,
        message: "Internal server error",
      });
    }
  },
};
