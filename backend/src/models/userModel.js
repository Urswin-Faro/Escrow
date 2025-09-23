// src/models/userModel.js
const bcrypt = require('bcrypt');

exports.createUser = async (email, password, username, role = 'user') => {
  const hashed = await bcrypt.hash(password, 10);
  const query = `
    INSERT INTO users (email, password, username, role)
    VALUES ($1, $2, $3, $4)
    RETURNING id
  `;
  const values = [email, hashed, username, role];

  const result = await pool.query(query, values);
  return { id: result.rows[0].id };
};

exports.findUserByEmail = async (email) => {
  const query = 'SELECT * FROM users WHERE email = $1';
  const result = await pool.query(query, [email]);
  return result.rows[0] || null;
};

// ✅ Add this function to check if a user exists by ID
exports.findUserById = async (id) => {
  const query = 'SELECT * FROM users WHERE id = $1';
  const result = await pool.query(query, [id]);
  return result.rows[0] || null;
};

// LOGIN
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }
    const user = await User.findUserByEmail(email);
    if (!user) {
      return res.status(401).json({ error: "Invalid email or password" });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: "Invalid email or password" });
    }
    const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: "1h" });
    res.json({ message: "Login successful", token, user: { id: user.id, email: user.email, role: user.role } });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ error: "Server error" });
  }
};