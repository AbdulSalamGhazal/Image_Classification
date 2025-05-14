# ML API Documentation

The ML API is a FastAPI-based service that provides image classification and object detection capabilities using state-of-the-art deep learning models.

## 🧠 Models

### Classification Model (DenseNet121)
- Purpose: Binary classification of chest X-ray images
- Input: 256x256 RGB images
- Output: Probability scores for each class
- Ensemble: Uses multiple models for improved accuracy
- Threshold: Default classification threshold is 0.5

### Detection Model (YOLOv8)
- Purpose: Object detection in chest X-ray images
- Input: Variable size RGB images
- Output: Bounding boxes with confidence scores
- Configuration:
  - IOU Threshold: 0.45
  - Confidence Threshold: 0.25
  - Number of Folds: 5

## 🚀 API Endpoints

### POST /analyze
Analyzes an image using both classification and detection models.

**Request:**
```json
{
  "image": "base64_encoded_image",
  "options": {
    "classification_threshold": 0.5,
    "detection_iou_threshold": 0.45,
    "detection_conf_threshold": 0.25
  }
}
```

**Response:**
```json
{
  "classification": {
    "predictions": [
      {
        "class": "Opacity",
        "probability": 0.95
      },
      {
        "class": "Normal",
        "probability": 0.05
      }
    ],
    "ensemble_decision": "Opacity"
  },
  "detection": {
    "boxes": [
      {
        "x": 100,
        "y": 150,
        "width": 200,
        "height": 200,
        "confidence": 0.92,
        "class": "Opacity"
      }
    ]
  }
}
```

## ⚙️ Configuration

### Environment Variables
```env
PYTHONUNBUFFERED=1
MODEL_DIR=classification_models
YOLO_DIR=yolo_runs
```

### Model Directories
- Classification models: `classification_models/`
- YOLO models: `yolo_runs/yolo_fold{1-5}_exp/weights/best.pt`

## 🛠 Setup

1. Create a Python virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

2. Install dependencies:
```bash
pip install -r requirements.txt
```

3. Start the server:
```bash
uvicorn api_server:app --host 0.0.0.0 --port 8000
```

## 🔧 GPU Support

The API automatically detects and uses GPU if available:
- TensorFlow GPU for classification
- PyTorch CUDA for YOLO detection
- Memory growth enabled for efficient GPU usage

To force CPU usage, set:
```bash
export CUDA_VISIBLE_DEVICES=-1
```

## 📊 Performance

- Classification: ~100ms per image (GPU)
- Detection: ~200ms per image (GPU)
- Ensemble processing: ~300ms per image (GPU)

## 🔍 Error Handling

The API includes comprehensive error handling for:
- Invalid image formats
- Model loading failures
- GPU memory issues
- Invalid request parameters

## 🧪 Testing

Run tests using pytest:
```bash
pytest tests/
```

## 📝 Notes

- Models are loaded at startup
- GPU memory growth is enabled by default
- Supports multiple concurrent requests
- Includes request validation
- Provides detailed error messages 