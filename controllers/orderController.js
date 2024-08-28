const db = require('../db/db');
const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');
const ejs = require('ejs'); // Import EJS
const pdf = require('html-pdf'); // Or use 'puppeteer'
const puppeteer = require('puppeteer');



exports.createOrder = async (req, res) => {
    const { ProductId, Quantity, OrderedBy } = req.body; // Get OrderedBy directly from the request body
  
    if (!OrderedBy) {
      return res.status(400).json({ error: 'OrderedBy is required' });
    }
  
    try {
      // Fetch product price to calculate the total price
      const productQuery = 'SELECT UnitPriceRwf FROM products WHERE ProductId = ?';
      db.query(productQuery, [ProductId], (err, productResult) => {
        if (err) {
          return res.status(500).json({ error: 'Error fetching product: ' + err.message });
        }
        if (productResult.length === 0) {
          return res.status(404).json({ error: 'Product not found' });
        }
  
        const UnitPriceRwf = productResult[0].UnitPriceRwf;
        const TotalPrice = UnitPriceRwf * Quantity;
  
        // Insert the order into the orders table
        const query = `INSERT INTO orders (ProductId, Quantity, TotalPrice, OrderedBy) 
                       VALUES (?, ?, ?, ?)`;
        db.query(query, [ProductId, Quantity, TotalPrice, OrderedBy], (err, result) => {
          if (err) {
            return res.status(500).json({ error: 'Failed to create order: ' + err.message });
          }
          res.json({ message: 'Order created successfully', orderId: result.insertId });
        });
      });
    } catch (error) {
      res.status(500).json({ error: 'Failed to create order: ' + error.message });
    }
  };
// Get all orders
// Get all orders
exports.getAllOrders = async (req, res) => {
    try {
      // Join orders with products to get the product name
      const query = `
        SELECT 
          orders.*,
          products.ProductName 
        FROM 
          orders 
        JOIN 
          products 
        ON 
          orders.ProductId = products.ProductId
      `;
      
      db.query(query, (err, results) => {
        if (err) {
          return res.status(500).json({ error: 'Failed to fetch orders: ' + err.message });
        }
        res.json(results);
      });
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch orders: ' + error.message });
    }
  };
  

// Update order status (approve/reject)
exports.updateOrderStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  try {
    const query = 'UPDATE orders SET status = ?, UpdatedAt = CURRENT_TIMESTAMP WHERE OrderId = ?';
    db.query(query, [status, id], (err, result) => {
      if (err) {
        return res.status(500).json({ error: 'Failed to update order status: ' + err.message });
      }
      if (result.affectedRows === 0) {
        return res.status(404).json({ error: 'Order not found' });
      }
      res.json({ message: `Order ${status} successfully` });
    });
  } catch (error) {
    res.status(500).json({ error: `Failed to update order status: ` + error.message });
  }
};
// Convert an image to Base64
const convertImageToBase64 = (imagePath) => {
    try {
      const imageBuffer = fs.readFileSync(imagePath);
      return `data:image/png;base64,${imageBuffer.toString('base64')}`;
    } catch (error) {
      console.error('Failed to convert image to base64:', error);
      return '';
    }
  };
  
  // Update the path to your logo
  const logoBase64 = convertImageToBase64(path.join(__dirname, './logo.png')); // Ensure this path is correct
  
  // Schedule delivery for an order
  exports.scheduleDelivery = async (req, res) => {
    const { id } = req.params;
    const { deliveryDate } = req.body;
  
    try {
      const query = 'UPDATE orders SET deliveryDate = ? WHERE OrderId = ?';
      await db.promise().query(query, [deliveryDate, id]);
      await generateInvoicePDF(id); // Generate the invoice after scheduling the delivery
      res.json({ message: 'Delivery scheduled successfully and invoice generated' });
    } catch (error) {
      console.error('Failed to schedule delivery:', error);
      res.status(500).json({ error: 'Failed to schedule delivery' });
    }
  };
  

const generateInvoicePDF = async (orderId) => {
  try {
    // Fetch order details
    const [orderResult] = await db.promise().query(
      'SELECT orders.*, products.ProductName, products.UnitPriceRwf, farmers.FarmerName FROM orders JOIN products ON orders.ProductId = products.ProductId JOIN farmers ON products.FarmerId = farmers.FarmerId WHERE orders.OrderId = ?',
      [orderId]
    );

    if (orderResult.length === 0) {
      throw new Error('Order not found');
    }

    const order = orderResult[0];

    // Generate HTML for the invoice using EJS
    const templatePath = path.join(__dirname, '../views/invoice.ejs');
    const html = await ejs.renderFile(templatePath, {
      order,
      logoBase64,
    });

    // Use html-pdf to convert the HTML to PDF
    const options = { format: 'A4' }; // You can adjust options as needed
    pdf.create(html, options).toBuffer(async (err, pdfBuffer) => {
      if (err) {
        throw new Error('Failed to generate PDF: ' + err.message);
      }

      // Ensure pdfBuffer is a Buffer and handle binary data correctly
      if (!Buffer.isBuffer(pdfBuffer)) {
        throw new Error('PDF buffer is not a valid binary buffer');
      }

      // Save the invoice to the database
      const [result] = await db.promise().query(
        'INSERT INTO invoices (OrderId, InvoiceData) VALUES (?, ?)',
        [orderId, pdfBuffer]
      );

      console.log(`Invoice generated and saved with InvoiceId: ${result.insertId}`);
    });
  } catch (error) {
    console.error('Failed to generate invoice:', error);
  }
};

  
  
  // Fetch and serve the invoice PDF from the database
  exports.getInvoice = async (req, res) => {
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
  };