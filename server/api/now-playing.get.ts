import { defineEventHandler } from 'h3';
import { useFetch } from 'nuxt/app';

export default defineEventHandler(async (event) => {
  const query = getQuery(event);
  const stationName = query.stationName;

  if (!stationName) {
    throw new Error('Station name is required');
  }

  const response = await useFetch(`http://basic-radio.subasically.me/api/nowplaying`);
  const nowPlaying = response.data;

  console.log('Now playing:', nowPlaying);

  // const nowPlayingData = {
  //   title: nowPlaying.song.title,
  //   artist: nowPlaying.song.artist,
  //   album: nowPlaying.song.album,
  //   image: nowPlaying.song.art,
  // };

  // Emit the now playing update to all clients
  // event.context?.appSocket.emit('now-playing-update', nowPlaying);

  return nowPlaying;
});