const express = require('express');
const router = express.Router();
const db = require('../database');
const { v4: uuidv4 } = require('uuid');

function generateOrderNumber() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = 'ZZ-';
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

// PLACE ORDER
router.post('/orders', (req, res) => {
  const { customer_name, customer_email, customer_phone, customer_address, items, total_price } = req.body;
  
  if (!customer_name || !customer_phone || !customer_address || !items || total_price === undefined) {
    return res.status(400).json({ error: 'Missing required fields.' });
  }

  const account_id = req.session.user ? req.session.user.id : null;
  
  // order_number generation avoiding collision (simplistic approach for demo)
  let order_number = generateOrderNumber();
  
  try {
    const data = db.read();
    
    const newOrder = {
      id: uuidv4(),
      order_number,
      account_id,
      customer_name,
      customer_email,
      customer_phone,
      customer_address,
      items,
      total_price,
      status: 'Pending',
      created_at: new Date().toISOString()
    };
    
    data.orders.push(newOrder);
    db.write(data);
    
    res.json({ success: true, orderNumber: order_number });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error while placing order.' });
  }
});

// GET MY ORDERS
router.get('/orders/mine', (req, res) => {
  if (!req.session.user) {
    return res.status(401).json({ error: 'Unauthorized.' });
  }

  try {
    const data = db.read();
    const orders = data.orders
      .filter(order => order.account_id === req.session.user.id)
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
      
    res.json({ orders });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error.' });
  }
});

module.exports = router;
