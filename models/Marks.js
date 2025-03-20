// models/Marks.js
const mongoose = require("mongoose");

const MarksSchema = new mongoose.Schema({
    student: { type: mongoose.Schema.Types.ObjectId, ref: "Student" },
    assignment: { type: mongoose.Schema.Types.ObjectId, ref: "Assignment" },
    score: { type: Number, required: true },
    note: { type: String }, // Note for additional comments
    weight: { type: Number }, // For weighted grading, optional
});

module.exports = mongoose.model("Marks", MarksSchema);
