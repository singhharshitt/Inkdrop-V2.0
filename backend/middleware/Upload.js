const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { v2: cloudinary } = require('cloudinary');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const supabase = require('../utils/supabase'); // 👈 Add Supabase client
require('dotenv').config();

// Setup Cloudinary if credentials exist
const useCloudinary = process.env.CLOUD_NAME && process.env.CLOUD_API_KEY && process.env.CLOUD_API_SECRET;

if (useCloudinary) {
  cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.CLOUD_API_KEY,
    api_secret: process.env.CLOUD_API_SECRET,
  });
}

// Create directory if needed for local storage
const ensureDirExists = (dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
};

// File filter (same as before)
const fileFilter = (req, file, cb) => {
  const imageTypes = ['.jpg', '.jpeg', '.png', '.webp'];
  const docTypes = ['.pdf', '.epub'];
  const ext = path.extname(file.originalname).toLowerCase();

  if (
    (file.fieldname === 'cover' && imageTypes.includes(ext)) ||
    (file.fieldname === 'pdf' && docTypes.includes(ext))
  ) {
    cb(null, true);
  } else {
    cb(new Error(`Invalid file type for ${file.fieldname}`), false);
  }
};

// ===== STORAGE SETUP =====
let storage;

if (useCloudinary) {
  storage = new CloudinaryStorage({
    cloudinary,
    params: async (req, file) => {
      const folder = file.fieldname === 'cover' ? 'book_covers' : 'book_pdfs';
      const ext = path.extname(file.originalname).toLowerCase();
      return {
        folder,
        resource_type: ext === '.pdf' || ext === '.epub' ? 'raw' : 'image',
        public_id: `${Date.now()}-${file.originalname.replace(/[^a-zA-Z0-9.]/g, '-')}`,
      };
    },
  });
} else {
  // Local fallback with Supabase upload
  storage = multer.memoryStorage(); // we'll upload manually later
}

// ===== MULTER INSTANCE =====
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 50 * 1024 * 1024 // 50MB max
  }
});

// ===== Supabase Upload Logic =====
const uploadToSupabase = async (fileBuffer, filename, mimetype, folder = '') => {
  const cleanName = `${Date.now()}-${filename.replace(/[^a-zA-Z0-9.]/g, '-')}`;
  const uploadPath = `${folder}/${cleanName}`;

  const { data, error } = await supabase.storage
    .from('inkdroop3') // use your actual bucket
    .upload(uploadPath, fileBuffer, {
      contentType: mimetype,
    });

  if (error) throw error;

  const { publicUrl } = supabase.storage
    .from('inkdroop3')
    .getPublicUrl(uploadPath);

  return publicUrl;
};

// ===== Book Upload Middleware =====
const uploadBook = upload.fields([
  { name: 'cover', maxCount: 1 },
  { name: 'pdf', maxCount: 1 }
]);

// ===== Middleware to handle fallback to Supabase =====
const handleUploadFallback = async (req, res, next) => {
  if (useCloudinary) return next(); // Skip if Cloudinary worked

  try {
    req.supabaseUploads = {};

    if (req.files?.cover?.[0]) {
      const file = req.files.cover[0];
      const url = await uploadToSupabase(file.buffer, file.originalname, file.mimetype, 'covers');
      req.supabaseUploads.cover = url;
    }

    if (req.files?.pdf?.[0]) {
      const file = req.files.pdf[0];
      const url = await uploadToSupabase(file.buffer, file.originalname, file.mimetype, 'pdfs');
      req.supabaseUploads.pdf = url;
    }

    next();
  } catch (err) {
    console.error('Supabase Upload Error:', err);
    return res.status(500).json({ success: false, message: 'Supabase upload failed.' });
  }
};

// ===== Error Handling =====
const handleUploadErrors = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    return res.status(400).json({
      success: false,
      message: err.code === 'LIMIT_FILE_SIZE'
        ? 'File too large. Max 50MB allowed.'
        : 'Upload error: ' + err.message
    });
  } else if (err) {
    return res.status(400).json({
      success: false,
      message: err.message || 'Upload error occurred'
    });
  }
  next();
};

// ===== EXPORTS =====
module.exports = {
  uploadBook,
  handleUploadFallback,
  uploadMultipleBooks: upload.array('bookFiles', 3), // still local
  handleUploadErrors
};
