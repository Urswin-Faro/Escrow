require('dotenv').config();

console.log('DB_USER:', process.env.DB_USER); // Add this line


module.exports = {
  jwtSecret: process.env.JWT_SECRET || 'your_very_secure_jwt_secret',
  database: {
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
  }
};