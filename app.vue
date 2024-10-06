<script setup lang="ts">
// Define the tabs
const items = [{
  slot: 'narodna',
  label: 'Narodna Muzika'
}, {
  slot: 'pop',
  label: 'Pop Muzika'
}, {
  slot: 'trending',
  label: 'Trending Muzika'
}]

// Create a reactive reference for the nowPlaying data
const nowPlaying = ref<any>({
  now_playing: {
    song: {
      title: '',
      artist: '',
      album: '',
      art: ''
    }
  }
});

// Function to fetch the nowPlaying data
async function getNowPlaying() {
  const res = await $fetch('https://basic-radio.subasically.me/api/nowplaying', {
    method: 'GET',
    cache: 'no-cache',
  });
  return res[0]?.now_playing || {
    song: {
      title: '',
      artist: '',
      album: '',
      art: ''
    }
  };
}

// Fetch the data when the component is mounted
onMounted(async () => {
  nowPlaying.value = await getNowPlaying();
});
</script>

<template>
  <UContainer>
    <h1 class="py-8">Dobro došli na Osnovni(Basic) Radio.</h1>
    <UTabs :items="items" class="w-full">
      <template #narodna="{ item }">
        <UCard>
          <RadioPlayer stationUrl="https://basic-radio.subasically.me/listen/narodna_muzika/radio"
            stationName="narodna_muzika" :nowPlaying="nowPlaying" />
        </UCard>
      </template>

      <template #pop="{ item }">
        <UCard>
          <RadioPlayer stationUrl="https://basic-radio.subasically.me/listen/pop_muzika/radio" stationName="pop_muzika"
            :nowPlaying="nowPlaying" />
        </UCard>
      </template>

      <template #trending="{ item }">
        <UCard>
          <RadioPlayer stationUrl="https://basic-radio.subasically.me/listen/trending_muzika/radio"
            stationName="trending_muzika" :nowPlaying="nowPlaying" />
        </UCard>
      </template>
    </UTabs>
  </UContainer>
</template>