const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const scholarshipSchema = new Schema({
  title: {
    type: String,
    required: true
  },
  issueDate: {
    type: Date,
    default: Date.now()
  },  
  closeDate: {
    type: Date,
    required: true
  },
  image: {
    type: String,
    required: true
  },
  status: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  eligibilityCriteria: {
    type: String,
    required: true
  },
  Instructions: {
    type: String,
    required: true
  },
  
});

module.exports = mongoose.model("Scholarship", scholarshipSchema);
