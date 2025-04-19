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
                                            @click="selectCell(cell.coordinates.row, cell.coordinates.col, true, $event)"
                                            @updateCandidates="cell.candidates = $event"
                                        ></Cell>
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
                <button
                    class="button"
                    v-if="!autoCheckCells"
                    @click="checkCell()"
                >Check Cell</button>
                <button
                    class="button"
                    @click="autoCandidate()"
                >Auto Candidate</button>
                <button
                    class="button"
                    @click="promoteSingles()"
                >Promote Singles</button>
                <button
                    class="button"
                    @click="markCells()"
                >{{ markCellsText }}</button>
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
                        <v-btn @click="showMarkCellsDialog = false">
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
}

enum GameMode {
    Zen = "zen",
    ThreeStrikes = "threeStrikes",
}

import { ref, onBeforeMount, computed } from 'vue'
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
const isMarkingCells = ref(false);
const showMarkCellsDialog = ref(false)
const markColor = ref()
const swatches = [
    ['#FF0000', '#AA0000', '#550000'],
    ['#FFFF00', '#AAAA00', '#555500'],
    ['#00FF00', '#00AA00', '#005500'],
    ['#00FFFF', '#00AAAA', '#005555'],
    ['#0000FF', '#0000AA', '#000055'],
];

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

const markCellsText = computed(() => {
    return isMarkingCells.value ? 'Finish Marking' : 'Mark Cells';
})

function markCells() {
    isMarkingCells.value = !isMarkingCells.value;
    if (!isMarkingCells.value) {
        showMarkCellsDialog.value = false;
        return
    }
    showMarkCellsDialog.value = true;
}

function clearMarks() {
    markColor.value = '#FFFFFF';
    showMarkCellsDialog.value = false;
}

