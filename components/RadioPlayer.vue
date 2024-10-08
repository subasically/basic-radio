<template>
  <div class="radio-player max-w-sm mx-auto">
    <div class="flex flex-col text-center" v-if="nowPlaying?.song">
      <div class="flex justify-center">
        <img v-if="nowPlaying.song.art" :src="isDev ? 'https://placehold.co/1000' : nowPlaying.song.art" alt="Album Art"
          class="max-h-[300px] max-w-[300px] object-cover rounded-lg mb-3" />
      </div>
      <div class="flex flex-row items-center my-2">
        <div class="mr-1">{{ formatTime(elapsedTime) }}</div>
        <UProgress size="md" :indicator="false" :value="songProgressWidth" />
        <div class="ml-1">{{ formatTime(songDuration) }}</div>
      </div>
      <h2 class="text-lg font-bold">{{ nowPlaying.song.title }}</h2>
      <h3>{{ nowPlaying.song.artist }}</h3>
      <h4 v-if="nowPlaying.song.album">{{ nowPlaying.song.album }}</h4>
    </div>
    <div v-else class="py-4 text-center">
      <p>Loading...</p>
    </div>

    <div v-if="songHistory.length > 0" class="flex flex-col text-center">
      <h3 class="text-lg font-bold">Recently Played</h3>
      <ul class="text-sm">
        <li v-for="song in songHistory" :key="song.sh_id">
          {{ song.song.title }} - {{ song.song.artist }}
        </li>
      </ul>
    </div>

    <div class="flex justify-center mt-4">
      <UButton v-if="!isPlaying" :ui="{ rounded: 'rounded-full' }" size="xl" icon="i-heroicons-play-circle-solid"
        @click="play">
        Play
      </UButton>
      <UButton v-else :ui="{ rounded: 'rounded-full' }" size="xl" icon="i-heroicons-stop-circle-solid" @click="stop">
        Stop
      </UButton>
    </div>

    <audio ref="audio" :src="stationUrl" @play="isPlaying = true" @pause="isPlaying = false"></audio>
  </div>
</template>

<script setup lang="ts">
interface Song {
  id: string;
  art: string;
  text: string;
  artist: string;
  title: string;
  album: string;
}

interface NowPlaying {
  sh_id: number;
  played_at: number;
  duration: number;
  elapsed?: number;
  song: Song;
}

// Make sure to import necessary Vue utilities
import { ref, computed, watch, onMounted } from 'vue';

// Update your script setup
const isDev = process.env.NODE_ENV === "development";

const props = defineProps<{
  stationUrl: string;
  nowPlaying: NowPlaying | null;
  songHistory: Array<Record<string, any>>;
}>();

const audio = ref<HTMLAudioElement | null>(null);
const isPlaying = ref(false);
const elapsedTime = ref(0);
const songProgressWidth = ref(0);
const songDuration = computed(() => props.nowPlaying?.duration || 0);

const calculateElapsedTime = () => {
  const currentTime = Math.floor(Date.now() / 1000);
  return currentTime - (props.nowPlaying?.played_at || currentTime);
};

const updateMediaSession = () => {
  if (typeof navigator !== 'undefined' && 'mediaSession' in navigator && props.nowPlaying?.song) {
    const { title, artist, album, art } = props.nowPlaying.song;
    navigator.mediaSession.metadata = new MediaMetadata({
      title,
      artist,
      album: album || "", // Handling case where album might be undefined
      artwork: [{
        src: art || "", // Ensure artwork URL is provided
        sizes: '512x512',
        type: 'image/jpeg',
      }],
    });
  }
};

const formatTime = (seconds: number) => {
  const minutes = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${minutes}:${secs < 10 ? '0' : ''}${secs}`;
};

const play = () => {
  if (audio.value) {
    audio.value.play();
    isPlaying.value = true;
  }
};

const stop = () => {
  if (audio.value) {
    audio.value.pause();
    isPlaying.value = false;
  }
};

const updateProgress = () => {
  elapsedTime.value = calculateElapsedTime();
  songProgressWidth.value =
    songDuration.value > 0 ? (elapsedTime.value / songDuration.value) * 100 : 0;
};

watch(
  () => props.nowPlaying,
  () => {
    updateProgress();
    updateMediaSession();
  },
  { immediate: true, deep: true }
);

onMounted(async () => {
  if (audio.value) {
    audio.value.addEventListener("ended", () => {
      isPlaying.value = false;
      elapsedTime.value = 0;
      songProgressWidth.value = 0;
    });
  }
  setInterval(() => {
    if (isPlaying.value) {
      elapsedTime.value = Math.min(elapsedTime.value + 1, songDuration.value);
      songProgressWidth.value =
        songDuration.value > 0 ? (elapsedTime.value / songDuration.value) * 100 : 0;
    }
  }, 1000);


});
</script>