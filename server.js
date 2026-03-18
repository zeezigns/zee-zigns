const express = require('express');
const session = require('express-session');
const path = require('path');
const db = require('./database');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(session({
  secret: 'aa_burgers_secret_key_2025',
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 7 * 24 * 60 * 60 * 1000 } // 1 week
}));

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));
// Serve pages directory implicitly if beneficial, but better to map them explicitly below
app.use('/pages', express.static(path.join(__dirname, 'public/pages')));

// API Routes
app.use('/api', require('./routes/authRoutes'));
app.use('/api', require('./routes/orderRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));

// HTML Page Routes
app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'public/pages/index.html')));
app.get('/auth', (req, res) => res.sendFile(path.join(__dirname, 'public/pages/auth.html')));
app.get('/checkout', (req, res) => res.sendFile(path.join(__dirname, 'public/pages/checkout.html')));
app.get('/account', (req, res) => res.sendFile(path.join(__dirname, 'public/pages/account.html')));
app.get('/admin', (req, res) => res.sendFile(path.join(__dirname, 'public/pages/admin.html')));

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
