<template>
  <div class="radio-player max-w-sm mx-auto">
    <div
      class="flex flex-col text-center"
      v-if="
        nowPlaying?.song &&
        nowPlaying?.song?.title !== 'We\'ll be back later...'
      "
    >
      <div class="flex justify-center">
        <img
          v-if="nowPlaying.song.art"
          :src="isDev ? 'https://placehold.co/1000' : nowPlaying.song.art"
          alt="Album Art"
          class="max-h-[300px] max-w-[300px] object-cover rounded-lg mb-3"
        />
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
      <p>We'll be back later...</p>
    </div>

    <div
      v-if="nowPlaying?.song?.title !== 'We\'ll be back later...'"
      class="flex justify-center my-4"
    >
      <UButton
        v-if="!isPlaying"
        :ui="{ rounded: 'rounded-full' }"
        size="xl"
        icon="i-heroicons-play-circle-solid"
        @click="play"
      >
        Play
      </UButton>
      <UButton
        v-else
        :ui="{ rounded: 'rounded-full' }"
        size="xl"
        icon="i-heroicons-stop-circle-solid"
        @click="stop"
      >
        Stop
      </UButton>
    </div>

    <UAccordion :items="radioQueueAccordion">
      <template #song-history>
        <div class="text-gray-900 dark:text-white text-center">
          <ul v-if="songHistory" class="text-sm">
            <li v-for="item in songHistory" :key="item.song.id">
              <div>{{ formatDate(item.played_at) }}</div>
              <strong>{{ item.song.artist }}</strong> - {{ item.song.title }}
            </li>
          </ul>
        </div>
      </template>

      <template #playing-next>
        <div class="text-gray-900 dark:text-white text-center">
          <ul v-if="playingNext" class="text-sm">
            <li>
              <div>{{ formatDate(playingNext.cued_at) }}</div>
              {{ playingNext.song.artist }} - {{ playingNext.song.title }}
            </li>
          </ul>
        </div>
      </template>
    </UAccordion>

    <audio
      ref="audio"
      :src="stationUrl"
      @play="isPlaying = true"
      @pause="isPlaying = false"
    ></audio>
  </div>
</template>

<script setup lang="ts">
import type { NowPlaying, PlayingNext, SongHistory } from "~/types";

const config = useRuntimeConfig();
const isDev = config.public.IS_DEV;

const props = defineProps<{
  stationUrl: string;
  nowPlaying: NowPlaying | null;
  playingNext: PlayingNext | null;
  songHistory: SongHistory[] | null;
}>();

const audio = ref<HTMLAudioElement | null>(null);
const isPlaying = ref(false);
const elapsedTime = ref(0);
const songProgressWidth = ref(0);
const songDuration = computed(() => props.nowPlaying?.duration || 0);
const radioQueueAccordion = [
  {
    label: "Song History",
    icon: "i-heroicons-information-circle",
    defaultOpen: false,
    slot: "song-history",
  },
  {
    label: "Next Song",
    icon: "i-heroicons-information-circle",
    defaultOpen: false,
    slot: "playing-next",
  },
];

const calculateElapsedTime = () => {
  const currentTime = Math.floor(Date.now() / 1000);
  return currentTime - (props.nowPlaying?.played_at || currentTime);
};

const updateMediaSession = () => {
  if (
    typeof navigator !== "undefined" &&
    "mediaSession" in navigator &&
    props.nowPlaying?.song
  ) {
    const { title, artist, album, art } = props.nowPlaying.song;
    navigator.mediaSession.metadata = new MediaMetadata({
      title,
      artist,
      album: album || "", // Handling case where album might be undefined
      artwork: [
        {
          src: art || "", // Ensure artwork URL is provided
          sizes: "512x512",
          type: "image/jpeg",
        },
      ],
    });
  }
};

const formatTime = (seconds: number) => {
  const minutes = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${minutes}:${secs < 10 ? "0" : ""}${secs}`;
};

const formatDate = (dateString: number) => {
  const date = new Date(dateString * 1000);
  return date.toLocaleTimeString();
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
        songDuration.value > 0
          ? (elapsedTime.value / songDuration.value) * 100
          : 0;
    }
  }, 1000);
});
</script>