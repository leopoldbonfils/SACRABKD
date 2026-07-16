const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { cloudinary, isConfigured } = require('../config/cloudinary');

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Multer Local Storage Configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

// File filter for acceptable file formats
const fileFilter = (req, file, cb) => {
  // Allow common images, docs, and video formats
  const allowedExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.pdf', '.doc', '.docx', '.mp4', '.webm', '.ogg'];
  const ext = path.extname(file.originalname).toLowerCase();
  
  if (allowedExtensions.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error(`Unsupported file type: ${ext}`), false);
  }
};

const multerUpload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 200 * 1024 * 1024 // 200MB maximum limit (for videos)
  }
});

// Middleware wrapper to handle Cloudinary upload if configured, or keep local file
const handleFileUpload = async (req, res, next) => {
  if (!req.file) {
    return next();
  }

  // File properties
  const localFilePath = req.file.path;
  const ext = path.extname(req.file.originalname).toLowerCase();
  
  // Format sizes for frontend
  const sizeInMB = (req.file.size / (1024 * 1024)).toFixed(1);
  req.file.formattedSize = `${sizeInMB} MB`;

  if (isConfigured) {
    try {
      // Determine folder and resource type based on extension
      let folderName = 'sacra/others';
      let resourceType = 'auto';

      if (['.jpg', '.jpeg', '.png', '.gif', '.webp'].includes(ext)) {
        folderName = 'sacra/images';
        resourceType = 'image';
      } else if (['.mp4', '.webm', '.ogg'].includes(ext)) {
        folderName = 'sacra/videos';
        resourceType = 'video';
      } else if (['.pdf', '.doc', '.docx'].includes(ext)) {
        folderName = 'sacra/documents';
        resourceType = 'raw'; // raw for files/documents
      }

      // Upload to Cloudinary
      const result = await cloudinary.uploader.upload(localFilePath, {
        folder: folderName,
        resource_type: resourceType
      });

      // Remove temp file from local folder
      fs.unlinkSync(localFilePath);

      // Overwrite file attributes in req.file with Cloudinary details
      req.file.url = result.secure_url;
      req.file.public_id = result.public_id;
      req.file.dimensions = result.width && result.height ? `${result.width} x ${result.height} px` : 'N/A';
      
      next();
    } catch (error) {
      console.error('Cloudinary upload failed, falling back to local storage:', error.message);
      // Fallback: keep local file, set local URL
      const host = req.get('host');
      const protocol = req.protocol;
      req.file.url = `${protocol}://${host}/uploads/${req.file.filename}`;
      req.file.dimensions = 'N/A';
      next();
    }
  } else {
    // No Cloudinary credentials - serve locally
    const host = req.get('host');
    const protocol = req.protocol;
    req.file.url = `${protocol}://${host}/uploads/${req.file.filename}`;
    req.file.dimensions = 'N/A';
    next();
  }
};

module.exports = {
  uploadSingle: (fieldName) => [multerUpload.single(fieldName), handleFileUpload]
};
