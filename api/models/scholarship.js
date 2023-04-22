const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const scholarshipSchema = new Schema({
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
});

module.exports = mongoose.model("Scholarship", scholarshipSchema);
