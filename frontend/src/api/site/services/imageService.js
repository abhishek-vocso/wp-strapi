// ./src/api/{modelName}/services/imageService.js

'use strict';

const axios = require('axios');
const fs = require('fs');
const path = require('path');

module.exports = {
  async downloadImage(imageUrl, fileName) {
    try {
      const response = await axios({
        method: 'GET',
        url: imageUrl,
        responseType: 'stream', // Important for handling binary data like images
      });

      if (response.status !== 200) {
        throw new Error(`Failed to fetch image: ${imageUrl}`);
      }

      // Save the image to a local file (or process as needed)
      const imagePath = path.join(__dirname, '..', '..', 'public', 'uploads', fileName);
      const writer = fs.createWriteStream(imagePath);
      response.data.pipe(writer);

      return new Promise((resolve, reject) => {
        writer.on('finish', () => resolve(imagePath));
        writer.on('error', reject);
      });
    } catch (error) {
      console.error('Error downloading image:', error);
      throw error;
    }
  },
};
