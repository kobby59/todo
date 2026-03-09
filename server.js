const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('../frontend'));

// Port Configuration
const PORT = process.env.PORT || 5000;

// Sample Products Database
const products = [
    { id: 1, name: 'Wireless Headphones', price: 79.99, category: 'electronics', stock: 50, emoji: '🎧' },
    { id: 2, name: 'Smart Watch', price: 199.99, category: 'electronics', stock: 30, emoji: '⌚' },
    { id: 3, name: 'USB-C Cable', price: 12.99, category: 'electronics', stock: 100, emoji: '🔌' },
    { id: 4, name: 'Designer T-Shirt', price: 49.99, category: 'clothing', stock: 75, emoji: '👕' },
    { id: 5, name: 'Running Shoes', price: 89.99, category: 'clothing', stock: 40, emoji: '👟' },
    { id: 6, name: 'Winter Jacket', price: 129.99, category: 'clothing', stock: 25, emoji: '🧥' },
    { id: 7, name: 'JavaScript Guide', price: 34.99, category: 'books', stock: 60, emoji: '📚' },
    { id: 8, name: 'Web Design Handbook', price: 44.99, category: 'books', stock: 45, emoji: '📖' },
    { id: 9, name: 'Plant Pot', price: 24.99, category: 'home', stock: 80, emoji: '🪴' },
    { id: 10, name: 'Desk Lamp', price: 59.99, category: 'home', stock: 55, emoji: '💡' },
    { id: 11, name: 'Coffee Maker', price: 89.99, category: 'home', stock: 35, emoji: '☕' },
    { id: 12, name: 'Bluetooth Speaker', price: 69.99, category: 'electronics', stock: 42, emoji: '🔊' }
];

// In-memory orders storage
let orders = [];
let orderIdCounter = 1000;

// Routes

// GET - Fetch all products
app.get('/api/products', (req, res) => {
    res.json({
        success: true,
        data: products,
        count: products.length
    });
});

// GET - Fetch single product
app.get('/api/products/:id', (req, res) => {
    const product = products.find(p => p.id === parseInt(req.params.id));
    
    if (!product) {
        return res.status(404).json({
            success: false,
            message: 'Product not found'
        });
    }
    
    res.json({
        success: true,
        data: product
    });
});

// GET - Filter products by category
app.get('/api/products/category/:category', (req, res) => {
    const filtered = products.filter(p => p.category === req.params.category);
    
    res.json({
        success: true,
        data: filtered,
        count: filtered.length
    });
});

// POST - Create order
app.post('/api/orders', (req, res) => {
    const { items, userEmail, total } = req.body;

    if (!items || items.length === 0) {
        return res.status(400).json({
            success: false,
            message: 'Order must contain items'
        });
    }

    const order = {
        orderId: orderIdCounter++,
        items: items,
        userEmail: userEmail,
        total: total,
        status: 'pending',
        createdAt: new Date().toISOString(),
        estimatedDelivery: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString()
    };

    orders.push(order);

    res.status(201).json({
        success: true,
        message: 'Order created successfully',
        data: order
    });
});

// GET - Fetch user orders
app.get('/api/orders/:email', (req, res) => {
    const userOrders = orders.filter(o => o.userEmail === req.params.email);

    res.json({
        success: true,
        data: userOrders,
        count: userOrders.length
    });
});

// GET - Fetch single order
app.get('/api/orders/item/:orderId', (req, res) => {
    const order = orders.find(o => o.orderId === parseInt(req.params.orderId));

    if (!order) {
        return res.status(404).json({
            success: false,
            message: 'Order not found'
        });
    }

    res.json({
        success: true,
        data: order
    });
});

// PUT - Update order status
app.put('/api/orders/:orderId/status', (req, res) => {
    const { status } = req.body;
    const order = orders.find(o => o.orderId === parseInt(req.params.orderId));

    if (!order) {
        return res.status(404).json({
            success: false,
            message: 'Order not found'
        });
    }

    order.status = status;
    res.json({
        success: true,
        message: 'Order status updated',
        data: order
    });
});

// POST - Process payment (simulated)
app.post('/api/payments', (req, res) => {
    const { amount, cardNumber, email } = req.body;

    // Simulate payment processing
    const isSuccessful = Math.random() > 0.1; // 90% success rate

    if (!isSuccessful) {
        return res.status(400).json({
            success: false,
            message: 'Payment failed. Please try again.'
        });
    }

    res.json({
        success: true,
        message: 'Payment processed successfully',
        transactionId: Math.random().toString(36).substr(2, 9).toUpperCase(),
        amount: amount,
        timestamp: new Date().toISOString()
    });
});

// GET - API Health Check
app.get('/api/health', (req, res) => {
    res.json({
        success: true,
        message: 'API is running',
        timestamp: new Date().toISOString()
    });
});

// 404 Handler
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: 'Endpoint not found'
    });
});

// Error Handler
app.use((err, req, res, next) => {
    console.error(err);
    res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: err.message
    });
});

// Start Server
app.listen(PORT, () => {
    console.log(`🚀 ShopHub API running on http://localhost:${PORT}`);
    console.log(`✅ Health check: http://localhost:${PORT}/api/health`);
    console.log(`✅ Products: http://localhost:${PORT}/api/products`);
});

module.exports = app;
