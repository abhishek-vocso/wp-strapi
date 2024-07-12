module.exports = [
  'strapi::logger',
  'strapi::errors',
  {
    name: "strapi::security",
    config: {
      contentSecurityPolicy: {
        useDefaults: true,
        directives: {
          // "connect-src": ["'self'", "https:", "http://localhost:3000/proxy"],
          "connect-src": ["'self'", "https:","http:", "http://localhost:3000/proxy"],
          "script-src": ["'self'", "https://maps.googleapis.com"],
          "img-src": [
            "'self'",
            "data:",
            "blob:",
            "market-assets.strapi.io",
          ],
          "media-src": [
            "'self'",
            "data:",
            "blob:",
            "market-assets.strapi.io",
          ],
          upgradeInsecureRequests: null,
        },
      },
      referrerPolicy: { policy: "origin-when-cross-origin" },
    },
  },
  'strapi::cors',
  'strapi::poweredBy',
  'strapi::query',
  'strapi::body',
  'strapi::session',
  'strapi::favicon',
  'strapi::public',
];
