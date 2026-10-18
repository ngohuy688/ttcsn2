const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const { port, initializeDatabase } = require('./config/db');
const { authenticateToken } = require('./utils/auth');
const authRoutes = require('./routes/authRoutes');
const campaignRoutes = require('./routes/campaignRoutes');
const donationRoutes = require('./routes/donationRoutes');
const disbursementRoutes = require('./routes/disbursementRoutes');
const { getDonationsByCampaign, getUserDonations } = require('./controllers/donationController');
const { getDisbursementsByCampaign } = require('./controllers/disbursementController');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
  },
});

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(204);
  }
  next();
});

app.set('io', io);
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

app.get('/', (req, res) => {
  res.status(200).json({
    name: 'HaUI Crowdfunding API',
    version: '1.0.0',
    description: 'Backend for HaUI crowdfunding and community support system.',
  });
});

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'Server is running.' });
});

app.use('/api/auth', authRoutes);
app.use('/api/campaigns', campaignRoutes);
app.use('/api/donations', donationRoutes);
app.use('/api/disbursements', disbursementRoutes);

app.get('/api/campaigns/:campaign_id/donations', getDonationsByCampaign);
app.get('/api/campaigns/:campaign_id/disbursements', getDisbursementsByCampaign);
app.get('/api/users/me/donations', authenticateToken, getUserDonations);

io.on('connection', (socket) => {
  socket.on('join_campaign', (campaignId) => {
    if (campaignId) {
      socket.join(`campaign_${campaignId}`);
    }
  });
});

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ message: 'Lỗi máy chủ không xác định.', error: err.message });
});

initializeDatabase().then(() => {
  server.listen(port, '0.0.0.0', () => {
    console.log(`Server is running on http://0.0.0.0:${port}`);
  });
}).catch((error) => {
  console.error('Failed to initialize database:', error.message);
  process.exit(1);
});
