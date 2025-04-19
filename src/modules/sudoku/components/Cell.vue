<template>
    <slot>
        <div
            class="outer"
            @click="handleClick()"
        >
            <div
                class="overlay"
                :style="backgroundColor"
            ></div>
            <div
                class="cell"
                v-if="props.type == 'candidate'"
            >
                <Candidates
                    v-model="(props.candidates as number[])"
                    :selected="props.selected"
                    :highlight="props.highlight"
                    :highlightValue="props.highlightValue"
                    @updateCandidates="$emit('updateCandidates', $event)"
                ></Candidates>
            </div>
            <div
                class="cell"
                v-else
                :class="cssClass"
            >
                <span
                    :class="[
                        props.highlightValue == value ? 'highlightValue' : '',
                        props.type != 'given' && props.check ? value == props.answer ? 'correct' : 'wrong' : '',
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
export interface CellProps {
    value: number | null;
    type: 'given' | 'filled' | 'candidate';
    candidates?: number[];
    selected: boolean;
    highlight: boolean;
    highlightValue?: number | null;
    check: boolean;
    answer: number;
    color: string;
}

import { computed, onBeforeMount, ref } from 'vue'

import Candidates from './Candidates.vue';

const props = defineProps<CellProps>();
const emits = defineEmits(['update:modelValue', 'click', 'updateCandidates']);

const selected = ref(false);
const highlight = ref(false);

onBeforeMount(() => {
    selected.value = props.selected ?? false;
    highlight.value = props.highlight ?? false;
});

const backgroundColor = computed(() => {
    return props.color == "#FFFFFF" ? "" : "opacity: .5 !important; background-color: " + props.color.substring(0, 7) + " !important;";
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
    z-index: 90;
    border-collapse: collapse;
    width: 100%;
    height: 100%;
    align-content: center;
    margin: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: transparent;
}

.given {
    font-weight: bold;
    font-size: x-large;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 100%;
    background-color: transparent;
}

.filled {
    font-weight: bold;
    font-size: x-large;
    display: flex;
    align-items: center;
    justify-content: center;
    color: gray;
    width: 100%;
    height: 100%;
    background-color: transparent;
}

.selected {
    background-color: yellow !important;
}

.highlight {
    background-color: lightblue !important;
}

.conflict {
    color: red !important;
}

.correct {
    color: blue;
}

.wrong {
    color: red;
}

.outer {
    position: relative;
    width: 100%;
    height: 100%;
    display: flex;
    align-items: stretch;
    /* Make outer stretch to fill cell */
    justify-content: stretch;
    /* Make outer stretch to fill cell */
}

.overlay {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    opacity: 0;
    background-color: yellow;
    pointer-events: none;
    z-index: 100;
}

.cell.selected,
.cell.highlight {
    background-color: yellow !important;
}

.cell.highlight {
    background-color: lightblue !important;
}

.highlightValue {
    background-color: orange !important;
}

@media (max-width: 768px) {
    /* ... mobile cell styles ... */
}

@media (max-width: 480px) {
    /* ... very small screen cell styles ... */
}
</style>