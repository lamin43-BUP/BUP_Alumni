const express = require('express');
const cors = require('cors');
const path = require('path');
const session = require('express-session');
require('dotenv').config();

// Import routes
const studentRoutes = require('./routes/studentRoutes');
const alumniRoutes = require('./routes/alumniRoutes');
const authRoutes = require('./routes/authRoutes');
const offerRoutes = require('./routes/offerRoutes');
const applicationRoutes = require('./routes/applicationRoutes');
const sessionsRoutes = require('./routes/sessionsRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

// ===============================
// Middleware
// ===============================
app.use(cors({
    origin: true,
    credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// -------------------------------
// Session middleware
// -------------------------------
app.use(session({
    secret: process.env.SESSION_SECRET || 'your-secret-key-here',
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: false,
        maxAge: 24 * 60 * 60 * 1000
    }
}));

// -------------------------------
// Serve static files
// -------------------------------
app.use(express.static(path.join(__dirname, '.')));
app.use('/css', express.static(path.join(__dirname, 'css')));
app.use('/js', express.static(path.join(__dirname, 'js')));
app.use('/images', express.static(path.join(__dirname, 'images')));
app.use('/frontend', express.static(path.join(__dirname, 'frontend')));
app.use('/includes', express.static(path.join(__dirname, 'includes')));

// -------------------------------
// Debug middleware for API routes
// -------------------------------
app.use('/api/*', (req, res, next) => {
    console.log(`📨 API Request: ${req.method} ${req.originalUrl}`);
    next();
});

// ===============================
// API Routes
// ===============================
app.use('/api/students', studentRoutes);
app.use('/api/alumni', alumniRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/offers', offerRoutes);
app.use('/api/applications', applicationRoutes);
app.use('/api/sessions', sessionsRoutes);

// ===============================
// Health check
// ===============================
app.get('/api/health', (req, res) => {
    res.json({ 
        success: true, 
        message: 'BUP Alumni System API is running',
        timestamp: new Date().toISOString(),
        mode: process.env.NODE_ENV || 'development'
    });
});

// ===============================
// Test database connection
// ===============================
app.get('/api/test-db', async (req, res) => {
    try {
        const db = require('./config/database');
        const [result] = await db.execute('SELECT 1 as test');
        res.json({
            success: true,
            message: 'Database connection successful',
            data: result
        });
    } catch (error) {
        console.error('Database connection error:', error);
        res.status(500).json({
            success: false,
            message: 'Database connection failed',
            error: error.message
        });
    }
});

// ===============================
// Test alumni table access
// ===============================
app.get('/api/test-alumni', async (req, res) => {
    try {
        const db = require('./config/database');
        const [alumni] = await db.execute('SELECT COUNT(*) as count FROM alumni');
        res.json({
            success: true,
            message: 'Alumni table accessible',
            count: alumni[0].count
        });
    } catch (error) {
        console.error('Alumni table error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to access alumni table',
            error: error.message
        });
    }
});

// ===============================
// Serve frontend pages
// ===============================
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'frontend', 'index.html'));
});

app.get('/alumni-directory', (req, res) => {
    res.sendFile(path.join(__dirname, 'frontend', 'alumni_details.html'));
});

// Minimal fix: allow other frontend pages including create_offer.html
app.get('/frontend/:page', (req, res, next) => {
    const page = req.params.page;
    const allowedPages = [
        'index.html', 'signup_select.html', 'student_signup.html', 
        'alumni_signup.html', 'login_select.html', 'student_login.html', 
        'alumni_login.html', 'alumni_details.html', 'create_offer.html'
    ];

    if (allowedPages.includes(page)) {
        res.sendFile(path.join(__dirname, 'frontend', page));
    } else {
        next(); // fallback to 404 handler
    }
});

// ===============================
// Error handling middleware
// ===============================
app.use((err, req, res, next) => {
    console.error('Server Error:', err.stack);
    res.status(500).json({
        success: false,
        message: 'Something went wrong!',
        error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});

// ===============================
// 404 handler for API routes
// ===============================
app.use('/api/*', (req, res) => {
    res.status(404).json({
        success: false,
        message: 'API route not found'
    });
});

// ===============================
// 404 handler for frontend pages (catch-all)
// ===============================
app.use('*', (req, res) => {
    res.status(404).sendFile(path.join(__dirname, 'frontend', 'index.html'));
});

// ===============================
// Start server
// ===============================
app.listen(PORT, () => {
    console.log(`🚀 BUP Alumni System Server is running on port ${PORT}`);
    console.log(`📝 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`🔗 Health check: http://localhost:${PORT}/api/health`);
    console.log(`🗄️  Database test: http://localhost:${PORT}/api/test-db`);
    console.log(`🎓 Student API: http://localhost:${PORT}/api/students`);
    console.log(`👨‍🎓 Alumni API: http://localhost:${PORT}/api/alumni`);
    console.log(`🏠 Frontend: http://localhost:${PORT}/`);
    console.log(`📊 Alumni Directory: http://localhost:${PORT}/alumni-directory`);
});