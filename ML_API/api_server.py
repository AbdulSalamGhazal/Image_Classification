import os
import json
import numpy as np
import cv2
import tensorflow as tf
from tensorflow.keras.models import load_model
from ultralytics import YOLO
import torch # For NMS and checking CUDA
import torchvision # For NMS operations
import io
from contextlib import asynccontextmanager

from fastapi import FastAPI, File, UploadFile, HTTPException, Body
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from typing import Optional, List, Dict, Any

# --- Configuration (Update these paths if necessary) ---
CLASSIFIER_MODEL_DIR = 'classification_models/'
DETECTOR_MODEL_PATTERN = 'yolo_runs/yolo_fold{}_exp/weights/best.pt'
NUM_FOLDS = 5

CLASSIFIER_IMG_HEIGHT = 256
CLASSIFIER_IMG_WIDTH = 256

DEFAULT_CLASSIFICATION_THRESHOLD = 0.5 # This is implicit in the pipeline output
DEFAULT_DETECTION_IOU_THRESHOLD = 0.45
DEFAULT_DETECTION_CONF_THRESHOLD = 0.25

# Global model dictionary (populated at startup)
models_store = {}

# --- Pydantic Models for Request/Response ---
class BoundingBox(BaseModel):
    x: float
    y: float
    width: float
    height: float

class PredictionResponse(BaseModel):
    probability: float
    boundingBox: Optional[BoundingBox] = None

# --- GPU Configuration ---
def set_gpu_memory_growth():
    gpus = tf.config.experimental.list_physical_devices('GPU')
    if gpus:
        try:
            for gpu in gpus:
                tf.config.experimental.set_memory_growth(gpu, True)
            print(f"Successfully set memory growth for {len(gpus)} GPU(s).")
        except RuntimeError as e:
            print(f"Error setting memory growth: {e}")
    else:
        print("No GPUs detected by TensorFlow.")

# --- Model Loading Functions (Adapted from previous script) ---
def load_all_classifier_models(model_dir):
    models = []
    print("Loading Keras classifier models...")
    for i in range(1, NUM_FOLDS + 1):
        model_path = os.path.join(model_dir, f'classifier_split_{i}.keras')
        if os.path.exists(model_path):
            try:
                model = load_model(model_path)
                models.append(model)
                print(f"Loaded classifier model: {model_path}")
            except Exception as e:
                print(f"Error loading classifier model {model_path}: {e}")
        else:
            print(f"Classifier model not found: {model_path}")
    if not models:
        raise FileNotFoundError(f"No classifier models successfully loaded from {model_dir}.")
    return models

def load_all_detector_models(model_pattern):
    models = []
    print("Loading Ultralytics YOLO detector models...")
    for i in range(1, NUM_FOLDS + 1):
        model_path = model_pattern.format(i)
        if os.path.exists(model_path):
            try:
                model = YOLO(model_path)
                models.append(model)
                print(f"Loaded detector model: {model_path}")
            except Exception as e:
                print(f"Error loading detector model {model_path}: {e}")
        else:
            print(f"Detector model not found: {model_path}")
    if not models:
        raise FileNotFoundError(f"No detector models successfully loaded with pattern {model_pattern}.")
    return models

# --- Preprocessing Functions ---
def preprocess_image_for_classifier(image_array_bgr):
    img = cv2.cvtColor(image_array_bgr, cv2.COLOR_BGR2RGB)
    img = cv2.resize(img, (CLASSIFIER_IMG_WIDTH, CLASSIFIER_IMG_HEIGHT))
    img = img.astype(np.float32) / 255.0
    return np.expand_dims(img, axis=0)

# --- Prediction Functions ---
def predict_with_classifiers(image_array_processed, class_models):
    if not class_models:
        raise ValueError("Classifier models not loaded.")
    all_probabilities = [model.predict(image_array_processed, verbose=0)[0][0] for model in class_models]
    ensemble_probability = np.mean(all_probabilities)
    final_label_str = "Opacity" if ensemble_probability >= DEFAULT_CLASSIFICATION_THRESHOLD else "Normal"
    return final_label_str, float(ensemble_probability)

def ensemble_detections_nms(all_boxes, all_scores, all_classes, iou_threshold):
    if not all_boxes: return []
    boxes_tensor = torch.tensor(all_boxes, dtype=torch.float32)
    scores_tensor = torch.tensor(all_scores, dtype=torch.float32)
    if boxes_tensor.nelement() == 0: return []
    keep_indices = torchvision.ops.nms(boxes_tensor, scores_tensor, iou_threshold)
    final_boxes = []
    for idx in keep_indices:
        final_boxes.append([
            float(boxes_tensor[idx][0]), float(boxes_tensor[idx][1]),
            float(boxes_tensor[idx][2]), float(boxes_tensor[idx][3]),
            float(scores_tensor[idx]),
            int(all_classes[idx])
        ])
    return final_boxes

