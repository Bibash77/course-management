const express = require("express");
const router = express.Router();
const Student = require("../models/Student");
const Assignment = require("../models/Assignment");

// List all students
router.get("/", async (req, res) => {
    try {
        const students = await Student.find().populate("assignments");
        res.render("students/index", { students });
    } catch (err) {
        res.status(500).send("Error fetching students");
    }
});

// Add Student Form
router.get("/add", (req, res) => {
    res.render("students/add");
});

// Add Student (POST)
router.post("/", async (req, res) => {
    try {
        const { name, roll_no, symbol_no } = req.body;
        const newStudent = new Student({ name, roll_no, symbol_no });
        await newStudent.save();
        res.redirect("/students");
    } catch (err) {
        res.status(500).send("Error adding student");
    }
});

// Edit Student Form
router.get("/edit/:id", async (req, res) => {
    try {
        const student = await Student.findById(req.params.id);
        res.render("students/edit", { student });
    } catch (err) {
        res.status(500).send("Error loading edit form");
    }
});

// Update Student (PUT)
router.put("/:id", async (req, res) => {
    try {
        await Student.findByIdAndUpdate(req.params.id, req.body);
        res.redirect("/students");
    } catch (err) {
        res.status(500).send("Error updating student");
    }
});

// Delete Student
router.delete("/:id", async (req, res) => {
    try {
        await Student.findByIdAndDelete(req.params.id);
        res.redirect("/students");
    } catch (err) {
        res.status(500).send("Error deleting student");
    }
});


// Bulk Update Page
router.get("/bulk-update", (req, res) => {
    res.render("students/bulk-update");
});

// Bulk Update (POST)
router.post("/bulk-update", async (req, res) => {
    try {
        const studentsData = JSON.parse(req.body.studentsJson);
        
        for (const student of studentsData) {
            const { name, roll_no, symbol_no } = student;

            await Student.findOneAndUpdate(
                { roll_no },  // Find student by roll number
                { name, roll_no, symbol_no }, 
                { upsert: true, new: true }
            );
        }

        res.redirect("/students");
    } catch (err) {
        console.error("Bulk update error:", err);
        res.status(500).send("Error processing bulk update.");
    }
});

router.get("/assignments", async (req, res) => {
    try {
        const today = new Date();
today.setHours(0, 0, 0, 0); // Set to the start of today to ignore time part

const dueAssignments = await Assignment.find({ dueDate: { $gte: today } })
  .sort({ dueDate: 1 });


        console.log(dueAssignments)
        res.render("students/assignments", { assignments: dueAssignments });
    } catch (err) {
        console.error("Error fetching assignments:", err);
        res.status(500).send("Internal Server Error");
    }
});

// Fetch marks/assignments for a student by studentId
router.get("/marks/:studentId", async (req, res) => {
    const { studentId } = req.params;

    try {
        // Fetch the student with populated assignments
        const student = await Student.findById(studentId).populate("assignments.assignmentId");

        if (!student) {
            return res.status(404).json({ error: "Student not found" });
        }

        // Fetch all assignments in a single query (reducing multiple calls)
        const allAssignments = await Assignment.find({}, "_id title");

        // Map assignments with student scores
        const studentAssignments = allAssignments.map(assignment => {
            const studentAssignment = student.assignments.find(
                sa => sa.assignmentId._id.toString() === assignment._id.toString()
            );

            return {
                assignmentId: assignment._id,
                title: assignment.title,
                score: studentAssignment ? studentAssignment.score : null, // Set to null if not attempted
                note: studentAssignment ? studentAssignment.note : "",  // Include note
            };
        });

        // Return the response
        res.json({
            studentId,
            studentName: student.name,
            assignments: studentAssignments,
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Server Error" });
    }
});


// Bulk update marks for a student
router.post("/marks/bulk-update", async (req, res) => {
    const { studentId, assignments } = req.body;

    try {
        const student = await Student.findById(studentId);
        if (!student) {
            return res.status(404).json({ error: "Student not found" });
        }

        assignments.forEach(update => {
            const assignmentIndex = student.assignments.findIndex(a => a.assignmentId.toString() === update.assignmentId.toString());

            if (assignmentIndex !== -1) {
                // Update existing assignment score and note
                student.assignments[assignmentIndex].score = update.score || 0;
                student.assignments[assignmentIndex].note = update.note || "";
            } else {
                // Add a new assignment entry if it does not exist
                student.assignments.push({
                    assignmentId: update.assignmentId,
                    score: update.score || 0,
                    note: update.note || ""
                });
            }
        });

        await student.save();

        res.status(200).json({ success: true, message: "Marks updated successfully", updatedStudent: student });

    } catch (err) {
        console.log("ererer")
        console.error(err);
        res.status(500).json({ error: "Failed to update marks" });
    }
});


module.exports = router;
