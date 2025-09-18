// backend/db.js
const { Pool } = require('pg');

const pool = new Pool({
  user: 'postgres',
  host: '192.168.1.54',
  database: 'postgres',
  password: 'Shafwan@1',
  port: 5432,
});

pool.connect()
  .then(() => console.log('Connected to Postgres!'))
  .catch(err => console.error('Postgres connection error', err));

module.exports = { pool };
