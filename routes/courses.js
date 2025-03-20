const express = require("express");
const router = express.Router();
const Course = require("../models/Course");

// GET: Show all courses
router.get("/", async (req, res) => {
  const courses = await Course.find();
  res.render("course/index", { courses });
});

// GET: Show form to create a new course
router.get("/new", (req, res) => {
  res.render("course/new");
});

// POST: Add new course
router.post("/", async (req, res) => {
  await Course.create(req.body);
  res.redirect("/courses");
});

// GET: Show specific course with topics & progress
router.get("/:id", async (req, res) => {
  const course = await Course.findById(req.params.id);
  if (!course) return res.redirect("/courses");

  const completedCount = course.topics.filter(t => t.completed).length;
  res.render("course/details", {
    course,
    completedCount,
    totalTopics: course.topics.length,
  });
});

// GET: Show form to add topic
router.get("/:id/new-topic", async (req, res) => {
  const course = await Course.findById(req.params.id);
  res.render("course/new-topic", { course });
});

// POST: Add topic to a course
router.post("/:id/topics", async (req, res) => {
  const course = await Course.findById(req.params.id);
  course.topics.push({
    title: req.body.title,
    studyMaterial: req.body.studyMaterial,
  });
  await course.save();
  res.redirect(`/courses/${req.params.id}`);
});

// PUT: Toggle topic completion
router.put("/:courseId/topics/:topicId", async (req, res) => {
  const course = await Course.findById(req.params.courseId);
  const topic = course.topics.id(req.params.topicId);
  topic.completed = !topic.completed;
  await course.save();
  res.redirect(`/courses/${req.params.courseId}`);
});

// DELETE: Remove a topic
router.delete("/:courseId/topics/:topicId", async (req, res) => {
  const course = await Course.findById(req.params.courseId);
  course.topics.id(req.params.topicId).remove();
  await course.save();
  res.redirect(`/courses/${req.params.courseId}`);
});

// DELETE: Remove an entire course
router.delete("/:id", async (req, res) => {
  await Course.findByIdAndDelete(req.params.id);
  res.redirect("/courses");
});

module.exports = router;
