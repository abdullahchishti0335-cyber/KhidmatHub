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
  return app(req, res);
}
