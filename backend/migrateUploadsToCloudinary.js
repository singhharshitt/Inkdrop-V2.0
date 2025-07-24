require('dotenv').config({ path: __dirname + '/.env' });
const fs = require('fs');
const path = require('path');
const axios = require('axios');
const cloudinary = require('cloudinary').v2;
const mongoose = require('mongoose');
const { createClient } = require('@supabase/supabase-js');
const Book = require('./models/Book');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

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

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB connected"))
  .catch(err => console.log("❌ MongoDB connection error:", err));

const isCloudUrl = (url) => url && url.startsWith('https://res.cloudinary.com/');

const downloadFile = async (url, dest) => {
  try {
    const response = await axios.get(url, { responseType: 'stream' });
    const writer = fs.createWriteStream(dest);
    response.data.pipe(writer);
    return new Promise((resolve, reject) => {
      writer.on('finish', resolve);
      writer.on('error', reject);
    });
  } catch (err) {
    if (err.response) {
      console.error(`❌ Failed to download from Supabase: ${url}`, 'Status:', err.response.status, 'Data:', err.response.data);
    } else {
      console.error(`❌ Failed to download from Supabase: ${url}`, err.message);
    }
    return false;
  }
};

async function findSupabaseFilePath(bucket, folder, bookTitle, ext) {
  const safeTitle = bookTitle.replace(/[^a-z0-9]/gi, '_').toLowerCase();
  const { data, error } = await supabase.storage.from(bucket).list(folder, { limit: 1000 });
  if (error) {
    console.error('Supabase list error:', error.message);
    return null;
  }
  const match = data.find(file =>
    file.name.replace(/\.[^/.]+$/, '').toLowerCase().includes(safeTitle)
    && file.name.endsWith(ext)
  );
  if (match) {
    return `${folder}/${match.name}`;
  }
  return null;
}

const migrateMissingPDFsAndCoversToCloudinary = async () => {
  const books = await Book.find();
  const bucket = 'inkdroop3';
  for (let book of books) {
    const safeTitle = book.title.replace(/[^a-z0-9]/gi, '_').toLowerCase();
    const localPdfPath = path.join(__dirname, `uploads/pdfs/${safeTitle}.pdf`);
    const localCoverPath = path.join(__dirname, `uploads/covers/${safeTitle}.jpg`);
    // --- PDF Migration ---
    let needsPdfUpload = false;
    if (!book.fileUrl || !isCloudUrl(book.fileUrl)) {
      needsPdfUpload = true;
    }
    if (needsPdfUpload) {
      // Try to auto-detect and download from Supabase if available
      if (!fs.existsSync(localPdfPath) && book.fileUrl && book.fileUrl.includes('supabase.co')) {
        const supaPath = await findSupabaseFilePath(bucket, 'pdfs', book.title, '.pdf');
        if (supaPath) {
          const { data: urlData } = supabase.storage.from(bucket).getPublicUrl(supaPath);
          if (urlData && urlData.publicUrl) {
            console.log(`⬇️  Downloading detected PDF from Supabase for: ${book.title}`);
            await downloadFile(urlData.publicUrl, localPdfPath);
          }
        }
      }
      console.log('Looking for PDF:', localPdfPath);
      if (fs.existsSync(localPdfPath)) {
        try {
          const res = await cloudinary.uploader.upload(localPdfPath, {
            folder: 'inkdrop/pdfs',
            resource_type: 'raw',
            format: 'pdf',
            quality: 'auto',
            fetch_format: 'auto',
          });
          console.log(`✅ Uploaded PDF for book: ${book.title} to Cloudinary at:`, res.secure_url, 'public_id:', res.public_id, 'folder:', res.folder);
          book.fileUrl = res.secure_url;
          await book.save();
        } catch (cloudErr) {
          console.error(`❌ Cloudinary PDF upload failed for ${book.title}:`, cloudErr.message);
        }
      } else {
        console.warn(`⚠️ Local PDF not found: ${book.title}`);
      }
    }
    // --- Cover Migration ---
    let needsCoverUpload = false;
    if (!book.coverImageUrl || !isCloudUrl(book.coverImageUrl)) {
      needsCoverUpload = true;
    }
    if (needsCoverUpload) {
      // Try to auto-detect and download from Supabase if available
      if (!fs.existsSync(localCoverPath) && book.coverImageUrl && book.coverImageUrl.includes('supabase.co')) {
        const supaPath = await findSupabaseFilePath(bucket, 'covers', book.title, '.jpg');
        if (supaPath) {
          const { data: urlData } = supabase.storage.from(bucket).getPublicUrl(supaPath);
          if (urlData && urlData.publicUrl) {
            console.log(`⬇️  Downloading detected cover from Supabase for: ${book.title}`);
            await downloadFile(urlData.publicUrl, localCoverPath);
          }
        }
      }
      console.log('Looking for cover:', localCoverPath);
      if (fs.existsSync(localCoverPath)) {
        try {
          const res = await cloudinary.uploader.upload(localCoverPath, {
            folder: 'inkdrop/covers',
            resource_type: 'image',
            quality: 'auto:eco',
            fetch_format: 'auto',
          });
          console.log(`✅ Uploaded cover for book: ${book.title} to Cloudinary at:`, res.secure_url, 'public_id:', res.public_id, 'folder:', res.folder);
          book.coverImageUrl = res.secure_url;
          await book.save();
        } catch (cloudErr) {
          console.error(`❌ Cloudinary cover upload failed for ${book.title}:`, cloudErr.message);
        }
      } else {
        console.warn(`⚠️ Local cover image not found: ${book.title}`);
      }
    }
  }
  console.log('✅ PDF and cover migration (missing/broken only) complete');
};

async function runMigrations() {
  try {
    await migrateMissingPDFsAndCoversToCloudinary();
  } catch (err) {
    console.error('❌ Migration process failed:', err);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 MongoDB disconnected');
  }
}

runMigrations();
