<template>
  <div class="radio-player max-w-md mx-auto">
    <div v-if="nowPlaying.song">
      <img
        v-if="nowPlaying.song.art"
        :src="isDev ? 'https://placehold.co/1000' : nowPlaying.song.art"
        alt="Album Art"
        class="object-cover rounded-lg mb-3"
      />
      <div class="flex flex-row items-center my-2">
        <div class="mr-1">{{ formatTime(elapsedTime) }}</div>
        <div
          class="flex-1 flex-shrink-0 basis-auto bg-gray-200 rounded-full h-2.5 dark:bg-gray-700 overflow-hidden"
        >
          <div
            class="bg-blue-600 h-2.5 rounded-full transition-all duration-300 ease-in-out"
            :style="{ width: songProgressWidth + '%' }"
          ></div>
        </div>
        <div class="ml-1">{{ formatTime(songDuration) }}</div>
      </div>
      <h2 class="text-lg font-bold">{{ nowPlaying.song.title }}</h2>
      <h3>{{ nowPlaying.song.artist }}</h3>
      <h4 v-if="nowPlaying.song.album">{{ nowPlaying.song.album }}</h4>

      <div class="flex justify-center mt-4">
        <UButton
          v-if="!isPlaying"
          :ui="{ rounded: 'rounded-full' }"
          size="xl"
          icon="i-heroicons-play"
          @click="play"
          >PLAY</UButton
        >
        <UButton
          v-else
          :ui="{ rounded: 'rounded-full' }"
          size="xl"
          icon="i-heroicons-stop"
          @click="stop"
          >STOP</UButton
        >
      </div>

      <audio
        ref="audio"
        :src="stationUrl"
        :title="nowPlaying.song.artist + ' - ' + nowPlaying.song.title"
        @play="isPlaying = true"
        @pause="isPlaying = false"
      ></audio>
    </div>
    <div v-else class="py-4 text-center">
      <p>Loading...</p>
    </div>
  </div>
</template>

<script setup>
const isDev = process.env.NODE_ENV === "development";
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
const songProgressWidth = ref(0); // Holds the percentage width for the progress bar

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
  }
};

// Stop audio method
const stop = () => {
  if (audio.value) {
    audio.value.pause(); // Use pause instead of stop
    isPlaying.value = false;
  }
};

// Update progress based on props
const updateProgress = () => {
  // Update elapsed time and duration based on nowPlaying
  elapsedTime.value = props.nowPlaying.elapsed || 0; // Update elapsed time
  songDuration.value = props.nowPlaying.duration || 0; // Set the duration

  // Update progress width
  songProgressWidth.value =
    songDuration.value > 0 ? (elapsedTime.value / songDuration.value) * 100 : 0; // Avoid division by zero
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
      songProgressWidth.value = 0; // Reset progress bar
    });
  }
  setInterval(() => {
    if (isPlaying.value) {
      elapsedTime.value = Math.min(elapsedTime.value + 1, songDuration.value);
      songProgressWidth.value =
        songDuration.value > 0
          ? (elapsedTime.value / songDuration.value) * 100
          : 0; // Avoid division by zero
    }
  }, 1000); // Update every second
});
</script>

<style scoped>
audio {
  display: none;
}
</style>
