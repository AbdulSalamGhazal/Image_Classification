import os
import json
import argparse
import numpy as np
import cv2
import tensorflow as tf
from tensorflow.keras.models import load_model
from ultralytics import YOLO
import torch # For NMS and checking CUDA

# --- Configuration ---
# These paths should point to where your trained models are stored.
# Update them if your directory structure is different.
CLASSIFIER_MODEL_DIR = 'full_models/' # Directory containing classifier_split_X.keras
# Example: 'yolo_runs/yolo_fold{}_exp/weights/best.pt' - replace {} with fold number
DETECTOR_MODEL_PATTERN = 'yolo_runs/yolo_fold{}_exp/weights/best.pt'

NUM_FOLDS = 5

# Image dimensions for models (as used during their training)
CLASSIFIER_IMG_HEIGHT = 256
CLASSIFIER_IMG_WIDTH = 256
CLASSIFIER_IMG_CHANNELS = 3
# For YOLO, imgsz is usually set during model.predict(), but good to keep in mind
# if specific input sizing was strictly enforced. Ultralytics is flexible.

# Thresholds for prediction logic
DEFAULT_CLASSIFICATION_THRESHOLD = 0.5 # Probability threshold for "Opacity" class
DEFAULT_DETECTION_IOU_THRESHOLD = 0.45 # IoU threshold for Non-Maximum Suppression
DEFAULT_DETECTION_CONF_THRESHOLD = 0.25 # Confidence threshold for considering a detection valid

# Global model lists (loaded once)
CLASSIFIER_MODELS = []
DETECTOR_MODELS = []

def set_gpu_memory_growth():
    """Configures TensorFlow to use GPU memory growth."""
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

# --- Model Loading Functions ---
def load_all_classifier_models(model_dir):
    """Loads all 5 Keras classifier models."""
    models = []
    print("Loading Keras classifier models...")
    for i in range(1, NUM_FOLDS + 1):
        model_path = os.path.join(model_dir, f'classifier_split_{i}.keras')
        if os.path.exists(model_path):
            try:
                # When loading custom metrics/objects, you might need custom_objects argument
                # model = load_model(model_path, custom_objects={'roc_auc': tf.keras.metrics.AUC})
                # For the provided scripts, standard AUC and accuracy were used, often fine without custom_objects
                model = load_model(model_path)
                models.append(model)
                print(f"Loaded classifier model: {model_path}")
            except Exception as e:
                print(f"Error loading classifier model {model_path}: {e}")
        else:
            print(f"Classifier model not found: {model_path}")
    if not models:
        raise FileNotFoundError("No classifier models were successfully loaded. Check CLASSIFIER_MODEL_DIR.")
    return models

def load_all_detector_models(model_pattern):
    """Loads all 5 Ultralytics YOLO detector models."""
    models = []
    print("Loading Ultralytics YOLO detector models...")
    for i in range(1, NUM_FOLDS + 1):
        model_path = model_pattern.format(i)
        if os.path.exists(model_path):
            try:
                model = YOLO(model_path) # Ultralytics model
                # You can force CPU/GPU here if needed: model.to('cuda' if torch.cuda.is_available() else 'cpu')
                models.append(model)
                print(f"Loaded detector model: {model_path}")
            except Exception as e:
                print(f"Error loading detector model {model_path}: {e}")
        else:
            print(f"Detector model not found: {model_path}")
    if not models:
        raise FileNotFoundError("No detector models were successfully loaded. Check DETECTOR_MODEL_PATTERN.")
    return models

# --- Preprocessing Functions ---
def preprocess_image_for_classifier(image_path_or_array):
    """
    Loads an image from path or uses an array, preprocesses it for the Keras classifier.
    Output shape: (1, height, width, channels)
    """
    if isinstance(image_path_or_array, str):
        img = cv2.imread(image_path_or_array)
        if img is None:
            raise ValueError(f"Could not read image from path: {image_path_or_array}")
    elif isinstance(image_path_or_array, np.ndarray):
        img = image_path_or_array.copy() # Work on a copy
    else:
        raise TypeError("Input must be an image path (str) or a NumPy array.")

    img = cv2.cvtColor(img, cv2.COLOR_BGR2RGB) # Ensure RGB
    img = cv2.resize(img, (CLASSIFIER_IMG_WIDTH, CLASSIFIER_IMG_HEIGHT))
    img = img.astype(np.float32) / 255.0
    return np.expand_dims(img, axis=0) # Add batch dimension

