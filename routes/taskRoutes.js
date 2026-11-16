/**
 * MongoDB CRUD Route Controllers for TaskGravity
 */

const express = require('express');
const router = express.Router();
const Task = require('../models/Task');
const { getDbStatus } = require('../config/db');

// Fallback in-memory store if MongoDB instance is not connected
let memoryTasks = [
  {
    _id: '507f1f77bcf86cd799439011',
    title: 'MongoDB Atlas Replica Set Connection',
    category: 'Database',
    priority: 'Urgent',
    dueDate: '2026-11-20',
    estimatedHours: 5,
    description: 'Establish secure TLS connection string and configure IP access whitelist.',
    status: 'completed',
    createdAt: new Date().toISOString()
  },
  {
    _id: '507f1f77bcf86cd799439012',
    title: 'Mongoose Schema Index Optimization',
    category: 'Database',
    priority: 'High',
    dueDate: '2026-11-22',
    estimatedHours: 4,
    description: 'Benchmark composite compound index across status and category fields.',
    status: 'in-progress',
    createdAt: new Date().toISOString()
  },
  {
    _id: '507f1f77bcf86cd799439013',
    title: 'NoSQL Aggregation Pipeline',
    category: 'Backend',
    priority: 'Medium',
    dueDate: '2026-11-25',
    estimatedHours: 3,
    description: 'Implement aggregate group operations to calculate velocity metrics.',
    status: 'pending',
    createdAt: new Date().toISOString()
  }
];

// Check if Mongoose connection is ready
function isDbReady() {
  const status = getDbStatus();
  return status.connected && Task !== null;
}

