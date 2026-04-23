const express = require('express');
const multer = require('multer');
const path = require('path');
const axios = require('axios');
const FormData = require('form-data');
require('dotenv').config();

const app = express();
const upload = multer({ storage: multer.memoryStorage() });
const IMGBB_API_KEY = process.env.IMGBB_API_KEY;
const PORT = process.env.PORT || 3000;

app.use(express.static(path.join(__dirname, '')));

app.post('/api/upload', upload.any(), async (req, res) => {
  if (!IMGBB_API_KEY) {
    return res.status(500).json({ success: false, error: 'Missing IMGBB_API_KEY in environment.' });
  }

  try {
    const uploaded = {};
    if (req.files && req.files.length > 0) {
      const uploadPromises = req.files.map(async (file) => {
        const formData = new FormData();
        formData.append('key', IMGBB_API_KEY);
        formData.append('image', file.buffer.toString('base64'));

        const response = await axios.post('https://api.imgbb.com/1/upload', formData, {
          headers: formData.getHeaders(),
        });

        if (response.data && response.data.success) {
          return [file.fieldname, response.data.data.url];
        }
        throw new Error('Failed to upload to ImgBB');
      });

      const results = await Promise.all(uploadPromises);
      results.forEach(([field, url]) => {
        uploaded[field] = url;
      });
    }

    return res.json({ success: true, uploaded });
  } catch (error) {
    console.error('Upload error:', error.message || error);
    return res.status(500).json({ success: false, error: 'Unable to upload files. See server logs.' });
  }
});

app.listen(PORT, () => {
  console.log(`GIDIGBA STUDIOS server running at http://localhost:${PORT}`);
});
