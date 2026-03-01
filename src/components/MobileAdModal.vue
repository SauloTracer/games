<template>
  <div v-if="visible" class="overlay" @click.self="fechar">
    <div class="modal">
      <button class="close" @click="fechar">✕</button>

      <Ad :forcedAd="currentAd" />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick, defineExpose } from 'vue'
import Ad from './Ad.vue'
import ads from '@/assets/ads.json'

const visible = ref(false)
const currentAd = ref(null)
let lastAdId = null
let timeoutId = null

const escolherNovoAd = () => {
  const disponiveis = ads.filter(a => a.id !== lastAdId)
  const index = Math.floor(Math.random() * disponiveis.length)
  currentAd.value = disponiveis[index]
  lastAdId = currentAd.value.id
}

const abrir = () => {
  escolherNovoAd()
  visible.value = true
  document.body.style.overflow = 'hidden'
}

const fechar = () => {
  visible.value = false
  document.body.style.overflow = ''
}

const showNewAd = async () => {
  fechar()
  await nextTick()
  abrir()
}

onMounted(() => {
  timeoutId = setTimeout(() => {
    abrir()
  }, 2000) // delay de 2 segundos
})

defineExpose({
  showNewAd
})
</script>

<style scoped>
.overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.55);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
}

.modal {
  background: white;
  padding: 20px;
  border-radius: 12px;
  max-width: 90%;
  width: 320px;
  position: relative;
  animation: fadeIn 0.25s ease;
}

.close {
  position: absolute;
  top: 8px;
  right: 10px;
  background: none;
  border: none;
  font-size: 18px;
  cursor: pointer;
}

@keyframes fadeIn {
  from { transform: scale(0.9); opacity: 0 }
  to { transform: scale(1); opacity: 1 }
}
</style>