function clearAllMarks() {
    [0, 1, 2, 3, 4, 5, 6, 7, 8].map(col =>
        [0, 1, 2, 3, 4, 5, 6, 7, 8].map(row =>
            board.value[row][col].color = '#FFFFFF'
        )
    );
    showMarkCellsDialog.value = false;
    isMarkingCells.value = false;
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
    isMarkingCells.value = false;

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

function selectCell(row: number, col: number, fromClick: boolean = false, event: Event = null) {
    if (fromClick) {
        // console.log("CLICK", event)
        if (isMarkingCells.value) {
            board.value[row][col].color = markColor.value
        }
        // if (event?.ctrlKey) {
        //     if (selectedCell.value) {
        //         alert(typeof (selectedCell.value))
        //     }
        // }
    }
    highlightValue.value = board.value[row][col].value;
    selectedCell.value = board.value[row][col];
    [0, 1, 2, 3, 4, 5, 6, 7, 8].map(row =>
        [0, 1, 2, 3, 4, 5, 6, 7, 8].map(col => {
            board.value[row][col].selected = false;
            board.value[row][col].highlight = false;
        })
    );
    board.value[row][col].selected = true;
    highlightConnectedCells(row, col);
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
    // console.log(event.key, selectedCell.value, selectedCell.value?.coordinates);
    // Ctrl + C => Auto candidates
    // if (event.ctrlKey && event.altlKey) {
    //     console.log(event.key, event)
    //     event.preventDefault()
    // }

    if (!selectedCell.value) return;

    let row = selectedCell.value.coordinates.row;
    let col = selectedCell.value.coordinates.col;

    if (event.key == ' ') {
        fillCandidates.value = !fillCandidates.value;
        return;
    }

    if (event.ctrlKey && event.key == 'z') {
        undo();
        return;
    }

    if (event.key == 'ArrowUp') {
        row = row > 0 ? row - 1 : 8;
        if (event.shiftKey) {
            let count = 0;
            while (board.value[row][col].type != 'candidate' && count < 9) {
                row = row > 0 ? row - 1 : 8;
                count++;
            }
        } else {
            if (event.ctrlKey) {
                row = row == 0 ? 8 : 0;
            }
        }
        selectCell(row, col);
        return;
    }
    if (event.key == 'ArrowDown') {
        row = row < 8 ? row + 1 : 0;
        if (event.shiftKey) {
            let count = 0;
            while (board.value[row][col].type != 'candidate' && count < 9) {
                row = row < 8 ? row + 1 : 0;
                count++;
            }
        } else {
            if (event.ctrlKey) {
                row = row == 8 ? 0 : 8;
            }
        }
        selectCell(row, col);
        return;
    }
    if (event.key == 'ArrowLeft') {
        col = col > 0 ? col - 1 : 8;
        if (event.shiftKey) {
            let count = 0;
            while (board.value[row][col].type != 'candidate' && count < 9) {
                col = col > 0 ? col - 1 : 8;
                count++;
            }
        } else {
            if (event.ctrlKey) {
                col = col == 0 ? 8 : 0;
            }
        }
        selectCell(row, col);
        return;
    }
    if (event.key == 'ArrowRight') {
        col = col < 8 ? col + 1 : 0;
        if (event.shiftKey) {
            let count = 0;
            while (board.value[row][col].type != 'candidate' && count < 9) {
                col = col < 8 ? col + 1 : 0;
                count++;
            }
        } else {
            if (event.ctrlKey) {
                col = col == 8 ? 0 : 8;
            }
        }

        selectCell(row, col);
        return;
    }

    if (selectedCell.value.type != 'given') {
        if (!["1", "2", "3", "4", "5", "6", "7", "8", "9", "Backspace", "Delete"].includes(event.key)) return;

        if (["Backspace", "Delete"].includes(event.key)) {
            clearCellValue();
        } else {
            setCellValue(parseInt(event.key));
        }
    }
}

function setCellValue(value: number) {
    if (!selectedCell.value) return;
    if (selectedCell.value.type == 'given') return;

    if (fillCandidates.value) {
        if (!selectedCell.value.candidates.includes(value)) {
            selectedCell.value.candidates.push(value);
        } else {
            selectedCell.value.candidates = selectedCell.value.candidates.filter(candidate => candidate != value);
        }
    } else {
        selectedCell.value.value = value;
        selectedCell.value.type = 'filled';
        handleStrikes(selectedCell.value);
        removeCandidateFromConnectedCells(value, selectedCell.value.coordinates.row, selectedCell.value.coordinates.col);
    }
    highlightValue.value = value;
    handleFinish();
    saveChanges();
    save();
}

function clearCellValue() {
    if (!selectedCell.value) return;
    if (selectedCell.value.type == 'given') return;

    selectedCell.value.value = null;
    selectedCell.value.type = 'candidate';

    // selectedCell.value.candidates = getCellCandidates(selectedCell.value.coordinates.row, selectedCell.value.coordinates.col);

    highlightValue.value = null;
    saveChanges();
}

function esc() {
    selectedCell.value = null;
    highlightValue.value = null;
    highlightedCells.value = [];
    [0, 1, 2, 3, 4, 5, 6, 7, 8].map(row =>
        [0, 1, 2, 3, 4, 5, 6, 7, 8].map(col =>
            board.value[row][col].selected = false
        )
    );
    isMarkingCells.value = false;
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
    board.value = localSave.board;
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
    localStorage.setItem('sudoku-changes', JSON.stringify(changes));
}

function undo() {
    let changes = JSON.parse(localStorage.getItem('sudoku-changes') ?? JSON.stringify([board.value]));
    let state = changes.pop();
    board.value = state.board;
    if (state.selectedCell) selectCell(state.selectedCell.coordinates.row, state.selectedCell.coordinates.col);
    if (changes.length == 0) changes.push({ board: board.value, selectedCell: selectedCell.value });
    localStorage.setItem('sudoku-changes', JSON.stringify(changes));
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