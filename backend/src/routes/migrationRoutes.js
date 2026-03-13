import express from 'express';
import { runMigrations, seedDatabase, pushDatabase } from '../controllers/migrationController.js';

const router = express.Router();

// Only allow in development or with special key
const checkMigrationAccess = (req, res, next) => {
  const key = req.query.key || req.headers['x-migration-key'];
  if (key === process.env.MIGRATION_KEY || process.env.NODE_ENV === 'development') {
    next();
  } else {
    res.status(403).json({ error: 'Unauthorized' });
  }
};

router.post('/migrate', checkMigrationAccess, runMigrations);
router.post('/push', checkMigrationAccess, pushDatabase);
router.post('/seed', checkMigrationAccess, seedDatabase);

export default router;
