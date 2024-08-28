const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../db/db');

exports.register = async (req, res) => {
  const { username, email, password, role } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const query = 'INSERT INTO users (username, email, password, role) VALUES (?, ?, ?, ?)';
    db.query(query, [username, email, hashedPassword, role || 'user'], (err, result) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.json({ message: 'User registered successfully' });
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to register user' });
  }
};

exports.login = (req, res) => {
  const { username, password } = req.body;
  const query = 'SELECT * FROM users WHERE username = ? OR email = ?';
  db.query(query, [username, username], async (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    if (results.length === 0) return res.status(400).json({ error: 'User not found' });

    const user = results[0];
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ error: 'Invalid credentials' });

    // Include user ID in the JWT payload
    const token = jwt.sign(
      { id: user.id, username: user.username, role: user.role },
      'your_jwt_secret',
      { expiresIn: '1h' }
    );

    // Send user ID in the response
    res.json({ token, role: user.role, userId: user.id });
  });
};
