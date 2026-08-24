import app from '../server/src/server.js';
import { connectDB } from '../server/src/config/db.js';
import { seedDatabase } from '../server/src/seeds/seedData.js';

let initializeDatabase;

const initialize = () => {
  if (!initializeDatabase) {
    initializeDatabase = connectDB().then(seedDatabase);
  }
  return initializeDatabase;
};

export default async function handler(req, res) {
  await initialize();

  // The Vercel rewrite sends /api/:path* to this single function. Restore the
  // original path so Express can match routes such as /api/v1/auth/register.
  if (typeof req.query?.route === 'string' && req.query.route) {
    req.url = `/api/${req.query.route}`;
  }

  return app(req, res);
}
