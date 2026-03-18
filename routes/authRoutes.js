const express = require('express');
const router = express.Router();
const db = require('../database');
const { v4: uuidv4 } = require('uuid');

// SIGN UP
router.post('/signup', (req, res) => {
  const { name, email, phone, address } = req.body;
  if (!name || !email || !phone || !address) {
    return res.status(400).json({ error: 'All fields are required.' });
  }

  try {
    const data = db.read();
    
    // Check if email exists
    if (data.accounts.some(acc => acc.email === email)) {
      return res.status(400).json({ error: 'An account with this email already exists.' });
    }
    
    // Create new account
    const newAccount = {
      id: uuidv4(),
      name,
      email,
      phone,
      address,
      created_at: new Date().toISOString()
    };
    
    data.accounts.push(newAccount);
    db.write(data);
    
    // Auto login
    req.session.user = { id: newAccount.id, name, email, phone, address };
    res.json({ success: true, user: req.session.user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error.' });
  }
});

// LOG IN
router.post('/login', (req, res) => {
  const { email, phone } = req.body;
  if (!email || !phone) {
    return res.status(400).json({ error: 'Email and Phone number are required.' });
  }

  try {
    const data = db.read();
    const user = data.accounts.find(acc => acc.email === email && acc.phone === phone);
    
    if (user) {
      req.session.user = { id: user.id, name: user.name, email: user.email, phone: user.phone, address: user.address };
      res.json({ success: true, user: req.session.user });
    } else {
      res.status(401).json({ error: 'Invalid email or phone number.' });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error.' });
  }
});

// LOG OUT
router.post('/logout', (req, res) => {
  req.session.destroy();
  res.json({ success: true });
});

// GET SESSION
router.get('/session', (req, res) => {
  if (req.session.user) {
    res.json({ user: req.session.user });
  } else {
    res.json({ user: null });
  }
});

// UPDATE ACCOUNT
router.patch('/account', (req, res) => {
  if (!req.session.user) {
    return res.status(401).json({ error: 'Unauthorized.' });
  }

  const { name, phone, address } = req.body;
  
  try {
    const data = db.read();
    const accountIndex = data.accounts.findIndex(acc => acc.id === req.session.user.id);
    
    if (accountIndex === -1) {
      return res.status(404).json({ error: 'Account not found.' });
    }
    
    // Update account
    data.accounts[accountIndex].name = name;
    data.accounts[accountIndex].phone = phone;
    data.accounts[accountIndex].address = address;
    db.write(data);
    
    // Update session
    req.session.user.name = name;
    req.session.user.phone = phone;
    req.session.user.address = address;
    
    res.json({ success: true, user: req.session.user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error.' });
  }
});

module.exports = router;
