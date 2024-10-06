<template>
  <div>
    <h2>Now Playing</h2>
    <div v-if="nowPlaying.song">
      <img v-if="nowPlaying.song.art" :src="nowPlaying.song.art" alt="Album Art" width="100" height="100" />
      <p><strong>Title:</strong> {{ nowPlaying.song.title }}</p>
      <p><strong>Artist:</strong> {{ nowPlaying.song.artist }}</p>
      <p><strong>Album:</strong> {{ nowPlaying.song.album }}</p>
    </div>
    <div v-else class="py-4">
      <p>No song is currently playing.</p>
    </div>
    <div class="flex space-x-4">
      <UButton @click="play">PLAY</UButton>
      <UButton @click="stop">STOP</UButton>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { Howl } from 'howler';

const props = defineProps<{
  stationUrl: string,
  stationName: string,
  nowPlaying: any
}>()

onMounted(() => {
  console.log(props.nowPlaying);
})

const sound = new Howl({
  src: [props.stationUrl],
  html5: true,
  // autoplay: true,
  // loop: true,
  volume: 0.5,
  onend: function () {
    console.log('Finished!');
  }
});

const play = () => {
  sound.stop();
  sound.play();
}

const stop = () => {
  sound.stop();
}

</script>

<style></style>