# --- Prediction Functions ---
def predict_with_classifiers(image_array_processed, models):
    """
    Performs classification using an ensemble of Keras models.
    Args:
        image_array_processed: Preprocessed image NumPy array (with batch dim).
        models: List of loaded Keras classifier models.
    Returns:
        Tuple: (final_label_str, ensemble_probability_float)
    """
    if not models:
        raise ValueError("Classifier models not loaded.")

    all_probabilities = []
    for model in models:
        pred = model.predict(image_array_processed, verbose=0) # verbose=0 for less console output
        all_probabilities.append(pred[0][0]) # Assuming single output sigmoid

    ensemble_probability = np.mean(all_probabilities)
    final_label_int = 1 if ensemble_probability >= DEFAULT_CLASSIFICATION_THRESHOLD else 0
    final_label_str = "Opacity" if final_label_int == 1 else "Normal"

    return final_label_str, float(ensemble_probability)


def ensemble_detections_nms(all_boxes, all_scores, all_classes, iou_threshold):
    """
    Applies Non-Maximum Suppression to a combined list of detections.
    Args:
        all_boxes: List or Tensor of bounding boxes (e.g., [[x1,y1,x2,y2], ...]).
        all_scores: List or Tensor of confidence scores.
        all_classes: List or Tensor of class IDs.
        iou_threshold: IoU threshold for NMS.
    Returns:
        List of final boxes: [[x1,y1,x2,y2, score, class_id], ...]
    """
    if not all_boxes: # Check if the list is empty
        return []

    boxes_tensor = torch.tensor(all_boxes, dtype=torch.float32)
    scores_tensor = torch.tensor(all_scores, dtype=torch.float32)
    # classes_tensor = torch.tensor(all_classes, dtype=torch.int64) # Not used by torchvision.ops.nms directly

    if boxes_tensor.nelement() == 0: # Check if tensor is empty
        return []

    # Perform NMS (expects boxes in (x1, y1, x2, y2) format)
    # torchvision.ops.nms works per-class. Since we only have one class 'Opacity' (0), this is simpler.
    # If multiple classes, you'd loop NMS per class or use a multi-class NMS variant.
    keep_indices = torchvision.ops.nms(boxes_tensor, scores_tensor, iou_threshold)

    final_boxes = []
    for idx in keep_indices:
        final_boxes.append([
            float(boxes_tensor[idx][0]), float(boxes_tensor[idx][1]),
            float(boxes_tensor[idx][2]), float(boxes_tensor[idx][3]),
            float(scores_tensor[idx]),
            int(all_classes[idx]) # Keep original class for the kept box
        ])
    return final_boxes


def predict_with_detectors(image_path_or_array, models, iou_thresh, conf_thresh):
    """
    Performs object detection using an ensemble of Ultralytics YOLO models.
    Args:
        image_path_or_array: Path to the image or a NumPy array (BGR or RGB).
                               Ultralytics handles path, PIL, numpy.
        models: List of loaded Ultralytics YOLO models.
        iou_thresh: IoU threshold for NMS.
        conf_thresh: Confidence threshold for initial filtering of detections.
    Returns:
        List of detected bounding boxes: [[x1, y1, x2, y2, score, class_name_str], ...]
    """
    if not models:
        raise ValueError("Detector models not loaded.")

    # Ultralytics models can take image_path or a numpy array (expects RGB if numpy)
    # If passing numpy array, ensure it's RGB
    if isinstance(image_path_or_array, np.ndarray):
        # Check if BGR (common from cv2.imread) and convert to RGB
        if image_path_or_array.ndim == 3 and image_path_or_array.shape[2] == 3:
             # Heuristic: If it looks like BGR, convert.
             # This part can be tricky if the array source is ambiguous.
             # Assuming cv2.imread source if numpy.
            image_input_for_yolo = cv2.cvtColor(image_path_or_array, cv2.COLOR_BGR2RGB)
        else:
            image_input_for_yolo = image_path_or_array
    else: # It's a path string
        image_input_for_yolo = image_path_or_array


    all_pred_boxes = []
    all_pred_scores = []
    all_pred_classes = [] # We know it's class 0 for 'Opacity'

    for model in models:
        # You can specify imgsz if needed, e.g., model.predict(image_input_for_yolo, conf=conf_thresh, imgsz=608)
        # By default, Ultralytics uses the model's trained imgsz.
        results = model.predict(image_input_for_yolo, conf=conf_thresh, verbose=False) # verbose=False for less output

        if results and results[0].boxes:
            boxes = results[0].boxes.xyxy.cpu().numpy() # [[x1,y1,x2,y2], ...]
            scores = results[0].boxes.conf.cpu().numpy() # [score, ...]
            classes = results[0].boxes.cls.cpu().numpy() # [class_id, ...]

            all_pred_boxes.extend(boxes.tolist())
            all_pred_scores.extend(scores.tolist())
            all_pred_classes.extend(classes.tolist()) # Should all be 0 for 'Opacity'

    # Apply NMS to the combined list of detections
    if not all_pred_boxes:
        return []

    # Convert class_id (0) to class_name ("Opacity")
    # This assumes class 0 is 'Opacity' as per typical YOLO setup for single class
    class_names = {0: "Opacity"}
    final_ensembled_boxes = ensemble_detections_nms(
        all_pred_boxes,
        all_pred_scores,
        all_pred_classes, # Pass original classes to preserve them through NMS
        iou_thresh
    )

    # Format output with class names
    formatted_boxes = []
    for box_data in final_ensembled_boxes:
        x1, y1, x2, y2, score, class_id = box_data
        formatted_boxes.append([x1, y1, x2, y2, score, class_names.get(int(class_id), "Unknown")])

    return formatted_boxes

