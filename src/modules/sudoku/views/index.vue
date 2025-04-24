<template>
    <div id="game-header">
        <Title>
            Sudoku
        </Title>
        <button
            id="play-button"
            @click="showNewGameDialog = true"
        >
            <v-icon id="play-button-icon">mdi-play</v-icon>
        </button>
        <div id="gameMode">
            <v-radio-group
                v-model="gameMode"
                @update:modelValue="changeMode($event)"
                inline
                hide-details
            >
                <v-radio
                    label="Zen"
                    :value="GameMode.Zen"
                ></v-radio>
                <v-radio
                    label="3 Strikes"
                    :value="GameMode.ThreeStrikes"
                ></v-radio>
            </v-radio-group>
            <div
                id="hearts"
                v-if="gameMode == GameMode.ThreeStrikes"
            >
                <template v-for="i in [3, 2, 1]">
                    <v-icon :color="i > errors ? 'red' : '#33333355'">mdi-heart-circle-outline</v-icon>
                </template>
            </div>
        </div>
        <div class="writing-tools-top">
            <v-btn-toggle
                divided
                v-model="fillCandidates"
                color="primary"
            >
                <v-btn
                    :value="true"
                    title="Candidates"
                >
                    <v-icon end>
                        mdi-pencil
                    </v-icon>
                </v-btn>

                <v-btn
                    :value="false"
                    title="Answer"
                >
                    <v-icon start>
                        mdi-pen
                    </v-icon>
                </v-btn>
            </v-btn-toggle>
        </div>
    </div>

    <v-row>
        <v-col>
            <div
                id="board"
                class="grid3"
                tabindex="0"
                ref="boardElement"
                @keyup.stop="handleKeyUp($event)"
                @keyup.escape="esc()"
            >
                <template v-for="row in [1, 2, 3]">
                    <template v-for="col in [1, 2, 3]">
                        <div class="block grid3">
                            <template v-for="line, lineIndex in board.slice((row - 1) * 3, row * 3)">
                                <template
                                    v-for="cell, colIndex in line.slice((col - 1) * 3, col * 3)"
                                    :key="`${lineIndex + (row - 1) * 3}-${colIndex + (col - 1) * 3}`"
                                >
                                    <div class="cell">
                                        <Cell
                                            :type="cell.type"
                                            :candidates="cell.candidates"
                                            :value="cell.value"
                                            :selected="cell.selected"
                                            :highlight="highlightedCells.includes(cell)"
                                            :highlightValue="highlightValue"
                                            :check="autoCheckCells || cell.check"
                                            :answer="cell.answer"
                                            :color="cell.color"
                                            :candidateColors="cell.candidateColors"
                                        ></Cell>
                                        <!-- @updateCandidates="cell.candidates = $event" -->
                                        <!-- @click="selectCell(cell.coordinates.row, cell.coordinates.col, true, $event)" -->
                                    </div>
                                </template>
                            </template>
                        </div>
                    </template>
                </template>
            </div>
        </v-col>
        <v-col>
            <div class="writing-tools">
                <v-btn-toggle
                    divided
                    v-model="fillCandidates"
                    color="primary"
                >
                    <v-btn :value="true">
                        Candidates
                        <v-icon end>
                            mdi-pencil
                        </v-icon>
                    </v-btn>

                    <v-btn :value="false">
                        <v-icon start>
                            mdi-pen
                        </v-icon>
                        Answer
                    </v-btn>
                </v-btn-toggle>
            </div>
            <div
                id="numbers"
                class="grid3"
            >
                <template v-for="n in [1, 2, 3, 4, 5, 6, 7, 8, 9]">
                    <button
                        class="number"
                        :id="n.toString()"
                        @mouseover="highlightValue = n"
                        @mouseleave="highlightValue = selectedCell?.value ?? null"
                        @click="setCellValue(n)"
                        :disabled="getCount(n) >= 9"
                    >
                        <div style="display: flex; flex-direction: column; aspect-ratio: 1;">
                            <span>{{ n }}</span>
                            <span style="font-size:x-small; color: rgb(100, 100, 100);">
                                ({{ getCount(n) }} / 9)
                            </span>
                        </div>
                    </button>
                </template>

            </div>
            <button
                class="number eraser"
                id="clearCellButton"
                @click="clearCellValue()"
            >
                <v-icon>mdi-eraser</v-icon>
                Erase
            </button>

            <div id="filterBox">
                <v-text-field
                    v-model="searchQuery"
                    placeholder="Search Tool"
                    class="mt-2"
                    @input="filterCandidates"
                    prepend-inner-icon="mdi-magnify"
                    append-inner-icon="mdi-help-circle-outline"
                    @click:append-inner="showFilterManualDialog = true"
                    hide-details
                ></v-text-field>
            </div>

            <div id="actions">
                <span
                    style="padding: 0.6em;"
                    class="checkbox"
                >
                    <input
                        id="autoCheckCells"
                        type="checkbox"
                        v-model="autoCheckCells"
                        label="Auto Check"
                        @change="updateCheckCells()"
                        :disabled="gameMode == GameMode.ThreeStrikes"
                    />
                    <label
                        for="autoCheckCells"
                        style="font-weight:500;"
                    > Auto Check</label>
                </span>

                <span
                    style="padding: 0.6em;"
                    class="checkbox"
                >
                    <input
                        id="multiselect-checkbox"
                        type="checkbox"
                        v-model="isMultiselectChecked"
                    />
                    <label
                        for="multiselect-checkbox"
                        style="font-weight:500;"
                    > Multiselect</label>
                </span>

                <button
                    class="button"
                    v-if="!autoCheckCells"
                    @click="checkCell()"
                >Check Cell</button>
                <button
                    class="button"
                    @click="handleAutoCandidateClick"
                >Auto Candidate</button>
                <button
                    class="button"
                    @click="promoteSingles()"
                >Promote Singles</button>
                <button
                    class="button"
                    @click="markCells()"
                >Mark Cells</button>
                <button
                    class="button"
                    @click="revealCell()"
                >Reveal Cell</button>
                <button
                    class="button"
                    @click="showSolution()"
                >Solve</button>
                <button
                    class="button"
                    @click="reset()"
                >Reset</button>
                <button
                    class="button"
                    @click="undo()"
                >Undo</button>
                <button
                    class="button"
                    @click="showNewGameDialog = true"
                >New Game</button>
            </div>
        </v-col>
    </v-row>

    <v-dialog
        max-width="500"
        v-model="finished"
    >
        <v-card :title="finishedTitle">
            <v-card-text>
                {{ finishedMessage }}
            </v-card-text>

            <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn
                    text="New Game"
                    @click="showNewGameDialog = true"
                ></v-btn>
                <v-btn
                    text="Review"
                    @click="() => { finished = false; gameMode = GameMode.Zen; }"
                ></v-btn>
                <v-btn
                    v-if="!finishedStatus"
                    text="Retry"
                    @click="reset();"
                ></v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>

    <v-dialog
        max-width="200"
        v-model="showNewGameDialog"
    >
        <v-card>
            <v-card-title style="text-align: center;">
                New Game
            </v-card-title>
            <v-card-text class="d-flex flex-column">
                <template v-for="[k, v] of Object.entries(Difficulty)">
                    <v-btn
                        class="button difficulty-button justify-center align-center"
                        text
                        @click="newGame(v)"
                    >{{ k }}</v-btn>
                </template>
            </v-card-text>
        </v-card>
    </v-dialog>

    <v-dialog
        max-width="350"
        v-model="showMarkCellsDialog"
    >
        <v-card>
            <v-card-title>
                <v-row>
                    <v-col cols="5">Choose Color</v-col>
                    <v-col cols="7">
                        <v-btn @click="applyMarkColorToSelection()">
                            Confirm choice
                        </v-btn>
                    </v-col>
                </v-row>
            </v-card-title>
            <v-card-text class="d-flex flex-column">
                <v-color-picker
                    :swatches="swatches"
                    show-swatches
                    v-model="markColor"
                ></v-color-picker>
            </v-card-text>
            <v-card-actions>
                <v-row>
                    <v-col>
                        <v-btn @click="clearMarks()">
                            Clear marks
                        </v-btn>
                    </v-col>
                    <v-col>
                        <v-btn @click="clearAllMarks()">
                            Clear all marks
                        </v-btn>
                    </v-col>
                </v-row>
            </v-card-actions>
        </v-card>
    </v-dialog>

    <v-dialog
        max-width="800"
        width="800"
        v-model="showFilterManualDialog"
    >
        <v-card>
            <v-card-title class="headline">Manual do Filtro</v-card-title>
            <v-card-text>
                <p><strong>Sintaxe Básica:</strong></p>
                <p>[universo1] comandoA(argsA) && comandoB[argsB]; [universo2] comandoX(argsX) && comandoY[argsY]; ...
                </p>
                <p>Você pode combinar múltiplos comandos DENTRO de um grupo usando '&&'.</p>
                <p>Você pode ter múltiplos grupos de comandos, separados por ';'. Cada grupo pode opcionalmente definir
                    seu próprio universo no início.</p>
                <p>Use parênteses () ou colchetes [] para os argumentos de cada comando.</p>
                <p><strong>Filtro de Universo (Opcional no início de cada grupo):</strong></p>
                <ul>
                    <li><code>blocks(...)</code> ou <code>b(...)</code> ou <code>blocks[...]</code> ou
                        <code>b[...]</code>: Restringe a busca aos blocos informados (1 a 9) PARA OS COMANDOS NESTE
                        GRUPO. Ex: <code>b(1,4) count(2)</code>
                    </li>
                    <li><code>lines(...)</code> ou <code>l(...)</code>: Restringe às linhas (1 a 9) PARA OS COMANDOS
                        NESTE GRUPO. Ex: <code>l[5] contains(9)</code></li>
                    <li><code>columns(...)</code> ou <code>c(...)</code>: Restringe às colunas (1 a 9) PARA OS COMANDOS
                        NESTE GRUPO. Ex: <code>c(2,8) unique()</code></li>
                </ul>

                <p><strong>Comandos e Aliases:</strong></p>
                <ul>
                    <li><strong>Candidato Contém Qualquer:</strong> Células candidatas que possuem QUALQUER um dos
                        números na lista de argumentos. Destaca APENAS os candidatos listados que estão na célula (Cor
                        por Comando).
                        <br>Comandos: <code>contains</code>, <code>contain</code>, <code>has</code>,
                        <code>includes</code>, <code>:</code>
                        <br>Ex: <code>contains(2,3)</code>, <code>has[5]</code>, <code>: (1,9)</code>
                    </li>
                    <li><strong>Candidato Contém Todos:</strong> Células candidatas que possuem TODOS os números na
                        lista de argumentos. Destaca APENAS os candidatos listados que estão na célula (Cor por
                        Comando).
                        <br>Comandos: <code>containsall</code>, <code>hasall</code>, <code>includesall</code>,
                        <code>>=</code>
                        <br>Ex: <code>containsall(1,5)</code>, <code>>=[8,9]</code>
                    </li>
                    <li><strong>Candidato Apenas:</strong> Células candidatas cujos candidatos são EXATAMENTE a lista de
                        argumentos. Destaca TODOS os candidatos na célula (Cor por Comando).
                        <br>Comandos: <code>only</code> (e seus aliases, se definidos)
                        <br>Ex: <code>only(1,2)</code>, <code>only[7,8,9]</code>
                    </li>
                    <li><strong>Único (Hidden Single):</strong> Células candidatas com um candidato que é único em sua
                        linha, coluna OU bloco (dentro do universo do grupo). Destaca o candidato único (Cor por
                        Comando).
                        <br>Comandos: <code>unique</code> (e seus aliases, se definidos)
                        <br>Ex: <code>unique()</code>
                    </li>
                    <li><strong>Pares Nus (Naked Pairs):</strong> Células com exatamente 2 candidatos que aparecem
                        juntos e APENAS juntos em 2 células dentro de uma unidade (dentro do universo do grupo). Destaca
                        os 2 candidatos nessas 2 células (Cor por Instância).
                        <br>Comandos: <code>nakedpairs</code>, <code>nakedpair</code>, <code>np</code>,
                        <code>pair</code>, <code>pairs</code>, <code>p</code>
                        <br>Ex: <code>nakedpairs()</code>
                    </li>
                    <li><strong>Trios Nus (Naked Triples):</strong> Células com 2 ou 3 candidatos que aparecem juntos e
                        APENAS juntos em 3 células dentro de uma unidade (dentro do universo do grupo), formando um
                        conjunto de 3 candidatos. Destaca os 3 candidatos nessas 3 células (Cor por Instância).
                        <br>Comandos: <code>nakedtriples</code>, <code>nakedtriple</code>, <code>nt</code>,
                        <code>t</code>, <code>triple</code>, <code>trio</code>
                        <br>Ex: <code>nt()</code>, <code>trio[]</code>
                    </li>
                    <li><strong>Pares Ocultos (Hidden Pairs):</strong> Em uma unidade (dentro do universo do grupo), 2
                        candidatos aparecem APENAS em 2 células (e essas 2 células podem ter outros candidatos). Destaca
                        os 2 candidatos nessas 2 células (Cor por Instância).
                        <br>Comandos: <code>hiddenpairs</code>, <code>hiddenpair</code>, <code>hp</code>
                        <br>Ex: <code>hiddenpairs()</code>
                    </li>
                    <li><strong>Trios Ocultos (Hidden Triples):</strong> Em uma unidade (dentro do universo do grupo), 3
                        candidatos aparecem APENAS em 3 células (e essas 3 células podem ter outros candidatos). Destaca
                        os 3 candidatos nessas 3 células (Cor por Instância).
                        <br>Comandos: <code>hiddentriples</code>, <code>hiddentriple</code>, <code>ht</code>
                        <br>Ex: <code>ht()</code>
                    </li>
                    <li><strong>X-Wing:</strong> Um candidato aparece em exatamente 2 células em 2 linhas diferentes
                        (dentro do universo do grupo), e essas células compartilham as mesmas 2 colunas. Destaca as 4
                        células envolvidas para um candidato específico (Cor por Grupo de Candidato).
                        <br>Comandos: <code>xwing</code>, <code>xw</code>
                        <br>Ex: <code>xwing()</code>
                    </li>
                    <li><strong>Swordfish:</strong> Um candidato aparece em exatamente 2 ou 3 células em 3 linhas
                        diferentes (dentro do universo do grupo), e todas essas células compartilham as mesmas 3
                        colunas. Destaca as células envolvidas para um candidato específico (Cor por Grupo de
                        Candidato).
                        <br>Comandos: <code>swordfish</code>, <code>sf</code>
                        <br>Ex: <code>swordfish()</code>
                    </li>
                    <li><strong>Contagem de Candidatos:</strong> Células candidatas (dentro do universo do grupo) com um
                        número EXATO de candidatos especificado. Destaca a CÉLULA INTEIRA (Destaque Geral).
                        <br>Comandos: <code>count</code>, <code>counter</code>, <code>*</code>, etc.
                        <br>Ex: <code>count(2)</code>, <code>*[3]</code>
                    </li>
                    <li><strong>Não Contém:</strong> Células (candidatas ou preenchidas, dentro do universo do grupo)
                        que NÃO contêm nenhum dos números especificados. Destaca a CÉLULA INTEIRA (Destaque Geral).
                        <br>Comandos: <code>notcontains</code>, <code>!</code>, <code>not</code>, etc.
                        <br>Ex: <code>notcontains(1,9)</code>, <code>![5]</code>
                    </li>
                    <li><strong>Número Único (Sem Parênteses/Colchetes):</strong> Se o comando for apenas um número.
                        Destaca CÉLULAS PREENCHIDAS (dentro do universo do grupo) com esse número E destaca CADA
                        CANDIDATO desse número nas células candidatas (dentro do universo do grupo). Destaca CÉLULA
                        PREENCHIDA (Destaque Geral) e CANDIDATO INDIVIDUAL (Cor por Comando).
                        <br>Ex: <code>5</code>
                    </li>
                </ul>

                <p><strong>Combinações:</strong></p>
                <p>Use <code>&&</code> para combinar filtros DENTRO DE UM MESMO GRUPO. Use <code>;</code> para separar
                    GRUPOS DE FILTRO. Os destaques de todos os grupos são combinados. Células ou candidatos que
                    correspondem a múltiplos filtros podem acumular destaques (a cor do último filtro correspondente no
                    ciclo geral de cores prevalece para candidatos coloridos).</p>
                <p>Ex: <code>b(1) contains(1) && count(2); l[2] unique()</code> (Candidatos '1' no bloco 1 E Células com
                    2 candidatos no bloco 1; Hidden Singles na linha 2)</p>

            </v-card-text>
            <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn
                    color="primary"
                    text
                    @click="showFilterManualDialog = false"
                >
                    Fechar
                </v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>

    <v-dialog
        v-model="showAutoCandidateDialog"
        max-width="450"
    >
        <v-card>
            <v-card-title class="headline">Auto Candidates</v-card-title>
            <v-card-text>
                Where do you want to apply auto candidates?
            </v-card-text>
            <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn
                    color="primary"
                    text
                    @click="applyAutoCandidates('selected'); showAutoCandidateDialog = false;"
                >
                    Selection
                </v-btn>
                <v-btn
                    color="primary"
                    text
                    @click="applyAutoCandidates('all'); showAutoCandidateDialog = false;"
                >
                    Board
                </v-btn>
                <v-btn
                    color="grey"
                    text
                    @click="showAutoCandidateDialog = false;"
                >
                    Cancel
                </v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>
