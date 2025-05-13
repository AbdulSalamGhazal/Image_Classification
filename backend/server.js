const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const multer = require('multer');
const path = require('path');
const axios = require('axios');
const FormData = require('form-data');
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
app.post('/api/analyze', upload.single('image'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No image file provided' });
  }

  const startTime = Date.now();

  try {
    // Create form data for the ML API
    const formData = new FormData();
    formData.append('file', req.file.buffer, {
      filename: req.file.originalname,
      contentType: req.file.mimetype
    });

    // Call the ML API
    const mlApiResponse = await axios.post('http://127.0.0.1:8000/predict/image/', formData, {
      headers: {
        ...formData.getHeaders()
      }
    });

    const processingTime = Date.now() - startTime;
    const responseData = {
      ...mlApiResponse.data,
      processingTime
    };

    // Log the analysis results
    console.log('\n=== Image Analysis Results ===');
    console.log('Probability:', (responseData.probability * 100).toFixed(2) + '%');
    console.log('Bounding Box:', responseData.boundingBox);
    console.log('Processing Time:', processingTime + 'ms');
    console.log('=============================\n');

    // Return the ML API response with processing time
    res.json(responseData);
  } catch (error) {
    console.error('Error calling ML API:', error);
    res.status(500).json({ 
      error: 'Error processing image',
      details: error.response?.data?.detail || error.message
    });
  }
});

app.use('/api/saved-images', savedImagesRouter);

// Start server
const PORT = process.env.PORT || 5050;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
}); 