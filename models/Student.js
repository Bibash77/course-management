const mongoose = require("mongoose");

const StudentSchema = new mongoose.Schema({
    name: { type: String, required: true },
    roll_no: { type: String, required: true, unique: true },
    symbol_no: { type: String, required: true },
    assignments: [
        {
            assignmentId: { type: mongoose.Schema.Types.ObjectId, ref: "Assignment" },
            score: Number,
            note: String
        }
    ]    
});

module.exports = mongoose.model("Student", StudentSchema);
