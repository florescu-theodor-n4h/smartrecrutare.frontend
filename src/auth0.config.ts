// src/auth0.config.js
export default {
  domain: 'https://dev-hqeowpbz7cmw3n3m.us.auth0.com', // e.g. dev-abc123.us.auth0.com
  clientId: 'mjMWbQgLWxFrLAmMrtfni5CjQhOQRaTK',
  authorizationParams: {
    redirect_uri: window.location.origin,
    audience: 'https://smartrecrutare.app.apiaud', // uncomment if calling an API
  },
}
