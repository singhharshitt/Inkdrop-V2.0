// deleteAllBooksFromCloudinary.js
const cloudinary = require('cloudinary').v2;
require('dotenv').config();

if (process.env.CLOUDINARY_URL) {
  cloudinary.config({
    cloudinary_url: process.env.CLOUDINARY_URL,
  });
} else {
  cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.CLOUD_API_KEY,
    api_secret: process.env.CLOUD_API_SECRET,
  });
}

async function deleteAllBooks() {
  try {
    const result = await cloudinary.api.delete_resources_by_prefix('books/');
    console.log('Deleted resources:', result);
  } catch (error) {
    console.error('Error deleting books:', error);
  }
}

deleteAllBooks();
