const express = require('express');
const { createTask, getTasks, updateTask, deleteTask } = require('../controllers/task.controller.js');
const requireAuth = require('../middleware/requireAuth.js');

const router = express.Router();

// Apply the middleware to ALL routes below this line
router.use(requireAuth);

router.post('/', createTask);
router.get('/', getTasks);
router.put('/:id', updateTask);
router.delete('/:id', deleteTask);

module.exports = router;