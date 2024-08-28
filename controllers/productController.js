const db = require('../db/db');

exports.createProduct = async (req, res) => {
  const { ProductName, Quantity, UnitPriceRwf, FarmerId } = req.body;

  // Calculate the total price based on quantity and unit price
  const TotalPriceRwf = Quantity * UnitPriceRwf;

  try {
    // Insert the product including the calculated TotalPriceRwf
    const query = `INSERT INTO products (ProductName, Quantity, UnitPriceRwf, TotalPriceRwf, FarmerId) 
                   VALUES (?, ?, ?, ?, ?)`;
    db.query(query, [ProductName, Quantity, UnitPriceRwf, TotalPriceRwf, FarmerId], (err, result) => {
      if (err) {
        throw err;
      }
      res.json({ message: 'Product added successfully', productId: result.insertId });
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to add product: ' + error.message });
  }
};

exports.getAllProducts = async (req, res) => {
  try {
    const query = `SELECT products.*, farmers.FarmerName 
                   FROM products 
                   JOIN farmers ON products.FarmerId = farmers.FarmerId`;
    db.query(query, (err, results) => {
      if (err) {
        throw err;
      }
      res.json(results);
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch products: ' + error.message });
  }
};

exports.updateProduct = async (req, res) => {
  const { id } = req.params;
  const { ProductName, Quantity, UnitPriceRwf, FarmerId } = req.body;

  // Calculate the total price based on quantity and unit price
  const TotalPriceRwf = Quantity * UnitPriceRwf;

  try {
    const query = `UPDATE products SET ProductName = ?, Quantity = ?, UnitPriceRwf = ?, TotalPriceRwf = ?, FarmerId = ?, 
                   UpdatedAt = CURRENT_TIMESTAMP WHERE ProductId = ?`;
    db.query(query, [ProductName, Quantity, UnitPriceRwf, TotalPriceRwf, FarmerId, id], (err, result) => {
      if (err) {
        throw err;
      }
      if (result.affectedRows === 0) {
        return res.status(404).json({ error: 'Product not found' });
      }
      res.json({ message: 'Product updated successfully' });
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update product: ' + error.message });
  }
};
// Delete a product
exports.deleteProduct = async (req, res) => {
  const { id } = req.params;
  try {
    const query = 'DELETE FROM products WHERE ProductId = ?';
    db.query(query, [id], (err, result) => {
      if (err) {
        throw err;
      }
      if (result.affectedRows === 0) {
        return res.status(404).json({ error: 'Product not found' });
      }
      res.json({ message: 'Product deleted successfully' });
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete product: ' + error.message });
  }
};

// Get all farmers
exports.getAllFarmers = async (req, res) => {
  try {
    const query = 'SELECT FarmerId, FarmerName FROM farmers';
    db.query(query, (err, results) => {
      if (err) {
        throw err;
      }
      res.json(results);
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch farmers: ' + error.message });
  }
};
