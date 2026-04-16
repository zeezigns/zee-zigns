const express = require('express');
const router = express.Router();
const db = require('../database');

// IMPORTANT: Change these credentials before going live. Ideally move to .env file.
const ADMIN_USERNAME = process.env.ADMIN_USER || 'asburgers_admin';
const ADMIN_PASSWORD = process.env.ADMIN_PASS || 'Admin@ZZ2025!';

// Check session
router.get('/session', (req, res) => {
  res.json({ admin: !!req.session.admin });
});

// Admin Login
router.post('/login', (req, res) => {
  const { username, password } = req.body;
  if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
    req.session.admin = true;
    res.json({ success: true });
  } else {
    res.status(401).json({ error: 'Invalid admin credentials' });
  }
});

// Admin Logout
router.post('/logout', (req, res) => {
  req.session.admin = false;
  res.json({ success: true });
});

// Middleware to protect admin routes
function requireAdmin(req, res, next) {
  if (!req.session.admin) {
    return res.status(403).json({ error: 'Forbidden. Admin access required.' });
  }
  next();
}

// Get all accounts with order count
router.get('/accounts', requireAdmin, (req, res) => {
  try {
    const data = db.read();
    
    // Add order counts
    const accounts = data.accounts.map(acc => {
      const orderCount = data.orders.filter(o => o.account_id === acc.id).length;
      return { ...acc, total_orders: orderCount };
    }).sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    
    res.json({ accounts });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  }
});

// Get all orders
router.get('/orders', requireAdmin, (req, res) => {
  try {
    const data = db.read();
    const orders = [...data.orders].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    res.json({ orders });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  }
});

// Update order status
router.patch('/orders/:id/status', requireAdmin, (req, res) => {
  const { status } = req.body;
  const orderId = req.params.id;
  
  const validStatuses = ['Pending', 'Preparing', 'Out for Delivery', 'Delivered', 'Cancelled'];
  if (!validStatuses.includes(status)) {
    return res.status(400).json({ error: 'Invalid status' });
  }

  try {
    const data = db.read();
    const orderIndex = data.orders.findIndex(o => o.id === orderId || o.id === parseInt(orderId));
    
    if (orderIndex === -1) {
      return res.status(404).json({ error: 'Order not found' });
    }
    
    data.orders[orderIndex].status = status;
    db.write(data);
    
    res.json({ success: true, status });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  }
});

// Delete an order permanently
router.delete('/orders/:id', requireAdmin, (req, res) => {
  const orderId = req.params.id;
  try {
    const data = db.read();
    const orderIndex = data.orders.findIndex(o => o.id === orderId || o.id === parseInt(orderId));
    
    if (orderIndex === -1) {
      return res.status(404).json({ error: 'Order not found' });
    }
    
    data.orders.splice(orderIndex, 1);
    db.write(data);
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  }
});

module.exports = router;
