const mysql = require('mysql2/promise');
const config = require('./config');

// The environment variables are loaded here from the config file
const pool = mysql.createPool(config.database);

module.exports = pool;