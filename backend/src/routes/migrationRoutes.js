import express from 'express';
import { runMigrations, seedDatabase, pushDatabase } from '../controllers/migrationController.js';

const router = express.Router();

// Only allow in development or with special key
const checkMigrationAccess = (req, res, next) => {
  const key = req.query.key || req.headers['x-migration-key'];
  
  // Prevent bypass if MIGRATION_KEY is not defined in env (undefined === undefined is true)
  const isDev = process.env.NODE_ENV !== 'production';
  const hasValidKey = process.env.MIGRATION_KEY && key === process.env.MIGRATION_KEY;

  if (hasValidKey || isDev) {
    next();
  } else {
    res.status(403).json({ error: 'Unauthorized' });
  }
};

router.post('/migrate', checkMigrationAccess, runMigrations);
router.post('/push', checkMigrationAccess, pushDatabase);
router.post('/seed', checkMigrationAccess, seedDatabase);

export default router;
