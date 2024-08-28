const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const db = require('./db/db');
const authRoutes = require('./routes/auth');
const farmerRoutes = require('./routes/farmers');
const fieldOfficerRoutes = require('./routes/fieldOfficer');
const adminRoutes = require('./routes/admin');
const userRoutes = require('./routes/users');  
const trainingRoutes = require('./routes/training');
const ProductRoutes = require('./routes/product');
const OrderRoutes = require('./routes/orders');
const ReportRoutes = require('./routes/report');
const app = express();

// Middleware
app.use(bodyParser.json());
app.use(cors());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/farmers', farmerRoutes);
app.use('/api/field-officer', fieldOfficerRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/users', userRoutes);  
app.use ('/api/trainings', trainingRoutes);
app.use ('/api/products', ProductRoutes);
app.use ('/api/orders', OrderRoutes);
app.use ('/api/report', ReportRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
