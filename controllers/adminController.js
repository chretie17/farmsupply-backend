const db = require('../db/db');

exports.getAdminDashboard = (req, res) => {
  // Example query to get admin-specific data
  const query = 'SELECT * FROM users';
  db.query(query, (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
};
exports.createTraining = (req, res) => {
    const { Title, Description, ScheduledDate } = req.body;
    const query = 'INSERT INTO trainings (Title, Description, ScheduledDate, CreatedBy) VALUES (?, ?, ?, ?)';
    db.query(query, [Title, Description, ScheduledDate, req.user.id], (err, result) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ message: 'Training program created successfully' });
    });
  };
  
  exports.getTrainings = (req, res) => {
    const query = 'SELECT * FROM trainings';
    db.query(query, (err, results) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(results);
    });
  };
  
// More admin-related controllers can be added here
