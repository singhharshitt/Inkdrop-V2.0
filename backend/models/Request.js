const mongoose = require('mongoose');

const requestSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Book title is required'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  author: {
    type: String,
    trim: true,
    maxlength: [100, 'Author name cannot exceed 100 characters']
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    trim: true
    
  },
  additionalNotes: {
    type: String,
    trim: true,
    maxlength: [500, 'Notes cannot exceed 500 characters']
  },
  requestedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  status: {
    type: String,
    enum: {
      values: ['Pending', 'Approved', 'Rejected', 'Fulfilled'],
      message: 'Invalid status value'
    },
    default: 'Pending'
  },
  adminNotes: {
    type: String,
    trim: true,
    maxlength: [500, 'Admin notes cannot exceed 500 characters']
  },
  fulfilledBook: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Book'
  }
}, {
  timestamps: true
});

// Indexes for better performance
requestSchema.index({ status: 1 });
requestSchema.index({ requestedBy: 1 });
requestSchema.index({ createdAt: -1 });

// Pre-save hook to validate fulfilledBook when status is Fulfilled
requestSchema.pre('save', function(next) {
  if (this.status === 'Fulfilled' && !this.fulfilledBook) {
    throw new Error('Fulfilled requests must reference a book');
  }
  next();
});

module.exports = mongoose.model('Request', requestSchema);