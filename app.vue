<script setup lang="ts">
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
          <RadioPlayer stationUrl="https://basic-radio.subasically.me/listen/narodna_muzika/narodna"
            stationName="narodna" />
        </UCard>
      </template>

      <template #pop="{ item }">
        <UCard>
          <RadioPlayer stationUrl="https://basic-radio.subasically.me/listen/pop_muzika/pop" stationName="pop" />
        </UCard>
      </template>

      <template #trending="{ item }">
        <UCard>
          <RadioPlayer stationUrl="https://basic-radio.subasically.me/listen/trending_muzika/trending"
            stationName="trending" />
        </UCard>
      </template>
    </UTabs>
  </UContainer>
</template>
