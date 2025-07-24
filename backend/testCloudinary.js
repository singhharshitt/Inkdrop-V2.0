require('dotenv').config();
const cloudinary = require('cloudinary').v2;

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_API_KEY,
  api_secret: process.env.CLOUD_API_SECRET
});

cloudinary.api.ping(function(error, result) {
  console.log('Cloudinary ping result:', result);
  console.log('Cloudinary ping error:', error);
}); 