# --- Main Pipeline Function ---
def run_complete_pipeline(image_path, class_models, detect_models,
                           class_thresh, det_iou_thresh, det_conf_thresh):
    """
    Runs the full classification and conditional detection pipeline.
    """
    # Load image once (e.g. for classifier, and pass array to detector if needed)
    raw_image_bgr = cv2.imread(image_path)
    if raw_image_bgr is None:
        return {"error": f"Failed to load image: {image_path}"}

    # Stage 1: Classification
    processed_img_classifier = preprocess_image_for_classifier(raw_image_bgr) # Pass the loaded array
    classification_label, classification_prob = predict_with_classifiers(processed_img_classifier, class_models)

    output = {
        "image_path": image_path,
        "classification": {
            "label": classification_label,
            "probability": classification_prob
        },
        "detections": []
    }

    # Stage 2: Detection (if classified as Opacity)
    if classification_label == "Opacity" and classification_prob >= class_thresh:
        # Pass the raw BGR image array to the detector function, which handles conversion if needed
        detected_boxes = predict_with_detectors(raw_image_bgr, detect_models,
                                                det_iou_thresh, det_conf_thresh)
        output["detections"] = detected_boxes
    else:
        print(f"Skipping detection for {os.path.basename(image_path)} as classification is '{classification_label}' (Prob: {classification_prob:.4f})")


    return output

# --- Main Execution ---
if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Pneumonia Classification and Detection Pipeline.")
    parser.add_argument("image_path", type=str, help="Path to the input image.")
    parser.add_argument("--classifier_dir", type=str, default=CLASSIFIER_MODEL_DIR,
                        help="Directory containing Keras classifier models.")
    parser.add_argument("--detector_pattern", type=str, default=DETECTOR_MODEL_PATTERN,
                        help="Path pattern for YOLO detector models (use {} for fold number).")
    parser.add_argument("--class_thresh", type=float, default=DEFAULT_CLASSIFICATION_THRESHOLD,
                        help="Probability threshold for 'Opacity' classification.")
    parser.add_argument("--det_iou_thresh", type=float, default=DEFAULT_DETECTION_IOU_THRESHOLD,
                        help="IoU threshold for detection NMS.")
    parser.add_argument("--det_conf_thresh", type=float, default=DEFAULT_DETECTION_CONF_THRESHOLD,
                        help="Confidence threshold for YOLO detections.")
    parser.add_argument("--cpu", action="store_true", help="Force all operations on CPU.")


    args = parser.parse_args()

    # Handle CPU forcing
    if args.cpu:
        os.environ['CUDA_VISIBLE_DEVICES'] = '-1'
        tf.config.set_visible_devices([], 'GPU') # For TensorFlow
        # For PyTorch/Ultralytics, YOLO will auto-detect or can be forced via model.to('cpu')
        # This is a simpler global way for TF. Ultralytics usually adapts.
        print("Attempting to force CPU usage.")


    # Configure TensorFlow GPU Memory (do this before TF initializes GPU)
    if not args.cpu:
        set_gpu_memory_growth()


    # Load models globally (or within a class if part of a larger app)
    try:
        CLASSIFIER_MODELS = load_all_classifier_models(args.classifier_dir)
        DETECTOR_MODELS = load_all_detector_models(args.detector_pattern)

        if args.cpu: # Ensure detector models are also on CPU if forced
            DETECTOR_MODELS = [model.to('cpu') for model in DETECTOR_MODELS]

    except FileNotFoundError as e:
        print(f"Error: {e}")
        print("Please ensure model paths are correct and models exist.")
        exit(1)
    except Exception as e:
        print(f"An unexpected error occurred during model loading: {e}")
        exit(1)


    if not CLASSIFIER_MODELS or not DETECTOR_MODELS:
        print("Critical error: Not all models could be loaded. Exiting.")
        exit(1)

    # Run the pipeline
    results = run_complete_pipeline(
        args.image_path,
        CLASSIFIER_MODELS,
        DETECTOR_MODELS,
        args.class_thresh,
        args.det_iou_thresh,
        args.det_conf_thresh
    )

    # Print results as JSON
    print(json.dumps(results, indent=4))