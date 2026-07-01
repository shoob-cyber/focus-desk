const express = require('express');
const { logSession, getSessions } = require('../controllers/session.controller.js');
const requireAuth = require('../middleware/requireAuth.js');

const router = express.Router();

// Apply security middleware so only logged-in users can log sessions
router.use(requireAuth);

router.post('/', logSession);
router.get('/', getSessions);

module.exports = router;