from flask import Flask, request, jsonify
import numpy as np
import cv2
import base64
from classify import (
    load_all_classifier_models,
    load_all_detector_models,
    preprocess_image_for_classifier,
    predict_with_classifiers,
    predict_with_detectors,
    set_gpu_memory_growth,
    CLASSIFIER_MODEL_DIR,
    DETECTOR_MODEL_PATTERN,
    DEFAULT_CLASSIFICATION_THRESHOLD,
    DEFAULT_DETECTION_IOU_THRESHOLD,
    DEFAULT_DETECTION_CONF_THRESHOLD
)

app = Flask(__name__)

# Initialize models
print("Initializing models...")
set_gpu_memory_growth()
classifier_models = load_all_classifier_models(CLASSIFIER_MODEL_DIR)
detector_models = load_all_detector_models(DETECTOR_MODEL_PATTERN)
print("Models loaded successfully!")

def base64_to_image(base64_string):
    """Convert base64 string to numpy array."""
    try:
        # Remove the data URL prefix if present
        if ',' in base64_string:
            base64_string = base64_string.split(',')[1]
        
        # Decode base64 string
        image_data = base64.b64decode(base64_string)
        nparr = np.frombuffer(image_data, np.uint8)
        img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        return img
    except Exception as e:
        raise ValueError(f"Error decoding base64 image: {str(e)}")

@app.route('/api/analyze', methods=['POST'])
def analyze_image():
    try:
        # Get image data from request
        if 'image' not in request.files and 'image' not in request.json:
            return jsonify({'error': 'No image provided'}), 400

        # Handle both file upload and base64
        if 'image' in request.files:
            file = request.files['image']
            img = cv2.imdecode(np.frombuffer(file.read(), np.uint8), cv2.IMREAD_COLOR)
        else:
            img = base64_to_image(request.json['image'])

        if img is None:
            return jsonify({'error': 'Invalid image data'}), 400

        # Preprocess image for classifier
        processed_img = preprocess_image_for_classifier(img)

        # Get classification results
        classification_label, classification_probability = predict_with_classifiers(
            processed_img,
            classifier_models
        )

        # Get detection results
        detections = predict_with_detectors(
            img,
            detector_models,
            DEFAULT_DETECTION_IOU_THRESHOLD,
            DEFAULT_DETECTION_CONF_THRESHOLD
        )

        # Format detection results
        formatted_detections = []
        for det in detections:
            x1, y1, x2, y2, score, class_id = det
            formatted_detections.append({
                'boundingBox': {
                    'x': float(x1),
                    'y': float(y1),
                    'width': float(x2 - x1),
                    'height': float(y2 - y1)
                },
                'confidence': float(score),
                'class': 'Opacity' if class_id == 0 else 'Normal'
            })

        # Prepare response
        response = {
            'classification': {
                'label': classification_label,
                'probability': float(classification_probability)
            },
            'detections': formatted_detections
        }

        return jsonify(response)

    except Exception as e:
        print(f"Error processing image: {str(e)}")
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5001) 