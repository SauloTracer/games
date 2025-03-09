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
        <Title>
            Sudoku
            <button
                class="button"
                @click="router.push('/sudoku')"
            >
                <v-icon>mdi-play</v-icon>
            </button>
        </Title>
    </div>
</template>

<script setup lang='ts'>
import { computed } from 'vue'
import { useIsMobileStore } from '@/stores/isMobile';
import { useRouter } from 'vue-router'

import Title from '../components/Title.vue';

const router = useRouter()
const isMobileStore = useIsMobileStore();
const isMobile = computed(() => isMobileStore.isMobile);
</script>

<style lang="css" scoped>
.button {
    appearance: none;
    background-color: #FAFBFC;
    border: 1px solid rgba(27, 31, 35, 0.15);
    border-radius: 6px;
    box-shadow: rgba(27, 31, 35, 0.04) 0 1px 0, rgba(255, 255, 255, 0.25) 0 1px 0 inset;
    box-sizing: border-box;
    color: #24292E;
    cursor: pointer;
    display: inline-block;
    font-family: -apple-system, system-ui, "Segoe UI", Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji";
    font-size: 14px;
    font-weight: 500;
    line-height: 20px;
    list-style: none;
    padding: 6px 10px;
    margin: 4px;
    position: relative;
    transition: background-color 0.2s cubic-bezier(0.3, 0, 0.5, 1);
    user-select: none;
    -webkit-user-select: none;
    touch-action: manipulation;
    vertical-align: middle;
    white-space: nowrap;
    word-wrap: break-word;
}
</style>