</template>

<script setup lang='ts'>
export interface Cell {
    value: number | null;
    type: 'given' | 'filled' | 'candidate';
    candidates: number[];
    selected: boolean;
    highlight: boolean;
    check: boolean;
    coordinates: { row: number, col: number };
    answer: number;
    color: string; // Para marcação manual com cor
    candidateColors?: Map<number, string>;
}

enum GameMode {
    Zen = "zen",
    ThreeStrikes = "threeStrikes",
}

import { ref, onBeforeMount, onMounted, onUnmounted, watch } from 'vue'
import { useSudokuStore, Difficulty } from '../stores/SudokuStore';

import Title from '../../../components/Title.vue';
import Cell from '../components/Cell.vue';

const sudokuStore = useSudokuStore();

const autoCheckCells = ref(false);
const defaultCell = { selected: false, highlight: false, check: autoCheckCells.value, value: null, candidates: [1, 2, 3, 4, 5, 6, 7, 8, 9], type: "candidate", coordinates: { row: 0, col: 0 }, answer: 0, color: "#FFFFFF" } as Cell;
const board = ref<Cell[][]>([
    [defaultCell, defaultCell, defaultCell, defaultCell, defaultCell, defaultCell, defaultCell, defaultCell, defaultCell,],
    [defaultCell, defaultCell, defaultCell, defaultCell, defaultCell, defaultCell, defaultCell, defaultCell, defaultCell,],
    [defaultCell, defaultCell, defaultCell, defaultCell, defaultCell, defaultCell, defaultCell, defaultCell, defaultCell,],
    [defaultCell, defaultCell, defaultCell, defaultCell, defaultCell, defaultCell, defaultCell, defaultCell, defaultCell,],
    [defaultCell, defaultCell, defaultCell, defaultCell, defaultCell, defaultCell, defaultCell, defaultCell, defaultCell,],
    [defaultCell, defaultCell, defaultCell, defaultCell, defaultCell, defaultCell, defaultCell, defaultCell, defaultCell,],
    [defaultCell, defaultCell, defaultCell, defaultCell, defaultCell, defaultCell, defaultCell, defaultCell, defaultCell,],
    [defaultCell, defaultCell, defaultCell, defaultCell, defaultCell, defaultCell, defaultCell, defaultCell, defaultCell,],
    [defaultCell, defaultCell, defaultCell, defaultCell, defaultCell, defaultCell, defaultCell, defaultCell, defaultCell,]
]);
const selectedCell = ref<Cell | Cell[] | null>(null);
const highlightedCells = ref<Cell[]>([]);
const highlightValue = ref<number | null>(null);
const fillCandidates = ref(true);
const gameMode = ref(GameMode.Zen);
const finished = ref(false);
const finishedStatus = ref(false);
const finishedTitle = ref('');
const finishedMessage = ref('');
const errors = ref(0);
const showNewGameDialog = ref(false);
const showMarkCellsDialog = ref(false)
const markColor = ref()
const swatches = [
    ['#FF0000', '#AA0000', '#550000'],
    ['#FFFF00', '#AAAA00', '#555500'],
    ['#00FF00', '#00AA00', '#005500'],
    ['#00FFFF', '#00AAAA', '#005555'],
    ['#0000FF', '#0000AA', '#000055'],
];
const highlightColors = ['#FF0000', '#0000FF', '#10A310', '#A020F0', '#FFA500', '#FF4500', '#8A2BE2', '#32CD32', '#4169E1'];
const searchQuery = ref('');
const showFilterManualDialog = ref(false);
const showAutoCandidateDialog = ref(false);
const isMultiselectChecked = ref(false);
const boardElement = ref<HTMLElement | null>(null);
const isDragging = ref(false);
const dragStartCell = ref<Cell | null>(null);
const lastDraggedCell = ref<Cell | null>(null);
const dragStartX = ref(0);
const dragStartY = ref(0);

let solution: number[][] = [[]];

onBeforeMount(() => {
    loadConfig();
    if (hasSavedGame()) {
        loadSave();
    } else {
        sudokuStore.getBoard();
        reset();
    }
});

onMounted(() => {
    // Adiciona event listeners para drag selection ao elemento do tabuleiro
    if (boardElement.value) {
        boardElement.value.addEventListener('mousedown', handleMouseDown);
        boardElement.value.addEventListener('mousemove', handleMouseMove);
        boardElement.value.addEventListener('mouseup', handleMouseUp);
        boardElement.value.addEventListener('keydown', (event) => {
            if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(event.key)) {
                event.preventDefault(); // Previne o comportamento padrão de rolagem
            }
        });
    }
});

onUnmounted(() => {
    // Remove event listeners ao desmontar
    if (boardElement.value) {
        boardElement.value.removeEventListener('mousedown', handleMouseDown);
        boardElement.value.removeEventListener('mousemove', handleMouseMove);
        boardElement.value.removeEventListener('mouseup', handleMouseUp);
        boardElement.value.removeEventListener('keydown', (event) => {
            if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(event.key)) {
                event.preventDefault(); // Previne o comportamento padrão de rolagem
            }
        });
    }
});

function markCells() {
    showMarkCellsDialog.value = true;
}

function clearMarks() {
    markColor.value = '#FFFFFF';
    if (!selectedCell.value || (Array.isArray(selectedCell.value) && selectedCell.value.length === 0)) {
        showMarkCellsDialog.value = false;
        return;
    }
    const cellsToClear = Array.isArray(selectedCell.value) ? selectedCell.value : [selectedCell.value];
    cellsToClear.forEach(cell => { const boardCell = board.value[cell.coordinates.row][cell.coordinates.col]; boardCell.color = '#FFFFFF'; }); // Limpa a cor (define como branco)
    showMarkCellsDialog.value = false;
    saveChanges(); save();
}

function clearAllMarks() {
    [0, 1, 2, 3, 4, 5, 6, 7, 8].map(col =>
        [0, 1, 2, 3, 4, 5, 6, 7, 8].map(row =>
            board.value[row][col].color = '#FFFFFF'
        )
    );
    showMarkCellsDialog.value = false;
}

function changeMode(mode: GameMode) {
    if (mode == GameMode.ThreeStrikes) {
        autoCheckCells.value = true;
    }
}

function newGame(difficulty: string = Difficulty.EASY) {
    sudokuStore.getBoard(difficulty);
    reset();
}

function reset() {
    deleteSave();
    [0, 1, 2, 3, 4, 5, 6, 7, 8].map(col =>
        [0, 1, 2, 3, 4, 5, 6, 7, 8].map(row => {
            if (hasSavedGame() && board.value[row][col].type == 'given') return;
            board.value[row][col] = {
                ...defaultCell,
                value: sudokuStore.board[row][col],
                coordinates: { row, col },
                candidates: [],
            };
            if (!hasSavedGame() && sudokuStore.board[row][col]) {
                board.value[row][col].type = 'given';
                board.value[row][col].value = sudokuStore.board[row][col];
            }
        })
    );
    highlightedCells.value = [];
    highlightValue.value = null;
    selectedCell.value = null;
    solution = board.value.map(line => line.map(cell => cell.value ?? 0)) as number[][];
    solve();
    [0, 1, 2, 3, 4, 5, 6, 7, 8].map(row =>
        [0, 1, 2, 3, 4, 5, 6, 7, 8].map(col =>
            board.value[row][col].answer = solution[row][col]
        )
    );
    finished.value = false;
    finishedStatus.value = false;
    finishedTitle.value = '';
    finishedMessage.value = '';
    errors.value = 0;
    showNewGameDialog.value = false;
    showMarkCellsDialog.value = false;

    save();
    saveChanges();
}

function getBlock(row: number, col: number) {
    row = Math.floor(row / 3);
    col = Math.floor(col / 3);
    return board.value.slice(row * 3, row * 3 + 3).map(line => line.slice(col * 3, col * 3 + 3));
}

function getBlockValues(row: number, col: number) {
    return getBlock(row, col).flat().map(cell => cell.value);
}

function getCellCandidates(row: number, col: number) {
    const possibleCandidates = [1, 2, 3, 4, 5, 6, 7, 8, 9];
    const block = getBlockValues(row, col);
    const boardRow = board.value[row].map(cell => cell.value);
    const boardCol = board.value.map(line => line[col].value);
    const candidates = possibleCandidates.filter(candidate => {
        return ![...boardCol, ...boardRow, ...block].includes(candidate);
    });
    return candidates;
}

function autoCandidate() {
    [0, 1, 2, 3, 4, 5, 6, 7, 8].map(row =>
        [0, 1, 2, 3, 4, 5, 6, 7, 8].map(col =>
            board.value[row][col].candidates = getCellCandidates(row, col)
        )
    );
    saveChanges();
}

function applyAutoCandidates(scope: 'selected' | 'all') {
    const cellsToProcess = scope === 'selected' ? selectedCell.value : board.value.flat();
    cellsToProcess.forEach(cell => {
        if (!cell.value) {
            cell.candidates = getCellCandidates(cell.coordinates.row, cell.coordinates.col);
            cell.candidateColors = undefined;
        }
    });
    saveChanges(); // Salva as alterações no localStorage
    save(); // Salva o estado atual do jogo
}

// Esta função decide se mostra o dialog ou aplica direto.
function handleAutoCandidateClick() {
    // Verifica se UMA OU MAIS células estão atualmente selecionadas
    if (selectedCell.value && selectedCell.value.length > 0) {
        // Se há células selecionadas, mostra o dialog de confirmação
        showAutoCandidateDialog.value = true;
    } else {
        // Se NENHUMA célula está selecionada, aplica candidatos a todo o tabuleiro diretamente
        applyAutoCandidates('all');
    }
}

function removeCandidateFromConnectedCells(value: number, row: number, col: number) {
    const block = getBlock(row, col).flat();
    const boardRow = board.value[row];
    const boardColumn = board.value.map(line => line[col]);
    [boardRow, boardColumn, block].flat().map(cell => {
        if (cell.type == 'candidate') {
            cell.candidates = cell.candidates.filter(candidate => candidate != value);
        }
    });
}

function getCount(value: number) {
    return board.value.flat().filter(cell => cell.value == value).length;
}

function highlightConnectedCells(row: number, col: number) {
    highlightedCells.value = [];
    const block = getBlock(row, col).flat();
    const boardRow = board.value[row];
    const boardColumn = board.value.map(line => line[col]);
    highlightedCells.value = [...block, ...boardRow, ...boardColumn];
}

function selectCell(row: number, col: number, fromClick: boolean = false, event: MouseEvent | null = null) {
    const clickedCell = board.value[row][col];

    // Verifica se Ctrl (ou Cmd no Mac) está pressionado ou se o modo multiselect está ativo
    const isCtrlPressed = event?.ctrlKey || event?.metaKey || false;
    const isMultiselectMode = isMultiselectChecked.value;

    // Determina o novo estado de selectedCell
    let newSelectedCell: Cell | Cell[] | null = null;

    if (isCtrlPressed || isMultiselectMode) {
        // Lógica para seleção múltipla (adicionar ou remover)
        if (Array.isArray(selectedCell.value)) {
            // Já é uma seleção múltipla, verifica se a célula clicada já está na lista
            const index = selectedCell.value.findIndex(cell => cell === clickedCell);
            if (index > -1) {
                // Célula clicada já está selecionada, remove dela
                newSelectedCell = selectedCell.value.filter(cell => cell !== clickedCell);
                if (newSelectedCell.length === 0) {
                    newSelectedCell = null; // Se a lista ficar vazia, a seleção é nula
                }
            } else {
                // Célula clicada não está selecionada, adiciona à lista existente
                newSelectedCell = [...selectedCell.value, clickedCell];
            }
        } else if (selectedCell.value === null) {
            // Nenhuma célula selecionada, inicia uma nova seleção múltipla com a célula clicada
            newSelectedCell = [clickedCell];
        } else {
            // Uma única célula estava selecionada, transforma em seleção múltipla
            // incluindo a célula previamente selecionada e a célula clicada.
            // Se a célula clicada for a mesma que já estava selecionada (e Ctrl+Click/Multiselect ativo),
            // deseleciona (toggle).
            if (selectedCell.value !== clickedCell) {
                newSelectedCell = [selectedCell.value, clickedCell];
            } else {
                // Clicou na mesma célula única selecionada com Ctrl ou Multiselect ativo, deseleciona.
                newSelectedCell = null;
            }
        }
    } else {
        // Lógica para seleção única (comportamento padrão sem Ctrl ou Multiselect ativo)
        // Se a célula clicada é a mesma que a única selecionada, deseleciona.
        if (selectedCell.value === clickedCell && !Array.isArray(selectedCell.value)) {
            newSelectedCell = null;
        } else {
            // Seleciona apenas a célula clicada, substituindo qualquer seleção anterior (única ou múltipla)
            newSelectedCell = clickedCell;
        }
    }

    // Atualiza o estado da ref selectedCell
    selectedCell.value = newSelectedCell;

    // Atualiza a seleção visual das células
    updateUISelection(selectedCell.value);

    save(); // Salva no localStorage
}

function applyMarkColorToSelection() {
    // Verifica se há células selecionadas (única ou múltipla)
    if (!selectedCell.value || (Array.isArray(selectedCell.value) && selectedCell.value.length === 0)) {
        showMarkCellsDialog.value = false; // Fecha o diálogo se não houver seleção
        return;
    }

    // Obtém as células a serem marcadas (única ou múltiplas)
    const cellsToMark = Array.isArray(selectedCell.value) ? selectedCell.value : [selectedCell.value];
    const colorToApply = markColor.value;

    // Aplica a cor a cada célula selecionada
    cellsToMark.forEach(cell => {
        // Encontra a referência reativa correta no board para garantir a atualização da UI
        const boardCell = board.value[cell.coordinates.row][cell.coordinates.col];
        boardCell.color = colorToApply;
    });

    saveChanges(); // Salva as mudanças de cor no histórico
    save(); // Salva no localStorage

    showMarkCellsDialog.value = false; // Fecha o diálogo após aplicar a cor
}

function promoteSingles() {
    [0, 1, 2, 3, 4, 5, 6, 7, 8].map(row =>
        [0, 1, 2, 3, 4, 5, 6, 7, 8].map(col => {
            const cell = board.value[row][col];
            if (cell.type == 'candidate' && cell.candidates.length == 1) {
                const value = cell.candidates[0];
                cell.value = value;
                cell.type = 'filled';
                let removeCandidates = true;
                if (autoCheckCells.value && cell.value != cell.answer) removeCandidates = false;
                if (removeCandidates) removeCandidateFromConnectedCells(value, row, col);
                handleStrikes(cell);
            }
        })
    );
    handleFinish();
    save();
    saveChanges();
}

