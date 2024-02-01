const express = require('express');
const { SubTask } = require('./models');
const authenticateToken = require('./authMiddleware');

const router = express.Router();

// Create a new subtask
router.post('/subtasks', authenticateToken, async (req, res) => {
  const { taskId, status } = req.body;
  try {
    const subTask = await SubTask.create({
      taskId,
      status,
    });
    res.json(subTask);
  } catch (error) {
    res.status(500).send(error.message);
  }
});

// Update a subtask
router.put('/subtasks/:subTaskId', authenticateToken, async (req, res) => {
  const { status } = req.body;
  try {
    const subTask = await SubTask.findByPk(req.params.subTaskId);
    if (!subTask) {
      return res.status(404).send('Subtask not found');
    }
    subTask.status = status;
    await subTask.save();
    res.json(subTask);
  } catch (error) {
    res.status(500).send(error.message);
  }
});

// Soft delete a subtask
router.delete('/subtasks/:subTaskId', authenticateToken, async (req, res) => {
  try {
    const subTask = await SubTask.findByPk(req.params.subTaskId);
    if (!subTask) {
      return res.status(404).send('Subtask not found');
    }
    subTask.deleted_at = new Date();
    await subTask.save();
    res.status(204).send();
  } catch (error) {
    res.status(500).send(error.message);
  }
});

module.exports = router;
