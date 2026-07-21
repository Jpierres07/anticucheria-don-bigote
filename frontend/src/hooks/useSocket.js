import { useEffect, useRef } from 'react';
import { io } from 'socket.io-client';

export const useSocket = (roomName, onEventReceived) => {
  const socketRef = useRef(null);
  const callbackRef = useRef(onEventReceived);

  // Mantener la referencia del callback actualizada sin forzar reconexión del socket
  useEffect(() => {
    callbackRef.current = onEventReceived;
  }, [onEventReceived]);

  useEffect(() => {
    // Conectar al servidor Socket.io
    socketRef.current = io('/', {
      transports: ['websocket', 'polling']
    });

    const socket = socketRef.current;

    socket.on('connect', () => {
      console.log('⚡ Conectado a WebSockets KDS:', socket.id);
      if (roomName) {
        socket.emit(`join_${roomName}`);
      }
    });

    socket.on('nuevo_pedido_cocina', (data) => callbackRef.current && callbackRef.current('nuevo_pedido', data));
    socket.on('cambio_estado_parrilla', (data) => callbackRef.current && callbackRef.current('cambio_estado', data));
    socket.on('comanda_lista_mozo', (data) => callbackRef.current && callbackRef.current('comanda_lista_mozo', data));
    socket.on('mesa_liberada', (data) => callbackRef.current && callbackRef.current('mesa_liberada', data));

    return () => {
      socket.disconnect();
    };
  }, [roomName]);

  return socketRef.current;
};
