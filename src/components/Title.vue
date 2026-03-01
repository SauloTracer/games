<template>
    <div class="title">
        <slot></slot>
    </div>
</template>

<script setup lang='ts'>
import { ref } from 'vue'
</script>

<style lang="css" scoped>
.title {
    font-size: 2rem;
    font-weight: 800;
    text-align: center;
}
</style>