"""
AttendAI — Python Face Recognition Microservice
Uses OpenCV LBPH Face Recognizer
Runs on port 5001
"""

import os
import cv2
import numpy as np
from flask import Flask, request, jsonify
from pathlib import Path

from trainer import train_model
from recognizer import recognize_face

app = Flask(__name__)

FACE_DATA_DIR = Path(os.getenv("FACE_DATA_DIR", "../backend/face_data"))
MODEL_PATH = FACE_DATA_DIR / "models" / "trainer.yml"
CONFIDENCE_THRESHOLD = 70  # Lower is better in LBPH; above this = unknown


@app.route("/health", methods=["GET"])
def health():
    return jsonify({
        "status": "ok",
        "model_trained": MODEL_PATH.exists()
    })


@app.route("/train", methods=["POST"])
def train():
    """
    Re-trains the LBPH model using all images in face_data/raw/{uid}/
    Called by Spring Boot after a student's 10 photos are uploaded.
    """
    raw_dir = FACE_DATA_DIR / "raw"
    if not raw_dir.exists():
        return jsonify({"error": "No face data found"}), 400

    result = train_model(raw_dir, MODEL_PATH)
    return jsonify(result)


@app.route("/recognize", methods=["POST"])
def recognize():
    """
    Accepts a JPEG image (multipart), returns:
    { recognized: bool, label: int, confidence: float }
    """
    if "image" not in request.files:
        return jsonify({"error": "No image provided"}), 400

    file = request.files["image"]
    img_bytes = np.frombuffer(file.read(), np.uint8)
    frame = cv2.imdecode(img_bytes, cv2.IMREAD_COLOR)

    if frame is None:
        return jsonify({"error": "Cannot decode image"}), 400

    if not MODEL_PATH.exists():
        return jsonify({"recognized": False, "label": -1, "confidence": 999.0,
                        "message": "Model not trained yet"}), 200

    result = recognize_face(frame, MODEL_PATH, CONFIDENCE_THRESHOLD)
    return jsonify(result)


if __name__ == "__main__":
    FACE_DATA_DIR.mkdir(parents=True, exist_ok=True)
    (FACE_DATA_DIR / "models").mkdir(parents=True, exist_ok=True)
    (FACE_DATA_DIR / "raw").mkdir(parents=True, exist_ok=True)
    print("AttendAI Python Service starting on port 5001...")
    app.run(host="0.0.0.0", port=5001, debug=False)
