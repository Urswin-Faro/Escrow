const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  },
  // Add connection management settings
  max: 10, // Maximum number of clients in the pool
  idleTimeoutMillis: 30000, // Close idle clients after 30 seconds
  connectionTimeoutMillis: 5000, // Return an error if connection takes longer than 5 seconds
});

// Handle pool errors
pool.on('error', (err, client) => {
  console.error('Unexpected error on idle client', err);
  process.exit(-1);
});

// Test connection with better error handling
pool.connect()
  .then((client) => {
    console.log('Connected to Neon PostgreSQL database successfully');
    client.release();
  })
  .catch(err => {
    console.error('Neon database connection error:', err.message);
    console.error('Retrying connection in 5 seconds...');
    setTimeout(() => {
      process.exit(1);
    }, 5000);
  });

module.exports = { pool };