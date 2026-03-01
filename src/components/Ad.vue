<template>
  <div v-if="anuncio" class="ad">
    <a :href="anuncio.link" target="_blank" rel="noopener noreferrer">
      <img :src="anuncio.image" :alt="anuncio.title" class="ad-img"/>
      <p class="ad-title">{{ anuncio.title }}</p>
    </a>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'

// Importa o JSON de anúncios
import ads from '@/assets/ads.json'

const anuncio = ref(null)

// Função para escolher aleatoriamente um item do JSON
const escolherAnuncio = () => {
  const index = Math.floor(Math.random() * ads.length)
  anuncio.value = ads[index]
}

onMounted(() => {
  escolherAnuncio()
})
</script>

<style scoped>
.ad {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin: 1rem 0;
  text-align: center;
}

.ad-img {
  max-width: 100%;
  border-radius: 8px;
}

.ad-title {
  margin-top: 0.5rem;
  font-weight: bold;
  font-size: 1rem;
  color: #333;
}
</style>