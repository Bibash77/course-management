const express = require("express");
const router = express.Router();
const Assignment = require("../models/Assignment");

// List all assignments
router.get("/", async (req, res) => {
    const assignments = await Assignment.find().sort({ title: 1 });
    res.render("assignments/index", { assignments });
});

// Add Assignment Page
router.get("/add", (req, res) => {
    res.render("assignments/add");
});

// Add Assignment (POST)
// router.post("/add", async (req, res) => {
//     const { title, description, dueDate } = req.body;
//     await Assignment.create({ title, description, dueDate });
//     res.redirect("/assignments");
// });

const moment = require('moment'); // Import moment.js

// POST route to add a new assignment
router.post("/add", async (req, res) => {
    const { title, description, dueDate } = req.body;

    // Format the dueDate to 'YYYY-MM-DD' format (using moment.js or native JS)
    const formattedDueDate = moment(dueDate).format('YYYY-MM-DD'); // Using moment.js
    await Assignment.create({ title, description, dueDate: formattedDueDate });

    // Redirect to the assignments page
    res.redirect("/assignments");
});


// Edit Assignment Page
router.get("/edit/:id", async (req, res) => {
    const assignment = await Assignment.findById(req.params.id);
    
    // Format the dueDate for the form
    const dueDateFormatted = moment(assignment.dueDate).format('YYYY-MM-DD');

    // Pass the assignment data to the template, ensuring all fields are included
    res.render("assignments/edit", {
        assignment: {
            _id: assignment._id, // Make sure to include the ObjectId
            title: assignment.title,
            description: assignment.description,
            dueDate: dueDateFormatted // formatted dueDate
        }
    });
});


// Update Assignment (PUT)
router.put("/edit/:id", async (req, res) => {
    let { title, description, dueDate } = req.body;
    dueDate = moment(dueDate).format('YYYY-MM-DD'); // Using moment.js
    console.log(dueDate)
    const formattedDueDate = moment(dueDate).format('YYYY-MM-DD'); // Using moment.js

    await Assignment.findByIdAndUpdate(req.params.id, { title, description, dueDate: formattedDueDate });
    res.redirect("/assignments");
});

// Delete Assignment
router.delete("/delete/:id", async (req, res) => {
    await Assignment.findByIdAndDelete(req.params.id);
    res.redirect("/assignments");
});

router.get("/list", async (req, res) => {
    try {
        const assignments = await Assignment.find({}, "_id title");
        res.json(assignments);
    } catch (err) {
        res.status(500).json({ error: "Failed to fetch assignments" });
    }
});





module.exports = router;
