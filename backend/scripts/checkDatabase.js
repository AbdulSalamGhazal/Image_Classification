const mongoose = require('mongoose');
const SavedImage = require('../models/SavedImage');
require('dotenv').config();

async function checkDatabase() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/image-classification', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('Connected to MongoDB');

    // Get all saved images
    const savedImages = await SavedImage.find().sort({ createdAt: -1 });
    
    console.log('\nFound saved images:', savedImages.length);
    console.log('----------------------------------------');
    
    savedImages.forEach((image, index) => {
      console.log(`\nImage ${index + 1}:`);
      console.log('ID:', image._id);
      console.log('Image URL:', image.imageUrl);
      console.log('Detection Probability:', (image.analysisResult.probability * 100).toFixed(2) + '%');
      console.log('Bounding Box:', image.analysisResult.boundingBox);
      console.log('Comments:', image.comments.length);
      console.log('Created At:', image.createdAt);
      console.log('----------------------------------------');
    });

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\nDisconnected from MongoDB');
  }
}

checkDatabase(); 