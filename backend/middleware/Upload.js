const multer = require('multer');
const path = require('path');
const fs = require('fs');

const ensureDirExists = (dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
};


const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const baseDir = 'uploads';
    const subDir = file.fieldname === 'cover' ? 'covers' : 'pdfs';
    const fullDir = path.join(baseDir, subDir);
    ensureDirExists(fullDir);
    cb(null, fullDir);
  },
  filename: function (req, file, cb) {
    const sanitizedName = file.originalname.replace(/[^a-zA-Z0-9.]/g, '-');
    const uniqueName = `${Date.now()}-${sanitizedName}`;
    cb(null, uniqueName);
  }
});


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


const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 50 * 1024 * 1024 // 50MB max
  }
});


const uploadBook = upload.fields([
  { name: 'cover', maxCount: 1 },
  { name: 'pdf', maxCount: 1 }
]);

// Error handling
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

module.exports = {
  uploadBook,
  uploadMultipleBooks: upload.array('bookFiles', 3),
  handleUploadErrors
};
