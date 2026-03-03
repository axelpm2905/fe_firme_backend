import dotenv from 'dotenv';
dotenv.config();

import app from './app';
import db from './models';

const PORT = process.env.PORT || 4000;

async function start() {
  try {
    await db.sequelize.authenticate();
  } catch (err) {
    console.error('No se pudo conectar a MySQL:', err);
    process.exit(1);
  }

  app.listen(PORT);
}

start();
