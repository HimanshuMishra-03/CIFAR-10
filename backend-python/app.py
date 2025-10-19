from flask import Flask, request, jsonify
from flask_cors import CORS
import numpy as np
from PIL import Image
import io
import tensorflow as tf


app = Flask(__name__)
CORS(app)


# Load model once at startup
MODEL_PATH = '../resnet_cifar10.h5'
model = tf.keras.models.load_model(MODEL_PATH)

# CIFAR-10 label names in standard order
CLASS_NAMES = [
	"airplane",
	"automobile",
	"bird",
	"cat",
	"deer",
	"dog",
	"frog",
	"horse",
	"ship",
	"truck",
]


def preprocess_image(image_bytes: bytes) -> np.ndarray:
	image = Image.open(io.BytesIO(image_bytes)).convert('RGB')
	image = image.resize((224, 224))
	image_array = np.asarray(image, dtype=np.float32) / 255.0
	# Add batch dimension
	image_array = np.expand_dims(image_array, axis=0)
	return image_array


@app.route('/health', methods=['GET'])
def health():
	return jsonify({"status": "ok"})


@app.route('/predict', methods=['POST'])
def predict():
	if 'image' not in request.files:
		return jsonify({"error": "Missing 'image' file in form-data"}), 400

	file = request.files['image']
	image_bytes = file.read()

	try:
		input_tensor = preprocess_image(image_bytes)
		predictions = model.predict(input_tensor)
		probs = predictions[0].tolist()
		pred_index = int(np.argmax(predictions[0]))
		pred_class = CLASS_NAMES[pred_index] if pred_index < len(CLASS_NAMES) else str(pred_index)
		response = {
			"class": pred_class,
			"index": pred_index,
			"probabilities": probs,
			"classes": CLASS_NAMES,
		}
		return jsonify(response)
	except Exception as e:
		return jsonify({"error": str(e)}), 500


if __name__ == '__main__':
	# Bind to 0.0.0.0 for cross-process access; default port 5000
	app.run(host='0.0.0.0', port=5000)


