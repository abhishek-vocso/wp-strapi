// @ts-nocheck
// ./src/api/{modelName}/routes/{modelName}.js

'use strict';

const { createCoreRouter } = require('@strapi/strapi').factories;

module.exports = createCoreRouter('api::site.site', {
  config: {
    routes: [
      {
        method: 'POST',
        path: '/download-image',
        handler: 'imageController.download',
        config: {
          policies: [],
          middlewares: [],
        },
      },
    ],
  },
});
