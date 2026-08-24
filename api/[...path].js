// Catch every /api/* request without rewriting its URL, so the Express
// application continues to receive paths such as /api/v1/auth/register.
export { default } from './index.js';