function handleKeyUp(event: KeyboardEvent) {
    // Define quais teclas são consideradas "teclas de input" para valores/candidatos
    const isInputKey = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "Backspace", "Delete"].includes(event.key);

    // Se não houver célula selecionada OU a seleção for um array vazio, e for uma tecla de input, não faz nada.
    if ((!selectedCell.value || (Array.isArray(selectedCell.value) && selectedCell.value.length === 0)) && isInputKey) return;

    // --- Lógica para teclas de Input (Números, Backspace, Delete) ---
    if (isInputKey) {
        if (["Backspace", "Delete"].includes(event.key)) {
            clearCellValue();
        } else {
            setCellValue(parseInt(event.key));
        }
        return; // Sai da função após lidar com a entrada
    }

    // --- Lógica para atalhos de teclado não relacionados a input direto (Espaço, Ctrl+Z) ---
    if (event.key == ' ') {
        // Garante que modificadores não ativem o toggle de fillCandidates a menos que seja intencional
        if (!event.ctrlKey && !event.shiftKey && !event.altKey) {
            fillCandidates.value = !fillCandidates.value; // Alterna modo candidato/valor
            event.preventDefault(); // Previne o comportamento padrão da barra de espaço (rolar)
            return;
        }
    }

    if (event.ctrlKey && event.key == 'z') {
        undo(); // Desfaz a última ação
        event.preventDefault(); // Previne o comportamento padrão do navegador
        return;
    }

    // --- Lógica para teclas de Navegação (Setas) ---
    if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(event.key)) {

        const isCtrlPressed = event.ctrlKey || event.metaKey; // Verifica Ctrl ou Cmd
        const isShiftPressed = event.shiftKey;
        const isAltPressed = event.alttKey;
        const isMultiselectMode = isMultiselectChecked.value; // Verifica o checkbox de multiseleção
        const isExtendingSelection = isShiftPressed || isMultiselectMode; // Modo de extensão ativado

        let referenceCell: Cell | null = null;

        // Determina a célula de referência para calcular a PRÓXIMA célula.
        // Se houver seleção (única ou múltipla), usa a ÚLTIMA célula no array (ou a única) como referência.
        // Se não houver seleção alguma, começa de (0,0) como referência.
        if (Array.isArray(selectedCell.value) && selectedCell.value.length > 0) {
            // Se multiseleção, usa a última célula no array como referência para a navegação de extensão.
            referenceCell = selectedCell.value[selectedCell.value.length - 1];
        } else if (selectedCell.value !== null && !Array.isArray(selectedCell.value)) {
            // Se seleção única, usa essa célula como referência.
            referenceCell = selectedCell.value;
        } else {
            // Se não houver seleção alguma, a referência inicial é (0,0).
            referenceCell = board.value[0][0];
            // Se não houver seleção e estiver em modo de extensão (Shift ou checkbox), inicia a multiseleção com (0,0)
            if (isExtendingSelection && selectedCell.value === null) {
                selectedCell.value = [referenceCell];
                // Atualiza UI para a nova multiseleção inicial
                board.value.flat().forEach(cell => { cell.selected = false; });
                referenceCell.selected = true; // Marca a célula inicial como selecionada
                highlightedCells.value = []; // Limpa destaques conectados para multiseleção
                highlightValue.value = null;
                save(); // Salva o estado inicial da multiseleção
                event.preventDefault(); // Previne o scroll
                return; // Sai após iniciar a multiseleção
            }
        }

        if (!referenceCell) return;

        const moveMap = {
            ArrowUp: { row: -1, col: 0 },
            ArrowDown: { row: 1, col: 0 },
            ArrowLeft: { row: 0, col: -1 },
            ArrowRight: { row: 0, col: 1 }
        }

        const getNextCell = (currentCell: cell, direction: { row: number, col: number }, modifiers: { ctrl: bool; alt: bool }) => {
            const cycle = (value: number, step: number) => {
                if (step === 0) return value; // Se o passo for 0, retorna o valor atual
                const [limit, oposite] = (step > 0) ? [8, 0] : [0, 8];
                if (modifiers.ctrl) return limit;
                return (value === limit) ? oposite : value + step;
            }
            if (modifiers.alt) {
                let nextCell = board.value[cycle(currentCell.row, direction.row)][cycle(currentCell.col, direction.col)];
                let count = 0;
                while (!nextCell.type == 'candidate' && count < 8) {
                    nextCell = board.value[cycle(nextCell.row, direction.row)][cycle(nextCell.col, direction.col)];
                    count++;
                }
                return nextCell;
            }
            return board.value[cycle(currentCell.coordinates.row, direction.row)][cycle(currentCell.coordinates.col, direction.col)];
        }
        const nextCell = getNextCell(referenceCell, moveMap[event.key], { ctrl: isCtrlPressed, alt: isAltPressed }); // A célula para onde a navegação "iria"
        const [nextRow, nextCol] = [nextCell.coordinates.row, nextCell.coordinates.col];

        // --- Aplica a Lógica de Seleção baseada no Modo de Extensão vs. Ctrl ---
        if (isExtendingSelection) {
            // Se Shift OU Multiselect checkbox estiverem ativos (e Ctrl não estiver), EXTENDE a seleção.
            let currentSelectionArray = Array.isArray(selectedCell.value) ? selectedCell.value : (selectedCell.value !== null ? [selectedCell.value] : []);

            // Adiciona a nextCell ao array de seleção se ela não estiver lá.
            // Se a célula já estiver na seleção, remove e adiciona ela novamente para garantir que ela será o último elemento do array.
            currentSelectionArray = currentSelectionArray.filter(cell => cell !== nextCell);
            if (!currentSelectionArray.includes(nextCell)) selectedCell.value = [...currentSelectionArray, nextCell];

            // Atualiza highlight da UI para a seleção
            board.value.flat().forEach(cell => { cell.selected = false; }); // Clear all highlights
            if (selectedCell.value && Array.isArray(selectedCell.value)) {
                selectedCell.value.forEach(cell => {
                    const boardCell = board.value[cell.coordinates.row][cell.coordinates.col];
                    boardCell.selected = true; // Highlight selected cells
                });
            } else if (selectedCell.value !== null) { // Should not happen here if logic is correct
                const boardCell = board.value[selectedCell.value.coordinates.row][selectedCell.value.coordinates.col];
                boardCell.selected = true;
            }
            // Clear connected/value highlights for multi-selection
            highlightedCells.value = [];
            highlightValue.value = null;
        } else {
            selectCell(nextRow, nextCol);
        }

        save(); // Salva no local storage
        return; // Exit function after handling key
    }

    // If the key was not an input key, shortcut, or arrow key, allow default behavior.
}

function setCellValue(value: number) {
    // Verifica se há alguma célula selecionada (única ou múltipla)
    if (!selectedCell.value || (Array.isArray(selectedCell.value) && selectedCell.value.length === 0)) {
        return; // Nenhuma célula selecionada, não faz nada
    }

    // Cria um array de células para iterar, seja uma única célula ou o array de células selecionadas
    const cellsToUpdate = Array.isArray(selectedCell.value) ? selectedCell.value : [selectedCell.value];

    cellsToUpdate.forEach(cell => {
        // Não permite editar células 'given'
        if (cell.type == 'given') return; // Pula para a próxima célula se for 'given'

        if (fillCandidates.value) {
            // Modo Candidatos: Alterna o candidato 'value' em cada célula selecionada
            const candidateIndex = cell.candidates.indexOf(value);
            if (candidateIndex > -1) {
                // Candidato existe, remove
                cell.candidates.splice(candidateIndex, 1);
            } else {
                // Candidato não existe, adiciona e ordena
                cell.candidates.push(value);
                cell.candidates.sort((a, b) => a - b);
            }
        } else {
            // Modo Resposta: Define o valor 'value' em cada célula selecionada
            cell.value = value;
            cell.type = 'filled'; // Marca como célula preenchida

            // Lida com strikes se o modo de jogo for 'Three Strikes'
            if (gameMode.value === GameMode.ThreeStrikes) handleStrikes(cell);

            // Remove o candidato das células conectadas (linha, coluna, bloco)
            // Esta remoção só deve ocorrer se o valor definido não for um erro (se autoCheck estiver ativo).
            // Se o valor for um erro, ele deve permanecer como um candidato válido em outras células.
            let removeCandidates = !(autoCheckCells.value && cell.value !== cell.answer); // Não remove candidatos se o valor for um erro em modo autoCheck
            if (removeCandidates) removeCandidateFromConnectedCells(value, cell.coordinates.row, cell.coordinates.col);
        }
    });

    // Atualiza o highlightValue:
    // Se estiver em modo de valor (fillCandidates=false) e houver células selecionadas:
    // - Se for seleção única, highlightValue é o valor definido.
    // - Se for multiseleção, highlightValue pode ser o valor definido SE TODAS foram preenchidas com o MESMO valor.
    //   Se forem valores diferentes (embora a UI atual só permita setar um valor por vez), ou se a seleção for múltipla,
    //   limpar o highlightValue é mais seguro.
    if (!fillCandidates.value && cellsToUpdate.length > 0) {
        const allFilledWithSameValue = cellsToUpdate.every(cell => cell.value === value);
        highlightValue.value = allFilledWithSameValue ? value : null;
    } else {
        // Se estiver em modo candidato, o highlightValue normalmente segue a célula única selecionada.
        // Em multiseleção candidato, não há uma única célula para seguir, então limpamos.
        if (Array.isArray(selectedCell.value)) {
            highlightValue.value = null;
        } else if (selectedCell.value !== null) {
            // Se for seleção única em modo candidato, highlightValue segue o valor da célula (se houver)
            highlightValue.value = selectedCell.value.value;
        } else {
            highlightValue.value = null; // Nenhuma célula selecionada
        }
    }


    handleFinish(); // Verifica se o jogo terminou após as alterações
    saveChanges(); // Salva as mudanças no histórico de desfazer
    save(); // Salva o estado atual do jogo no armazenamento local
}

function clearCellValue() {
    // Verifica se há alguma célula selecionada (única ou múltipla)
    if (!selectedCell.value || (Array.isArray(selectedCell.value) && selectedCell.value.length === 0)) {
        return; // Nenhuma célula selecionada, não faz nada
    }

    // Cria um array de células para iterar
    const cellsToUpdate = Array.isArray(selectedCell.value) ? selectedCell.value : [selectedCell.value];

    cellsToUpdate.forEach(cell => {
        // Limpa o valor e define o tipo para 'candidate' a não ser que o tipo seja 'given'
        if (cell.type == 'given') return; // Pula para a próxima célula se for 'given'
        cell.value = null;
        cell.type = 'candidate';
    });

    highlightValue.value = null;

    saveChanges();
    save();
}

function esc() {
    selectedCell.value = null;
    highlightValue.value = null;
    highlightedCells.value = [];
    board.value.flat().forEach(cell => { cell.selected = false; });
    showMarkCellsDialog.value = false; // Fecha o diálogo de marcação
    isMultiselectChecked.value = false; // Sai do modo seleção multipla
    save(); // Salva no local storage
}

function possible(row: number, col: number, k: number) {
    for (let i = 0; i < 9; i++) {
        const m = 3 * Math.floor(row / 3) + Math.floor(i / 3);
        const n = 3 * Math.floor(col / 3) + i % 3;
        if (solution[row][i] == k || solution[i][col] == k || solution[m][n] == k) {
            return false;
        }
    }
    return true;
}

function solve() {
    for (let i = 0; i < 9; i++) {
        for (let j = 0; j < 9; j++) {
            if (!solution[i][j]) {
                for (let k = 1; k <= 9; k++) {
                    if (possible(i, j, k)) {
                        solution[i][j] = k;
                        if (solve()) {
                            return true;
                        } else {
                            solution[i][j] = 0;
                        }
                    }
                }
                return false;
            }
        }
    }
    return true;
}

function showSolution() {
    [0, 1, 2, 3, 4, 5, 6, 7, 8].map(row =>
        [0, 1, 2, 3, 4, 5, 6, 7, 8].map(col => {
            if (board.value[row][col].type != 'given') {
                board.value[row][col].value = solution[row][col];
                board.value[row][col].type = 'filled';
            }
        })
    );
    saveChanges();
}

function revealCell() {
    if (!selectedCell.value) return;
    if (selectedCell.value.type == 'given') return;
    selectedCell.value.value = selectedCell.value.answer;
    selectedCell.value.type = 'filled';
    removeCandidateFromConnectedCells(selectedCell.value.answer, selectedCell.value.coordinates.row, selectedCell.value.coordinates.col);
    saveChanges();
}

function checkCell() {
    if (!selectedCell.value) return;
    if (selectedCell.value.type == 'given') return;
    selectedCell.value.check = true;
}

function updateCheckCells() {
    [0, 1, 2, 3, 4, 5, 6, 7, 8].map(row =>
        [0, 1, 2, 3, 4, 5, 6, 7, 8].map(col => {
            board.value[row][col].check = autoCheckCells.value;
        })
    );
}

function isFinished() {
    return board.value.flat().filter(cell => [null, NaN, 0].includes(cell.value)).length == 0;
}

function handleFinish() {
    if (finished.value) return; // already finished (probably from handleStrikes())
    const allFilled = isFinished();
    if (allFilled) {
        if (autoCheckCells.value) {
            finishedStatus.value = board.value.flat().filter(cell => cell.value == cell.answer).length == 81;
            finishedTitle.value = finishedStatus.value ? 'Congratulations!' : 'Oops!';
            finishedMessage.value = finishedStatus.value ? 'Congratulations! You have successfully solved this Sudoku puzzle!' : 'It seems you have some mistakes in your solution! Try Again!';
        }
        finished.value = true;
    }
}

function handleStrikes(cell: Cell) {
    if (gameMode.value != GameMode.ThreeStrikes) return;
    if (cell.value != cell.answer) errors.value++;
    if (errors.value >= 3) {
        finishedStatus.value = false;
        finishedTitle.value = "Ooops! [3 STRIKES! YOU'RE OUT!]";
        finishedMessage.value = 'You have made 3 mistakes! Game Over!';
        finished.value = true;
    }
}

function hasSavedGame() {
    return localStorage.getItem('sudoku-currentGame') != null;
}

function hasSavedConfig() {
    return localStorage.getItem('sudoku-config') != null;
}

function save() {
    let localSave: any = {
        board: board.value,
        errors: errors.value,
    };
    localStorage.setItem('sudoku-currentGame', btoa(JSON.stringify(localSave)));
    let sudokuConfig = {
        autoCheckCells: autoCheckCells.value,
        gameMode: gameMode.value,
    };
    localStorage.setItem('sudoku-config', JSON.stringify(sudokuConfig));
}

function loadSave() {
    let localSave: any = JSON.parse(atob(localStorage.getItem('sudoku-currentGame') ?? ''));
    errors.value = localSave.errors;

    // Modifique o carregamento do tabuleiro para converter candidateColors de volta para Map
    board.value = localSave.board.map((row: any) =>
        row.map((cell: any) => {
            // Certifique-se de que candidateColors é um Map se existir, for um objeto plano e não for já um Map
            if (cell.candidateColors && typeof cell.candidateColors === 'object' && !(cell.candidateColors instanceof Map)) {
                // Converte o objeto plano de volta para um Map<number, string>
                // Object.entries() transforma { "5": "#RRGGBB" } em [ ["5", "#RRGGBB"] ]
                // O map transforma ["5", "#RRGGBB"] em [5, "#RRGGBB"] (parseando a chave para número)
                cell.candidateColors = new Map(Object.entries(cell.candidateColors).map(([key, value]) => [parseInt(key), value as string]));
            }
            // Adicione uma verificação de segurança para 'candidates' também, caso seja necessário deserializar
            if (cell.candidates && !Array.isArray(cell.candidates)) {
                cell.candidates = Object.values(cell.candidates).map(val => parseInt(val as any));
            }
            return cell as Cell; // Retorna a célula (agora com Map)
        })
    );

    // Se houver uma célula selecionada salva, re-selecione-a após carregar o tabuleiro
    if (localSave.selectedCell && localSave.selectedCell.coordinates) {
        const { row, col } = localSave.selectedCell.coordinates;
        // Encontre a célula correspondente no novo array do tabuleiro
        const cellToSelect = board.value[row][col];
        // Limpa seleções anteriores (garante apenas a célula correta selecionada)
        board.value.flat().forEach(c => c.selected = false);
        // Seleciona a célula carregada
        cellToSelect.selected = true;
        selectedCell.value = cellToSelect;
        highlightValue.value = cellToSelect.value; // Restaura o highlightValue
        // Re-aplica os destaques conectados para a célula selecionada
        highlightConnectedCells(row, col); // Assume que esta função existe

    } else {
        // Nenhuma célula selecionada salva
        selectedCell.value = null;
        highlightValue.value = null;
        highlightedCells.value = []; // Limpa todos os destaques conectados
        // Garante que nenhuma célula esteja marcada como selecionada
        board.value.flat().forEach(c => c.selected = false);
        // Limpa todos os destaques gerais (os do filtro serão reaplicados)
        board.value.flat().forEach(c => c.highlight = false);
    }

    // Re-aplica os destaques de filtro após carregar o tabuleiro
    filterCandidates(); // Assume que filterCandidates está acessível
}

function deleteSave() {
    localStorage.removeItem('sudoku-currentGame');
    localStorage.removeItem('sudoku-changes');
}

function loadConfig() {
    if (!hasSavedConfig()) return;
    let sudokuConfig = JSON.parse(localStorage.getItem('sudoku-config') ?? '{}');
    autoCheckCells.value = sudokuConfig.autoCheckCells;
    gameMode.value = sudokuConfig.gameMode;
}

function saveChanges() {
    let changes = JSON.parse(localStorage.getItem('sudoku-changes') ?? JSON.stringify([{ board: board.value, selectedCell: selectedCell.value }]));
    changes.push({ board: board.value, selectedCell: selectedCell.value });
    try {
        localStorage.setItem('sudoku-changes', JSON.stringify(changes));
    } catch (e) {
        // remove first five items from the changes array and try again
        changes = changes.slice(5);
        localStorage.setItem('sudoku-changes', JSON.stringify(changes));
    }
}

function undo() {
    let changes = JSON.parse(localStorage.getItem('sudoku-changes') ?? JSON.stringify([board.value]));
    let state = changes.pop();
    board.value = state.board;
    if (changes.length == 0) changes.push({ board: board.value, selectedCell: selectedCell.value });
    localStorage.setItem('sudoku-changes', JSON.stringify(changes));
}

/* ****************************FILTER************************************ */
function contains(cell: any, values: number[]): boolean {
    if (cell.value) return values.includes(cell.value);
    return cell.candidates.some(candidate => values.includes(candidate));
}

function containsAll(cell: any, values: number[]): boolean {
    // Check if the cell is a candidate cell and has candidates
    if (!cell.value && cell.candidates && cell.candidates.length > 0) {
        // Check if ALL values in the input array are included in the cell's candidates array
        return values.every(val => cell.candidates.includes(val));
    }
    // If not a candidate cell or doesn't have candidates, it doesn't contain all values
    return false;
}

function notContains(cell: any, values: number[]): boolean {
    if (cell.value) return !values.includes(cell.value);
    return !cell.candidates.some(candidate => values.includes(candidate));
}

