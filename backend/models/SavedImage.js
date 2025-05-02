const mongoose = require('mongoose');

const savedImageSchema = new mongoose.Schema({
  imageUrl: {
    type: String,
    required: true
  },
  analysisResult: {
    probability: {
      type: Number,
      required: true
    },
    boundingBox: {
      x: Number,
      y: Number,
      width: Number,
      height: Number
    }
  },
  comments: [{
    text: {
      type: String,
      required: true
    },
    timestamp: {
      type: Date,
      default: Date.now
    }
  }],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('SavedImage', savedImageSchema); 