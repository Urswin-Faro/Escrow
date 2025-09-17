const pool = require('../db');

// The new createUser function
exports.createUser = async (email, password, name, role) => {
    const query = 'INSERT INTO users (email, password, name, role) VALUES (?, ?, ?, ?)';
    const values = [email, password, name, role];
    const [result] = await pool.query(query, values);
    return { id: result.insertId };
};

// The findUserByEmail function remains the same
exports.findUserByEmail = async (email) => {
    const query = 'SELECT * FROM users WHERE email = ?';
    const [rows] = await pool.query(query, [email]);
    return rows[0];
};