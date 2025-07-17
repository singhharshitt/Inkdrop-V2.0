const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Book title is required'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  author: {
    type: String,
    required: [true, 'Author name is required'],
    trim: true,
    maxlength: [100, 'Author name cannot exceed 100 characters']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [1000, 'Description cannot exceed 1000 characters']
  },
  copiesSold: {
  type: Number,
  default: 0,
},
  category: {
    type: String,
    required: [true, 'Category is required'],
    trim: true
    
  },
  fileUrl: {
    type: String,
    required: [true, 'File URL is required'],
    validate: {
      validator: function (v) {
        return /\.pdf$/i.test(v);
      },
      message: props => `${props.value} is not a valid PDF file URL`
    }
  },
  coverImageUrl: {
    type: String,
    default: '/images/default-book-cover.jpg'
  },
  fileSize: {
    type: Number,
    required: true,
    min: [1, 'File size must be at least 1 byte']
  },
  pages: {
    type: Number,
    min: [1, 'Book must have at least 1 page']
  },
  publicationYear: {
    type: Number,
    min: [1000, 'Publication year must be after 1000 AD'],
    max: [new Date().getFullYear(), 'Publication year cannot be in the future']
  },
  downloadCount: {
    type: Number,
    default: 0,
    min: 0
  },
  isFeatured: {
    type: Boolean,
    default: false
  },
  uploadDate: {
    type: Date,
    default: Date.now
  },
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  tags: [{
    type: String,
    trim: true,
    maxlength: [30, 'Tag cannot exceed 30 characters']
  }],

  
  lastDownloadedAt: {
    type: Date,
    default: null
  },
  downloadedBy: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }]
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});


bookSchema.index({ title: 'text', author: 'text', description: 'text' });
bookSchema.index({ category: 1 });
bookSchema.index({ downloadCount: -1 });


bookSchema.virtual('formattedFileSize').get(function () {
  if (this.fileSize < 1024) return `${this.fileSize} bytes`;
  if (this.fileSize < 1048576) return `${(this.fileSize / 1024).toFixed(1)} KB`;
  return `${(this.fileSize / 1048576).toFixed(1)} MB`;
});

module.exports = mongoose.model('Book', bookSchema);