function only(cell: any, values: number[]): boolean {
    if (cell.value) return values.length === 1 && cell.value === values[0];
    return cell.candidates.length === values.length && cell.candidates.every(candidate => values.includes(candidate));
}

// // Função para encontrar candidatos únicos (Hidden Singles) e retornar as células e os candidatos
// function findUniqueCandidates(board: Cell[][], universe: { rows: number[]; cols: number[]; blocks: number[] }): Array<{ cell: Cell, candidates: number[] }> {
//     const uniqueCandidateInfo: Array<{ cell: Cell, candidates: number[] }> = [];

//     board.forEach(row => {
//         row.forEach(cell => {
//             // Processa apenas células candidatas que estão dentro do universo especificado
//             const isCellInUniverse =
//                 (universe.rows.length === 0 || universe.rows.includes(cell.coordinates.row + 1)) &&
//                 (universe.cols.length === 0 || universe.cols.includes(cell.coordinates.col + 1)) &&
//                 (universe.blocks.length === 0 || universe.blocks.includes(getBlockNumber(cell.coordinates.row, cell.coordinates.col))); // Assume getBlockNumber está definida

//             if (isCellInUniverse && !cell.value && cell.candidates && cell.candidates.length > 0) {

//                 const { row: r, col: c } = cell.coordinates;
//                 const blockNumber = getBlockNumber(r, c);
//                 const uniqueCandsInCell: number[] = []; // Para armazenar os candidatos únicos encontrados nesta célula

//                 // Verifica cada candidato na célula
//                 for (const candidate of cell.candidates) {
//                     let isUniqueInRelevantUnit = false; // Flag para saber se o candidato é único em *alguma* unidade relevante

//                     // 1. Verificar unicidade na LINHA (se a linha estiver no universo OU se não houver restrição de linhas)
//                     if (universe.rows.length === 0 || universe.rows.includes(r + 1)) {
//                         let foundOtherCellWithCandidate = false;
//                         for (let cc = 0; cc < 9; cc++) {
//                             const otherCell = board[r][cc];
//                             if (otherCell !== cell && !otherCell.value && otherCell.candidates && otherCell.candidates.includes(candidate)) {
//                                 foundOtherCellWithCandidate = true;
//                                 break; // Encontramos outra célula com o mesmo candidato na linha
//                             }
//                         }
//                         if (!foundOtherCellWithCandidate) {
//                             isUniqueInRelevantUnit = true; // O candidato é único nesta linha relevante
//                         }
//                     }

//                     // Se for único em uma unidade relevante, adiciona e passa para o próximo candidato desta célula
//                     if (isUniqueInRelevantUnit) {
//                         uniqueCandsInCell.push(candidate);
//                         continue;
//                     }

//                     // 2. Verificar unicidade na COLUNA (se a coluna estiver no universo OU sem restrição)
//                     if (universe.cols.length === 0 || universe.cols.includes(c + 1)) {
//                         let foundOtherCellWithCandidate = false;
//                         for (let rr = 0; rr < 9; rr++) {
//                             const otherCell = board[rr][c];
//                             if (otherCell !== cell && !otherCell.value && otherCell.candidates && otherCell.candidates.includes(candidate)) {
//                                 foundOtherCellWithCandidate = true;
//                                 break; // Encontramos outra célula com o mesmo candidato na coluna
//                             }
//                         }
//                         if (!foundOtherCellWithCandidate) {
//                             isUniqueInRelevantUnit = true; // O candidato é único nesta coluna relevante
//                         }
//                     }

//                     if (isUniqueInRelevantUnit) {
//                         uniqueCandsInCell.push(candidate);
//                         continue;
//                     }

//                     // 3. Verificar unicidade no BLOCO (se o bloco estiver no universo OU sem restrição)
//                     if (universe.blocks.length === 0 || universe.blocks.includes(blockNumber)) {
//                         let foundOtherCellWithCandidate = false;
//                         const blockRowStart = Math.floor(r / 3) * 3;
//                         const blockColStart = Math.floor(c / 3) * 3;
//                         for (let br = blockRowStart; br < blockRowStart + 3; br++) {
//                             for (let bc = blockColStart; bc < blockColStart + 3; bc++) {
//                                 const otherCell = board[br][bc];
//                                 if (otherCell !== cell && !otherCell.value && otherCell.candidates && otherCell.candidates.includes(candidate)) {
//                                     foundOtherCellWithCandidate = true;
//                                     break;
//                                 }
//                             }
//                             if (foundOtherCellWithCandidate) break;
//                         }
//                         if (!foundOtherCellWithCandidate) {
//                             isUniqueInRelevantUnit = true; // O candidato é único neste bloco relevante
//                         }
//                     }

//                     // Se chegou até aqui e isUniqueInRelevantUnit é true, significa que é único em pelo menos uma unidade relevante
//                     if (isUniqueInRelevantUnit) {
//                         uniqueCandsInCell.push(candidate);
//                     }
//                 }

//                 // Se algum candidato nesta célula foi encontrado como único em uma unidade relevante, adiciona a informação
//                 if (uniqueCandsInCell.length > 0) {
//                     uniqueCandidateInfo.push({ cell: cell, candidates: uniqueCandsInCell });
//                 }
//             }
//         });
//     });

//     return uniqueCandidateInfo; // Retorna a lista de células e os candidatos únicos encontrados em cada uma
// }

/**
 * Encontra Candidatos Únicos (Hidden Singles) no tabuleiro dentro das unidades especificadas pelo universo.
 * Utiliza a função auxiliar findUniqueCellForCandidateInCells.
 * @param board O tabuleiro Sudoku.
 * @param universe O objeto universo contendo as restrições de linhas, colunas e blocos.
 * @returns Uma lista de objetos, onde cada objeto representa um Candidato Único com sua célula e o candidato.
 */
function findUniqueCandidates(board: Cell[][], universe: { rows: number[]; cols: number[]; blocks: number[] }): Array<{ cell: Cell, candidates: number[] }> {
    const uniqueCandidatesFound: Array<{ cell: Cell, candidates: number[] }> = [];
    // Usamos um Set para rastrear pares célula-candidato únicos já adicionados, para evitar duplicatas
    // (ex: um candidato pode ser único tanto na linha quanto no bloco da mesma célula)
    const addedUniquePairs = new Set<string>(); // Formato da chave: `row-col-candidate`

    // Função auxiliar que encontra a célula contendo um CANDIDATO ESPECÍFICO se ele for único em uma lista de células
    // Retorna a célula onde o candidato é único se encontrado, caso contrário, retorna null.
    const findUniqueCellForCandidateInCells = (candidate: number, cells: Cell[]): Cell | null => {
        let count = 0;
        let uniqueCell: Cell | null = null;
        for (const cell of cells) {
            // Considera apenas células vazias/candidatas
            if (!cell.value && cell.candidates && cell.candidates.includes(candidate)) {
                count++;
                uniqueCell = cell; // Guarda a referência para a célula que possui este candidato
            }
        }
        // Se o candidato apareceu exatamente uma vez no array de células fornecido, retorna a célula onde ele foi encontrado.
        // Caso contrário (0 vezes ou mais de 1 vez), retorna null.
        return count === 1 ? uniqueCell : null;
    };

    // Função auxiliar para verificar uma única unidade (linha, coluna ou bloco) por Candidatos Únicos
    const checkUnitForUniqueCandidates = (unitCells: Cell[]) => {
        // Precisamos verificar cada número candidato possível (de 1 a 9)
        for (let candidate = 1; candidate <= 9; candidate++) {
            // Usa a nova função auxiliar para verificar se este candidato específico é único nesta unidade
            const uniqueCell = findUniqueCellForCandidateInCells(candidate, unitCells);

            // Se a função auxiliar retornou uma célula, significa que este candidato é um Candidato Único nesta unidade.
            if (uniqueCell) {
                // Cria uma chave única para identificar este par célula-candidato específico
                const key = `${uniqueCell.coordinates.row}-${uniqueCell.coordinates.col}-${candidate}`;

                // Adiciona o Candidato Único aos resultados apenas se este par célula-candidato
                // (o candidato 'candidate' na célula 'uniqueCell') ainda não tiver sido adicionado.
                if (!addedUniquePairs.has(key)) {
                    uniqueCandidatesFound.push({ cell: uniqueCell, candidates: [candidate] });
                    addedUniquePairs.add(key); // Marca este par célula-candidato como adicionado
                }
            }
        }
    };

    // Verifica as Linhas dentro do universo especificado (ou todas se o universo de linhas for vazio)
    for (let r = 0; r < 9; r++) {
        if (universe.rows.length === 0 || universe.rows.includes(r + 1)) {
            checkUnitForUniqueCandidates(getUnitCells(board, 'row', r));
        }
    }

    // Verifica as Colunas dentro do universo especificado (ou todas se o universo de colunas for vazio)
    for (let c = 0; c < 9; c++) {
        if (universe.cols.length === 0 || universe.cols.includes(c + 1)) {
            checkUnitForUniqueCandidates(getUnitCells(board, 'col', c));
        }
    }

    // Verifica os Blocos dentro do universo especificado (ou todos se o universo de blocos for vazio)
    for (let blockIndex = 0; blockIndex < 9; blockIndex++) { // Índices de bloco 0-8
        if (universe.blocks.length === 0 || universe.blocks.includes(blockIndex + 1)) { // Universo usa números de bloco 1-9
            checkUnitForUniqueCandidates(getUnitCells(board, 'block', blockIndex));
        }
    }

    // Retorna a lista de Candidatos Únicos encontrados
    return uniqueCandidatesFound;
}

/**
 * Encontra Pares Nus (Naked Pairs) no tabuleiro dentro das unidades especificadas pelo universo, retornando instâncias.
 * @param board O tabuleiro Sudoku.
 * @param universe O objeto universo contendo as restrições de linhas, colunas e blocos.
 * @returns Uma lista de objetos, onde cada objeto representa uma instância de Naked Pair com suas células e candidatos.
 */
function findNakedPairs(board: Cell[][], universe: { rows: number[]; cols: number[]; blocks: number[] }): Array<{ cells: Cell[], candidates: number[] }> {
    // Lista para armazenar as instâncias de Pares Nus encontradas.
    // Cada item será um objeto { cells: [cell1, cell2], candidates: [cand1, cand2] }
    const nakedPairInstances: Array<{ cells: Cell[], candidates: number[] }> = [];
    // Usamos um Set para rastrear pares de células (instâncias) já adicionados, para evitar adicionar a mesma instância de Naked Pair mais de uma vez (por exemplo, se for encontrada em uma linha e em um bloco simultaneamente - embora raro com Naked Pairs).
    // Criamos uma chave única para cada par de células e candidatos para garantir a unicidade da instância.
    const addedInstances = new Set<string>();


    // Função auxiliar para verificar uma única unidade (linha, coluna ou bloco) por Pares Nus
    const checkUnitForNakedPairs = (unitCells: Cell[]) => {
        // Filtra apenas as células que são vazias (valor null ou 0), têm candidatos
        // e cujo número de candidatos é EXATAMENTE 2 (requisito para Naked Pairs).
        const candidateCellsInUnit = unitCells.filter(cell =>
            !cell.value &&
            cell.candidates &&
            cell.candidates.length === 2
        );

        // Precisamos de pelo menos 2 células candidatas com 2 candidatos nesta unidade
        if (candidateCellsInUnit.length < 2) {
            return;
        }

        // Itera por todos os pares distintos de células candidatas com 2 candidatos na unidade
        for (let i = 0; i < candidateCellsInUnit.length; i++) {
            const cell1 = candidateCellsInUnit[i];

            for (let j = i + 1; j < candidateCellsInUnit.length; j++) {
                const cell2 = candidateCellsInUnit[j];

                // Verifica se as duas células têm EXATAMENTE o mesmo par de candidatos.
                // Usamos slice() antes de sort() para não modificar o array original.
                // Comparar a representação string de arrays ordenados verifica se os conjuntos de candidatos são iguais.
                if (cell1.candidates.slice().sort().toString() === cell2.candidates.slice().sort().toString()) {
                    // Encontramos uma instância de Naked Pair!
                    const nakedCandidates = cell1.candidates.slice().sort(); // O par de candidatos (ordenado)
                    // Ordenamos as células por coordenadas para criar uma chave de instância consistente
                    const pairCells = [cell1, cell2].sort((a, b) => {
                        if (a.coordinates.row !== b.coordinates.row) return a.coordinates.row - b.coordinates.row;
                        return a.coordinates.col - b.coordinates.col;
                    });

                    // Cria uma chave única para esta instância do par de células com esses candidatos
                    const instanceKey = `${pairCells[0].coordinates.row}-${pairCells[0].coordinates.col}-${pairCells[1].coordinates.row}-${pairCells[1].coordinates.col}-${nakedCandidates.join(',')}`;

                    // Adiciona a instância à lista se ainda não foi adicionada
                    if (!addedInstances.has(instanceKey)) {
                        nakedPairInstances.push({ cells: pairCells, candidates: nakedCandidates });
                        addedInstances.add(instanceKey); // Marca a instância como adicionada
                    }
                }
            }
        }
    };

    // Verifica as Linhas dentro do universo especificado
    for (let r = 0; r < 9; r++) {
        if (universe.rows.length === 0 || universe.rows.includes(r + 1)) {
            checkUnitForNakedPairs(getUnitCells(board, 'row', r));
        }
    }

    // Verifica as Colunas dentro do universo especificado
    for (let c = 0; c < 9; c++) {
        if (universe.cols.length === 0 || universe.cols.includes(c + 1)) {
            checkUnitForNakedPairs(getUnitCells(board, 'col', c));
        }
    }

    // Verifica os Blocos dentro do universo especificado
    for (let blockIndex = 0; blockIndex < 9; blockIndex++) { // Índices de bloco 0-8
        if (universe.blocks.length === 0 || universe.blocks.includes(blockIndex + 1)) { // Universo usa números de bloco 1-9
            checkUnitForNakedPairs(getUnitCells(board, 'block', blockIndex));
        }
    }

    // Retorna a lista de instâncias distintas de Naked Pairs encontradas
    return nakedPairInstances;
}

/**
 * Encontra Trios Nus (Naked Triples) no tabuleiro dentro das unidades especificadas pelo universo, retornando instâncias.
 * @param board O tabuleiro Sudoku.
 * @param universe O objeto universo contendo as restrições de linhas, colunas e blocos.
 * @returns Uma lista de objetos, onde cada objeto representa uma instância de Trio Nu com suas células e candidatos.
 */
function findNakedTriples(board: Cell[][], universe: { rows: number[]; cols: number[]; blocks: number[] }): Array<{ cells: Cell[], candidates: number[] }> {
    // Lista para armazenar as instâncias de Trios Nus encontradas.
    // Cada item será um objeto { cells: [cell1, cell2, cell3], candidates: [cand1, cand2, cand3] }
    const nakedTripleInstances: Array<{ cells: Cell[], candidates: number[] }> = [];
    // Usamos um Set para rastrear trios de células (instâncias) já adicionados, para evitar adicionar a mesma instância mais de uma vez.
    // Criamos uma chave única para cada trio de células e candidatos para garantir a unicidade da instância.
    const addedInstances = new Set<string>();


    // Função auxiliar para verificar uma única unidade (linha, coluna ou bloco) por Trios Nus
    const checkUnitForNakedTriples = (unitCells: Cell[]) => {
        // Filtra apenas as células que são vazias (valor null ou 0), têm candidatos
        // e cujo número de candidatos é <= 3 (células em um Naked Triple têm 2 ou 3 candidatos).
        const candidateCellsInUnit = unitCells.filter(cell =>
            !cell.value &&
            cell.candidates &&
            cell.candidates.length >= 2 && cell.candidates.length <= 3 // Células em um Naked Triple têm 2 ou 3 candidatos
        );

        // Precisamos de pelo menos 3 células candidatas com 2 ou 3 candidatos nesta unidade
        if (candidateCellsInUnit.length < 3) {
            return;
        }

        // Itera por todas as combinações possíveis de 3 células distintas na lista de células candidatas da unidade
        for (let i = 0; i < candidateCellsInUnit.length; i++) {
            const cell1 = candidateCellsInUnit[i];

            for (let j = i + 1; j < candidateCellsInUnit.length; j++) {
                const cell2 = candidateCellsInUnit[j];

                for (let k = j + 1; k < candidateCellsInUnit.length; k++) {
                    const cell3 = candidateCellsInUnit[k];

                    // Calcula a união dos candidatos dessas três células
                    const combinedCandidatesSet = new Set<number>();
                    cell1.candidates.forEach(c => combinedCandidatesSet.add(c));
                    cell2.candidates.forEach(c => combinedCandidatesSet.add(c));
                    cell3.candidates.forEach(c => combinedCandidatesSet.add(c));

                    // Se o tamanho da união for EXATAMENTE 3, encontramos uma instância de Trio Nu!
                    if (combinedCandidatesSet.size === 3) {
                        const nakedCandidates = Array.from(combinedCandidatesSet).sort((a, b) => a - b); // Os 3 candidatos do trio (ordenados)
                        // Ordenamos as células por coordenadas para criar uma chave de instância consistente
                        const tripleCells = [cell1, cell2, cell3].sort((a, b) => {
                            if (a.coordinates.row !== b.coordinates.row) return a.coordinates.row - b.coordinates.row;
                            return a.coordinates.col - b.coordinates.col;
                        });

                        // Cria uma chave única para esta instância do trio de células com esses candidatos
                        const instanceKey = `${tripleCells[0].coordinates.row}-${tripleCells[0].coordinates.col}-${tripleCells[1].coordinates.row}-${tripleCells[1].coordinates.col}-${tripleCells[2].coordinates.row}-${tripleCells[2].coordinates.col}-${nakedCandidates.join(',')}`;


                        // Adiciona a instância à lista se ainda não foi adicionada
                        if (!addedInstances.has(instanceKey)) {
                            nakedTripleInstances.push({ cells: tripleCells, candidates: nakedCandidates });
                            addedInstances.add(instanceKey); // Marca a instância como adicionada
                        }
                    }
                }
            }
        }
    };

    // Verifica as Linhas dentro do universo especificado (ou todas se o universo de linhas for vazio)
    for (let r = 0; r < 9; r++) {
        if (universe.rows.length === 0 || universe.rows.includes(r + 1)) {
            checkUnitForNakedTriples(getUnitCells(board, 'row', r));
        }
    }

    // Verifica as Colunas dentro do universo especificado (ou todas se o universo de colunas for vazio)
    for (let c = 0; c < 9; c++) {
        if (universe.cols.length === 0 || universe.cols.includes(c + 1)) {
            checkUnitForNakedTriples(getUnitCells(board, 'col', c));
        }
    }

    // Verifica os Blocos dentro do universo especificado (ou todos se o universo de blocos for vazio)
    for (let blockIndex = 0; blockIndex < 9; blockIndex++) { // Índices de bloco 0-8
        if (universe.blocks.length === 0 || universe.blocks.includes(blockIndex + 1)) { // Universo usa números de bloco 1-9
            checkUnitForNakedTriples(getUnitCells(board, 'block', blockIndex));
        }
    }

    // Retorna a lista de instâncias distintas de Naked Triples encontradas
    return nakedTripleInstances;
}

