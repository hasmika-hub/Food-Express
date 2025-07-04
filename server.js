const express = require('express');
const path = require('path');
const session = require('express-session');
const bodyParser = require('body-parser');

const app = express();
const PORT = 3000;

// ✅ Middleware
app.use(express.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use(session({
  secret: 'your-secret-key',  // Replace with a secure value for production
  resave: false,
  saveUninitialized: true
}));

app.use(express.static(__dirname));

// ---------------- ROUTES ---------------- //

// ✅ Landing page (login)
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// ✅ Handle login
app.post('/login', (req, res) => {
  const { name, mobile, place } = req.body;
  req.session.userName = name;
  req.session.userPlace = place;

  res.json({ success: true, message: 'Login successful!' });
});

// ✅ Home page
app.get('/home.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'home.html'));
});

// ✅ Get user data
app.get('/userdata', (req, res) => {
  res.json({
    name: req.session.userName || '',
    place: req.session.userPlace || ''
  });
});

// ✅ Add to cart
app.post('/add-to-cart', (req, res) => {
  const item = req.body;
  if (!req.session.cart) req.session.cart = [];
  req.session.cart.push(item);

  console.log(`🧺 Item added to cart: ${item.name}`);
  res.json({ message: 'Item added to cart!' });
});

// ✅ Get cart
app.get('/get-cart', (req, res) => {
  const cart = req.session.cart || [];
  res.json(cart);
});

// ✅ Admin - all orders
app.get('/admin/orders', (req, res) => {
  if (req.app.locals.orders && req.app.locals.orders.length > 0) {
    res.json(req.app.locals.orders);
  } else {
    res.json([]);
  }
});

// ✅ Place order
app.post('/place-order', (req, res) => {
  const { name, place, items } = req.body;

  if (!name || !place || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ message: 'Invalid order data' });
  }

  const order = {
    id: Date.now().toString(),
    name,
    place,
    items,
    status: 'Preparing',
    placedAt: new Date().toLocaleString()
  };

  if (!req.app.locals.orders) req.app.locals.orders = [];
  req.app.locals.orders.push(order);

  console.log("📦 New Order Received:", order);
  res.json({ message: 'Order placed successfully!', orderId: order.id });
});

// ✅ Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