def predict_with_detectors(image_array_bgr, detect_models, iou_thresh, conf_thresh):
    if not detect_models:
        raise ValueError("Detector models not loaded.")

    image_input_for_yolo = cv2.cvtColor(image_array_bgr, cv2.COLOR_BGR2RGB)
    all_pred_boxes, all_pred_scores, all_pred_classes = [], [], []

    for model in detect_models:
        results = model.predict(image_input_for_yolo, conf=conf_thresh, verbose=False)
        if results and results[0].boxes:
            all_pred_boxes.extend(results[0].boxes.xyxy.cpu().numpy().tolist())
            all_pred_scores.extend(results[0].boxes.conf.cpu().numpy().tolist())
            all_pred_classes.extend(results[0].boxes.cls.cpu().numpy().tolist())

    if not all_pred_boxes: return []
    final_ensembled_boxes = ensemble_detections_nms(all_pred_boxes, all_pred_scores, all_pred_classes, iou_thresh)
    
    # Format output with class names (assuming class 0 is "Opacity")
    class_names = {0: "Opacity"}
    formatted_boxes = []
    for box_data in final_ensembled_boxes:
        x1, y1, x2, y2, score, class_id = box_data
        formatted_boxes.append([x1, y1, x2, y2, score, class_names.get(int(class_id), "Unknown")])
    return formatted_boxes

# --- FastAPI Lifespan for Model Loading ---
@asynccontextmanager
async def lifespan(app: FastAPI):
    # Load models at startup
    print("Application startup: Loading models...")
    set_gpu_memory_growth() # Configure GPU for TensorFlow
    try:
        models_store["classifiers"] = load_all_classifier_models(CLASSIFIER_MODEL_DIR)
        models_store["detectors"] = load_all_detector_models(DETECTOR_MODEL_PATTERN)
        # Check if GPU is available for PyTorch and move detector models if so
        if torch.cuda.is_available():
            print("Moving detector models to GPU...")
            models_store["detectors"] = [model.to('cuda') for model in models_store["detectors"]]
        else:
            print("CUDA not available for PyTorch, detectors will run on CPU.")
        print("Models loaded successfully.")
    except FileNotFoundError as e:
        print(f"CRITICAL: {e}. Ensure model paths are correct.")
        # In a production app, you might want to prevent startup or have a health check fail
    except Exception as e:
        print(f"CRITICAL: An unexpected error occurred during model loading: {e}")
    yield
    # Clean up models and resources if needed on shutdown
    print("Application shutdown.")
    models_store.clear()

app = FastAPI(lifespan=lifespan)

# --- API Endpoint ---
@app.post("/predict/image/", response_model=PredictionResponse)
async def predict_image_pipeline(file: UploadFile = File(...)):
    if not models_store.get("classifiers") or not models_store.get("detectors"):
        raise HTTPException(status_code=503, detail="Models are not loaded or unavailable. Please check server logs.")

    # Read image file
    try:
        contents = await file.read()
        nparr = np.frombuffer(contents, np.uint8)
        raw_image_bgr = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        if raw_image_bgr is None:
            raise HTTPException(status_code=400, detail="Invalid image file or format.")
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Could not process image file: {e}")
    finally:
        await file.close()

    # Stage 1: Classification
    try:
        processed_img_classifier = preprocess_image_for_classifier(raw_image_bgr)
        classification_label, classification_prob = predict_with_classifiers(
            processed_img_classifier, models_store["classifiers"]
        )
    except Exception as e:
        print(f"Error during classification: {e}")
        raise HTTPException(status_code=500, detail=f"Error during classification: {e}")

    detected_bounding_box = None
    # Stage 2: Detection (if classified as Opacity)
    if classification_label == "Opacity":
        try:
            detected_boxes = predict_with_detectors(
                raw_image_bgr, models_store["detectors"],
                DEFAULT_DETECTION_IOU_THRESHOLD, DEFAULT_DETECTION_CONF_THRESHOLD
            )

            if detected_boxes:
                # Select the box with the highest confidence score
                # Each box in detected_boxes is [x1, y1, x2, y2, score, class_name]
                highest_score_box = max(detected_boxes, key=lambda box: box[4])
                x1, y1, x2, y2, score, _ = highest_score_box
                
                # Get image dimensions for normalization
                img_height, img_width = raw_image_bgr.shape[:2]
                
                # Normalize coordinates to [0, 1] range
                detected_bounding_box = BoundingBox(
                    x=float(x1) / img_width,
                    y=float(y1) / img_height,
                    width=float(x2 - x1) / img_width,
                    height=float(y2 - y1) / img_height
                )
        except Exception as e:
            print(f"Error during detection: {e}")
            # Optionally, you could allow the API to return classification even if detection fails
            raise HTTPException(status_code=500, detail=f"Error during detection: {e}")
    else:
        print(f"Skipping detection as classification is '{classification_label}' (Prob: {classification_prob:.4f})")


    return PredictionResponse(
        probability=classification_prob,
        boundingBox=detected_bounding_box
    )

@app.get("/health")
async def health_check():
    if models_store.get("classifiers") and models_store.get("detectors"):
        return {"status": "healthy", "message": "Models loaded."}
    return {"status": "unhealthy", "message": "Models not loaded or error during startup."}

# To run this app:
# 1. Save as api_server.py (or any other name)
# 2. Install FastAPI and Uvicorn: pip install fastapi uvicorn[standard]
# 3. Run with Uvicorn: uvicorn api_server:app --reload
#    (The --reload flag is for development, remove it in production)
#    You might want to specify host and port, e.g., uvicorn api_server:app --host 0.0.0.0 --port 8000