// GET /api/tasks - Retrieve all tasks (with filter)
router.get('/', async (req, res) => {
  try {
    const { status, category, priority, search } = req.query;

    if (isDbReady()) {
      const filter = {};
      if (status && status !== 'all') filter.status = status;
      if (category && category !== 'all') filter.category = category;
      if (priority && priority !== 'all') filter.priority = priority;
      if (search) {
        filter.$or = [
          { title: { $regex: search, $options: 'i' } },
          { description: { $regex: search, $options: 'i' } }
        ];
      }

      const tasks = await Task.find(filter).sort({ dueDate: 1, createdAt: -1 });
      return res.status(200).json({
        success: true,
        source: 'MongoDB',
        count: tasks.length,
        data: tasks
      });
    }

    // Fallback store
    let filtered = [...memoryTasks];
    if (status && status !== 'all') filtered = filtered.filter(t => t.status === status);
    if (category && category !== 'all') filtered = filtered.filter(t => t.category === category);
    if (priority && priority !== 'all') filtered = filtered.filter(t => t.priority === priority);
    if (search) {
      const q = search.toLowerCase();
      filtered = filtered.filter(t => t.title.toLowerCase().includes(q) || (t.description || '').toLowerCase().includes(q));
    }

    res.status(200).json({
      success: true,
      source: 'MemoryFallback (Connect MONGO_URI for Atlas)',
      count: filtered.length,
      data: filtered
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Database query failed', error: err.message });
  }
});

// GET /api/tasks/stats - Aggregated Metrics
router.get('/stats', async (req, res) => {
  try {
    if (isDbReady()) {
      const total = await Task.countDocuments();
      const completed = await Task.countDocuments({ status: 'completed' });
      const inProgress = await Task.countDocuments({ status: 'in-progress' });
      const pending = await Task.countDocuments({ status: 'pending' });

      return res.status(200).json({
        success: true,
        source: 'MongoDB',
        stats: {
          total,
          completed,
          inProgress,
          pending,
          velocity: total > 0 ? Math.round((completed / total) * 100) : 0
        }
      });
    }

    const total = memoryTasks.length;
    const completed = memoryTasks.filter(t => t.status === 'completed').length;
    const inProgress = memoryTasks.filter(t => t.status === 'in-progress').length;
    const pending = memoryTasks.filter(t => t.status === 'pending').length;

    res.status(200).json({
      success: true,
      source: 'MemoryFallback',
      stats: {
        total,
        completed,
        inProgress,
        pending,
        velocity: total > 0 ? Math.round((completed / total) * 100) : 0
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/tasks/:id - Retrieve single task
router.get('/:id', async (req, res) => {
  try {
    if (isDbReady()) {
      const task = await Task.findById(req.params.id);
      if (!task) {
        return res.status(404).json({ success: false, message: `Task not found in MongoDB (${req.params.id})` });
      }
      return res.status(200).json({ success: true, data: task });
    }

    const task = memoryTasks.find(t => t._id === req.params.id);
    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }
    res.status(200).json({ success: true, data: task });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/tasks - Create task with Mongoose validation
router.post('/', async (req, res) => {
  try {
    const { title, category, priority, dueDate, estimatedHours, description } = req.body;

    if (isDbReady()) {
      const newTask = new Task({
        title,
        category,
        priority,
        dueDate,
        estimatedHours,
        description
      });

      const saved = await newTask.save();
      return res.status(201).json({
        success: true,
        message: 'Task successfully inserted into MongoDB collection.',
        data: saved
      });
    }

    // Fallback store validation
    if (!title || title.trim().length < 3) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: { title: 'Title must be at least 3 characters long.' }
      });
    }

    const newTask = {
      _id: '507f1f77bcf86cd7994390' + Date.now().toString().slice(-2),
      title: title.trim(),
      category: category || 'Frontend',
      priority: priority || 'Medium',
      dueDate: dueDate || new Date().toISOString().split('T')[0],
      estimatedHours: Number(estimatedHours) || 4,
      description: description || '',
      status: 'pending',
      createdAt: new Date().toISOString()
    };

    memoryTasks.unshift(newTask);
    res.status(201).json({
      success: true,
      message: 'Task saved to memory fallback (Configure MONGO_URI to save directly to MongoDB).',
      data: newTask
    });
  } catch (err) {
    if (err.name === 'ValidationError') {
      const formatted = {};
      Object.keys(err.errors).forEach(key => {
        formatted[key] = err.errors[key].message;
      });
      return res.status(400).json({
        success: false,
        message: 'Mongoose schema validation failed.',
        errors: formatted
      });
    }
    res.status(500).json({ success: false, message: 'Server error saving task', error: err.message });
  }
});

// PUT /api/tasks/:id - Full Update
router.put('/:id', async (req, res) => {
  try {
    if (isDbReady()) {
      const updated = await Task.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true, runValidators: true }
      );
      if (!updated) {
        return res.status(404).json({ success: false, message: 'Task not found in MongoDB.' });
      }
      return res.status(200).json({
        success: true,
        message: 'MongoDB document updated successfully.',
        data: updated
      });
    }

    const index = memoryTasks.findIndex(t => t._id === req.params.id);
    if (index === -1) return res.status(404).json({ success: false, message: 'Task not found.' });

    memoryTasks[index] = { ...memoryTasks[index], ...req.body };
    res.status(200).json({ success: true, data: memoryTasks[index] });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// PATCH /api/tasks/:id/status - Toggle/Update status
router.patch('/:id/status', async (req, res) => {
  try {
    const { status } = req.body;

    if (isDbReady()) {
      const current = await Task.findById(req.params.id);
      if (!current) {
        return res.status(404).json({ success: false, message: 'Task not found.' });
      }

      let nextStatus = status;
      if (!nextStatus) {
        nextStatus = current.status === 'pending'
          ? 'in-progress'
          : current.status === 'in-progress'
            ? 'completed'
            : 'pending';
      }

      current.status = nextStatus;
      await current.save();

      return res.status(200).json({
        success: true,
        message: `Status updated to '${nextStatus}' in MongoDB.`,
        data: current
      });
    }

    const task = memoryTasks.find(t => t._id === req.params.id);
    if (!task) return res.status(404).json({ success: false, message: 'Task not found.' });

    task.status = status || (task.status === 'pending' ? 'in-progress' : (task.status === 'in-progress' ? 'completed' : 'pending'));
    res.status(200).json({ success: true, data: task });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// DELETE /api/tasks/:id - Remove document from MongoDB
router.delete('/:id', async (req, res) => {
  try {
    if (isDbReady()) {
      const deleted = await Task.findByIdAndDelete(req.params.id);
      if (!deleted) {
        return res.status(404).json({ success: false, message: 'Task not found in MongoDB.' });
      }
      return res.status(200).json({
        success: true,
        message: `Task '${deleted.title}' permanently removed from MongoDB collection.`,
        data: deleted
      });
    }

    const index = memoryTasks.findIndex(t => t._id === req.params.id);
    if (index === -1) return res.status(404).json({ success: false, message: 'Task not found.' });

    const [deleted] = memoryTasks.splice(index, 1);
    res.status(200).json({ success: true, message: 'Task deleted from memory.', data: deleted });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
