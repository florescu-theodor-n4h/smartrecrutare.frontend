// src/auth0.config.js
export default {
  domain: 'YOUR_AUTH0_DOMAIN', // e.g. dev-abc123.us.auth0.com
  clientId: 'YOUR_AUTH0_CLIENT_ID',
  authorizationParams: {
    redirect_uri: window.location.origin,
    // audience: 'YOUR_API_AUDIENCE',  // uncomment if calling an API
  },
}
