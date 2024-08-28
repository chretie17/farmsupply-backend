// adminController.js
const db = require('../db/db');

// Fetch total metrics for dashboard
exports.getMetrics = async (req, res) => {
  try {
    const metrics = {};

    // Total Users
    const usersQuery = 'SELECT COUNT(*) AS totalUsers FROM users';
    const usersResult = await db.promise().query(usersQuery);
    metrics.totalUsers = usersResult[0][0].totalUsers;

    // Total Products
    const productsQuery = 'SELECT COUNT(*) AS totalProducts FROM products';
    const productsResult = await db.promise().query(productsQuery);
    metrics.totalProducts = productsResult[0][0].totalProducts;

    // Total Orders
    const ordersQuery = 'SELECT COUNT(*) AS totalOrders FROM orders';
    const ordersResult = await db.promise().query(ordersQuery);
    metrics.totalOrders = ordersResult[0][0].totalOrders;

    // Total Revenue
    const revenueQuery = 'SELECT SUM(TotalPrice) AS totalRevenue FROM orders WHERE status = "approved"';
    const revenueResult = await db.promise().query(revenueQuery);
    metrics.totalRevenue = revenueResult[0][0].totalRevenue || 0;

    res.json(metrics);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch metrics: ' + error.message });
  }
};

// Fetch orders per day for chart
exports.getOrdersPerDay = async (req, res) => {
  try {
    const query = `
      SELECT DATE(CreatedAt) AS date, COUNT(*) AS orders
      FROM orders
      GROUP BY DATE(CreatedAt)
      ORDER BY date;
    `;
    const results = await db.promise().query(query);
    res.json(results[0]);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch orders per day: ' + error.message });
  }
};

// Fetch products added per day for chart
exports.getProductsPerDay = async (req, res) => {
  try {
    const query = `
      SELECT DATE(CreatedAt) AS date, COUNT(*) AS products
      FROM products
      GROUP BY DATE(CreatedAt)
      ORDER BY date;
    `;
    const results = await db.promise().query(query);
    res.json(results[0]);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch products per day: ' + error.message });
  }
};
// Fetch weekly revenue for chart
exports.getWeeklyRevenue = async (req, res) => {
  try {
    const query = `
      SELECT 
        DAYNAME(CreatedAt) AS day, 
        SUM(TotalPrice) AS revenue 
      FROM orders 
      WHERE status = 'approved' 
      GROUP BY day 
      ORDER BY FIELD(day, 'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday');
    `;
    const [results] = await db.promise().query(query);
    res.json(results);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch weekly revenue: ' + error.message });
  }
};
exports.getAllOrders = async (req, res) => {
  try {
    const [orders] = await db.promise().query(`
      SELECT 
        orders.OrderId, 
        orders.Quantity, 
        orders.TotalPrice, 
        orders.deliveryDate, 
        products.ProductName, 
        farmers.FarmerName 
      FROM 
        orders 
      JOIN 
        products ON orders.ProductId = products.ProductId 
      JOIN 
        farmers ON products.FarmerId = farmers.FarmerId
    `);

    // Send the fetched orders as JSON
    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch orders: ' + error.message });
  }
};

// Function to download the invoice for a specific order
exports.downloadInvoice = async (req, res) => {
  const { id } = req.params;

  try {
    const [invoiceResult] = await db.promise().query(
      'SELECT InvoiceData FROM invoices WHERE OrderId = ?',
      [id]
    );

    if (invoiceResult.length === 0) {
      return res.status(404).json({ error: 'Invoice not found' });
    }

    const invoiceData = invoiceResult[0].InvoiceData;

    // Set the response headers and send the PDF
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=invoice_${id}.pdf`);
    res.send(invoiceData);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch invoice: ' + error.message });
  }
}