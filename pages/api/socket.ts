// pages/api/socket.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { Server as HTTPServer } from 'http';
import { Server as IOServer } from 'socket.io';
import type { Socket } from 'net';

type NextApiResponseWithSocket = NextApiResponse & {
  socket: Socket & {
    server: HTTPServer & {
      io?: IOServer;
    };
  };
};

const SocketHandler = (req: NextApiRequest, res: NextApiResponseWithSocket) => {
  if (!res.socket.server.io) {
    console.log('🔌 Inicializando servidor Socket.IO...');

    const io = new IOServer(res.socket.server, {
      path: '/api/socket',
      addTrailingSlash: false,
    });

    res.socket.server.io = io;

    io.on('connection', socket => {
      console.log('🟢 Cliente conectado:', socket.id);
    });
  } else {
    console.log('⚙️ Servidor Socket.IO já inicializado.');
  }

  res.end();
};

export default SocketHandler;
