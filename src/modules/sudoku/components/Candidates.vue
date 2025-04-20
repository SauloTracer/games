<template>
    <div :class="cssClass">
        <template v-for="n in [1, 2, 3, 4, 5, 6, 7, 8, 9]">
            <div
                :id="n.toString()"
                @click="toggle(n)"
                class="candidate-spot"
            >
                <span
                    :class="highlightCss(n)"
                    :style="[
                        'font-weight: bold; padding:0 5px 0 5px;',
                        getHighlightColorStyle(n)
                    ]"
                >
                    {{ `${candidates?.includes(n) ? n.toString() : '&nbsp;'}` }}
                </span>
            </div>
        </template>
    </div>
</template>

<script setup lang='ts'>
import { computed, onBeforeMount, ref, watch } from 'vue'

// Definição da interface CandidatesProps.
// Adicione a propriedade candidateColors que Cell.vue está passando.
export interface CandidatesProps {
    modelValue: number[]; // A lista atual de candidatos da célula
    selected: boolean; // Se a célula pai está selecionada
    highlight: boolean; // Se a célula pai tem destaque geral (do filtro)
    highlightValue?: number | null; // Valor específico a ser destacado (se usado para candidatos)
    candidateColors?: Map<number, string>; // <--- NOVA PROP: Mapa de candidato para cor
}

const props = defineProps<CandidatesProps>();
const emits = defineEmits(['updateCandidates']);

// Use uma ref local para gerenciar os candidatos exibidos
const candidates = ref<number[]>([]);

// Inicializa a ref candidates com o valor inicial da prop modelValue
onBeforeMount(() => {
    // Inicializa com a prop modelValue. Se for nulo/undefined, usa uma lista vazia ou 1-9.
    // Usar lista vazia pode ser mais seguro se 1-9 for só para depuração.
    candidates.value = props.modelValue ?? [1, 2, 3, 4, 5, 6, 7, 8, 9];
});

// Função para alternar um candidato específico (se a célula pai estiver selecionada)
function toggle(value: number) {
    if (!props.selected) return; // Só permite alternar se a célula estiver selecionada

    const currentCandidates = candidates.value; // Use a ref local

    if (currentCandidates.includes(value)) {
        // Remove o candidato se ele já estiver presente
        candidates.value = currentCandidates.filter((v) => v !== value);
    } else {
        // Adiciona o candidato e mantém a lista ordenada
        candidates.value = [...currentCandidates, value].sort((a, b) => a - b);
    }
    // Emite o array de candidatos atualizado para a célula pai
    emits('updateCandidates', candidates.value);
}

// Computed property para classes CSS gerais do grid de candidatos
const cssClass = computed(() => {
    return [
        'grid',
        // Aplica classes de destaque geral se a célula pai estiver selecionada ou destacada
        // Note que o destaque geral também é aplicado no contêiner pai (.cell no Cell.vue)
        props.selected ? 'selected' : '',
        props.highlight && !props.selected ? 'highlight' : '', // Aplica 'highlight' apenas se não estiver selecionada
    ].join(' ');
});

// Watch para atualizar a ref local 'candidates' sempre que a prop 'modelValue' mudar
watch(() => props.modelValue, (newValue) => {
    // Atualiza a ref local 'candidates' com o novo array da prop
    candidates.value = newValue ?? [];
}, { deep: true }); // Use deep: true se a mutação direta do array for possível (geralmente não é recomendado com props)

// --- NOVA FUNÇÃO PARA OBTER O ESTILO DE COR DE DESTAQUE ---
// Verifica se há uma cor definida no mapa candidateColors para um determinado número candidato
function getHighlightColorStyle(value: number) {
    // Verifica se o mapa candidateColors existe E se ele tem uma entrada para o número candidato atual
    if (props.candidateColors && props.candidateColors.has(value)) {
        // Se existir uma cor, retorna um objeto de estilo para definir a cor do texto
        return { color: props.candidateColors.get(value) };
    }
    // Se não houver uma cor específica definida para este candidato neste mapa, retorna um objeto vazio.
    // A cor padrão será usada (definida no CSS).
    return {};
}

// Função existente para a classe highlightValue (verifique se ainda é relevante ou conflita com o novo destaque de cor)
// Esta função aplica a classe 'highlightValue' ao span se o candidato estiver presente E for igual a props.highlightValue.
// O novo estilo inline de cor de getHighlightColorStyle provavelmente SOBRESCREVERÁ a cor definida por esta classe.
function highlightCss(value: number) {
    // Verifica se o candidato está na lista de candidatos visíveis E se ele corresponde ao highlightValue
    return candidates.value?.includes(value) && props.highlightValue != null && props.highlightValue === value ? 'highlightValue' : '';
}

</script>

<style lang="css" scoped>
/* Estilos para o grid de candidatos */
.grid {
    display: grid;
    gap: 1px;
    /* Espaço entre os números candidatos */
    grid-template-columns: repeat(3, 1fr);
    grid-template-rows: repeat(3, 1fr);
    font-size: 0.85em;
    /* Tamanho da fonte para candidatos */
    width: 90%;
    /* Faz o grid preencher o container pai (.cell) */
    height: 90%;
    /* Faz o grid preencher o container pai (.cell) */
    z-index: 101;
    /* Garante que os candidatos fiquem acima do overlay */
    /* Ajuste z-index se necessário em relação a outros elementos */
}

/* Estilos para cada spot de candidato (o div que contém o span do número) */
.grid .candidate-spot {
    display: flex;
    align-items: center;
    justify-content: center;
    aspect-ratio: 1 / 1;
    padding: 1px;
}

/* Estilos para o span que contém o número candidato real */
.grid span {
    font-weight: bold;
    /* Padding já definido no estilo inline */
    /* Cor padrão dos candidatos. Será sobrescrita pelo estilo inline de getHighlightColorStyle se houver uma cor definida. */
    color: #555;
    /* Cor padrão dos candidatos */

    user-select: none;
    -webkit-user-select: none;
    /* Para navegadores baseados em WebKit (Chrome, Safari, etc.) */
    -moz-user-select: none;
    /* Para Firefox */
    -ms-user-select: none;
    /* Para Internet Explorer/Edge (versões antigas) */
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

    .grid .candidate-spot {
        /* Usando a nova classe */
        padding: 2px;
    }
}

@media (max-width: 480px) {
    .grid {
        font-size: 0.7em;
    }

    .grid .candidate-spot {
        /* Usando a nova classe */
        padding: 1px;
    }
}
</style>