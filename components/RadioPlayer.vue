<template>
  <div>
    <h2>Now Playing</h2>
    <div v-if="data">
      <img
        v-if="data.now_playing.song.art"
        :src="data.now_playing.song.art"
        alt="Album Art"
        width="100"
        height="100"
      />
      <p><strong>Title:</strong> {{ data.now_playing.song.title }}</p>
      <p><strong>Artist:</strong> {{ data.now_playing.song.artist }}</p>
      <div class="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700 mb-6 mt-2">
        <div class="bg-blue-600 h-2.5 rounded-full" :style="{ width: songProgressRemaining + '%' }"></div>
      </div>
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
import { Howl } from "howler";

// Define props
const props = defineProps<{
  stationUrl: string;
  stationName: string;
}>();

// Create a reactive reference for the nowPlaying data
const data = ref<any>();

// Initialize Server-Sent Events
let sse: EventSource | null = null;

const initializeSse = (stationName: string) => {
  const sseBaseUri =
    "https://basic-radio.subasically.me/api/live/nowplaying/sse";
  const sseUriParams = new URLSearchParams({
    cf_connect: JSON.stringify({
      subs: {
        [`station:${stationName}`]: {},
      },
    }),
  });
  const sseUri = `${sseBaseUri}?${sseUriParams.toString()}`;

  sse = new EventSource(sseUri);

  sse.onmessage = (e) => {
    const jsonData = JSON.parse(e.data);
    if ("pub" in jsonData) {
      data.value = jsonData.pub.data.np;
    }
  };

  sse.onerror = (error) => {
    console.error("SSE error:", error);
  };
};

// Clean up the SSE connection when the component is unmounted
onBeforeUnmount(() => {
  if (sse) {
    sse.close();
  }
});

// Initialize the SSE connection for the selected station
onMounted(() => {
  initializeSse(props.stationName); // Start listening for updates
});

// Howler sound configuration
const sound = new Howl({
  src: [props.stationUrl],
  html5: true,
  volume: 1,
  // onend: function () {
  //   console.log("Finished!");
  // },
});

// Methods to play and stop the sound
const play = () => {
  // sound.stop();
  sound.play();
};

const stop = () => {
  sound.stop();
};

const songProgressRemaining = computed(() => {
  if (data.value) {
    return ((data.value.now_playing.duration - data.value.now_playing.remaining) / data.value.now_playing.duration) * 100;
  }
  return 0;
});
</script>

<style></style>
