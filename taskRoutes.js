const express = require('express');
const { Task, SubTask } = require('./models');
const authenticateToken = require('./authMiddleware');

const router = express.Router();

// Create a new task
router.post('/tasks', authenticateToken,  async (req, res) => {
  const { title, description, due_date } = req.body;
  try {
    console.log(req.body.user)
    const task = await Task.create({
      title,
      description,
      due_date,
      status: 'TODO', // Default status
      deleted_at: null, // Default deleted_at
      //userId: 123,
      userId: req.user.id, // Assuming the user ID is stored in the token
    });
    res.json(task);
  } catch (error) {
    res.status(500).send(error.message);
  }
});

// Update a task
router.put('/tasks/:taskId', authenticateToken, async (req, res) => {
  const { due_date, status } = req.body;
  try {
    const task = await Task.findByPk(req.params.taskId);
    if (!task) {
      return res.status(404).send('Task not found');
    }
    task.due_date = due_date || task.due_date;
    task.status = status || task.status;
    await task.save();
    res.json(task);
  } catch (error) {
    res.status(500).send(error.message);
  }
});

// Soft delete a task
router.delete('/tasks/:taskId', authenticateToken, async (req, res) => {
  try {
    const task = await Task.findByPk(req.params.taskId);
    if (!task) {
      return res.status(404).send('Task not found');
    }
    task.deleted_at = new Date();
    await task.save();
    res.status(204).send();
  } catch (error) {
    res.status(500).send(error.message);
  }
});

// Get all tasks for a user with filters and pagination
router.get('/tasks', authenticateToken, async (req, res) => {
  const { priority, due_date } = req.query;
  const limit = parseInt(req.query.limit) || 10; // Default limit
  const offset = parseInt(req.query.offset) || 0; // Default offset

  let where = { userId: req.user.id, deleted_at: null }; // Only non-deleted tasks
  if (priority) where.priority = priority;
  if (due_date) where.due_date = due_date;

  try {
    const tasks = await Task.findAndCountAll({ where, limit, offset });
    res.json(tasks);
  } catch (error) {
    res.status(500).send(error.message);
  }
});

module.exports = router;
