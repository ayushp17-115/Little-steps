require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const { connectDB } = require('./src/config/db');

const authRoutes = require('./src/routes/authRoutes');
const centerRoutes = require('./src/routes/centerRoutes');
const caregiverRoutes = require('./src/routes/caregiverRoutes');
const bookingRoutes = require('./src/routes/bookingRoutes');
const subscriptionRoutes = require('./src/routes/subscriptionRoutes');
const adminRoutes = require('./src/routes/adminRoutes');

const app = express();
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

app.get('/api/health', (req, res) => res.json({ ok: true, service: 'little-steps-api' }));

app.use('/api/auth', authRoutes);
app.use('/api/centers', centerRoutes);
app.use('/api/caregivers', caregiverRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/subscriptions', subscriptionRoutes);
app.use('/api/admin', adminRoutes);

app.use((req, res) => res.status(404).json({ error: 'Not found' }));
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'Internal server error' });
});

const PORT = process.env.PORT || 5000;

async function start() {
  await connectDB(process.env.MONGODB_URI);
  app.listen(PORT, () => console.log(`[server] Little Steps API running on port ${PORT}`));
}

if (require.main === module) {
  start().catch((err) => {
    console.error('Failed to start server:', err);
    process.exit(1);
  });
}

module.exports = { app, start };
