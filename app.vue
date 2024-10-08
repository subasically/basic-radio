<template>
  <UContainer class="flex flex-col items-center">
    <div class="text-center pt-6 pb-4">
      Dobro došli na <br /><span class="font-bold text-3xl">Osnovni(Basic)</span><br />
      Radio
    </div>
    <UTabs :items="items" class="max-w-md">
      <template #narodna_muzika="{ item }">
        <UCard>
          <RadioPlayer v-if="item.stationUrl" :stationUrl="item.stationUrl" :nowPlaying="nowPlaying[item.slot]"
            :songHistory="songHistory[item.slot]" />
          <p v-else>Currently offline.</p>
        </UCard>
      </template>

      <template #mix_muzika="{ item }">
        <UCard>
          <RadioPlayer v-if="item.stationUrl" :stationUrl="item.stationUrl" :nowPlaying="nowPlaying[item.slot]"
            :songHistory="songHistory[item.slot]" />
          <p v-else>Currently offline.</p>
        </UCard>
      </template>

      <template #trending_muzika="{ item }">
        <UCard>
          <RadioPlayer v-if="item.stationUrl" :stationUrl="item.stationUrl" :nowPlaying="nowPlaying[item.slot]"
            :songHistory="songHistory[item.slot]" />
          <p v-else>Currently offline.</p>
        </UCard>
      </template>
    </UTabs>
  </UContainer>
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

interface StationNowPlaying {
  station: Record<string, any>;
  now_playing: NowPlaying;
}

interface StationItem {
  slot: string;
  label: string;
  stationUrl: string;
}

const items: StationItem[] = [
  {
    slot: 'narodna_muzika',
    label: 'Narodna Muzika',
    stationUrl: 'https://basic-radio.subasically.me/listen/narodna_muzika/radio',
  },
  {
    slot: 'mix_muzika',
    label: 'Mix Muzika',
    stationUrl: 'https://basic-radio.subasically.me/listen/mix_muzika/radio',
  },
  {
    slot: 'trending_muzika',
    label: 'Trending Muzika',
    stationUrl: '',
  },
];

const nowPlaying = ref<Record<string, NowPlaying | null>>({
  narodna_muzika: null,
  mix_muzika: null,
  trending_muzika: null,
});

const songHistory = ref<Record<string, any[]>>({
  narodna_muzika: [],
  mix_muzika: [],
  trending_muzika: [],
});

const sse = ref<Record<string, EventSource | null>>({
  narodna_muzika: null,
  mix_muzika: null,
  trending_muzika: null,
});

const reconnectTimeouts: Record<string, ReturnType<typeof setTimeout> | null> = {
  narodna_muzika: null,
  mix_muzika: null,
  trending_muzika: null,
};

const handleSseData = (ssePayload: any) => {
  const jsonData = ssePayload.data;

  for (const station in nowPlaying.value) {
    if (jsonData.np.station.shortcode === station) {
      const currentlyPlaying = jsonData.np.now_playing;
      const currentTime = Math.floor(Date.now() / 1000);

      nowPlaying.value[station] = {
        ...currentlyPlaying,
        elapsed: currentTime - currentlyPlaying.played_at,
      };
      break;
    }
  }
};

const initializeSse = (stationName: string) => {
  const sseBaseUri = "https://basic-radio.subasically.me/api/live/nowplaying/sse";
  const sseUriParams = new URLSearchParams({
    cf_connect: JSON.stringify({
      subs: {
        [`station:${stationName}`]: { recover: true },
      },
    }),
  });

  const sseUri = `${sseBaseUri}?${sseUriParams.toString()}`;
  const sseInstance = new EventSource(sseUri);
  sse.value[stationName] = sseInstance;

  sseInstance.onmessage = (e: MessageEvent) => {
    const jsonData = JSON.parse(e.data);

    if ('connect' in jsonData) {
      const connectData = jsonData.connect;

      if ('data' in connectData) {
        connectData.data.forEach((initialRow: any) => handleSseData(initialRow));
      } else {
        if ('time' in connectData) {
          const connectTime = Math.floor(connectData.time / 1000);
        }

        for (const subName in connectData.subs) {
          const sub = connectData.subs[subName];
          if ('publications' in sub && sub.publications.length > 0) {
            sub.publications.forEach((initialRow: any) => handleSseData(initialRow));
          }
        }
      }
    } else if ('pub' in jsonData) {
      handleSseData(jsonData.pub);
    }
  };

  sseInstance.onerror = () => {
    if (reconnectTimeouts[stationName] === null) {
      reconnectTimeouts[stationName] = setTimeout(() => {
        initializeSse(stationName);
        reconnectTimeouts[stationName] = null;
      }, 5000);
    }
  };
};

const fetchSongHistory = async (stationId: string) => {
  const config = useRuntimeConfig();

  console.log('api key:', config.public.AZURACAST_API_KEY);

  try {
    const data = await $fetch(`https://basic-radio.subasically.me/api/station/${stationId}/history`, {
      headers: {
        Authorization: `Bearer ${config.public.AZURACAST_API_KEY}`
      }
    });

    songHistory.value[stationId] = Array.isArray(data) ? data : [];
  } catch (error) {
    console.error('Failed to fetch song history:', error);
  }
}

onMounted(async () => {
  const apiKey = process.env.AZURACAST_API_KEY;

  for (const item of items) {
    if (item.stationUrl) {
      initializeSse(item.slot);
      await fetchSongHistory(item.slot);
    }
  }
});

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