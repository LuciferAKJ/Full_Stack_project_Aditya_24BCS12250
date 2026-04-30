"""
trainer.py — LBPH Face Model Trainer
Reads all images from face_data/raw/{uid}/
Uses the student's face_label (derived from folder ordering or a label_map.json)
"""

import os
import cv2
import numpy as np
import json
from pathlib import Path


def _load_face_cascade():
    cascade_path = cv2.data.haarcascades + "haarcascade_frontalface_default.xml"
    return cv2.CascadeClassifier(cascade_path)


def train_model(raw_dir: Path, model_path: Path) -> dict:
    """
    Trains the LBPH recognizer with all student images.
    Expects face_data/raw/{uid}/ containing JPEG images.
    A companion label_map.json maps uid -> integer label.
    """
    face_cascade = _load_face_cascade()
    recognizer = cv2.face.LBPHFaceRecognizer_create()

    faces = []
    labels = []

    label_map_path = raw_dir.parent / "label_map.json"
    label_map = {}
    if label_map_path.exists():
        with open(label_map_path) as f:
            label_map = json.load(f)

    students_processed = 0

    for student_dir in sorted(raw_dir.iterdir()):
        if not student_dir.is_dir():
            continue
        uid = student_dir.name

        # Assign label: from label_map if available, else auto-increment
        if uid not in label_map:
            label_map[uid] = len(label_map) + 1
        label = label_map[uid]

        images_used = 0
        for img_path in sorted(student_dir.glob("*.jpg")):
            img = cv2.imread(str(img_path), cv2.IMREAD_GRAYSCALE)
            if img is None:
                continue

            # Apply histogram equalization for better lighting invariance
            img = cv2.equalizeHist(img)

            detected = face_cascade.detectMultiScale(
                img, scaleFactor=1.1, minNeighbors=5, minSize=(50, 50)
            )

            if len(detected) > 0:
                x, y, w, h = detected[0]
                face_roi = img[y:y+h, x:x+w]
                face_roi = cv2.resize(face_roi, (200, 200))
                faces.append(face_roi)
                labels.append(label)
                images_used += 1
            else:
                # No face detected — use full image resized
                resized = cv2.resize(img, (200, 200))
                faces.append(resized)
                labels.append(label)
                images_used += 1

        if images_used > 0:
            students_processed += 1

    if not faces:
        return {"success": False, "message": "No face images found to train", "students": 0}

    recognizer.train(faces, np.array(labels))
    model_path.parent.mkdir(parents=True, exist_ok=True)
    recognizer.save(str(model_path))

    # Update label map
    with open(label_map_path, "w") as f:
        json.dump(label_map, f, indent=2)

    return {
        "success": True,
        "message": f"Model trained with {len(faces)} images from {students_processed} students",
        "students": students_processed,
        "images": len(faces)
    }
