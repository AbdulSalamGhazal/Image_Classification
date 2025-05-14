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

## 🔧 Docker Setup and Usage

### Prerequisites
- Docker Desktop installed and running
- Docker Compose installed
- Git installed

### Quick Start with Docker

1. Clone the repository:
```bash
git clone https://github.com/AbdulSalamGhazal/Image_Classification.git
cd Image_Classification
```

2. Create necessary directories:
```bash
mkdir -p backend/uploads/saved ML_API/classification_models ML_API/yolo_runs
```

3. Start all services:
```bash
# Build and start all containers
docker-compose up --build

# Or run in detached mode (background)
docker-compose up -d --build
```

4. Access the application:
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000
- ML API: http://localhost:8000
- MongoDB: localhost:27017

### Common Docker Commands

```bash
# View running containers
docker-compose ps

# View logs
docker-compose logs -f        # All services
docker-compose logs -f frontend  # Frontend only
docker-compose logs -f backend   # Backend only

# Stop all services
docker-compose down

# Stop and remove volumes
docker-compose down -v

# Rebuild a specific service
docker-compose up -d --build frontend

# View container resource usage
docker stats
```

### Docker Services

1. **Frontend Service**
   - React application served via Nginx
   - Port: 3000 (host) → 80 (container)
   - Environment: Production-optimized build
   - Features: Static file serving, API proxy

2. **Backend Service**
   - Node.js Express API
   - Port: 5000
   - Features: File uploads, MongoDB connection
   - Volumes: Persistent upload storage

3. **MongoDB Service**
   - Latest MongoDB version
   - Port: 27017
   - Volume: Persistent data storage

### Troubleshooting

1. **Port Conflicts**
   - If ports 3000, 5000, or 27017 are in use:
   ```bash
   # Find process using port
   lsof -i :3000
   # Kill process
   kill -9 <PID>
   ```

2. **Container Issues**
   ```bash
   # Restart all services
   docker-compose restart
   
   # Rebuild and restart
   docker-compose up -d --build
   
   # Remove all containers and start fresh
   docker-compose down
   docker-compose up -d --build
   ```

3. **Volume Issues**
   ```bash
   # Remove all volumes and start fresh
   docker-compose down -v
   docker-compose up -d --build
   ```

4. **Logs and Debugging**
   ```bash
   # View detailed logs
   docker-compose logs -f --tail=100
   
   # Check container status
   docker-compose ps
   
   # Access container shell
   docker-compose exec backend sh
   docker-compose exec frontend sh
   ```

### Development with Docker

1. **Hot Reloading**
   - Frontend: Changes in `frontend/src` trigger automatic rebuild
   - Backend: Changes in `backend` trigger server restart
   - ML API: Changes require container rebuild

2. **Environment Variables**
   - Development: Use `.env` files in each service directory
   - Production: Use Docker Compose environment variables

3. **Adding Dependencies**
   ```bash
   # Frontend
   docker-compose exec frontend npm install <package>
   
   # Backend
   docker-compose exec backend npm install <package>
   ```

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