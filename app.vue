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
</script>

<template>
  <UContainer>
    <h1 class="py-8">Dobro došli na Osnovni(Basic) Radio.</h1>
    <UTabs :items="items" class="w-full">
      <template #narodna="{ item }">
        <UCard>
          <RadioPlayer stationUrl="https://basic-radio.subasically.me/listen/narodna_muzika/radio"
            stationName="narodna_muzika" />
        </UCard>
      </template>

      <template #pop="{ item }">
        <UCard>
          <RadioPlayer stationUrl="https://basic-radio.subasically.me/listen/pop_muzika/radio" stationName="pop_muzika"
           />
        </UCard>
      </template>

      <template #trending="{ item }">
        <UCard>
          <RadioPlayer stationUrl="https://basic-radio.subasically.me/listen/trending_muzika/radio"
            stationName="trending_muzika" />
        </UCard>
      </template>
    </UTabs>
  </UContainer>
</template>