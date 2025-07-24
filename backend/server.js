const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const cookieParser = require('cookie-parser');

// Load environment variables
dotenv.config();

const app = express();

// ✅ CORS configuration
const allowedOrigins = [
  'http://localhost:5173', // local dev frontend
  'https://inkdrop-v2-0.onrender.com' // deployed frontend
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));

// ✅ Middleware
app.use(express.json());
app.use(cookieParser());

// ✅ Static file serving (uploaded files)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ✅ API Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/books', require('./routes/bookroutes'));
app.use('/api/requests', require('./routes/requestRoutes'));
app.use('/api/downloads', require('./routes/downloadRoutes'));
app.use('/api/notifications', require('./routes/notificationRoutes'));
app.use('/api/categories', require('./routes/categoryRoutes'));
app.use('/api/dashboard', require('./routes/dashboardRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));
app.use('/api/user/dashboard', require('./routes/dashboardUser'));
app.use('/api/contact', require('./routes/contact'));

// ✅ Serve frontend for unknown routes (SPA fallback)
app.use((req, res, next) => {
  if (req.method === 'GET' && !req.path.startsWith('/api') && !req.path.startsWith('/uploads')) {
    res.sendFile(path.join(__dirname, '../frontend/index.html'));
  } else {
    next();
  }
});

// ✅ MongoDB Connection
mongoose.set('strictQuery', true);

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
  .then(() => {
    console.log('✅ MongoDB Connected');
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
    });
  })
  .catch(err => {
    console.error('❌ MongoDB connection error:', err);
  });
