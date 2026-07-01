require('dotenv').config(); // Loads your .env variables securely
const app = require('./src/app');

// Fallback to 5000 if PORT isn't found in the .env
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 FocusDesk server is live on http://localhost:${PORT}`);
});