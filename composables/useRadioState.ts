// composables/useRadioState.ts
import type { PlayingNext, SongHistory, NowPlaying, Listeners } from "../types";

export const useRadioState = () => {
  const stations = ref([
    {
      slot: "narodna_muzika",
      label: "Narodna Muzika",
      stationUrl: "https://basic-radio.subasically.me/listen/narodna_muzika/radio",
    },
    {
      slot: "mix_muzika",
      label: "Mix Muzika",
      stationUrl: "https://basic-radio.subasically.me/listen/mix_muzika/radio",
    },
    {
      slot: "trending_muzika",
      label: "Trending Muzika",
      stationUrl: "https://basic-radio.subasically.me/listen/trending_muzika/radio",
    },
  ]);

  const lastDataReceived = ref<Record<string, number>>({
    narodna_muzika: Date.now(),
    mix_muzika: Date.now(),
    trending_muzika: Date.now(),
  });

  const nowPlaying = ref<Record<string, NowPlaying | null>>({
    narodna_muzika: null,
    mix_muzika: null,
    trending_muzika: null,
  });

  const playingNext = ref<Record<string, PlayingNext | null>>({
    narodna_muzika: null,
    mix_muzika: null,
    trending_muzika: null,
  });

  const songHistory = ref<Record<string, SongHistory[] | null>>({
    narodna_muzika: null,
    mix_muzika: null,
    trending_muzika: null,
  });

  const activeListeners = ref<Record<string, | Listeners>>({
    narodna_muzika: {
      total: 0,
      unique: 0,
      current: 0,
    },
    mix_muzika: {
      total: 0,
      unique: 0,
      current: 0,
    },
    trending_muzika: {
      total: 0,
      unique: 0,
      current: 0,
    },
  });

  const sse = ref<Record<string, EventSource | null>>({
    narodna_muzika: null,
    mix_muzika: null,
    trending_muzika: null,
  });

  const reconnectTimeouts = ref<Record<string, ReturnType<typeof setTimeout> | null>>({
    narodna_muzika: null,
    mix_muzika: null,
    trending_muzika: null,
  });

  const initializeSse = (stationName: string) => {
    const sseBaseUri = "https://basic-radio.subasically.me/api/live/nowplaying/sse";
    const sseUriParams = new URLSearchParams({
      cf_connect: JSON.stringify({
        subs: {
          [`station:${stationName}`]: {},
        },
      }),
    });

    console.info("Initializing SSE for", stationName);

    const sseUri = `${sseBaseUri}?${sseUriParams.toString()}`;

    sse.value[stationName] = new EventSource(sseUri);

    sse.value[stationName].onmessage = (e) => {
      const jsonData = JSON.parse(e.data);
      if ("pub" in jsonData) {
        console.info("Received message for", stationName, jsonData.pub.data.np.now_playing);
        lastDataReceived.value[stationName] = Date.now();
        nowPlaying.value[stationName] = jsonData.pub.data.np.now_playing;
      }
    };

    sse.value[stationName].onerror = () => {
      if (reconnectTimeouts.value[stationName] === null) {
        reconnectTimeouts.value[stationName] = setTimeout(() => {
          initializeSse(stationName); // Reconnect after 5 seconds
          reconnectTimeouts.value[stationName] = null;
        }, 5000);
      }
    };
  };

  return {
    stations,
    nowPlaying,
    playingNext,
    songHistory,
    activeListeners,
    sse,
    reconnectTimeouts,
    initializeSse,
  };
};