// Helper function to get cells in a specific row, column, or block
function getUnitCells(board: Cell[][], type: 'row' | 'col' | 'block', index: number): Cell[] {
    if (type === 'row') {
        return board[index];
    } else if (type === 'col') {
        return board.map(row => row[index]);
    } else if (type === 'block') {
        const blockRowStart = Math.floor(index / 3) * 3;
        const blockColStart = (index % 3) * 3;
        const blockCells: Cell[] = [];
        for (let r = 0; r < 3; r++) {
            for (let c = 0; c < 3; c++) {
                blockCells.push(board[blockRowStart + r][blockColStart + c]);
            }
        }
        return blockCells;
    }
    return []; // Should not happen
}

/**
 * Encontra Pares Ocultos (Hidden Pairs) no tabuleiro dentro das unidades especificadas pelo universo, retornando instâncias.
 * @param board O tabuleiro Sudoku.
 * @param universe O objeto universo contendo as restrições de linhas, colunas e blocos.
 * @returns Uma lista de objetos, onde cada objeto representa uma instância de Par Oculto com suas células e candidatos.
 */
function findHiddenPairs(board: Cell[][], universe: { rows: number[]; cols: number[]; blocks: number[] }): Array<{ cells: Cell[], candidates: number[] }> {
    // Lista para armazenar as instâncias de Pares Ocultos encontradas.
    // Cada item será um objeto { cells: [cell1, cell2], candidates: [cand1, cand2] }
    const hiddenPairInstances: Array<{ cells: Cell[], candidates: number[] }> = [];
    // Usamos um Set para rastrear pares de células (instâncias) já adicionados, para evitar adicionar a mesma instância mais de uma vez.
    // Criamos uma chave única para cada par de células e candidatos para garantir a unicidade da instância.
    const addedInstances = new Set<string>();


    // Função auxiliar para verificar uma única unidade (linha, coluna ou bloco) por Pares Ocultos
    const checkUnitForHiddenPairs = (unitCells: Cell[]) => {
        // Filtra apenas as células que são vazias (valor null ou 0) e têm candidatos.
        // Células em Pares Ocultos podem ter mais de 2 candidatos inicialmente.
        const candidateCellsInUnit = unitCells.filter(cell => !cell.value && cell.candidates && cell.candidates.length > 0);

        // Precisamos de pelo menos 2 células candidatas na unidade
        if (candidateCellsInUnit.length < 2) {
            return;
        }

        // Itera por todos os pares possíveis de candidatos (1 a 9)
        for (let cand1 = 1; cand1 <= 9; cand1++) {
            for (let cand2 = cand1 + 1; cand2 <= 9; cand2++) {

                // Encontra todas as células candidatas na unidade que contêm cand1
                const cellsWithCand1 = candidateCellsInUnit.filter(cell => cell.candidates.includes(cand1));
                // Encontra todas as células candidatas na unidade que contêm cand2
                const cellsWithCand2 = candidateCellsInUnit.filter(cell => cell.candidates.includes(cand2));

                // Para ser um Hidden Pair (cand1, cand2):
                // 1. Exatamente 2 células candidatas na unidade devem conter cand1.
                // 2. Exatamente 2 células candidatas na unidade devem conter cand2.
                // 3. As duas células que contêm cand1 devem ser as MESMAS duas células que contêm cand2.

                if (cellsWithCand1.length === 2 && cellsWithCand2.length === 2) {
                    // Verifica se o conjunto de células que contém cand1 é idêntico ao conjunto de células que contém cand2.
                    const areSetsEqual = cellsWithCand1.every(cell => cellsWithCand2.includes(cell)) &&
                        cellsWithCand2.every(cell => cellsWithCand1.includes(cell));

                    if (areSetsEqual) {
                        // Encontramos uma instância de Hidden Pair para os candidatos (cand1, cand2) nessas duas células!
                        const pairCells = cellsWithCand1.sort((a, b) => { // Ordenamos as células por coordenadas para uma chave consistente
                            if (a.coordinates.row !== b.coordinates.row) return a.coordinates.row - b.coordinates.row;
                            return a.coordinates.col - b.coordinates.col;
                        });
                        const hiddenCandidates = [cand1, cand2].sort((a, b) => a - b); // Os candidatos ocultos (ordenados)

                        // Cria uma chave única para esta instância do par de células com esses candidatos
                        const instanceKey = `${pairCells[0].coordinates.row}-${pairCells[0].coordinates.col}-${pairCells[1].coordinates.row}-${pairCells[1].coordinates.col}-${hiddenCandidates.join(',')}`;


                        // Adiciona a instância à lista se ainda não foi adicionada
                        if (!addedInstances.has(instanceKey)) {
                            hiddenPairInstances.push({ cells: pairCells, candidates: hiddenCandidates });
                            addedInstances.add(instanceKey); // Marca a instância como adicionada
                        }
                    }
                }
            }
        }
    };

    // Check Rows within the universe
    for (let r = 0; r < 9; r++) {
        if (universe.rows.length === 0 || universe.rows.includes(r + 1)) {
            checkUnitForHiddenPairs(getUnitCells(board, 'row', r));
        }
    }

    // Check Columns within the universe
    for (let c = 0; c < 9; c++) {
        if (universe.cols.length === 0 || universe.cols.includes(c + 1)) {
            checkUnitForHiddenPairs(getUnitCells(board, 'col', c));
        }
    }

    // Check Blocks within the universe
    for (let blockIndex = 0; blockIndex < 9; blockIndex++) { // Block index 0-8
        if (universe.blocks.length === 0 || universe.blocks.includes(blockIndex + 1)) { // Universe blocks are 1-9
            checkUnitForHiddenPairs(getUnitCells(board, 'block', blockIndex));
        }
    }

    // Retorna a lista de instâncias distintas de Pares Ocultos encontradas
    return hiddenPairInstances;
}

/**
 * Encontra Trios Ocultos (Hidden Triples) no tabuleiro dentro das unidades especificadas pelo universo, retornando instâncias.
 * @param board O tabuleiro Sudoku.
 * @param universe O objeto universo contendo as restrições de linhas, colunas e blocos.
 * @returns Uma lista de objetos, onde cada objeto representa uma instância de Trio Oculto com suas células e candidatos.
 */
function findHiddenTriples(board: Cell[][], universe: { rows: number[]; cols: number[]; blocks: number[] }): Array<{ cells: Cell[], candidates: number[] }> {
    // Lista para armazenar as instâncias de Trios Ocultos encontradas.
    // Cada item será um objeto { cells: [cell1, cell2, cell3], candidates: [cand1, cand2, cand3] }
    const hiddenTripleInstances: Array<{ cells: Cell[], candidates: number[] }> = [];
    // Usamos um Set para rastrear trios de células (instâncias) já adicionados, para evitar adicionar a mesma instância mais de uma vez.
    // Criamos uma chave única para cada trio de células e candidatos para garantir a unicidade da instância.
    const addedInstances = new Set<string>();


    // Função auxiliar para verificar uma única unidade (linha, coluna ou bloco) por Trios Ocultos
    // Função auxiliar para verificar uma única unidade (linha, coluna ou bloco) por Trios Ocultos
    const checkUnitForHiddenTriples = (unitCells: Cell[]) => {
        // Filtra apenas as células que são vazias (valor null ou 0) e têm candidatos.
        const candidateCellsInUnit = unitCells.filter(cell => !cell.value && cell.candidates && cell.candidates.length > 0); // [cite: 515]
        // Precisamos de pelo menos 3 células candidatas na unidade
        if (candidateCellsInUnit.length < 3) return; // [cite: 516]

        // Itera por todas as combinações possíveis de 3 candidatos (1 a 9)
        for (let cand1 = 1; cand1 <= 9; cand1++) {
            for (let cand2 = cand1 + 1; cand2 <= 9; cand2++) {
                for (let cand3 = cand2 + 1; cand3 <= 9; cand3++) { // [cite: 517]
                    const tripleCandidates = [cand1, cand2, cand3];

                    // Encontra todas as células candidatas na unidade que contêm PELO MENOS UM desses três candidatos
                    const cellsWithAnyOfTheTriple = candidateCellsInUnit.filter(cell =>
                        tripleCandidates.some(cand => cell.candidates.includes(cand))
                    ); // Similar a [cite: 518]

                    // 1ª Verificação: Precisamos que EXATAMENTE 3 células contenham algum dos nossos candidatos
                    if (cellsWithAnyOfTheTriple.length === 3) { // [cite: 523]
                        // As 3 células potencialmente formadoras do Hidden Triple
                        const potentialTripleCells = cellsWithAnyOfTheTriple;

                        // 2ª Verificação (CRUCIAL - A CORREÇÃO):
                        // Verifica se os candidatos cand1, cand2, cand3 NÃO aparecem em NENHUMA OUTRA célula candidata da unidade.
                        let foundCandidateOutsidePotentialCells = false;
                        for (const otherCell of candidateCellsInUnit) {
                            // Se a 'otherCell' NÃO está no nosso grupo potencial de 3 células...
                            if (!potentialTripleCells.includes(otherCell)) {
                                // ...verifica se ela contém ALGUM dos nossos 3 candidatos.
                                if (tripleCandidates.some(cand => otherCell.candidates.includes(cand))) {
                                    foundCandidateOutsidePotentialCells = true;
                                    break; // Encontrou um dos candidatos fora do trio potencial, não é um Hidden Triple
                                }
                            }
                        }

                        // Se nenhum dos candidatos foi encontrado fora das 3 células potenciais, É um Hidden Triple!
                        if (!foundCandidateOutsidePotentialCells) {
                            const tripleCells = potentialTripleCells.sort((a, b) => { // Ordenamos as células por coordenadas para uma chave consistente [cite: 524]
                                if (a.coordinates.row !== b.coordinates.row) return a.coordinates.row - b.coordinates.row;
                                return a.coordinates.col - b.coordinates.col;
                            }); // [cite: 525]
                            const hiddenCandidates = tripleCandidates.sort((a, b) => a - b); // [cite: 525] (já está ordenado pela forma como iteramos)

                            // Cria uma chave única para esta instância do trio de células com esses candidatos
                            const instanceKey = `${tripleCells[0].coordinates.row}-${tripleCells[0].coordinates.col}-${tripleCells[1].coordinates.row}-${tripleCells[1].coordinates.col}-${tripleCells[2].coordinates.row}-${tripleCells[2].coordinates.col}-${hiddenCandidates.join(',')}`; // [cite: 526]
                            // Adiciona a instância à lista se ainda não foi adicionada
                            if (!addedInstances.has(instanceKey)) { // [cite: 527]
                                console.log("HIDDEN TRIPLE", { cells: tripleCells, candidates: hiddenCandidates });
                                hiddenTripleInstances.push({ cells: tripleCells, candidates: hiddenCandidates }); // [cite: 527]
                                addedInstances.add(instanceKey); // Marca a instância como adicionada [cite: 528]
                            }
                        }
                    }
                }
            }
        }
    }; // Fim de checkUnitForHiddenTriples

    // Check Rows within the universe
    for (let r = 0; r < 9; r++) {
        if (universe.rows.length === 0 || universe.rows.includes(r + 1)) {
            checkUnitForHiddenTriples(getUnitCells(board, 'row', r));
        }
    }

    // Check Columns within the universe
    for (let c = 0; c < 9; c++) {
        if (universe.cols.length === 0 || universe.cols.includes(c + 1)) {
            checkUnitForHiddenTriples(getUnitCells(board, 'col', c));
        }
    }

    // Check Blocks within the universe
    for (let blockIndex = 0; blockIndex < 9; blockIndex++) { // Block index 0-8
        if (universe.blocks.length === 0 || universe.blocks.includes(blockIndex + 1)) { // Universe blocks are 1-9
            checkUnitForHiddenTriples(getUnitCells(board, 'block', blockIndex));
        }
    }

    // Retorna a lista de instâncias distintas de Trios Ocultos encontradas
    return hiddenTripleInstances;
}

/**
 * Encontra X-Wings no tabuleiro dentro das unidades relevantes especificadas pelo universo, agrupados por candidato.
 * @param board O tabuleiro Sudoku.
 * @param universe O objeto universo contendo as restrições de linhas, colunas e blocos.
 * @returns Um Map onde a chave é o candidato do X-Wing e o valor é uma lista de células que formam X-Wings para esse candidato.
 */
