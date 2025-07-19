const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const cookieParser = require('cookie-parser');

dotenv.config();

const app = express();

// ✅ Updated CORS configuration
const allowedOrigins = [
  'http://localhost:5173',
  'https://inkdroopp.onrender.com'
];

app.use(cors({
  origin: function (origin, callback) {
    // allow requests with no origin (like mobile apps, curl, postman)
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));

app.use(express.json()); 
app.use(cookieParser()); 

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ✅ Your existing routes remain unchanged
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
  .catch((err) => {
    console.error('❌ MongoDB connection error:', err);
  });

console.log('JWT_SECRET is:', process.env.JWT_SECRET);
