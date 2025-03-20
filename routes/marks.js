const express = require("express");
const router = express.Router();
const Student = require("../models/Student");
const Assignment = require("../models/Assignment");
const Marks = require("../models/Marks");

// Manage Marks - Display Student Scores
// routes/marks.js
// const express = require("express");
// const Student = require("../models/Student");
// const Assignment = require("../models/Assignment");

// const router = express.Router();

router.get("/", async (req, res) => {
    try {
        // Fetching students with populated assignments
        const students = await Student.find().populate("assignments.assignmentId");
        const assignments = await Assignment.find();

        // Transform students to include only relevant data for display
        const transformedStudents = students.map(student => {
            const studentAssignments = student.assignments.map(studentAssignment => {
                // Lookup the assignment title
                const assignmentDetails = assignments.find(
                    assignment => assignment._id.toString() === studentAssignment.assignmentId.toString()
                );

                return {
                    assignmentId: assignmentDetails ? assignmentDetails._id : null,
                    title: assignmentDetails ? assignmentDetails.title : "Unknown",
                    score: studentAssignment.score
                };
            });

            // Calculate the average score for each student
            const averageScore = studentAssignments.length > 0
                ? (studentAssignments.reduce((sum, assignment) => sum + assignment.score, 0) / studentAssignments.length).toFixed(2)
                : 0;

            return {
                ...student.toObject(),
                assignments: studentAssignments,
                averageScore
            };
        });

        // Render the page with students and assignments data
        res.render("marks/index", { students: transformedStudents, assignments });

    } catch (err) {
        console.error(err);
        res.status(500).send("Server Error");
    }
});

router.post("/update", async (req, res) => {
    const { studentId, assignmentId, score, note } = req.body;

    try {
        // Find the student
        let student = await Student.findById(studentId);
        if (!student) {
            return res.status(404).json({ error: "Student not found" });
        }

        // Check if assignment already exists
        const assignmentIndex = student.assignments.findIndex(a => a.assignmentId.toString() === assignmentId);

        if (assignmentIndex !== -1) {
            // **Update existing assignment**
            student.assignments[assignmentIndex].score = score;
            student.assignments[assignmentIndex].note = note;
        } else {
            // **Add new assignment record**
            student.assignments.push({ assignmentId, score, note });
        }

        // Save the student document
        await student.save();

        res.json({ success: true, updatedStudent: student });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to update marks" });
    }
});


// Route for bulk update of marks
router.post('/bulk-update', async (req, res) => {
    try {
        const marksData = req.body;
        
        // Loop over each mark data and update the corresponding marks
        for (let mark of marksData) {
            const existingMark = await Marks.findOne({ student: mark.studentId, assignment: mark.assignmentId });

            if (existingMark) {
                existingMark.score = mark.score || existingMark.score;
                existingMark.note = mark.note || existingMark.note;
                existingMark.weight = mark.weight || existingMark.weight;
                await existingMark.save();
            } else {
                // If no existing mark, create a new entry
                await Marks.create({
                    student: mark.studentId,
                    assignment: mark.assignmentId,
                    score: mark.score,
                    note: mark.note,
                    weight: mark.weight
                });
            }
        }
        res.status(200).send('Marks updated successfully');
    } catch (error) {
        res.status(500).send('Error updating marks');
    }
});


// Fetch marks/assignments for a student by studentId
router.get("/marks/:studentId", async (req, res) => {
    const { studentId } = req.params;

    try {
        // Fetch the student by ID and populate the assignment data
        const student = await Student.findById(studentId).populate("assignments.assignmentId");

        if (!student) {
            return res.status(404).json({ error: "Student not found" });
        }

        // Prepare the assignment data for response
        const studentAssignments = student.assignments.map(assignment => ({
            assignmentId: assignment.assignmentId._id,
            title: assignment.assignmentId.title, // Assuming title is part of the Assignment model
            score: assignment.score,
            note: assignment.note,
        }));

        // Return the student's assignments (marks) data
        res.json({ studentId, studentName: student.name, assignments: studentAssignments });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Server Error" });
    }
});


module.exports = router;
