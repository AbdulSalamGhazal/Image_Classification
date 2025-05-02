const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const multer = require('multer');
const path = require('path');
const savedImagesRouter = require('./routes/savedImages');

// Load environment variables
dotenv.config();

// Create Express app
const app = express();

// Configure multer for file upload
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from the uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/image-classification', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('Connected to MongoDB'))
.catch((err) => console.error('MongoDB connection error:', err));

// Basic route
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to Image Classification API' });
});

// Image analysis endpoint
app.post('/api/analyze', upload.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No image file provided' });
  }

  // Simulate processing time
  setTimeout(() => {
    // Generate random probability between 0.5 and 1.0
    const probability = (Math.random() * 0.5 + 0.5).toFixed(2);
    
    // Generate random bounding box values (x, y, width, height)
    // Values are normalized between 0 and 1
    const x = (Math.random() * 0.7).toFixed(2); // x coordinate (0-0.7)
    const y = (Math.random() * 0.7).toFixed(2); // y coordinate (0-0.7)
    const width = (Math.random() * 0.3 + 0.1).toFixed(2); // width (0.1-0.4)
    const height = (Math.random() * 0.3 + 0.1).toFixed(2); // height (0.1-0.4)

    res.json({
      probability: parseFloat(probability),
      boundingBox: {
        x: parseFloat(x),
        y: parseFloat(y),
        width: parseFloat(width),
        height: parseFloat(height)
      }
    });
  }, 2000); // Simulate 2 seconds processing time
});

app.use('/api/saved-images', savedImagesRouter);

// Start server
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
}); 