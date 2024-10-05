<template>
  <div>
    <h2>Now Playing</h2>
    <div v-if="nowPlaying.title">
      <p><strong>Title:</strong> {{ nowPlaying.title }}</p>
      <p><strong>Artist:</strong> {{ nowPlaying.artist }}</p>
      <p><strong>Album:</strong> {{ nowPlaying.album }}</p>
      <img v-if="nowPlaying.image" :src="nowPlaying.image" alt="Album Art" />
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
import { useNowPlaying } from '@/composables/nowPlaying';


const props = defineProps<{
  stationUrl: string,
  stationName: string
}>()

const { nowPlaying } = useNowPlaying(props.stationName);

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