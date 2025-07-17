const jwt = require('jsonwebtoken');


const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  console.error('❌ JWT_SECRET is not defined. Please check your .env file.');
  process.exit(1); 
}

const protect = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: 'Access denied. Token missing or malformed.' });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET); 
    req.user = decoded; 
    next();
  } catch (err) {
    console.error('[AUTH ERROR]', err);
    return res.status(401).json({ error: 'Invalid or expired token.' });
  }
};


const isAdmin = (req, res, next) => {
  if (req.user?.role === 'admin') {
    return next();
  } else {
    return res.status(403).json({ error: 'Access denied. Admins only.' });
  }
};

module.exports = {
  protect,
  isAdmin
};
