const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const multer = require("multer");
require("dotenv").config();

// Safe Cloudinary configuration
const cloudinaryConfig = {
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
};

// Check if variables exist before configuring
if (!cloudinaryConfig.cloud_name || !cloudinaryConfig.api_key || !cloudinaryConfig.api_secret) {
  console.warn("⚠️ Cloudinary environment variables are missing! Media features will be disabled.");
} else {
  cloudinary.config(cloudinaryConfig);
}

// Configure Multer storage using Cloudinary
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (req, file) => {
    if (!file) return null;
    
    // Determine folder and resource_type based on the file type
    const isPdf = file.mimetype === "application/pdf";
    return {
      folder: "devmate/posts",
      resource_type: isPdf ? "raw" : "image",
      allowed_formats: ["jpg", "jpeg", "png", "gif", "webp", "pdf"],
      public_id: `${Date.now()}-${file.originalname.split('.')[0]}`,
    };
  },
});

// Setup multer
// Limit size to 5MB
const upload = multer({ 
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }
});

module.exports = { cloudinary, upload };
