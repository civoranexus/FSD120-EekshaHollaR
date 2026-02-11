const db = require('../config/db');

afterAll(async () => {
  try {
    await db.pool.end();
    console.log('Test setup: DB pool closed');
  } catch (err) {
    // ignore errors during shutdown
  }
});
