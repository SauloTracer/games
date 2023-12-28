<template>
    <slot>
        <div
            class="outer"
            @click="handleClick()"
        >
            <div v-if="props.type == 'candidate'">
                <candidates
                    v-model="(props.candidates as number[])"
                    :selected="props.selected"
                    :highlight="props.highlight"
                    :highlightValue="props.highlightValue"
                    @updateCandidates="$emit('updateCandidates', $event)"
                ></candidates>
            </div>
            <div
                v-else
                :class="cssClass"
            >
                <span
                    :class="[
                        props.highlightValue == value ? 'highlightValue' : '',
                    ]"
                    style="aspect-ratio: 1 / 1; margin: 5px; padding: 0 10px;"
                >
                    {{ value }}
                </span>
            </div>
        </div>
    </slot>
</template>

<script setup lang='ts'>
export interface Cell {
    value: number | null;
    type: 'given' | 'filled' | 'candidate';
    candidates?: number[];
    selected: boolean;
    highlight: boolean;
    highlightValue?: number | null;
}

import { computed, onBeforeMount, ref, watch } from 'vue'

import candidates from './candidates.vue';

const props = defineProps<Cell>();
const emits = defineEmits(['update:modelValue', 'click', 'updateCandidates']);

const selected = ref(false);
const highlight = ref(false);

onBeforeMount(() => {
    selected.value = props.selected ?? false;
    highlight.value = props.highlight ?? false;
});

function handleClick() {
    selected.value = true;
    emits('click');
}

const cssClass = computed(() => {
    return [
        'cell',
        props.type == 'given' ? 'given' : '',
        props.type == 'filled' ? 'filled' : '',
        props.selected ? 'selected' : '',
        props.highlight && !props.selected ? 'highlight' : '',
    ].join(' ');
});

</script>

<style lang="css" scoped>
.cell {
    height: 99%;
    aspect-ratio: 1 / 1;
    z-index: 90;
}

.given {
    font-weight: bold;
    font-size: xx-large;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: lightgray;
}

.filled {
    font-weight: bold;
    font-size: xx-large;
    display: flex;
    align-items: center;
    justify-content: center;
    color: gray;
}

.selected {
    background-color: yellow !important;
    /* #ffda00 */
}

.highlight {
    background-color: lightblue !important;
}

.conflict {
    color: red !important;
}

.answer {
    font-weight: bold;
    color: blue;
}

.outer {
    margin: 3px;
}

.highlightValue {
    background-color: orange !important;
}
</style>