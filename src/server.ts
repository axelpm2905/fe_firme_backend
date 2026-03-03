import dotenv from 'dotenv';

dotenv.config();

import app from './app';
import db from './models';

const PORT = Number(process.env.PORT) || 4000;

async function start() {
  try {
    console.log('Connecting to database...');
    await db.sequelize.authenticate();
    console.log('✓ Database connection established.');
  } catch (err) {
    console.error('✗ Failed to connect to database:', err);
    process.exit(1);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`✓ Server listening on http://0.0.0.0:${PORT}`);
  });
}

start();
