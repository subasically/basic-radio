<template>
  <div>
    <div v-if="nowPlaying.song">
      <img
        v-if="nowPlaying.song.art"
        :src="nowPlaying.song.art"
        alt="Album Art"
      />
      <h2 class="text-lg font-bold">{{ nowPlaying.song.title }}</h2>
      <h3>{{ nowPlaying.song.artist }}</h3>
      <h4 v-if="nowPlaying.song.album">{{ nowPlaying.song.album }}</h4>
      <div class="flex flex-row items-center my-2">
        <div class="mr-1">{{ formatTime(elapsedTime) }}</div>
        <div
          class="flex-1 flex-shrink-0 basis-auto bg-gray-200 rounded-full h-2.5 dark:bg-gray-700"
        >
          <div
            class="bg-blue-600 h-2.5 rounded-full"
            :style="{ width: songProgressWidth + '%' }"
          ></div>
        </div>
        <div class="ml-1">{{ formatTime(songDuration) }}</div>
      </div>
      <!-- <p>Elapsed Time: {{ formatTime(elapsedTime) }}</p> -->
      <!-- <p>Remaining Time: {{ formatTime(remainingTime) }}</p> -->
      <!-- <p>Total Time: {{ formatTime(songDuration) }}</p> -->

      <div class="flex space-x-4">
        <UButton v-if="!isPlaying" @click="play">PLAY</UButton>
        <UButton v-else @click="stop">STOP</UButton>
      </div>

      <audio
        ref="audio"
        :src="stationUrl"
        :title="nowPlaying.song.artist + ' - ' + nowPlaying.song.title"
      ></audio>
    </div>
    <div v-else class="py-4">
      <p>No song is currently playing.</p>
    </div>
  </div>
</template>

<script setup>
// Props passed from App.vue
const props = defineProps({
  stationUrl: {
    type: String,
    required: true,
  },
  nowPlaying: {
    type: Object,
    required: true,
  },
});

// Audio element reference
const audio = ref(null);
const isPlaying = ref(false);
const songDuration = ref(0);
const elapsedTime = ref(0);
const remainingTime = ref(0);
const songProgressWidth = ref(0); // This holds the percentage width for the progress bar

// Helper function to format time in minutes:seconds
const formatTime = (seconds) => {
  const minutes = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${minutes}:${secs < 10 ? "0" : ""}${secs}`;
};

// Play audio method
const play = () => {
  if (audio.value) {
    audio.value.play();
    isPlaying.value = true;
    startTimer(); // Start the timer when playing
  }
};

// Stop audio method
const stop = () => {
  if (audio.value) {
    audio.value.pause(); // Use pause instead of stop
    isPlaying.value = false;
    clearInterval(timer); // Clear the timer
  }
};

// Timer to update elapsed time and progress bar
let timer = null;
const startTimer = () => {
  if (!timer) {
    timer = setInterval(() => {
      if (audio.value && isPlaying.value) {
        elapsedTime.value = Math.min(
          elapsedTime.value + 1,
          props.nowPlaying.duration
        );
        remainingTime.value = Math.max(
          props.nowPlaying.duration - elapsedTime.value,
          0
        );
        songProgressWidth.value =
          (elapsedTime.value / props.nowPlaying.duration) * 100;
      }
    }, 1000); // Update every second
  }
};

// Update progress based on props
const updateProgress = () => {
  if (props.nowPlaying.duration) {
    // Update only if duration is defined
    elapsedTime.value = props.nowPlaying.elapsed;
    remainingTime.value = props.nowPlaying.remaining;
    songDuration.value = props.nowPlaying.duration;
    songProgressWidth.value =
      (elapsedTime.value / props.nowPlaying.duration) * 100;
  }
};

// Watch for updates in the nowPlaying object
watch(
  () => props.nowPlaying,
  () => {
    updateProgress(); // Call the update function whenever nowPlaying changes
  },
  { deep: true } // Watch deeply for nested properties
);

// Reset progress bar and reinitialize audio when component is mounted
onMounted(() => {
  if (audio.value) {
    audio.value.addEventListener("ended", () => {
      isPlaying.value = false;
      elapsedTime.value = 0; // Reset elapsed time when song ends
      remainingTime.value = props.nowPlaying.duration; // Reset remaining time
      songProgressWidth.value = 100; // Reset progress bar
      clearInterval(timer); // Clear the timer
    });
  }
});
</script>

<style scoped>
audio {
  display: none;
}
</style>
