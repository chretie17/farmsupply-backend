const multer = require('multer');
const db = require('../db/db');

// Configure multer for file uploads
const storage = multer.memoryStorage(); // Store the file in memory
const upload = multer({ storage: storage });

// Create a new training program with PDF and scheduled date (admin only)
exports.createTraining = [
  upload.single('pdf'), // Middleware to handle file upload
  async (req, res) => {
    try {
      const { TrainingTitle, Description, ScheduledDate } = req.body;
      const PdfData = req.file ? req.file.buffer : null; // Get the file buffer if uploaded

      const query = `INSERT INTO trainings (TrainingTitle, Description, PdfData, ScheduledDate) 
                     VALUES (?, ?, ?, ?)`;
      db.query(query, [TrainingTitle, Description, PdfData, ScheduledDate], (err, result) => {
        if (err) {
          throw err;
        }
        res.json({ message: 'Training created successfully', trainingId: result.insertId });
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
];

// Serve PDF data to the frontend
exports.getTrainingPdf = async (req, res) => {
    const { id } = req.params;
  
    try {
      const query = 'SELECT PdfData FROM trainings WHERE TrainingId = ?';
      db.query(query, [id], (err, results) => {
        if (err) {
          throw err;
        }
        if (results.length === 0) {
          return res.status(404).json({ error: 'PDF not found' });
        }
  
        // Set content-type to application/pdf
        res.setHeader('Content-Type', 'application/pdf');
        res.send(results[0].PdfData);
      });
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch PDF: ' + error.message });
    }
  };
  
// Get all trainings (accessible by field officers)
exports.getAllTrainings = async (req, res) => {
  try {
    const query = 'SELECT TrainingId, TrainingTitle, Description, ScheduledDate, CreatedAt, UpdatedAt FROM trainings';
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

// Get a single training by ID
exports.getTrainingById = async (req, res) => {
  try {
    const { id } = req.params;
    const query = 'SELECT * FROM trainings WHERE TrainingId = ?';
    db.query(query, [id], (err, results) => {
      if (err) {
        throw err;
      }
      if (results.length === 0) {
        return res.status(404).json({ error: 'Training not found' });
      }
      res.json(results[0]);
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update a training program (admin only)
exports.updateTraining = [
  upload.single('pdf'), // Middleware to handle file upload
  async (req, res) => {
    try {
      const { id } = req.params;
      const { TrainingTitle, Description, ScheduledDate } = req.body;
      const PdfData = req.file ? req.file.buffer : null; // Get the file buffer if uploaded

      const query = PdfData
        ? `UPDATE trainings SET TrainingTitle = ?, Description = ?, PdfData = ?, ScheduledDate = ?, 
           UpdatedAt = CURRENT_TIMESTAMP WHERE TrainingId = ?`
        : `UPDATE trainings SET TrainingTitle = ?, Description = ?, ScheduledDate = ?, 
           UpdatedAt = CURRENT_TIMESTAMP WHERE TrainingId = ?`;

      const params = PdfData
        ? [TrainingTitle, Description, PdfData, ScheduledDate, id]
        : [TrainingTitle, Description, ScheduledDate, id];

      db.query(query, params, (err, result) => {
        if (err) {
          throw err;
        }
        if (result.affectedRows === 0) {
          return res.status(404).json({ error: 'Training not found' });
        }
        res.json({ message: 'Training updated successfully' });
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
];

// Delete a training program (admin only)
exports.deleteTraining = async (req, res) => {
  try {
    const { id } = req.params;
    const query = 'DELETE FROM trainings WHERE TrainingId = ?';
    db.query(query, [id], (err, result) => {
      if (err) {
        throw err;
      }
      if (result.affectedRows === 0) {
        return res.status(404).json({ error: 'Training not found' });
      }
      res.json({ message: 'Training deleted successfully' });
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
exports.getTrainingPdfById = async (req, res) => {
    const { id } = req.params;
    try {
        const query = 'SELECT PdfData FROM trainings WHERE TrainingId = ?';
        db.query(query, [id], (err, results) => {
            if (err) {
                throw err;
            }
            if (results.length === 0) {
                return res.status(404).json({ error: 'Training not found' });
            }

            const pdfData = results[0].PdfData;
            res.setHeader('Content-Type', 'application/pdf');
            res.send(pdfData);
        });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch training PDF: ' + error.message });
    }
};
