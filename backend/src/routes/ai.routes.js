const express = require('express');
const { breakdownTask } = require('../controllers/ai.controller');
const requireAuth = require('../middleware/requireAuth');

const router = express.Router();

router.post('/breakdown', requireAuth, breakdownTask);

module.exports = router;