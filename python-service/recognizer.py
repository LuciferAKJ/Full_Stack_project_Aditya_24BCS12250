"""
recognizer.py — Real-time Face Recognition using trained LBPH model
"""

import cv2
import numpy as np
from pathlib import Path


def _load_face_cascade():
    cascade_path = cv2.data.haarcascades + "haarcascade_frontalface_default.xml"
    return cv2.CascadeClassifier(cascade_path)


def recognize_face(frame: np.ndarray, model_path: Path, threshold: float = 70.0) -> dict:
    """
    Detects and recognizes the most prominent face in the given frame.

    Returns:
        {
            "recognized": bool,
            "label": int,       -- matches Student.faceLabel in DB
            "confidence": float -- lower is better (LBPH)
        }
    """
    face_cascade = _load_face_cascade()
    recognizer = cv2.face.LBPHFaceRecognizer_create()
    recognizer.read(str(model_path))

    # Convert to grayscale
    gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
    gray = cv2.equalizeHist(gray)

    faces = face_cascade.detectMultiScale(
        gray, scaleFactor=1.1, minNeighbors=5, minSize=(80, 80)
    )

    if len(faces) == 0:
        return {"recognized": False, "label": -1, "confidence": 999.0,
                "message": "No face detected in frame"}

    # Use the largest detected face
    largest = max(faces, key=lambda r: r[2] * r[3])
    x, y, w, h = largest
    face_roi = gray[y:y+h, x:x+w]
    face_roi = cv2.resize(face_roi, (200, 200))

    label, confidence = recognizer.predict(face_roi)

    recognized = confidence < threshold

    return {
        "recognized": recognized,
        "label": int(label),
        "confidence": round(float(confidence), 2),
        "message": "Recognized" if recognized else "Unknown face (confidence too low)"
    }
