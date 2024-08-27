const db = require('../db/db');

// Create a new farmer
exports.createFarmer = async (req, res) => {
    const { FarmerName, TelNo, Address, AccountNo, NationalId, Site, farmSize, harvestPerSeason } = req.body;
    const status = 'pending'; // Default status when a farmer is added
  
    if (!FarmerName || !TelNo || !Address || !AccountNo || !NationalId || !Site) {
      return res.status(400).json({ error: 'All fields are required' });
    }
  
    try {
      const query = `INSERT INTO farmers (FarmerName, TelNo, Address, AccountNo, NationalId, Site, farmSize, harvestPerSeason, status) 
                     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`;
      db.query(query, [FarmerName, TelNo, Address, AccountNo, NationalId, Site, farmSize, harvestPerSeason, status], (err, result) => {
        if (err) {
          throw err;
        }
        res.json({ message: 'Farmer added successfully', farmerId: result.insertId });
      });
    } catch (error) {
      res.status(500).json({ error: 'Failed to create farmer: ' + error.message });
    }
  };

// Get all farmers
exports.getAllFarmers = async (req, res) => {
  try {
    const query = 'SELECT * FROM farmers';
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

// Get a single farmer by ID
exports.getFarmerById = async (req, res) => {
  const { id } = req.params;
  try {
    const query = 'SELECT * FROM farmers WHERE FarmerId = ?';
    db.query(query, [id], (err, results) => {
      if (err) {
        throw err;
      }
      if (results.length === 0) {
        return res.status(404).json({ error: 'Farmer not found' });
      }
      res.json(results[0]);
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch farmer: ' + error.message });
  }
};

// Update a farmer
exports.updateFarmer = async (req, res) => {
    const { id } = req.params;
    const { FarmerName, TelNo, Address, AccountNo, NationalId, Site, farmSize, harvestPerSeason } = req.body;
  
    if (!FarmerName || !TelNo || !Address || !AccountNo || !NationalId || !Site) {
      return res.status(400).json({ error: 'All fields are required' });
    }
  
    try {
      const query = `UPDATE farmers SET FarmerName = ?, TelNo = ?, Address = ?, AccountNo = ?, NationalId = ?, Site = ?, 
                     farmSize = ?, harvestPerSeason = ?, updated_at = CURRENT_TIMESTAMP WHERE FarmerId = ?`;
      db.query(query, [FarmerName, TelNo, Address, AccountNo, NationalId, Site, farmSize, harvestPerSeason, id], (err, result) => {
        if (err) {
          throw err;
        }
        if (result.affectedRows === 0) {
          return res.status(404).json({ error: 'Farmer not found' });
        }
        res.json({ message: 'Farmer updated successfully' });
      });
    } catch (error) {
      res.status(500).json({ error: 'Failed to update farmer: ' + error.message });
    }
  };

// Delete a farmer
exports.deleteFarmer = async (req, res) => {
  const { id } = req.params;
  try {
    const query = 'DELETE FROM farmers WHERE FarmerId = ?';
    db.query(query, [id], (err, result) => {
      if (err) {
        throw err;
      }
      if (result.affectedRows === 0) {
        return res.status(404).json({ error: 'Farmer not found' });
      }
      res.json({ message: 'Farmer deleted successfully' });
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete farmer: ' + error.message });
  }
};

// Approve or reject a farmer
exports.approveOrRejectFarmer = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  try {
    const query = 'UPDATE farmers SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE FarmerId = ?';
    db.query(query, [status, id], (err, result) => {
      if (err) {
        throw err;
      }
      if (result.affectedRows === 0) {
        return res.status(404).json({ error: 'Farmer not found' });
      }
      res.json({ message: `Farmer ${status} successfully` });
    });
  } catch (error) {
    res.status(500).json({ error: `Failed to ${status} farmer: ` + error.message });
  }
};
