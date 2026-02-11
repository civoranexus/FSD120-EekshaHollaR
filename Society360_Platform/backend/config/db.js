const { Pool } = require('pg');
try {
  require('dotenv').config();
} catch (err) {
  // Silent in production where env vars are usually pre-set
}


// const pool = new Pool({
//   user: process.env.DB_USER,
//   host: process.env.DB_HOST,
//   database: process.env.DB_DATABASE,
//   password: process.env.DB_PASSWORD,
//   port: process.env.DB_PORT,
// });
const pool= new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: 
    process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
})

pool.on('connect', () => {
  console.log('Connected to the PostgreSQL database');
});

pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
  process.exit(-1);
});

// In test environment, ensure pool is closed on process exit to avoid open handle warnings
if (process.env.NODE_ENV === 'test') {
  process.on('exit', async () => {
    try {
      await pool.end();
      console.log('Test environment: closed DB pool');
    } catch (err) {
      // ignore
    }
  });
}

module.exports = {
  query: (text, params) => pool.query(text, params),
  pool,
};
