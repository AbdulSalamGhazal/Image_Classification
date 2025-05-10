# Image Classification System

A full-stack web application for image classification and object detection using machine learning models.

## Features

- Image classification using DenseNet121
- Object detection using YOLOv8
- Real-time image analysis
- Dashboard with statistics and model information
- Image inspection and analysis
- Save and manage analyzed images
- Comment system for analyzed images

## Tech Stack

### Frontend
- React.js
- Material-UI
- Axios for API calls
- React Router for navigation

### Backend
- Node.js with Express
- MongoDB for data storage
- Multer for file uploads
- Machine Learning models:
  - DenseNet121 for classification
  - YOLOv8 for object detection

## Setup

1. Clone the repository:
```bash
git clone https://github.com/AbdulSalamGhazal/Image_Classification.git
cd Image_Classification
```

2. Backend Setup:
```bash
cd backend
npm install
cp .env.example .env  # Configure your environment variables
npm start
```

3. Frontend Setup:
```bash
cd frontend
npm install
cp .env.example .env  # Configure your environment variables
npm start
```

4. Database Setup:
- Ensure MongoDB is installed and running
- The application will automatically create necessary collections

## Environment Variables

### Backend (.env)
- `PORT`: Server port (default: 5001)
- `MONGODB_URI`: MongoDB connection string
- `MAX_FILE_SIZE`: Maximum file upload size
- `ALLOWED_FILE_TYPES`: Allowed file types for upload

### Frontend (.env)
- `REACT_APP_API_URL`: Backend API URL

## Project Structure

```
Image_Classification/
├── backend/
│   ├── models/         # Database models
│   ├── routes/         # API routes
│   ├── uploads/        # Uploaded images
│   └── server.js       # Main server file
├── frontend/
│   ├── public/         # Static files
│   └── src/
│       ├── components/ # Reusable components
│       ├── pages/      # Page components
│       └── App.js      # Main app component
└── README.md
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details. 