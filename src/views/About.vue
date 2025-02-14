<template>
    <div class="about">
        <img
            v-if="!isMobile"
            src="/src/assets/images/banner.jpeg"
            alt="puzzled.com.br"
            class="logo"
            style="width: 100%;"
        />
        <img
            v-else
            src="/src/assets/images/icon.jpeg"
            alt="puzzled.com.br"
            class="logo"
            style="width: 100%;"
        />
        <p>Made by <a href="mailto:saulo.tracer@gmail.com">Tr@c3r</a></p>
    </div>
</template>

<script setup lang='ts'>
import { computed } from 'vue'
import { useIsMobileStore } from '@/stores/isMobile';
const isMobileStore = useIsMobileStore();
const isMobile = computed(() => isMobileStore.isMobile);
</script>

<style lang="css" scoped></style>