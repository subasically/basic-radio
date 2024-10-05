import { Socket, Server } from 'socket.io';

let appSocket = {
  emit: (channel: string, message: string) => {
    console.log('Not initiated yet', channel, message);
  }
};

export default defineEventHandler((event) => {
  event.context.appSocket = appSocket;

  if (global.io) return;
  console.log('Initiating socket.middleware');

  const node = event.node;
  global.io = new Server(node.res.socket?.server);

  global.io.on('connection', (socket: Socket) => {
    socket.emit('message-channel', `welcome ${socket.id}`);

    appSocket.emit = (channel, message) => {
      global.io.emit(channel, message);
    };

    socket.on('subscribe', ({ station }) => {
      console.log(`Socket subscribed to now playing updates for ${station}`);
    });

    socket.on('disconnect', () => {
      console.log(`Socket disconnected: ${socket.id}`);
    });
  });
});
