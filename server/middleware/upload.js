const multer = require('multer');
const path = require('path');
const crypto = require('crypto');
const fs = require('fs').promises;
const { fileTypeFromBuffer } = require('file-type');

// Allowed file extensions and MIME types
const allowedExtensions = ['.pdf', '.jpg', '.jpeg', '.png', '.gif', '.webp'];
const allowedMimeTypes = [
  'application/pdf',
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp'
];

// Store files locally on disk
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    // replace code which uploaded at the same millisecond will overwrite each other with random hex no. to avoid overwrite each other
    const randomBytes = crypto.randomBytes(16).toString('hex');
    const timestamp = Date.now();
    const extension = path.extname(file.originalname).toLowerCase();
    cb(null, `${timestamp}-${randomBytes}${extension}`);
  },
});

// File filter to allow only PDF documents and approved image formats
const fileFilter = (req, file, cb) => {
  const extname = path.extname(file.originalname).toLowerCase();
  const mimetype = file.mimetype;

  if (!allowedExtensions.includes(extname) || !allowedMimeTypes.includes(mimetype)) {
    const error = new Error('Only PDF documents and approved image formats are permitted.');
    error.status = 400;
    return cb(error, false);
  }

  cb(null, true);
};

// Upload middleware to handle file uploads with file type and size validation
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024
  }
});

// Validate file signature to ensure it matches the expected format
const validateFileSignature = async (req, res, next) => {
  if (!req.file) {
    return next();
  }

  let filePath;
  try {
    filePath = path.join(__dirname, '../uploads', req.file.filename);
    const fileBuffer = await fs.readFile(filePath);
    const fileTypeResult = await fileTypeFromBuffer(fileBuffer);

    if (!fileTypeResult) {
      await fs.unlink(filePath);
      return res.status(400).json({ message: 'Only PDF documents and approved image formats are permitted.' });
    }

    const { ext, mime } = fileTypeResult;
    const normalizedExt = '.' + ext.toLowerCase();
    const normalizedMime = mime.toLowerCase();

    if (!allowedExtensions.includes(normalizedExt) || !allowedMimeTypes.includes(normalizedMime)) {
      await fs.unlink(filePath);
      return res.status(400).json({ message: 'Only PDF documents and approved image formats are permitted.' });
    }

    next();
  } catch (error) {
    if (filePath) {
      try {
        await fs.unlink(filePath);
      } catch (unlinkError) {
        console.error('Failed to clean up file:', unlinkError);
      }
    }
    next(error);
  }
};

module.exports = {
  upload,
  validateFileSignature
};

