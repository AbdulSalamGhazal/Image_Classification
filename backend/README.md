# Backend API Documentation

The backend service provides a RESTful API for the Image Classification System, handling image uploads, analysis requests, and data persistence.

## 🚀 Features

- RESTful API endpoints
- Secure file uploads with Multer
- MongoDB integration with Mongoose
- JWT authentication
- ML API integration
- Image storage and management
- Comment system for analyzed images

## 📋 API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration

### Image Analysis
- `POST /api/analyze` - Upload and analyze an image
- `GET /api/analyze/:id` - Get analysis results

### Saved Images
- `GET /api/saved-images` - List all saved images
- `POST /api/saved-images` - Save a new image with analysis
- `DELETE /api/saved-images/:id` - Delete a saved image
- `POST /api/saved-images/:id/comments` - Add a comment

## ⚙️ Configuration

### Environment Variables
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/image-classification
ML_API_URL=http://localhost:8000
JWT_SECRET=your_jwt_secret
MAX_FILE_SIZE=5242880  # 5MB
ALLOWED_FILE_TYPES=image/jpeg,image/png
```

### File Upload
- Maximum file size: 5MB
- Allowed types: JPEG, PNG
- Storage: `uploads/saved/` directory
- Automatic directory creation

## 🛠 Setup

1. Install dependencies:
```bash
npm install
```

2. Configure environment:
```bash
cp .env.example .env
# Edit .env with your configuration
```

3. Start the server:
```bash
# Development
npm run dev

# Production
npm start
```

## 📁 Project Structure

```
backend/
├── models/           # Database models
│   ├── User.js
│   └── SavedImage.js
├── routes/           # API routes
│   ├── auth.js
│   ├── analyze.js
│   └── savedImages.js
├── middleware/       # Custom middleware
├── uploads/         # Uploaded images
│   └── saved/      # Saved analyzed images
├── server.js        # Main application file
└── package.json
```

## 🔒 Security

- JWT-based authentication
- Secure file upload validation
- CORS configuration
- Rate limiting
- Input validation
- Error handling

## 📊 Database Schema

### User Model
```javascript
{
  username: String,
  email: String,
  password: String (hashed),
  role: String,
  createdAt: Date
}
```

### SavedImage Model
```javascript
{
  imageUrl: String,
  analysisResult: Object,
  comments: [{
    text: String,
    user: ObjectId,
    createdAt: Date
  }],
  createdAt: Date
}
```

## 🧪 Testing

Run tests using Jest:
```bash
npm test
```

## 📝 Notes

- Uses Express.js for routing
- MongoDB for data persistence
- Multer for file uploads
- JWT for authentication
- Axios for ML API communication
- Automatic directory creation for uploads
- Error logging and monitoring
- Request validation
- Response compression 