const mongoose = require("mongoose");

const AssignmentSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String },
    dueDate: { type: Date, required: true },
    totalMarks: Number,

});

module.exports = mongoose.model("Assignment", AssignmentSchema);
