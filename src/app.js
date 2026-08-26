const express = require('express');
const env = require('./config/env');
const requestIdMiddleware = require('./middleware/requestId');
const errorHandler = require('./middleware/errorHandler');
const apiLimiter = require('./middleware/rateLimiter');

// Import all routes
const qrRoutes = require('./routes/qr.routes');
const inspireRoutes = require('./routes/inspire.routes');
const redirectRoutes = require('./routes/redirect.routes');
const dashboardRoutes = require('./routes/dashboard.routes'); // <-- New Dashboard Route

const app = express();

app.set('trust proxy', env.TRUST_PROXY_HOPS);
app.use(requestIdMiddleware);

// Apply routes
app.use('/generate', apiLimiter, qrRoutes);
app.use('/inspire', apiLimiter, inspireRoutes);
app.use('/r', apiLimiter, redirectRoutes);
app.use('/dashboard', dashboardRoutes); // <-- Mount the dashboard at /dashboard

app.use(errorHandler);

module.exports = app;