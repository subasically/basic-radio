import { ref, onMounted, onUnmounted } from 'vue';
import { io, Socket } from 'socket.io-client';

interface NowPlaying {
  title: string;
  artist: string;
  album: string;
  image: string;
}

export const useNowPlaying = (stationName: string) => {
  const nowPlaying = ref<NowPlaying>({
    title: "",
    artist: "",
    album: "",
    image: "",
  });

  let socket: Socket | undefined;

  const handleNowPlayingUpdate = (data: NowPlaying) => {
    nowPlaying.value = data;
  };

  onMounted(() => {
    // Use the specified WebSocket URL
    socket = io('wss://basic-radio.subasically.me/api/live/nowplaying/websocket');

    socket.on('connect', () => {
      console.log('Connected to WebSocket');
      // Emit a request to subscribe to updates for the specific station
      socket.emit('subscribe', { station: stationName });
    });

    socket.on('now-playing-update', (data: NowPlaying) => {
      handleNowPlayingUpdate(data);
    });

    socket.on('connect_error', (err) => {
      console.error('Connection error:', err);
    });

    socket.on('disconnect', () => {
      console.log('WebSocket disconnected');
    });
  });


  onUnmounted(() => {
    socket?.disconnect();
  });

  return { nowPlaying };
};
