<template>
  <div ref="columnRef" class="ad-column">
    <Ad
      v-for="(ad, index) in visibleAds"
      :key="index"
      :forcedAd="ad"
    />
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, nextTick } from 'vue'
import Ad from './Ad.vue'
import ads from '@/assets/ads.json'

const columnRef = ref(null)
const visibleAds = ref([])

const AD_HEIGHT = 300 // altura média estimada do anúncio (px)

const calcularQuantidade = () => {
  if (!columnRef.value) return

  const altura = columnRef.value.clientHeight
  const quantidade = Math.floor(altura / AD_HEIGHT)

  // embaralha e pega N anúncios
  const embaralhados = [...ads].sort(() => 0.5 - Math.random())
  visibleAds.value = embaralhados.slice(0, Math.max(1,quantidade-1))
}

const handleResize = () => {
  calcularQuantidade()
}

onMounted(async () => {
  await nextTick()
  calcularQuantidade()
  window.addEventListener('resize', handleResize)
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', handleResize)
})
</script>

<style scoped>
.ad-column {
  display: flex;
  flex-direction: column;
  gap: 16px;
  height: 100vh;
  max-height: 100vh;
  width: 300px;
  padding: 0 20px;
}
</style>