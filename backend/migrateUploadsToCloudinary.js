const fs = require('fs');
const path = require('path');
const cloudinary = require('cloudinary').v2;
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Book = require('./models/Book'); // adjust as needed
const supabase = require('./supabaseClient');

dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_API_KEY,
  api_secret: process.env.CLOUD_API_SECRET,
});

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch(err => console.log("Mongo error:", err));

const uploadToSupabase = async (filePath, storagePath) => {
  const fileBuffer = fs.readFileSync(filePath);
  const { data, error } = await supabase.storage
    .from('inkdroop3') // use your actual Supabase storage bucket name
    .upload(storagePath, fileBuffer, {
      contentType: 'application/pdf',
      upsert: true,
    });

  if (error) {
    console.error("Supabase Upload Error:", error.message);
    return null;
  }

  return `${process.env.SUPABASE_URL.replace('.co', '.co/storage/v1/object/public')}/inkdroop3/${storagePath}`;
};

const uploadFolder = async () => {
  const books = await Book.find();

  for (let book of books) {
    let updated = false;
    try {
      // Upload Cover Image to Cloudinary
      if (book.coverImageUrl && !book.coverImageUrl.startsWith("http")) {
        const localCoverPath = path.join(__dirname, book.coverImageUrl);
        if (fs.existsSync(localCoverPath)) {
          try {
            const res = await cloudinary.uploader.upload(localCoverPath, {
              folder: 'inkdrop/covers',
            });
            book.coverImageUrl = res.secure_url;
            updated = true;
          } catch (cloudErr) {
            console.error(`❌ Cloudinary Cover Upload Failed: ${book.title}`, cloudErr.message);
            const supaPath = `covers/${path.basename(book.coverImageUrl)}`;
            const supaUrl = await uploadToSupabase(localCoverPath, supaPath);
            if (supaUrl) {
              book.coverImageUrl = supaUrl;
              updated = true;
            }
          }
        }
      }

      // Upload PDF to Cloudinary or Supabase
      if (book.fileUrl && !book.fileUrl.startsWith("http")) {
        const localPdfPath = path.join(__dirname, book.fileUrl);
        if (fs.existsSync(localPdfPath)) {
          try {
            const res = await cloudinary.uploader.upload(localPdfPath, {
              folder: 'inkdrop/pdfs',
              resource_type: 'raw',
            });
            book.fileUrl = res.secure_url;
            updated = true;
          } catch (cloudErr) {
            console.error(`❌ Cloudinary PDF Upload Failed: ${book.title}`, cloudErr.message);
            const supaPath = `pdfs/${path.basename(book.fileUrl)}`;
            const supaUrl = await uploadToSupabase(localPdfPath, supaPath);
            if (supaUrl) {
              book.fileUrl = supaUrl;
              updated = true;
            }
          }
        }
      }

      if (updated) {
        await book.save();
        console.log(`✅ Updated book: ${book.title}`);
      }
    } catch (err) {
      console.error(`⚠️ Error processing book: ${book.title}`, err);
    }
  }

  console.log("✅ Migration complete");
  mongoose.disconnect();
};

uploadFolder();
