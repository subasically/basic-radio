<template>
  <UContainer class="flex flex-col items-center">
    <div class="text-center pt-6 pb-4">
      Dobro došli na <br /><span class="font-bold text-3xl">Osnovni(Basic)</span
      ><br />
      Radio
    </div>
    <UTabs :items="items" class="max-w-md">
      <template #narodna_muzika="{ item }">
        <UCard>
          <RadioPlayer
            v-if="item.stationUrl"
            :stationUrl="item.stationUrl"
            :nowPlaying="nowPlaying[item.slot]"
          />
          <p v-else>Currently offline.</p>
        </UCard>
      </template>

      <template #mix_muzika="{ item }">
        <UCard>
          <RadioPlayer
            v-if="item.stationUrl"
            :stationUrl="item.stationUrl"
            :nowPlaying="nowPlaying[item.slot]"
          />
          <p v-else>Currently offline.</p>
        </UCard>
      </template>

      <template #trending_muzika="{ item }">
        <UCard>
          <RadioPlayer
            v-if="item.stationUrl"
            :stationUrl="item.stationUrl"
            :nowPlaying="nowPlaying[item.slot]"
          />
          <p v-else>Currently offline.</p>
        </UCard>
      </template>
    </UTabs>
  </UContainer>
</template>

<script setup lang="ts">
// Define the structure of each item in the items array
interface StationItem {
  slot: string;
  label: string;
  stationUrl: string;
}

// Define the items array with StationItem type
const items: StationItem[] = [
  {
    slot: "narodna_muzika",
    label: "Narodna Muzika",
    stationUrl: `https://basic-radio.subasically.me/listen/narodna_muzika/radio`,
  },
  {
    slot: "mix_muzika",
    label: "Mix Muzika",
    stationUrl: "https://basic-radio.subasically.me/listen/mix_muzika/radio",
  },
  {
    slot: "trending_muzika",
    label: "Trending Muzika",
    stationUrl: "",
  },
];

// State for nowPlaying for each station
const nowPlaying = ref<Record<string, any>>({
  narodna_muzika: { song: null },
  mix_muzika: { song: null },
  trending_muzika: { song: null },
});

const sse = ref<Record<string, EventSource | null>>({
  narodna_muzika: null,
  mix_muzika: null,
  trending_muzika: null,
});

let reconnectTimeouts: Record<string, ReturnType<typeof setTimeout> | null> = {
  narodna_muzika: null,
  mix_muzika: null,
  trending_muzika: null,
};

// Fetch initial data for each station
const fetchInitialData = async (stationName: string) => {
  try {
    const response = await fetch(
      `https://basic-radio.subasically.me/api/nowplaying/${stationName}`
    );
    const data = await response.json();
    nowPlaying.value[stationName] = data.now_playing;
  } catch (error) {
    console.error(`Error fetching initial data for ${stationName}:`, error);
  }
};

// Initialize Server-Sent Events for each station
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
  sse.value[stationName] = new EventSource(sseUri);

  sse.value[stationName]!.onmessage = (e: { data: string }) => {
    const jsonData = JSON.parse(e.data);
    if ("pub" in jsonData) {
      nowPlaying.value[stationName] = jsonData.pub.data.np.now_playing;
    }
  };

  sse.value[stationName]!.onerror = () => {
    if (reconnectTimeouts[stationName] === null) {
      reconnectTimeouts[stationName] = setTimeout(() => {
        initializeSse(stationName);
        reconnectTimeouts[stationName] = null;
      }, 5000);
    }
  };
};

// Automatically connect to the stations that have a URL
const connectToAvailableStations = () => {
  for (const item of items) {
    if (item.stationUrl) {
      fetchInitialData(item.slot); // Fetch initial nowPlaying data for each station
      initializeSse(item.slot); // Set up SSE for each station
    }
  }
};

// Call the function when the component is mounted
onMounted(async () => {
  connectToAvailableStations(); // Connect to all available stations
});

// Cleanup on unmount
onBeforeUnmount(() => {
  for (const station in sse.value) {
    if (sse.value[station]) {
      sse.value[station]!.close();
    }
  }
  for (const station in reconnectTimeouts) {
    if (reconnectTimeouts[station]) {
      clearTimeout(reconnectTimeouts[station]!);
    }
  }
});
</script>
