<template>
    <div :class="cssClass">
        <template v-for="n in [1, 2, 3, 4, 5, 6, 7, 8, 9]">
            <div
                :id="n.toString()"
                @click="toggle(n)"
            >
                <span
                    :class="highlightCss(n)"
                    style="font-weight: bold;"
                >
                    {{ `${candidates?.includes(n) ? n.toString() : '&nbsp;'}` }}
                </span>
            </div>
        </template>
    </div>
</template>

<script
    setup
    lang='ts'
>
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

<style
    lang="css"
    scoped
>
.grid {
    display: grid;
    gap: 0px;
    grid-template-columns: repeat(3, auto);
    grid-template-rows: repeat(3, auto);
}

.selected {
    background-color: yellow !important;
}

.highlight {
    background-color: lightblue !important;
}

.highlightValue {
    background-color: lightgreen !important;
    padding: 0 5px;
}
</style>