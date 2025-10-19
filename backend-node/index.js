const express = require('express');
const cors = require('cors');
const multer = require('multer');
const fetch = require('node-fetch');
const FormData = require('form-data');

const app = express();
app.use(cors());

const upload = multer({ storage: multer.memoryStorage() });

const FLASK_URL = process.env.FLASK_URL || 'http://localhost:5000';

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.post('/predict', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "Missing 'image' file in form-data" });
    }

    const form = new FormData();
    form.append('image', req.file.buffer, { filename: req.file.originalname || 'upload.jpg', contentType: req.file.mimetype || 'image/jpeg' });

    const response = await fetch(`${FLASK_URL}/predict`, {
      method: 'POST',
      body: form,
      headers: form.getHeaders(),
    });

    const data = await response.json();
    res.status(response.status).json(data);
  } catch (err) {
    res.status(500).json({ error: err.message || String(err) });
  }
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Node backend listening on port ${PORT}`);
});


