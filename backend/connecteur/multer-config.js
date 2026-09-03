const multer = require('multer');

const storage = multer.memoryStorage();

module.exports = multer({
  storage: storage,
  limits: {
    fileSize: 4 * 1024 * 1024 // 4MB limit
  }
}).single('image');
