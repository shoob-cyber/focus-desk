const jwt = require('jsonwebtoken');

const requireAuth = (req, res, next) => {
  // 1. Get the token from the headers
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Unauthorized: No token provided' });
  }

  const token = authHeader.split(' ')[1];

  try {
    // 2. Verify the token using your secret key
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // 3. Attach the user's ID to the request object so the controller can use it
    req.user = { id: decoded.id };
    
    // 4. Move on to the next function (the controller)
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Unauthorized: Invalid token' });
  }
};

module.exports = requireAuth;