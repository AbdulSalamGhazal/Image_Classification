const express = require('express');
const router = express.Router();
const SavedImage = require('../models/SavedImage');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configure multer for image storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = 'uploads/saved';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });

// Save a new image with analysis results and comments
router.post('/', upload.single('image'), async (req, res) => {
  try {
    const { analysisResult, comments } = req.body;
    const parsedAnalysisResult = JSON.parse(analysisResult);
    const parsedComments = JSON.parse(comments);

    const savedImage = new SavedImage({
      imageUrl: `/uploads/saved/${req.file.filename}`,
      analysisResult: parsedAnalysisResult,
      comments: parsedComments
    });

    await savedImage.save();
    res.status(201).json(savedImage);
  } catch (error) {
    console.error('Error saving image:', error);
    res.status(500).json({ error: 'Error saving image' });
  }
});

// Get all saved images
router.get('/', async (req, res) => {
  try {
    const savedImages = await SavedImage.find().sort({ createdAt: -1 });
    res.json(savedImages);
  } catch (error) {
    console.error('Error fetching saved images:', error);
    res.status(500).json({ error: 'Error fetching saved images' });
  }
});

// Get a single saved image
router.get('/:id', async (req, res) => {
  try {
    const savedImage = await SavedImage.findById(req.params.id);
    if (!savedImage) {
      return res.status(404).json({ error: 'Image not found' });
    }
    res.json(savedImage);
  } catch (error) {
    console.error('Error fetching saved image:', error);
    res.status(500).json({ error: 'Error fetching saved image' });
  }
});

// Delete a saved image
router.delete('/:id', async (req, res) => {
  try {
    const savedImage = await SavedImage.findById(req.params.id);
    if (!savedImage) {
      return res.status(404).json({ error: 'Image not found' });
    }

    // Delete the image file
    const imagePath = path.join(__dirname, '..', savedImage.imageUrl);
    if (fs.existsSync(imagePath)) {
      fs.unlinkSync(imagePath);
    }

    // Delete from database
    await SavedImage.findByIdAndDelete(req.params.id);
    res.json({ message: 'Image deleted successfully' });
  } catch (error) {
    console.error('Error deleting image:', error);
    res.status(500).json({ error: 'Error deleting image' });
  }
});

module.exports = router; 