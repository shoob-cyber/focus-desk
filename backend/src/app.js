const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/auth.routes.js'); 
const taskRoutes = require('./routes/task.routes.js'); 
const sessionRoutes = require('./routes/session.routes.js'); 
// NEW: Import analytics routes
const analyticsRoutes = require('./routes/analytics.routes.js'); 

const app = express();

app.use(cors()); 
app.use(express.json()); 

app.get('/', (req, res) => {
  res.status(200).json({ status: 'success', message: 'FocusDesk API is up and running!' });
});

app.use('/api/auth', authRoutes); 
app.use('/api/tasks', taskRoutes); 
app.use('/api/sessions', sessionRoutes); 
// NEW: Mount analytics routes
app.use('/api/analytics', analyticsRoutes); 

module.exports = app;