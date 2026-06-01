const express    = require('express');
const cors       = require('cors');
const dotenv     = require('dotenv');
const path       = require('path');
const http       = require('http');
const { Server } = require('socket.io');
const connectDB  = require('./config/db');

dotenv.config();

// ─── Safety checks before anything else ──────────────────────────────────────
if (!process.env.JWT_SECRET) {
  console.error('FATAL: JWT_SECRET is not set in environment variables. Exiting.');
  process.exit(1);
}
if (!process.env.MONGODB_URI && !process.env.MONGO_URI) {
  console.error('FATAL: MONGODB_URI is not set. Exiting.');
  process.exit(1);
}

connectDB();

const app    = express();
const server = http.createServer(app);

const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:4173',
  'https://mediassist-pro-lemon.vercel.app',
  process.env.CLIENT_URL,
].filter(Boolean);

const corsOptions = {
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    if (origin.endsWith('.vercel.app') || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error(`CORS blocked: ${origin}`));
    }
  },
  credentials: true,
};

const io = new Server(server, {
  cors: { origin: allowedOrigins, methods: ['GET','POST'], credentials: true },
});
require('./socket/chatHandler')(io);

app.use(cors(corsOptions));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ─── Routes ───────────────────────────────────────────────────────────────────
app.use('/api/auth',          require('./routes/auth'));
app.use('/api/patients',      require('./routes/patients'));
app.use('/api/symptoms',      require('./routes/symptoms'));
app.use('/api/prescriptions', require('./routes/prescriptions'));
app.use('/api/vitals',        require('./routes/vitals'));
app.use('/api/ai',            require('./routes/ai'));
app.use('/api/hospitals',     require('./routes/hospitals'));
app.use('/api/appointments',  require('./routes/appointments'));
app.use('/api/messages',      require('./routes/messages'));
app.use('/api/organisations',  require('./routes/organisations'));
app.use('/api/billing',        require('./routes/billing'));
app.use('/api/doctors',        require('./routes/doctors'));

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'MediAssist API running', timestamp: new Date() });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({ success: false, message: err.message || 'Server error' });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`\n🏥 MediAssist Server running on port ${PORT}`);
  console.log(`📡 API:    http://localhost:${PORT}/api`);
  console.log(`🔌 Socket: ws://localhost:${PORT}`);
  console.log(`🌍 Mode:   ${process.env.NODE_ENV || 'development'}\n`);
});