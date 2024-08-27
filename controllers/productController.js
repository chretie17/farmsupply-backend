const db = require('../db/db');

exports.addProduct = (req, res) => {
  const { FarmerId, ProductName } = req.body;
  const query = 'INSERT INTO products (FarmerId, ProductName) VALUES (?, ?)';
  db.query(query, [FarmerId, ProductName], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'Product added successfully' });
  });
};

exports.getProducts = (req, res) => {
  const query = 'SELECT * FROM products WHERE FarmerId = ?';
  db.query(query, [req.params.farmerId], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
};
