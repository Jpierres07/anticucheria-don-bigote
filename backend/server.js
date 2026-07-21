const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
require('dotenv').config();

const authRoutes = require('./routes/authRoutes');
const clienteRoutes = require('./routes/clienteRoutes');
const salonRoutes = require('./routes/salonRoutes');
const cocinaRoutes = require('./routes/cocinaRoutes');
const adminRoutes = require('./routes/adminRoutes');
const initParrillaSocket = require('./sockets/parrillaSocket');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE']
  }
});

// Middlewares
app.use(cors());
app.use(express.json());

// Inyectar io en req para enviarlo desde los controladores si es necesario
app.use((req, res, next) => {
  req.io = io;
  next();
});

// Inicializar WebSockets
initParrillaSocket(io);

// Rutas de la API RESTful
app.use('/api/auth', authRoutes);
app.use('/api/cliente', clienteRoutes);
app.use('/api/salon', salonRoutes);
app.use('/api/cocina', cocinaRoutes);
app.use('/api/admin', adminRoutes);

app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    empresa: 'Anticuchería Don Bigote',
    timestamp: new Date().toISOString()
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`=======================================================`);
  console.log(`🔥 Servidor API RESTful - Anticuchería Don Bigote`);
  console.log(`📡 Puerto: http://localhost:${PORT}`);
  console.log(`⚡ Entorno: ${process.env.NODE_ENV || 'development'}`);
  console.log(`=======================================================`);
});
