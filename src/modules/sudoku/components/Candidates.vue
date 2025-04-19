<template>
    <div :class="cssClass">
        <template v-for="n in [1, 2, 3, 4, 5, 6, 7, 8, 9]">
            <div
                :id="n.toString()"
                @click="toggle(n)"
            >
                <span
                    :class="highlightCss(n)"
                    style="font-weight: bold; padding:0 5px 0 5px;"
                >
                    {{ `${candidates?.includes(n) ? n.toString() : '&nbsp;'}` }}
                </span>
            </div>
        </template>
    </div>
</template>

<script setup lang='ts'>
export interface CandidatesProps {
    modelValue: number[];
    selected: boolean;
    highlight: boolean;
    highlightValue?: number | null;
}

import { computed, onBeforeMount, ref, watch } from 'vue'

const props = defineProps<CandidatesProps>();
const emits = defineEmits(['updateCandidates']);
const candidates = ref<number[]>([]);

onBeforeMount(() => {
    candidates.value = props.modelValue ?? [1, 2, 3, 4, 5, 6, 7, 8, 9];
});

function toggle(value: number) {
    if (!props.selected) return;
    if (candidates.value.includes(value)) {
        candidates.value = candidates.value.filter((v) => v != value);
    } else {
        candidates.value.push(value);
    }
    emits('updateCandidates', candidates.value);
}

function highlightCss(value: number) {
    return candidates.value?.includes(value) && props.highlightValue == value ? 'highlightValue' : '';
}

const cssClass = computed(() => {
    return [
        'grid',
        props.selected ? 'selected' : '',
        props.highlight && !props.selected ? 'highlight' : '',
    ].join(' ');
});

watch(() => props.modelValue, (value) => {
    candidates.value = value;
});
</script>

<style lang="css" scoped>
.grid {
    display: grid;
    gap: 1px;
    grid-template-columns: repeat(3, 1fr);
    grid-template-rows: repeat(3, 1fr);
    font-size: 0.85em;
    width: 90%;
    height: 90%;
    z-index: 101;
}

.grid div {
    display: flex;
    align-items: center;
    justify-content: center;
    aspect-ratio: 1 / 1;
    padding: 1px;
}

.grid span {
    font-weight: bold;
}

.selected {
    background-color: yellow !important;
}

.highlight {
    background-color: lightblue !important;
}

.highlightValue {
    background-color: lightgreen !important;
}

@media (max-width: 768px) {
    .grid {
        font-size: 0.8em;
        gap: 1px;
    }

    .grid div {
        padding: 2px;
    }
}

@media (max-width: 480px) {
    .grid {
        font-size: 0.7em;
    }

    .grid div {
        padding: 1px;
    }
}
</style>