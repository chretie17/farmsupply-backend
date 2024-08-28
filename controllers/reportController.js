const db = require('../db/db');

// Fetch data for the report
exports.getReportData = async (req, res) => {
  try {
    // Fetch total metrics
    const metrics = {};

    // Total Users
    const usersQuery = 'SELECT COUNT(*) AS totalUsers FROM users';
    const [usersResult] = await db.promise().query(usersQuery);
    metrics.totalUsers = usersResult[0].totalUsers;

    // Total Products
    const productsQuery = 'SELECT COUNT(*) AS totalProducts FROM products';
    const [productsResult] = await db.promise().query(productsQuery);
    metrics.totalProducts = productsResult[0].totalProducts;

    // Total Orders
    const ordersQuery = 'SELECT COUNT(*) AS totalOrders FROM orders';
    const [ordersResult] = await db.promise().query(ordersQuery);
    metrics.totalOrders = ordersResult[0].totalOrders;

    // Total Revenue
    const revenueQuery = 'SELECT SUM(TotalPrice) AS totalRevenue FROM orders WHERE status = "approved"';
    const [revenueResult] = await db.promise().query(revenueQuery);
    metrics.totalRevenue = revenueResult[0].totalRevenue || 0;

    // Fetch orders details
    const ordersDetailsQuery = `
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
    `;
    const [ordersDetails] = await db.promise().query(ordersDetailsQuery);

    // Fetch revenue per day for the last week
    const weeklyRevenueQuery = `
      SELECT 
        DAYNAME(CreatedAt) AS day, 
        SUM(TotalPrice) AS revenue 
      FROM orders 
      WHERE status = 'approved' 
      AND CreatedAt >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)
      GROUP BY day 
      ORDER BY FIELD(day, 'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday');
    `;
    const [weeklyRevenue] = await db.promise().query(weeklyRevenueQuery);

    // Fetch products added per day for the last week
    const productsPerDayQuery = `
      SELECT DATE(CreatedAt) AS date, COUNT(*) AS products
      FROM products
      WHERE CreatedAt >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)
      GROUP BY DATE(CreatedAt)
      ORDER BY date;
    `;
    const [productsPerDay] = await db.promise().query(productsPerDayQuery);

    // Fetch orders per day for the last week
    const ordersPerDayQuery = `
      SELECT DATE(CreatedAt) AS date, COUNT(*) AS orders
      FROM orders
      WHERE CreatedAt >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)
      GROUP BY DATE(CreatedAt)
      ORDER BY date;
    `;
    const [ordersPerDay] = await db.promise().query(ordersPerDayQuery);

    // Fetch all farmers
    const farmersQuery = 'SELECT FarmerId, FarmerName, status FROM farmers';
    const [farmers] = await db.promise().query(farmersQuery);

    // Fetch all training programs
    const trainingsQuery = 'SELECT TrainingId, TrainingTitle, ScheduledDate FROM trainings';
    const [trainings] = await db.promise().query(trainingsQuery);

    // Combine all the fetched data
    const reportData = {
      metrics,
      ordersDetails,
      weeklyRevenue,
      productsPerDay,
      ordersPerDay,
      farmers,
      trainings,
    };

    // Send the report data as JSON
    res.json(reportData);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch report data: ' + error.message });
  }
};