function findXWing(board: Cell[][], universe: { rows: number[]; cols: number[]; blocks: number[] }): Map<number, Cell[]> {
    // Usamos um Map para agrupar as células dos X-Wings pelo candidato que forma o X-Wing.
    // A chave é o candidato (number) e o valor é uma lista das células (Cell[]) que contêm esse candidato e fazem parte de um X-Wing para ele.
    const xWingsByCandidate: Map<number, Cell[]> = new Map();

    // Contagem de candidatos por linha e coluna, considerando apenas células candidatas
    const candidateCountsByRow: { [key: number]: { [key: number]: number[] } } = {}; // { row: { candidate: [col1, col2, ...] } }
    const candidateCountsByCol: { [key: number]: { [key: number]: number[] } } = {}; // { col: { candidate: [row1, row2, ...] } }

    // Analisa candidatos por linha para linhas dentro do universo especificado
    board.forEach((row, rowIndex) => {
        // Considera apenas linhas dentro do universo ou se nenhum universo de linha for especificado
        if (universe.rows.length === 0 || universe.rows.includes(rowIndex + 1)) {
            row.forEach((cell, colIndex) => {
                // Considera apenas células candidatas (valor é null ou 0)
                if (!cell.value && cell.candidates && cell.candidates.length > 0) {
                    cell.candidates.forEach(candidate => {
                        if (!candidateCountsByRow[rowIndex]) {
                            candidateCountsByRow[rowIndex] = {};
                        }
                        if (!candidateCountsByRow[rowIndex][candidate]) {
                            candidateCountsByRow[rowIndex][candidate] = [];
                        }
                        candidateCountsByRow[rowIndex][candidate].push(colIndex);
                    });
                }
            });
        }
    });

    // Identifica X-Wings baseados nas linhas e agrupa as células por candidato
    for (const row1 in candidateCountsByRow) {
        for (const candidateStr in candidateCountsByRow[row1]) {
            const candidate = parseInt(candidateStr); // O candidato que forma o X-Wing
            // Procura por candidatos que aparecem em exatamente 2 posições na linha row1
            if (candidateCountsByRow[row1][candidateStr].length === 2) {
                const cols1 = candidateCountsByRow[row1][candidateStr]; // As duas colunas na linha row1

                // Procura por outra linha (row2) que também está no universo (ou sem universo de linha)
                // e tem o mesmo candidato nas mesmas duas colunas.
                for (const row2 in candidateCountsByRow) {
                    // Garante que row2 é diferente de row1 e está dentro do universo (se especificado)
                    if (parseInt(row2) > parseInt(row1) && (universe.rows.length === 0 || universe.rows.includes(parseInt(row2) + 1)) && candidateCountsByRow[row2] && candidateCountsByRow[row2][candidateStr]?.length === 2) {
                        const cols2 = candidateCountsByRow[row2][candidateStr]; // As duas colunas na linha row2

                        // Verifica se os índices das colunas são os mesmos para ambas as linhas
                        if (cols1[0] === cols2[0] && cols1[1] === cols2[1]) {
                            // Encontramos um X-Wing baseado em linha para este candidato!
                            const row1Index = parseInt(row1);
                            const row2Index = parseInt(row2);
                            const col1Index = cols1[0];
                            const col2Index = cols1[1];

                            // As 4 células que formam esta instância de X-Wing
                            const xWingCells = [
                                board[row1Index][col1Index],
                                board[row1Index][col2Index],
                                board[row2Index][col1Index],
                                board[row2Index][col2Index],
                            ];

                            // Adiciona estas células ao mapa, agrupadas pelo candidato do X-Wing.
                            // Se o candidato ainda não estiver no mapa, cria uma nova entrada com uma lista vazia.
                            if (!xWingsByCandidate.has(candidate)) {
                                xWingsByCandidate.set(candidate, []);
                            }
                            const cellsForThisCandidate = xWingsByCandidate.get(candidate)!;

                            // Adiciona cada célula do X-Wing à lista para este candidato, evitando duplicatas DENTRO desta lista.
                            xWingCells.forEach(cell => {
                                if (!cellsForThisCandidate.includes(cell)) {
                                    cellsForThisCandidate.push(cell);
                                }
                            });
                        }
                    }
                }
            }
        }
    }


    // Analisa candidatos por coluna para colunas dentro do universo especificado (simétrico à verificação de linha)
    board.forEach((row, rowIndex) => {
        row.forEach((cell, colIndex) => {
            // Considera apenas colunas dentro do universo ou se nenhum universo de coluna for especificado
            if (universe.cols.length === 0 || universe.cols.includes(colIndex + 1)) {
                // Considera apenas células candidatas (valor é null ou 0)
                if (!cell.value && cell.candidates && cell.candidates.length > 0) {
                    cell.candidates.forEach(candidate => {
                        if (!candidateCountsByCol[colIndex]) {
                            candidateCountsByCol[colIndex] = {};
                        }
                        if (!candidateCountsByCol[colIndex][candidate]) {
                            candidateCountsByCol[colIndex][candidate] = [];
                        }
                        candidateCountsByCol[colIndex][candidate].push(rowIndex);
                    });
                }
            }
        });
    });


    // Identifica X-Wings baseados nas colunas e agrupa as células por candidato
    for (const col1 in candidateCountsByCol) {
        for (const candidateStr in candidateCountsByCol[col1]) {
            const candidate = parseInt(candidateStr); // O candidato que forma o X-Wing
            // Procura por candidatos que aparecem em exatamente 2 posições na coluna col1
            if (candidateCountsByCol[col1][candidateStr].length === 2) {
                const rows1 = candidateCountsByCol[col1][candidateStr]; // As duas linhas na coluna col1

                // Procura por outra coluna (col2) que também está no universo (ou sem universo de coluna)
                // e tem o mesmo candidato nas mesmas duas linhas.
                for (const col2 in candidateCountsByCol) {
                    // Garante que col2 é diferente de col1 e está dentro do universo (se especificado)
                    if (parseInt(col2) > parseInt(col1) && (universe.cols.length === 0 || universe.cols.includes(parseInt(col2) + 1)) && candidateCountsByCol[col2] && candidateCountsByCol[col2][candidateStr]?.length === 2) {
                        const rows2 = candidateCountsByCol[col2][candidateStr]; // As duas linhas na coluna col2

                        // Verifica se os índices das linhas são os mesmos para ambas as colunas
                        if (rows1[0] === rows2[0] && rows1[1] === rows2[1]) {
                            // Encontramos um X-Wing baseado em coluna para este candidato!
                            const col1Index = parseInt(col1);
                            const col2Index = parseInt(col2);
                            const row1Index = rows1[0];
                            const row2Index = rows1[1];

                            // As 4 células que formam esta instância de X-Wing
                            const xWingCells = [
                                board[row1Index][col1Index],
                                board[row2Index][col1Index],
                                board[row1Index][col2Index],
                                board[row2Index][col2Index],
                            ];

                            // Adiciona estas células ao mapa, agrupadas pelo candidato do X-Wing.
                            // Se o candidato ainda não estiver no mapa, cria uma nova entrada com uma lista vazia.
                            if (!xWingsByCandidate.has(candidate)) {
                                xWingsByCandidate.set(candidate, []);
                            }
                            const cellsForThisCandidate = xWingsByCandidate.get(candidate)!;

                            // Adiciona cada célula do X-Wing à lista para este candidato, evitando duplicatas DENTRO desta lista.
                            xWingCells.forEach(cell => {
                                if (!cellsForThisCandidate.includes(cell)) {
                                    cellsForThisCandidate.push(cell);
                                }
                            });
                        }
                    }
                }
            }
        }
    }

    // Retorna o Map onde as chaves são os candidatos do X-Wing e os valores são arrays de células envolvidas para CADA candidato.
    // Note que se houver múltiplos X-Wings para o mesmo candidato, todas as células envolvidas estarão na mesma lista para aquele candidato.
    return xWingsByCandidate;
}

/**
 * Encontra Swordfish no tabuleiro dentro das unidades relevantes especificadas pelo universo, agrupados por candidato.
 * @param board O tabuleiro Sudoku.
 * @param universe O objeto universo contendo as restrições de linhas, colunas e blocos.
 * @returns Um Map onde a chave é o candidato do Swordfish e o valor é uma lista de células que formam Swordfish para esse candidato.
 */
function findSwordfish(board: Cell[][], universe: { rows: number[]; cols: number[]; blocks: number[] }): Map<number, Cell[]> {
    // Usamos um Map para agrupar as células do Swordfish pelo candidato que forma o Swordfish.
    const swordfishByCandidate: Map<number, Cell[]> = new Map();

    // Itera por cada número candidato (de 1 a 9) para procurar Swordfish para este candidato
    for (let candidate = 1; candidate <= 9; candidate++) {

        // --- Verifica por Swordfish baseado em Linha ---
        // Encontra as linhas onde o candidato aparece em exatamente 2 ou 3 células candidatas,
        // considerando apenas as linhas dentro do universo especificado.
        const rowsWithCandidateIn2or3Positions: { rowIndex: number; cols: number[] }[] = [];
        for (let r = 0; r < 9; r++) {
            if (universe.rows.length === 0 || universe.rows.includes(r + 1)) {
                const cellsWithCandidateInRow = board[r].filter(cell =>
                    !cell.value && cell.candidates && cell.candidates.includes(candidate)
                );
                if (cellsWithCandidateInRow.length >= 2 && cellsWithCandidateInRow.length <= 3) {
                    rowsWithCandidateIn2or3Positions.push({
                        rowIndex: r,
                        cols: cellsWithCandidateInRow.map(cell => cell.coordinates.col)
                    });
                }
            }
        }

        // Precisamos de pelo menos 3 dessas linhas para potencialmente formar um Swordfish
        if (rowsWithCandidateIn2or3Positions.length >= 3) {
            // Procura por combinações de 3 dessas linhas
            for (let i = 0; i < rowsWithCandidateIn2or3Positions.length; i++) {
                const rowInfo1 = rowsWithCandidateIn2or3Positions[i];
                for (let j = i + 1; j < rowsWithCandidateIn2or3Positions.length; j++) {
                    const rowInfo2 = rowsWithCandidateIn2or3Positions[j];
                    for (let k = j + 1; k < rowsWithCandidateIn2or3Positions.length; k++) {
                        const rowInfo3 = rowsWithCandidateIn2or3Positions[k];

                        // Coleta todos os índices de coluna únicos dessas três linhas onde o candidato aparece
                        const uniqueCols = new Set<number>();
                        rowInfo1.cols.forEach(col => uniqueCols.add(col));
                        rowInfo2.cols.forEach(col => uniqueCols.add(col));
                        rowInfo3.cols.forEach(col => uniqueCols.add(col));

                        // Se o número de colunas únicas for EXATAMENTE 3, encontramos um Swordfish baseado em linha!
                        if (uniqueCols.size === 3) {
                            const swordfishCandidate = candidate; // O candidato do Swordfish
                            const swordfishRows = [rowInfo1.rowIndex, rowInfo2.rowIndex, rowInfo3.rowIndex]; // As linhas base
                            const swordfishCols = Array.from(uniqueCols).sort((a, b) => a - b); // As colunas de cobertura (ordenadas)

                            // Adiciona as células que formam o Swordfish ao mapa, agrupadas pelo candidato do Swordfish.
                            // Se o candidato ainda não estiver no mapa, cria uma nova entrada.
                            if (!swordfishByCandidate.has(swordfishCandidate)) {
                                swordfishByCandidate.set(swordfishCandidate, []);
                            }
                            const cellsForThisCandidate = swordfishByCandidate.get(swordfishCandidate)!;

                            // Adiciona cada célula do Swordfish à lista para este candidato, evitando duplicatas.
                            swordfishRows.forEach(rIndex => {
                                swordfishCols.forEach(cIndex => {
                                    const cell = board[rIndex][cIndex];
                                    // Garante que a célula é uma célula candidata e contém o candidato do Swordfish
                                    if (!cell.value && cell.candidates && cell.candidates.includes(swordfishCandidate)) {
                                        if (!cellsForThisCandidate.includes(cell)) {
                                            cellsForThisCandidate.push(cell);
                                        }
                                    }
                                });
                            });
                        }
                    }
                }
            }
        }


        // --- Verifica por Swordfish baseado em Coluna (simétrico) ---
        const colsWithCandidateIn2or3Positions: { colIndex: number; rows: number[] }[] = [];
        for (let c = 0; c < 9; c++) {
            if (universe.cols.length === 0 || universe.cols.includes(c + 1)) {
                const cellsWithCandidateInCol = board.map(row => row[c]).filter(cell =>
                    !cell.value && cell.candidates && cell.candidates.includes(candidate)
                );
                if (cellsWithCandidateInCol.length >= 2 && cellsWithCandidateInCol.length <= 3) {
                    colsWithCandidateIn2or3Positions.push({
                        colIndex: c,
                        rows: cellsWithCandidateInCol.map(cell => cell.coordinates.row)
                    });
                }
            }
        }

        if (colsWithCandidateIn2or3Positions.length >= 3) {
            for (let i = 0; i < colsWithCandidateIn2or3Positions.length; i++) {
                const colInfo1 = colsWithCandidateIn2or3Positions[i];
                for (let j = i + 1; j < colsWithCandidateIn2or3Positions.length; j++) {
                    const colInfo2 = colsWithCandidateIn2or3Positions[j];
                    for (let k = j + 1; k < colsWithCandidateIn2or3Positions.length; k++) {
                        const colInfo3 = colsWithCandidateIn2or3Positions[k];

                        const uniqueRows = new Set<number>();
                        colInfo1.rows.forEach(row => uniqueRows.add(row));
                        colInfo2.rows.forEach(row => uniqueRows.add(row));
                        colInfo3.rows.forEach(row => uniqueRows.add(row));

                        if (uniqueRows.size === 3) {
                            // Encontramos um Swordfish baseado em coluna para 'candidate'
                            const swordfishCandidate = candidate;
                            const swordfishCols = [colInfo1.colIndex, colInfo2.colIndex, colInfo3.colIndex];
                            const swordfishRows = Array.from(uniqueRows).sort((a, b) => a - b);

                            // Adiciona as células que formam o Swordfish ao mapa, agrupadas pelo candidato.
                            if (!swordfishByCandidate.has(swordfishCandidate)) {
                                swordfishByCandidate.set(swordfishCandidate, []);
                            }
                            const cellsForThisCandidate = swordfishByCandidate.get(swordfishCandidate)!;

                            swordfishRows.forEach(rIndex => {
                                swordfishCols.forEach(cIndex => {
                                    const cell = board[rIndex][cIndex];
                                    if (!cell.value && cell.candidates && cell.candidates.includes(swordfishCandidate)) {
                                        if (!cellsForThisCandidate.includes(cell)) {
                                            cellsForThisCandidate.push(cell);
                                        }
                                    }
                                });
                            });
                        }
                    }
                }
            }
        }
    }

    // Retorna o Map onde as chaves são os candidatos do Swordfish e os valores são arrays de células envolvidas para CADA candidato.
    return swordfishByCandidate;
}

function getBlockNumber(row: number, col: number): number {
    const blockRow = Math.floor(row / 3);
    const blockCol = Math.floor(col / 3);
    return blockRow * 3 + blockCol + 1;
}

