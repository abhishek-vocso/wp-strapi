const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();

app.use(cors());
app.use(express.json());

app.post('/proxy', async (req, res) => {
  const { imageUrls } = req.body;

  if (!Array.isArray(imageUrls) || imageUrls.length === 0) {
    return res.status(400).send('No image URLs provided');
  }

  try {
    const imagePromises = imageUrls.map(async (url) => {
      const response = await axios.get(url, { responseType: 'arraybuffer' });
      return {
        url,
        data: response.data,
        contentType: response.headers['content-type']
      };
    });

    const images = await Promise.all(imagePromises);

    // Send the images as an array of objects
    res.json(images);
  } catch (error) {
    console.error('Error fetching images:', error);
    res.status(500).send('Error fetching images');
  }
});

app.listen(3000, () => {
  console.log('Server running on port 3000');
});
