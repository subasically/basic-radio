<template>
  <UContainer>
    <div class="text-center py-8">
      Dobro došli na <br /><span class="font-bold text-2xl">Osnovni(Basic)</span
      ><br />
      Radio.
    </div>
    <UTabs :items="items" class="w-full">
      <template #narodna_muzika="{ item }">
        <UCard>
          <RadioPlayer :stationUrl="item.stationUrl" :nowPlaying="nowPlaying" />
        </UCard>
      </template>

      <template #pop_muzika="{ item }">
        <UCard>
          <p>To be implemented when Pop radio is live.</p>
        </UCard>
      </template>

      <template #trending_muzika="{ item }">
        <UCard>
          <p>To be implemented when Trending radio is live.</p>
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
    stationUrl:
      "https://basic-radio.subasically.me/listen/narodna_muzika/radio",
  },
  {
    slot: "pop_muzika",
    label: "Pop Muzika",
    stationUrl: "",
  },
  {
    slot: "trending_muzika",
    label: "Trending Muzika",
    stationUrl: "",
  },
];

// State for nowPlaying and SSE
const nowPlaying = ref({
  song: null,
});
const sse = ref<EventSource | null>(null);
let reconnectTimeout: ReturnType<typeof setTimeout> | null = null;

// Initialize Server-Sent Events
const initializeSse = (stationName: string) => {
  console.log("Connecting to", stationName);

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

  sse.value = new EventSource(sseUri);

  sse.value.onmessage = (e) => {
    const jsonData = JSON.parse(e.data);
    if ("pub" in jsonData) {
      console.log(
        new Date().toLocaleTimeString(),
        "new data:",
        jsonData.pub.data.np.now_playing
      );
      nowPlaying.value = jsonData.pub.data.np.now_playing; // Update nowPlaying
    }
  };

  sse.value.onerror = () => {
    if (reconnectTimeout === null) {
      reconnectTimeout = setTimeout(() => {
        initializeSse(stationName); // Reconnect after 5 seconds
        reconnectTimeout = null;
      }, 5000);
    }
  };
};

// Automatically connect to the first available station on mount
const connectToAvailableStation = () => {
  for (const item of items) {
    if (item.stationUrl) {
      initializeSse(item.slot); // Use the slot as the station name
      break; // Connect to the first available station
    }
  }
};

// Call the function when the component is mounted
onMounted(() => {
  connectToAvailableStation();
});

// Cleanup on unmount
onBeforeUnmount(() => {
  if (sse.value) {
    sse.value.close();
    console.warn("SSE connection closed.");
  }
  if (reconnectTimeout) {
    clearTimeout(reconnectTimeout);
  }
});
</script>