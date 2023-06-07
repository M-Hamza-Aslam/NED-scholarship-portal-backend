const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const scholarshipSchema = new Schema({
  creator: {
    id: {
      type: String,
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    // email: {
    //   type: String,
    //   required: true,
    // },
    role: {
      type: String,
      required: true,
    },
  },
  type: {
    type: String,
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  image: {
    type: String,
  },
  issueDate: {
    type: Date,
    required: true,
  },
  closeDate: {
    type: Date,
    required: true,
  },
  status: {
    type: String,
    required: true,
  },
  matricPercentage: {
    type: String,
    default: "",
  },
  intermediatePercentage: {
    type: String,
    default: "",
  },
  bachelorCGPA: {
    type: String,
    default: "",
  },
  familyIncome: {
    type: String,
    default: "",
  },
  description: {
    type: String,
    required: true,
  },
  eligibilityCriteria: {
    type: String,
    required: true,
  },
  instructions: {
    type: String,
    required: true,
  },
  otherRequirements: {
    type: Array,
    require: true,
  },
});

module.exports = mongoose.model("Scholarship", scholarshipSchema);
