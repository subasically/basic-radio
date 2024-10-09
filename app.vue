<template>
  <UContainer class="flex flex-col items-center">
    <div class="text-center pt-6 pb-4">
      Dobro došli na <br /><span class="font-bold text-3xl">Osnovni(Basic)</span
      ><br />
      Radio
    </div>
    <UTabs v-model="activeTab" :items="stations" class="max-w-md">
      <template #narodna_muzika="{ item, index }">
        <UCard>
          <RadioPlayer
            v-if="item.stationUrl"
            :stationUrl="item.stationUrl"
            :nowPlaying="nowPlaying[item.slot]"
            :playingNext="playingNext[item.slot]"
            :songHistory="songHistory[item.slot]"
            :listeners="activeListeners[item.slot]"
            :isActive="activeTab === index"
          />
          <p v-else>Currently offline.</p>
        </UCard>
      </template>

      <template #mix_muzika="{ item, index }">
        <UCard>
          <RadioPlayer
            v-if="item.stationUrl"
            :stationUrl="item.stationUrl"
            :nowPlaying="nowPlaying[item.slot]"
            :playingNext="playingNext[item.slot]"
            :songHistory="songHistory[item.slot]"
            :listeners="activeListeners[item.slot]"
            :isActive="activeTab === index"
          />
          <p v-else>Currently offline.</p>
        </UCard>
      </template>

      <template #trending_muzika="{ item, index }">
        <UCard>
          <RadioPlayer
            v-if="item.stationUrl"
            :stationUrl="item.stationUrl"
            :nowPlaying="nowPlaying[item.slot]"
            :playingNext="playingNext[item.slot]"
            :songHistory="songHistory[item.slot]"
            :listeners="activeListeners[item.slot]"
            :isActive="activeTab === index"
          />
          <p v-else>Currently offline.</p>
        </UCard>
      </template>
    </UTabs>
  </UContainer>
</template>

<script setup lang="ts">
import { useRadioState } from "~/composables/useRadioState";
import type { StationNowPlaying } from "./types";

const {
  stations,
  nowPlaying,
  playingNext,
  songHistory,
  activeListeners,
  sse,
  reconnectTimeouts,
  initializeSse,
} = useRadioState();

const config = useRuntimeConfig();
const activeTab = ref<number>(0); // Track the active tab with correct type

const fetchNowPlaying = async () => {
  console.info("Fetching now playing data...");
  try {
    const data: StationNowPlaying[] = await $fetch(
      `${config.public.BASE_URL}/api/nowplaying`
    );

    data.forEach((item) => {
      nowPlaying.value[item.station.shortcode] = item.now_playing;
      songHistory.value[item.station.shortcode] = item.song_history || [];
      playingNext.value[item.station.shortcode] = item.playing_next;
      activeListeners.value[item.station.shortcode] = item.listeners;
    });
  } catch (error) {
    console.error("Failed to fetch song history:", error);
  }
};

onMounted(async () => {
  await fetchNowPlaying();

  for (const item of stations.value) {
    if (item.stationUrl) {
      initializeSse(item.slot);
    }
  }

  setInterval(fetchNowPlaying, 60000);
});

onBeforeUnmount(() => {
  for (const station in sse.value) {
    if (sse.value[station]) {
      sse.value[station]!.close();
    }
  }
  for (const station in reconnectTimeouts.value) {
    if (reconnectTimeouts.value[station]) {
      clearTimeout(reconnectTimeouts.value[station]!);
    }
  }
});
</script>