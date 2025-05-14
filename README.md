# Image Classification System

A full-stack web application for medical image classification and object detection using state-of-the-art machine learning models. This system is designed to assist medical professionals in analyzing chest X-ray images for pneumonia detection.

## 🚀 Features

- **Advanced Image Analysis**
  - Image classification using DenseNet121
  - Object detection using YOLOv8
  - Real-time image analysis with confidence scores
  - Support for multiple image formats (JPG, PNG, etc.)

- **User Interface**
  - Modern, responsive dashboard with statistics
  - Interactive image inspection and analysis
  - Save and manage analyzed images
  - Comment system for collaborative analysis
  - Real-time model performance metrics

- **Technical Features**
  - RESTful API architecture
  - Secure file uploads and storage
  - MongoDB for persistent data storage
  - Docker containerization for easy deployment
  - GPU acceleration support (when available)

## 🛠 Tech Stack

### Frontend
- React.js 18
- Material-UI (MUI) for modern UI components
- Axios for API communication
- React Router v6 for navigation
- Recharts for data visualization

### Backend
- Node.js with Express
- MongoDB with Mongoose ODM
- Multer for secure file uploads
- JWT for authentication
- Machine Learning models:
  - DenseNet121 for classification
  - YOLOv8 for object detection

### ML API
- FastAPI for high-performance ML endpoints
- TensorFlow for classification
- PyTorch/Ultralytics for YOLO detection
- GPU acceleration support
- Model ensemble for improved accuracy

## 📋 Prerequisites

- Node.js (v18 or later)
- Python 3.10 or later
- MongoDB (v4.4 or later)
- Docker and Docker Compose (for containerized deployment)
- Git

## 🚀 Quick Start

### Option 1: Using Docker (Recommended)

1. Clone the repository:
```bash
git clone https://github.com/AbdulSalamGhazal/Image_Classification.git
cd Image_Classification
```

2. Create necessary directories:
```bash
mkdir -p backend/uploads/saved ML_API/classification_models ML_API/yolo_runs
```

3. Start the application:
```bash
docker-compose up --build
```

The application will be available at:
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000
- ML API: http://localhost:8000
- MongoDB: localhost:27017

### Option 2: Manual Setup

1. Clone and prepare:
```bash
git clone https://github.com/AbdulSalamGhazal/Image_Classification.git
cd Image_Classification
```

2. Backend Setup:
```bash
cd backend
npm install
cp .env.example .env  # Configure your environment variables
npm run dev
```

3. Frontend Setup:
```bash
cd frontend
npm install
cp .env.example .env  # Configure your environment variables
npm start
```

4. ML API Setup:
```bash
cd ML_API
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn api_server:app --host 0.0.0.0 --port 8000
```

## ⚙️ Environment Variables

### Backend (.env)
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/image-classification
ML_API_URL=http://localhost:8000
JWT_SECRET=your_jwt_secret
MAX_FILE_SIZE=5242880  # 5MB
ALLOWED_FILE_TYPES=image/jpeg,image/png
```

### Frontend (.env)
```env
REACT_APP_API_URL=http://localhost:5000
```

### ML API (.env)
```env
PYTHONUNBUFFERED=1
MODEL_DIR=classification_models
YOLO_DIR=yolo_runs
```

## 📁 Project Structure

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
├── ML_API/
│   ├── api_server.py   # FastAPI server
│   ├── classify.py     # ML pipeline
│   └── requirements.txt
├── docker/            # Docker configuration
├── docker-compose.yml # Container orchestration
└── README.md
```

## 🔧 Docker Configuration

The project uses Docker for consistent development and deployment environments. Key configurations:

### Services
- **Frontend**: React app served on port 3000
- **Backend**: Express API on port 5000
- **ML API**: FastAPI service on port 8000
- **MongoDB**: Database on port 27017

### Volumes
- `mongodb_data`: Persistent MongoDB storage
- `backend/uploads`: Uploaded images storage
- `ML_API/classification_models`: ML model storage
- `ML_API/yolo_runs`: YOLO model storage

### Environment
All necessary environment variables are configured in `docker-compose.yml` and respective `.env` files.

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

Please ensure your code follows the existing style and includes appropriate tests.

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support, please:
1. Check the [documentation](docs/)
2. Search existing [issues](https://github.com/AbdulSalamGhazal/Image_Classification/issues)
3. Create a new issue if needed

## 🙏 Acknowledgments

- DenseNet121 model architecture
- YOLOv8 for object detection
- FastAPI and React communities
- All contributors to this project 