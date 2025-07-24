const cloudinary = require('./cloudinary');

function deleteAllPDFsAndImages() {
  // Delete PDFs
  cloudinary.api.delete_resources_by_prefix('inkdrop/pdfs/', {
    resource_type: 'raw'
  }, (error, result) => {
    if (error) console.error('Bulk PDF delete failed:', error);
    else console.log('PDFs deleted:', result);
  });

  // Delete cover images
  cloudinary.api.delete_resources_by_prefix('inkdrop/covers/', {
    resource_type: 'image'
  }, (error, result) => {
    if (error) console.error('Bulk image delete failed:', error);
    else console.log('Images deleted:', result);
  });
}

module.exports = deleteAllPDFsAndImages;
