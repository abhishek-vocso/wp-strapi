// @ts-nocheck
// ./src/api/{modelName}/controllers/imageController.js

'use strict';

const { downloadImage } = require('../services/imageService');

module.exports = {
  async download(ctx) {
    const { imageUrl, fileName } = ctx.request.body;

    if (!imageUrl || !fileName) {
      return ctx.badRequest('Image URL and file name are required');
    }

    try {
      const imagePath = await downloadImage(imageUrl, fileName);
      return ctx.send({ imagePath });
    } catch (error) {
      return ctx.internalServerError('Error downloading image', error);
    }
  },
};
