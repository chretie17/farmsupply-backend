const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../db/db');

// Create a new user
exports.createUser = async (req, res) => {
  const { username, email, password, role } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const query = 'INSERT INTO users (username, email, password, role) VALUES (?, ?, ?, ?)';
    db.query(query, [username, email, hashedPassword, role || 'user'], (err, result) => {
      if (err) {
        throw err;
      }
      res.json({ message: 'User created successfully' });
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create user' });
  }
};

// Get all users
exports.getAllUsers = async (req, res) => {
  try {
    const query = 'SELECT id, username, email, role, created_at, updated_at FROM users';
    db.query(query, (err, results) => {
      if (err) {
        throw err;
      }
      res.json(results);
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get a single user by ID
exports.getUserById = async (req, res) => {
  const { id } = req.params;
  try {
    const query = 'SELECT id, username, email, role, created_at, updated_at FROM users WHERE id = ?';
    db.query(query, [id], (err, results) => {
      if (err) {
        throw err;
      }
      if (results.length === 0) {
        return res.status(404).json({ error: 'User not found' });
      }
      res.json(results[0]);
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update a user by ID
exports.updateUser = async (req, res) => {
  const { id } = req.params;
  const { username, email, role } = req.body;
  try {
    const query = 'UPDATE users SET username = ?, email = ?, role = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?';
    db.query(query, [username, email, role, id], (err, result) => {
      if (err) {
        throw err;
      }
      if (result.affectedRows === 0) {
        return res.status(404).json({ error: 'User not found' });
      }
      res.json({ message: 'User updated successfully' });
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Delete a user by ID
exports.deleteUser = async (req, res) => {
  const { id } = req.params;
  try {
    const query = 'DELETE FROM users WHERE id = ?';
    db.query(query, [id], (err, result) => {
      if (err) {
        throw err;
      }
      if (result.affectedRows === 0) {
        return res.status(404).json({ error: 'User not found' });
      }
      res.json({ message: 'User deleted successfully' });
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
