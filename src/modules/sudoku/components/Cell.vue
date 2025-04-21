<template>
    <slot>
        <div
            class="outer"
            @click="handleClick($event)"
        >
            <div
                class="overlay"
                :style="backgroundColor"
            ></div>

            <div
                class="cell"
                v-if="props.type == 'candidate'"
                :class="{ 'selected': props.selected, 'highlight': props.highlight && !props.selected }"
            >
                <Candidates
                    v-model="(props.candidates as number[])"
                    :selected="props.selected"
                    :highlight="props.highlight"
                    :highlightValue="props.highlightValue"
                    :candidateColors="props.candidateColors"
                ></Candidates>
                <!-- @updateCandidates="$emit('updateCandidates', $event)" -->
            </div>

            <div
                class="cell"
                v-else
                :class="cssClass"
            >
                <span
                    :class="[
                        // Classe para destacar o valor fixo se ele corresponder a highlightValue
                        props.highlightValue != null && value == props.highlightValue ? 'highlightValue' : '',
                        // Lógica para classes 'correct' ou 'wrong' se a verificação estiver ativa e não for 'given'
                        props.type != 'given' && props.check ? (props.value != null && props.value == props.answer ? 'correct' : 'wrong') : '',
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
import { computed, onBeforeMount, ref } from 'vue'

export interface CellProps {
    value: number | null;
    type: 'given' | 'filled' | 'candidate';
    candidates?: number[];
    selected: boolean;
    highlight: boolean; // Para destaque geral da célula
    highlightValue?: number | null; // Para destacar um valor fixo específico
    check: boolean; // Se a verificação de resposta está ativa
    answer: number; // A resposta correta para verificação
    color: string; // Para marcação manual com cor de fundo
    candidateColors?: Map<number, string>; // Mapeamento de cores para candidatos
}

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
    // Lógica para a cor de fundo baseada na propriedade 'color' (marcação manual)
    // Aplica opacidade e cor se a cor não for #FFFFFF
    return props.color === "#FFFFFF" ? "" : `opacity: .5 !important; background-color: ${props.color.substring(0, 7)} !important;`;
});

function handleClick(event: MouseEvent) {
    selected.value = true;
    emits('click'); //, event); // Emite o evento click, assumindo que a lógica de seleção é externa
    // event.stopPropagation(); // Para evitar que o evento suba para o pai
}

// Computed property para classes CSS gerais da célula (given, filled, selected, highlight)
const cssClass = computed(() => {
    return [
        'cell',
        props.type === 'given' ? 'given' : '',
        props.type === 'filled' ? 'filled' : '',
        props.selected ? 'selected' : '',
        props.highlight && !props.selected ? 'highlight' : '', // Aplica 'highlight' apenas se não estiver selecionada
    ].join(' ');
});

</script>

<style lang="css" scoped>
/* Estilos para o div principal da célula (.cell) */
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
    user-select: none;
    -webkit-user-select: none;
    /* Para navegadores baseados em WebKit (Chrome, Safari, etc.) */
    -moz-user-select: none;
    /* Para Firefox */
    -ms-user-select: none;
    /* Para Internet Explorer/Edge (versões antigas) */
}

/* Estilos específicos para tipos de célula */
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
    /* Faz o conteúdo esticar para preencher o outer */
    justify-content: stretch;
    /* Faz o conteúdo esticar para preencher o outer */
    cursor: pointer;
    /* Indica que a célula é clicável */
    /* Border removida daqui se a border for aplicada no .cell */
}

/* Overlay para cor de marcação manual */
.overlay {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    /* Opacidade controlada pelo estilo inline da prop color */
    opacity: 0;
    /* Padrão */
    background-color: yellow;
    /* Cor padrão de fallback, será sobrescrita pelo estilo inline */
    pointer-events: none;
    /* Permite clicar na célula por baixo */
    z-index: 100;
    /* Posicionado acima do .cell */
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
</style>