import 'dotenv/config';
import app from './src/app.js';
import pool from './src/config/db.js';

const PORT = process.env.PORT || 3000;

const server = app.listen(PORT, () => {
  console.log(`Switchback is running on port ${PORT}`);
});

// Close the server and the database pool cleanly (Render sends SIGTERM on deploys).
function shutdown() {
  server.close(async () => {
    await pool.end();
    process.exit(0);
  });
}

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);
