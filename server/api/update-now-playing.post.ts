export default defineEventHandler(async (event) => {
  const body = await readBody(event);

  // Assume body contains the updated now playing data
  const nowPlayingData = {
    title: body.title,
    artist: body.artist,
    album: body.album,
    image: body.image,
  };

  // Emit the now playing update to all clients
  event.context?.appSocket.emit('now-playing-update', nowPlayingData);

  return nowPlayingData;
});
