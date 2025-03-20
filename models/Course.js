const mongoose = require("mongoose");

const TopicSchema = new mongoose.Schema({
  title: String,
  completed: { type: Boolean, default: false },
  studyMaterial: String,  // New field for storing Google Doc URL or any link
});

const CourseSchema = new mongoose.Schema({
  title: String,
  code: String,
  semester: String,
  classLoad: String,
  topics: [TopicSchema],
});

module.exports = mongoose.model("Course", CourseSchema);