function filterCandidates() {
    // Limpa todos os destaques anteriores (candidatos e geral)
    board.value.forEach(row => {
        row.forEach(cell => {
            cell.highlight = false;
            cell.candidateColors = undefined; // Limpa o mapa de cores de candidatos
        });
    });

    const query = searchQuery.value.trim();
    if (!query) {
        highlightedCells.value = [];
        return;
    }

    // --- Coleções Globais para Acumular Destaques de Todos os Grupos ---
    const cellsForGeneralHighlight: Set<Cell> = new Set();
    // Mapa para armazenar as cores dos candidatos: Cell -> (Candidato -> Cor)
    const cellCandidateColors: Map<Cell, Map<number, string>> = new Map();

    let colorIndex = 0; // Índice para ciclar pelas cores (continua através de todos os grupos e comandos)

    // --- Definição dos Arrays de Aliases para cada Comando ---
    const containsAliases = [':', 'contains', 'contain', 'has', 'includes'];
    const countAliases = ['*', 'count', 'counter', 'cont', 'qtd'];
    const notcontainsAliases = ['notcontains', 'notcontain', 'not_contains', 'not_contain', 'not-contains', 'not-contain', '!', 'not'];
    const uniqueAliases = ['unique', '?'];
    const nakedPairsAliases = ['nakedpairs', 'nakedpair', 'np', 'pair', 'pairs', 'p'];
    const nakedTriplesAliases = ['nakedtriples', 'nakedtriple', 'naked-triple', 'naked_triple', 'nt', 't', 'triple', 'trio'];
    const hiddenPairsAliases = ['hiddenpairs', 'hiddenpair', 'hp'];
    const hiddenTriplesAliases = ['hiddentriples', 'hiddentriple', 'ht'];
    const xwingAliases = ['xwing', 'xw'];
    const swordfishAliases = ['swordfish', 'sf'];
    const containsAllAliases = ['containsall', 'hasall', 'includesall', '>='];
    // Adicione aqui os arrays de aliases para outros comandos se necessário.


    // --- Divide a query principal em grupos de filtro usando ';' ---
    const filterGroups = query.split(';').map(group => group.trim()).filter(group => group.length > 0); // Remove grupos vazios

    // --- Processa cada grupo de filtro ---
    filterGroups.forEach(groupString => {
        // Para cada grupo, um novo universo pode ser definido
        let groupUniverse: { rows: number[]; cols: number[]; blocks: number[] } = { rows: [], cols: [], blocks: [] };
        let groupCommandsString = groupString;

        // Tenta analisar a definição do universo NO INÍCIO DESTE GRUPO
        // Regex para suportar parênteses () ou colchetes [] e espaço opcional
        // Mantemos este regex separado pois ele só procura os aliases de universo específicos no início
        const universeMatch = groupString.match(/^(blocks?|b|lines?|l|columns?|column?|c)\s*[\(\[]\s*(.*?)\s*[\)\]]\s+(.*)$/i);
        if (universeMatch) {
            const universeType = universeMatch[1].toLowerCase();
            const universeArgs = universeMatch[2].split(',').map(arg => parseInt(arg.trim())).filter(arg => !isNaN(arg));
            groupCommandsString = universeMatch[3]; // O resto da string após o universo deste grupo

            if (['line', 'lines', 'l'].includes(universeType)) groupUniverse.rows = universeArgs;
            else if (['col', 'cols', 'column', 'columns', 'c'].includes(universeType)) groupUniverse.cols = universeArgs;
            else if (['block', 'blocks', 'b'].includes(universeType)) groupUniverse.blocks = universeArgs;
        }

        // --- Divide os comandos dentro deste grupo usando '&&' ---
        const commands = groupCommandsString.split('&&').map(cmd => cmd.trim()).filter(cmd => cmd.length > 0); // Remove comandos vazios

        // --- Processa cada comando dentro deste grupo ---
        commands.forEach(command => {
            // --- Análise de Comando com Aliases e Colchetes/Parênteses ---
            // Regex ATUALIZADA: Permite que o nome do comando seja uma palavra (letras/números/_) OU um único caractere *, :, !
            // ^((?:\w+)|(?:\*)|(?:\:)|(?:!)): Captura um nome que é ou \w+ OU *, :, !
            // (?:...) é um grupo não capturante, usado para agrupar as alternativas sem criar um grupo de captura extra.
            // O primeiro grupo de captura agora é ((?:\w+)|(?:\*)|(?:\:)|(?:!)), então o nome bruto estará em match[1].
            const match = command.match(/^((?:\w+)|(?:\*)|(?:\:)|(?:!))\s*[\(\[]\s*(.*?)\s*[\)\]]\s*$/i);

            if (match) {
                // rawOperation é o nome capturado pelo primeiro grupo, incluindo o alias especial se for o caso
                const rawOperation = match[1].toLowerCase();
                const argsString = match[2]; // A string dentro dos parênteses ou colchetes

                let operation: string | undefined; // Variável para armazenar o nome de operação padrão

                // --- Mapeia o Alias para o Nome de Operação Padrão usando if/else if com includes() ---
                // Esta lógica permanece a mesma, comparando rawOperation com os arrays de aliases
                if (containsAliases.includes(rawOperation)) { operation = 'contains'; }
                else if (countAliases.includes(rawOperation)) { operation = 'count'; }
                else if (notcontainsAliases.includes(rawOperation)) { operation = 'notcontains'; }
                else if (uniqueAliases.includes(rawOperation)) { operation = 'unique'; }
                else if (nakedPairsAliases.includes(rawOperation)) { operation = 'nakedpairs'; }
                else if (nakedTriplesAliases.includes(rawOperation)) { operation = 'nakedtriples'; }
                else if (hiddenPairsAliases.includes(rawOperation)) { operation = 'hiddenpairs'; }
                else if (hiddenTriplesAliases.includes(rawOperation)) { operation = 'hiddentriples'; }
                else if (xwingAliases.includes(rawOperation)) { operation = 'xwing'; }
                else if (swordfishAliases.includes(rawOperation)) { operation = 'swordfish'; }
                else if (containsAllAliases.includes(rawOperation)) { operation = 'containsAll'; }
                // --- Adicione aqui mais blocos else if para outros comandos se necessário ---


                // Verifica se o alias usado no comando corresponde a uma operação válida.
                if (!operation) {
                    console.warn(`Operação de filtro ou alias desconhecido: "${rawOperation}" no comando "${command}" do grupo "${groupString}". Comando ignorado.`);
                    return; // Ignora este comando
                }

                // Analisa a string de argumentos em um array de números
                const args = argsString.split(',').map(arg => parseInt(arg.trim())).filter(arg => !isNaN(arg));


                // --- Lógica de Processamento dos Comandos (com base no nome padrão da operação) ---
                // Esta lógica usa o 'groupUniverse' definido para este grupo.

                // --- Lida com filtros que resultam em DESTAQUE DE CANDIDATOS ---
                if (['contains', 'only', 'unique', 'containsAll'].includes(operation)) {
                    let results: Array<{ cell: Cell, candidates: number[] }> = [];

                    if (['contains', 'only', 'containsAll'].includes(operation)) {
                        board.value.forEach(row => {
                            row.forEach(cell => {
                                // VERIFICAÇÃO CONTRA O UNIVERSO DESTE GRUPO
                                const isCellInUniverse =
                                    (groupUniverse.rows.length === 0 || groupUniverse.rows.includes(cell.coordinates.row + 1)) &&
                                    (groupUniverse.cols.length === 0 || groupUniverse.cols.includes(cell.coordinates.col + 1)) &&
                                    (groupUniverse.blocks.length === 0 || groupUniverse.blocks.includes(getBlockNumber(cell.coordinates.row, cell.coordinates.col)));

                                if (isCellInUniverse && !cell.value && cell.candidates) {
                                    let candidatesToHighlight: number[] = [];
                                    switch (operation) {
                                        case 'contains':
                                            candidatesToHighlight = cell.candidates.filter(cand => args.includes(cand));
                                            break;
                                        case 'only':
                                            if (only(cell, args)) {
                                                candidatesToHighlight = cell.candidates;
                                            }
                                            break;
                                        case 'containsAll':
                                            if (containsAll(cell, args)) {
                                                candidatesToHighlight = args.filter(cand => cell.candidates.includes(cand));
                                            }
                                            break;
                                    }
                                    if (candidatesToHighlight.length > 0) {
                                        results.push({ cell: cell, candidates: candidatesToHighlight });
                                    }
                                }
                            });
                        });
                    } else { // Caso 'unique' (usa findUniqueCandidates que já considera o universo)
                        // Chama findUniqueCandidates com o universo DESTE grupo
                        results = findUniqueCandidates(board.value, groupUniverse);
                    }

                    // Aplica a coloração. O colorIndex CONTINUA através de todos os comandos de todos os grupos.
                    // Uma cor por COMANDO (para contains, only, unique, containsAll)
                    const commandColor = highlightColors[colorIndex % highlightColors.length];
                    colorIndex++; // Incrementa para o PRÓXIMO comando/grupo de padrão

                    results.forEach(item => {
                        if (!cellCandidateColors.has(item.cell)) {
                            cellCandidateColors.set(item.cell, new Map());
                        }
                        const candidateMap = cellCandidateColors.get(item.cell)!;
                        item.candidates.forEach(cand => {
                            candidateMap.set(cand, commandColor);
                        });
                    });

                }
                // --- Lida com Naked/Hidden Pairs e Triples (Array<{ cells: Cell[], candidates: number[] }>) ---
                // Estes filtros recebem uma cor POR INSTÂNCIA do padrão.
                else if (['nakedpairs', 'nakedtriples', 'hiddenpairs', 'hiddentriples'].includes(operation)) {
                    let patternInstances: Array<{ cells: Cell[], candidates: number[] }> = [];
                    switch (operation) {
                        // Chama as funções find com o universo DESTE grupo
                        case 'nakedpairs': patternInstances = findNakedPairs(board.value, groupUniverse); break;
                        case 'nakedtriples': patternInstances = findNakedTriples(board.value, groupUniverse); break;
                        case 'hiddenpairs': patternInstances = findHiddenPairs(board.value, groupUniverse); break;
                        case 'hiddentriples': patternInstances = findHiddenTriples(board.value, groupUniverse); break;
                    }

                    // Itera por CADA INSTÂNCIA distinta encontrada por este comando.
                    // CADA INSTÂNCIA receberá uma NOVA cor.
                    patternInstances.forEach(instance => {
                        const instanceColor = highlightColors[colorIndex % highlightColors.length];
                        colorIndex++; // Incrementa para a PRÓXIMA instância

                        instance.cells.forEach(cell => {
                            instance.candidates.forEach(candidate => {
                                if (!cell.value && cell.candidates && cell.candidates.includes(candidate)) {
                                    if (!cellCandidateColors.has(cell)) {
                                        cellCandidateColors.set(cell, new Map());
                                    }
                                    cellCandidateColors.get(cell)!.set(candidate, instanceColor);
                                }
                            });
                        });
                    });

                }
                // --- Lida com XWing e Swordfish (Map<number, Cell[]>) ---
                // Estes filtros recebem uma cor POR GRUPO DE CANDIDATO que forma o padrão.
                else if (['xwing', 'swordfish'].includes(operation)) {
                    let groupedResults: Map<number, Cell[]> = new Map();
                    switch (operation) {
                        // Chama as funções find com o universo DESTE grupo
                        case 'xwing': groupedResults = findXWing(board.value, groupUniverse); break;
                        case 'swordfish': groupedResults = findSwordfish(board.value, groupUniverse); break;
                    }

                    // Itera pelos resultados agrupados por candidato.
                    // CADA GRUPO DE CANDIDATO (para um candidato específico) DENTRO deste comando receberá uma NOVA cor.
                    groupedResults.forEach((cellsInPattern, candidate) => {
                        const candidatePatternColor = highlightColors[colorIndex % highlightColors.length];
                        colorIndex++; // Incrementa para o PRÓXIMO grupo de padrão/candidato

                        cellsInPattern.forEach(cell => {
                            if (!cell.value && cell.candidates && cell.candidates.includes(candidate)) {
                                if (!cellCandidateColors.has(cell)) {
                                    cellCandidateColors.set(cell, new Map());
                                }
                                cellCandidateColors.get(cell)!.set(candidate, candidatePatternColor);
                            }
                        });
                    });
                }
                // --- Lida com filtros que resultam em DESTAQUE GERAL DA CÉLULA ---
                else if (['notcontains', 'count'].includes(operation)) {
                    board.value.forEach(row => {
                        row.forEach(cell => {
                            // VERIFICAÇÃO CONTRA O UNIVERSO DESTE GRUPO
                            const isCellInUniverse =
                                (groupUniverse.rows.length === 0 || groupUniverse.rows.includes(cell.coordinates.row + 1)) &&
                                (groupUniverse.cols.length === 0 || groupUniverse.cols.includes(cell.coordinates.col + 1)) &&
                                (groupUniverse.blocks.length === 0 || groupUniverse.blocks.includes(getBlockNumber(cell.coordinates.row, cell.coordinates.col)));

                            if (isCellInUniverse) {
                                let shouldHighlightCell = false;
                                switch (operation) {
                                    case 'notcontains':
                                        if (!cell.value && cell.candidates) {
                                            // Verifica se NENHUM dos candidatos da célula está na lista de args
                                            shouldHighlightCell = !cell.candidates.some(cand => args.includes(cand));
                                        } else if (cell.value !== null && cell.value !== 0) {
                                            // CORREÇÃO: Verifica se o valor FIXO da célula NÃO está na lista de args
                                            shouldHighlightCell = !args.includes(cell.value);
                                        }
                                        break;
                                    case 'count':
                                        if (args.length === 1 && !cell.value && cell.candidates) {
                                            shouldHighlightCell = cell.candidates.length === args[0];
                                        }
                                        break;
                                }
                                // Adiciona a célula ao conjunto global de destaque geral
                                if (shouldHighlightCell && !cellsForGeneralHighlight.has(cell)) {
                                    cellsForGeneralHighlight.add(cell);
                                }
                            }
                        });
                    });
                }
                // Adicione outros tipos de operação que podem resultar em destaque geral da célula aqui.

            } else if (!isNaN(parseInt(command.trim()))) {
                // Caso especial: o comando é apenas um número único (e.g., "5").
                // Este caso não usa parênteses/colchetes ou aliases, então sua lógica permanece separada.
                const number = parseInt(command.trim());
                // Pega a cor para este filtro de número único (usa colorIndex, incrementa)
                const filterNumberColor = highlightColors[colorIndex % highlightColors.length];
                colorIndex++; // Incrementa o índice de cor

                board.value.forEach(row => {
                    row.forEach(cell => {
                        // VERIFICAÇÃO CONTRA O UNIVERSO DESTE GRUPO
                        const isCellInUniverse =
                            (groupUniverse.rows.length === 0 || groupUniverse.rows.includes(cell.coordinates.row + 1)) &&
                            (groupUniverse.cols.length === 0 || groupUniverse.cols.includes(cell.coordinates.col + 1)) &&
                            (groupUniverse.blocks.length === 0 || groupUniverse.blocks.includes(getBlockNumber(cell.coordinates.row, cell.coordinates.col))); // CORREÇÃO AQUI: era blocks.blocks

                        if (isCellInUniverse) {
                            // Se for célula candidata e contiver o número, destaca o candidato com sua cor.
                            if (!cell.value && cell.candidates && cell.candidates.includes(number)) {
                                if (!cellCandidateColors.has(cell)) {
                                    cellCandidateColors.set(cell, new Map());
                                }
                                cellCandidateColors.get(cell)!.set(number, filterNumberColor);
                            } else if (cell.value !== null && cell.value !== 0 && cell.value === number) {
                                // Se for célula preenchida com o número, destaca a célula inteira (geral).
                                if (!cellsForGeneralHighlight.has(cell)) {
                                    cellsForGeneralHighlight.add(cell);
                                }
                            }
                        }
                    });
                });
            }
            // Comandos que não correspondem ao regex (operação(...) ou operação[...])
            // E não são um número único, são ignorados.
        }); // Fim do loop de comandos dentro de um grupo

    }); // Fim do loop de grupos de filtro


    // --- Aplicar os Destaques Coletados (DEPOIS DE PROCESSAR TODOS OS GRUPOS) ---

    // Aplica as cores de candidatos coletadas à propriedade candidateColors das células
    cellCandidateColors.forEach((candidateMap, cell) => {
        cell.candidateColors = new Map(candidateMap); // Cria um novo Map e atribui
    });

    // Aplica o destaque geral (cell.highlight = true) às células coletadas
    cellsForGeneralHighlight.forEach(cell => {
        cell.highlight = true;
    });

    // Atualiza o ref highlightedCells para incluir todas as células que têm QUALQUER tipo de destaque
    highlightedCells.value = board.value.flat().filter(cell => cell.highlight || (cell.candidateColors && cell.candidateColors.size > 0));

}

watch(() => board.value.map(row => row.map(cell => cell.value ? [cell.value].join(', ') : cell.candidates.join(', '))), () => {
    filterCandidates(); // Refiltrar quando o board mudar (e.g., novo jogo)
});

watch(searchQuery, () => {
    filterCandidates(); // Refiltrar quando a query mudar
});

/* *******************************DRAG SELECTION******************************************* */
// Funções auxiliares para converter coordenadas do mouse para linha/coluna da célula
function getCellFromMouseEvent(event: MouseEvent): Cell | null {
    if (!boardElement.value) return null;

    const boardRect = boardElement.value.getBoundingClientRect();
    const mouseX = event.clientX;
    const mouseY = event.clientY;

    // Verifica se o mouse está dentro dos limites do tabuleiro
    if (mouseX < boardRect.left || mouseX > boardRect.right || mouseY < boardRect.top || mouseY > boardRect.bottom) {
        return null; // Mouse fora do tabuleiro
    }

    // Coordenadas do mouse relativas ao canto superior esquerdo do tabuleiro
    const relativeX = mouseX - boardRect.left;
    const relativeY = mouseY - boardRect.top;

    const cellWidth = boardRect.width / 9;
    const cellHeight = boardRect.height / 9;

    // Calcula a linha e coluna com base nas coordenadas relativas e tamanho da célula
    const col = Math.floor(relativeX / cellWidth);
    const row = Math.floor(relativeY / cellHeight);

    // Garante que as coordenadas calculadas estão dentro dos limites do tabuleiro (0-8)
    if (row >= 0 && row < 9 && col >= 0 && col < 9) return board.value[row][col];

    // Se as coordenadas não estão dentro do tabuleiro, retorna null
    return null; // Coordenadas inválidas
}


// Função auxiliar para obter o número do candidato a partir do elemento clicado
function getCandidateNumberFromElement(element: HTMLElement): number | null {
    // Procura o elemento mais próximo com a classe 'candidate-spot' e obtém seu id
    const candidateSpot = element.closest('.candidate-spot');
    if (candidateSpot && candidateSpot.id) {
        const id = parseInt(candidateSpot.id);
        // Verifica se o id é um número válido entre 1 e 9
        if (!isNaN(id) && id >= 1 && id <= 9) {
            return id;
        }
    }
    return null; // Retorna null se não for um clique em candidato válido
}

// --- Lida com o clique em um candidato ---
function handleCandidateClick(cell: Cell, candidateNumber: number) {
    // Esta função é chamada quando um clique em um ponto de candidato é detectado.
    // Ela só deve alternar o candidato se a célula estiver selecionada.
    // Verifica se a célula passada é válida e está selecionada.
    if (!cell || !cell.selected) return; // Não faz nada se a célula não estiver selecionada

    // Lógica para alternar o candidato (movida de Candidates.vue)
    const currentCandidates = [...cell.candidates]; // Copia o array de candidatos

    if (currentCandidates.includes(candidateNumber)) {
        // Se o candidato existe, remove
        const index = currentCandidates.indexOf(candidateNumber);
        currentCandidates.splice(index, 1);
    } else {
        // Se o candidato não existe, adiciona e mantém ordenado
        currentCandidates.push(candidateNumber);
        currentCandidates.sort((a, b) => a - b);
    }

    // Atualiza o array de candidatos da célula no estado do tabuleiro
    cell.candidates = currentCandidates;

    // Salva as mudanças no estado (histórico de desfazer e local storage)
    saveChanges();
    save();
}
// --- FIM DA NOVA FUNÇÃO ---

