const initParrillaSocket = (io) => {
  io.on('connection', (socket) => {
    console.log(`🔌 Nuevo cliente WebSocket conectado a Parrilla KDS (ID: ${socket.id})`);

    socket.on('join_cocina', () => {
      socket.join('cocina_room');
      console.log(`👨‍🍳 Cliente unido a cocina_room`);
    });

    socket.on('join_salon', () => {
      socket.join('salon_room');
      console.log(`📱 Cliente unido a salon_room`);
    });

    socket.on('disconnect', () => {
      console.log(`❌ Cliente desconectado (${socket.id})`);
    });
  });
};

module.exports = initParrillaSocket;