function handleMouseDown(event: MouseEvent) {
    // Ignora cliques que não sejam do botão esquerdo do mouse
    if (event.button !== 0) return;

    const clickedCell = getCellFromMouseEvent(event); // Determina a célula clicada
    const targetElement = event.target as HTMLElement; // Obtém o elemento clicado diretamente


    if (clickedCell) {
        // Se o clique foi em uma célula do tabuleiro

        if (clickedCell.selected) {
            // Se a célula clicada JÁ ESTÁ selecionada.
            // A intenção AGORA pode ser interagir com um candidato (se for célula candidate)
            // ou re-selecionar/iniciar drag a partir desta célula selecionada.

            // Verifica se o clique target é especificamente um ponto de candidato dentro desta célula.
            const candidateSpotElement = targetElement.closest('.candidate-spot');

            if (candidateSpotElement) {
                // Se o target for um ponto de candidato E a célula estiver selecionada,
                // trata como clique para toggle de candidato.
                const candidateNumber = getCandidateNumberFromElement(targetElement);
                if (candidateNumber !== null) { // Garante que o número do candidato seja válido
                    handleCandidateClick(clickedCell, candidateNumber);
                }

                // Após tratar (ou tentar tratar) o clique em candidato, NÃO iniciamos arrasto ou seleção principal.
                isDragging.value = false; // Garante que o estado de arrasto esteja desligado
                dragStartCell.value = null;
                lastDraggedCell.value = null;
                dragStartX.value = 0;
                dragStartY.value = 0;
                // No preventDefault() aqui.
                return; // Sai da função handleMouseDown
            }
        }

        // --- LÓGICA PARA SELEÇÃO / ARRASTO DE CÉLULA ---
        // Este bloco é alcançado se:
        // - A célula clicada NÃO ESTÁ selecionada (clickedCell.selected é false)
        // - OU a célula clicada ESTÁ selecionada, MAS o clique target NÃO FOI um ponto de candidato.

        // Inicia a lógica de arrasto/seleção de célula principal para esta célula.
        isDragging.value = true;
        dragStartCell.value = clickedCell;
        lastDraggedCell.value = clickedCell;
        dragStartX.value = event.clientX; // Armazena a posição inicial do clique
        dragStartY.value = event.clientY;

        // --- LÓGICA DE SELEÇÃO INICIAL (CLIQUE SIMPLES OU INÍCIO DE ARRASTO) ---
        // Esta lógica decide o estado inicial de selectedCell.value
        // (seleção única LIMPA anterior OU adiciona à multiseleção).
        const isCtrlPressed = event.ctrlKey || event.metaKey;
        const isMultiselectMode = isMultiselectChecked.value;

        if (isCtrlPressed || isMultiselectMode) {
            // Se Ctrl ou Multiselect checkbox estiver ativo, adiciona a célula clicada à seleção existente
            let currentSelectionArray = Array.isArray(selectedCell.value) ? selectedCell.value : (selectedCell.value !== null ? [selectedCell.value] : []);

            // Adiciona a célula clicada se ela ainda não estiver no array
            if (!currentSelectionArray.includes(clickedCell)) {
                selectedCell.value = [...currentSelectionArray, clickedCell];
            }
        } else {
            // Se NÃO Ctrl e NÃO Multiselect checkbox, LIMPA a seleção anterior e seleciona apenas a célula clicada.
            // Isso lida tanto com o clique simples em uma nova célula quanto com o início de um arrasto simples.
            selectedCell.value = [clickedCell];
        }
        // --- FIM DA LÓGICA DE SELEÇÃO INICIAL ---

        // Atualiza o destaque da UI com a nova seleção inicial
        updateUISelection(selectedCell.value);
    } else {
        // Clique fora do tabuleiro - limpa a seleção atual (se houver)
        if (selectedCell.value !== null) {
            selectedCell.value = null;
            updateUISelection(selectedCell.value);
            highlightedCells.value = []; // Limpa destaques conectados/valor
            highlightValue.value = null;
            save();
        }
    }
}

function handleMouseMove(event: MouseEvent) {
    // Só age se estiver arrastando E o botão esquerdo do mouse ainda estiver pressionado
    // O 'buttons & 1' verifica se o botão esquerdo está pressionado durante o mousemove
    if (!isDragging.value || !dragStartCell.value || !(event.buttons & 1)) {
        // Se isDragging for true mas o botão não estiver pressionado, pode ser um mouseup que não foi capturado.
        // Neste caso, finalize o drag.
        if (isDragging.value) {
            handleMouseUp(event); // Chama mouseup para finalizar
        }
        return;
    }

    const currentCell = getCellFromMouseEvent(event);

    // Lógica para adicionar células conforme o mouse passa DURANTE o arrasto
    // A seleção inicial (substituir ou adicionar) foi definida em handleMouseDown.
    // Aqui, apenas adicionamos a célula atual ao array existente, se ela for nova.
    if (currentCell && currentCell !== lastDraggedCell.value) {
        // Se o mouse moveu para uma nova célula DENTRO do tabuleiro durante o arrasto

        let currentSelectionArray = Array.isArray(selectedCell.value) ? selectedCell.value : (selectedCell.value !== null ? [selectedCell.value] : []);

        // Adiciona a célula atual à seleção (array), se ela não estiver lá.
        // Não removemos ao "voltar" durante o arrasto com esta lógica simples.
        if (!currentSelectionArray.includes(currentCell)) {
            selectedCell.value = [...currentSelectionArray, currentCell]; // Adiciona a nova célula
            updateUISelection(selectedCell.value); // Atualiza o destaque visual
        }

        lastDraggedCell.value = currentCell; // Atualiza a última célula arrastada para otimização

        // No modo de arrasto, limpamos os destaques de célula conectada/valor
        highlightedCells.value = [];
        highlightValue.value = null;
    }
    // Se o mouse sair do tabuleiro durante o arrasto, a lógica atual ignora.
    // Para seleção que se estende para fora: listeners no document seriam melhores.
}

// Copie e substitua esta função no seu arquivo index.vue.txt
function handleMouseUp(event: MouseEvent) {
    // --- VERIFICAÇÃO: Verifica se o target do mouseup é um elemento candidato ---
    const targetElement = event.target as HTMLElement;
    const isCandidateClick = getCandidateNumberFromElement(targetElement) !== null;

    if (isCandidateClick) {
        // Se o mouseup ocorreu ESPECIFICAMENTE sobre um ponto de candidato,
        // não fazemos nada aqui. O handleMouseDown já lidou com o toggle do candidato.
        isDragging.value = false; // Garante que o estado de arrasto esteja desligado
        dragStartCell.value = null;
        lastDraggedCell.value = null;
        dragStartX.value = 0;
        dragStartY.value = 0;
        return; // Sai da função handleMouseUp
    }
    // --- FIM DA VERIFICAÇÃO ---


    // Se não era um clique em candidato, procede com a diferenciação de clique vs arrasto
    // Só processa se um arrasto potencial foi iniciado em handleMouseDown (ou seja, clicou em uma célula não-candidato)
    if (!isDragging.value) {
        // Se MouseUp ocorreu mas isDragging era false, e não era candidato,
        // foi um clique fora do board (handleMouseDown já lidou)
        // ou algum outro caso que não iniciou um drag válido.
        return;
    }


    // Finaliza o estado de arrasto (mesmo que tenha sido um clique rápido)
    isDragging.value = false;
    const endX = event.clientX;
    const endY = event.clientY;

    // Calcula a distância percorrida pelo mouse
    const moveDistance = Math.sqrt(Math.pow(endX - dragStartX.value, 2) + Math.pow(endY - dragStartY.value, 2));

    // Define um limite de distância para diferenciar clique de arrasto (ajuste conforme necessário)
    const clickThreshold = 5; // pixels

    if (moveDistance > clickThreshold) {
        // Se o movimento foi maior que o limite, trata como um ARRASTO
        // Ao final de um arrasto, limpamos os destaques de célula conectada/valor (se estavam visíveis)
        highlightedCells.value = [];
        highlightValue.value = null;

        // Salva o estado da seleção final após o arrasto (array de células arrastadas)
        save();
    }

    // Reseta as variáveis de estado do arrasto
    isDragging.value = false; // Redundante, mas seguro
    dragStartCell.value = null;
    lastDraggedCell.value = null;
    dragStartX.value = 0;
    dragStartY.value = 0;

    // Opcional: prevenir comportamento padrão em mouseup também (menos comum que em mousedown para drag)
    // event.preventDefault(); // Cuidado com isso e a propagação de eventos
}
// Mantenha as outras funções (handleKeyUp, selectCell, updateUISelection, getCellFromMouseEvent, getCandidateNumberFromElement, handleCandidateClick) inalteradas em relação às últimas versões funcionais.


function updateUISelection(currentSelection: Cell | Cell[] | null) {

    // Remove a classe de seleção de todas as células primeiro
    board.value.flat().forEach(cell => cell.selected = false);

    // Limpa sempre os destaques conectados e de valor antes de re-aplicar
    highlightedCells.value = [];
    highlightValue.value = null;

    if (Array.isArray(currentSelection)) {
        // Aplica a classe 'selected' a todas as células no array
        currentSelection.forEach(cell => {
            // Encontra a referência reativa correta no board
            const boardCell = board.value[cell.coordinates.row][cell.coordinates.col];
            boardCell.selected = true;
        });

        if (currentSelection.length === 1) {
            const singleCell = currentSelection[0];
            // Verifica se a célula única selecionada é válida antes de destacar
            if (singleCell && singleCell.coordinates) {
                highlightConnectedCells(singleCell.coordinates.row, singleCell.coordinates.col);
                highlightValue.value = singleCell.value;
            }
        }

    } else if (currentSelection) {
        // Aplica a classe 'selected' para seleção única (quando selectedCell.value é um único objeto Cell)
        const boardCell = board.value[currentSelection.coordinates.row][currentSelection.coordinates.col];
        boardCell.selected = true;
        // Para seleção única, aplica os destaques conectados e o valor
        highlightConnectedCells(currentSelection.coordinates.row, currentSelection.coordinates.col);
        highlightValue.value = currentSelection.value;
    } else {
        // Nenhuma seleção
    }
}

// Função auxiliar para debugging: loga o tabuleiro e os candidatos
function logBoard(board: Cell[][]) {
    const asString = (list: number[]) => list.length > 0 ? list.join(', ') : '[]';
    const candidatesByCell = board.map(row => row.map(cell => cell.value ? asString([cell.value]) : asString(cell.candidates)));
    console.table(candidatesByCell);
}

</script>

<style lang="css" scoped>
.grid3 {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
}

.writing-tools-top {
    width: 100%;
    float: right;
    padding-bottom: 5px;
    display: none;
}

.writing-tools-top .v-btn-toggle {
    margin: 0;
    padding: 0;
    height: 1.75em;
    border: 1px solid #ccc;
}

#game-header {
    display: flex;
    flex-direction: row;
    align-items: center;
    width: 98vw;
    max-width: 18cm;
    box-sizing: border-box;
    /* Ensure padding doesn't affect the overall width */
}

#play-button {
    height: 2em;
    font-size: 1.2em;
    cursor: pointer;
    border: solid 2px black;
    margin-left: 5px;
    padding: 0 5px;
}

#gameMode {
    display: flex;
    align-items: center;
    flex-shrink: 0;
}

#gameMode label {
    margin: 0 8px;
}

#hearts {
    display: flex;
    align-items: center;
    flex-shrink: 0;
}

.heart {
    color: red;
    font-size: 1.2em;
    margin: 0 3px;
}

#board {
    width: 98vw;
    max-width: 18cm;
    margin: 5px auto 20px auto;
    display: grid;
    grid-template-columns: repeat(9, 1fr);
    grid-template-rows: repeat(9, 1fr);
    aspect-ratio: 1 / 1;
    /* Maintain a square aspect ratio */
}

.block {
    border: solid 2px black;
    z-index: 3;
    grid-column-span: 3;
    grid-row-span: 3;
}

/* Target the correct blocks based on their position in the 9x9 grid */
#board>div:nth-child(1) {
    grid-column: 1 / span 3;
    grid-row: 1 / span 3;
}

#board>div:nth-child(2) {
    grid-column: 4 / span 3;
    grid-row: 1 / span 3;
}

#board>div:nth-child(3) {
    grid-column: 7 / span 3;
    grid-row: 1 / span 3;
}

#board>div:nth-child(4) {
    grid-column: 1 / span 3;
    grid-row: 4 / span 3;
}

#board>div:nth-child(5) {
    grid-column: 4 / span 3;
    grid-row: 4 / span 3;
}

#board>div:nth-child(6) {
    grid-column: 7 / span 3;
    grid-row: 4 / span 3;
}

#board>div:nth-child(7) {
    grid-column: 1 / span 3;
    grid-row: 7 / span 3;
}

#board>div:nth-child(8) {
    grid-column: 4 / span 3;
    grid-row: 7 / span 3;
}

#board>div:nth-child(9) {
    grid-column: 7 / span 3;
    grid-row: 7 / span 3;
}

/* Ensure cells have borders */
#board>div>div {
    border: solid 1px gray;
    border-collapse: collapse;
    display: flex;
    align-items: center;
    justify-content: center;
    aspect-ratio: 1 / 1;
    /* Maintain square cells */
}

#gameMode {
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: center;
}

#hearts {
    margin-left: 15px;
}

#actions {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
    gap: 10px;
    padding: 10px;
}

#numbers {
    width: 8cm;
    margin: 15px auto;
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 5px;
}

.number {
    font-size: 1em;
    border-radius: 5px;
    border: solid 1px gray;
    background-color: lightgray;
    font-weight: bolder;
    justify-content: center;
}

.eraser {
    font-weight: normal !important;
    width: 8cm;
    margin: 15px auto;
}

.number:disabled {
    background-color: gray;
    cursor: not-allowed;
}

.selected {
    border: 2px solid black;
}

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

.new-game {
    width: 100%;
    margin: 0 10px 0 10px;
}

.button:hover {
    background-color: #F3F4F6;
    text-decoration: none;
    transition-duration: 0.1s;
}

.button:disabled {
    background-color: #FAFBFC;
    border-color: rgba(27, 31, 35, 0.15);
    color: #959DA5;
    cursor: default;
}

.button:active {
    background-color: #EDEFF2;
    box-shadow: rgba(225, 228, 232, 0.2) 0 1px 0 inset;
    transition: none 0s;
}

.button:focus {
    outline: 1px transparent;
}

.button:before {
    display: none;
}

.button:-webkit-details-marker {
    display: none;
}

.difficulty-button {
    width: 80%;
    margin: 0 auto;
    margin-bottom: 10px;
}

.no-select {
    -webkit-user-select: none;
    /* Safari */
    -moz-user-select: none;
    /* Firefox */
    -ms-user-select: none;
    /* IE/Edge */
    user-select: none;
    /* Standard */
}

#clearCellButton {
    margin: 10px auto;
    display: block;
    width: 50%;
    padding: 0.6em 1.2em;
    font-size: 1em;
    font-weight: bold;
    border-radius: 5px;
    border: solid 1px gray;
    background-color: lightgray;
}

.v-dialog {
    width: 500px !important;
    max-width: 500px !important;
    margin: 0 auto;
    /* Center dialogs */
}

@media (min-width: 1000px) {

    #board,
    #game-header {
        width: 18cm;
        max-width: none;
    }
}

@media (min-width: 769px) and (max-width: 999px) {

    #board,
    #game-header {
        width: 98vw;
    }
}

/* Media query for smaller screens (e.g., phones) */
@media (max-width: 768px) {
    body {
        flex-direction: column;
        align-items: center;
    }

    #board,
    #game-header {
        width: 90vw;
        margin: 10px auto;
    }

    .block {
        border: solid 1px black;
    }

    #board>div>div {
        border: solid 1px lightgray;
        display: flex;
        align-items: center;
        justify-content: center;
        aspect-ratio: 1 / 1;
        font-size: 1em;
    }

    #title-play {
        display: flex;
        /* Manter título e botão na mesma linha */
        align-items: center;
        /* Alinhar verticalmente */
        margin-bottom: 10px;
    }

    #title-play h1 {
        font-size: 1.8em;
        /* Reduzir um pouco o tamanho do título em telas menores */
        margin-right: 5px;
        /* Adicionar um pouco de espaço entre o título e o botão */
    }

    #game-header {
        margin-bottom: -1.5em;
    }

    #gameMode label {
        margin: 0 8px;
        font-size: 0.9em;
    }

    #hearts {
        margin-top: 5px;
    }

    .heart {
        font-size: 1em;
        margin: 0 3px;
    }

    .writing-tools-top {
        display: flex;
        justify-content: flex-end;
    }

    .writing-tools {
        display: none;
    }

    #actions {
        display: flex;
        /* Use flexbox for horizontal arrangement that can wrap */
        flex-direction: row;
        flex-wrap: wrap;
        justify-content: space-around;
        /* Distribute buttons */
        padding: 10px;
        width: 100%;
        margin: 10px auto;
    }

    .button {
        font-size: 1em;
        padding: 0.8em 0.5em;
        /* Adjust padding for smaller screens */
        margin: 5px;
        /* Add some margin for spacing */
        display: inline-block;
        /* Allow buttons to sit side by side and wrap */

        /* Two buttons per row with spacing */
        box-sizing: border-box;
        /* Include padding and border in width */
        text-align: center;
    }

    #numbers {
        width: 100%;
        gap: 0;
        margin: 15px auto;
        margin-top: -1em;
        display: flex;
        justify-content: space-around;
        align-items: flex-start;
    }

    .eraser {
        width: 95%;
    }

    .number {
        flex-basis: calc(33.33% - 10px);
        margin: 2px;
        font-size: 1em;
        border-radius: 5px;
    }

    #clearCellButton {
        width: 80%;
        margin: 15px auto;
        display: block;
        padding: 0.8em;
        font-size: 1em;
        border-radius: 5px;
    }

    .v-dialog {
        width: 90% !important;
        max-width: 90% !important;
        margin: 30px auto;
        /* Add some top/bottom margin for dialogs */
    }
}

@media (max-width: 740px) {
    #board {
        width: 97vw;
    }
}

@media (max-width: 680px) {
    #board {
        width: 98vw;
    }
}

@media (max-width: 670px) {
    #board {
        width: 99vw;
    }
}

@media (max-width: 660px) {
    #board {
        width: 100vw;
    }
}

/* Further adjustments for very small screens (optional) */
@media (max-width: 480px) {
    .number {
        font-size: 0.9em;
        padding: 0.7em 0.4em;
        margin: 3px;
        flex-basis: calc(33.33% - 6px);
    }

    .button {
        font-size: 0.9em;
        padding: 0.7em;
    }

    #clearCellButton {
        font-size: 0.9em;
        padding: 0.7em;
        width: 70%;
    }
}
</style>