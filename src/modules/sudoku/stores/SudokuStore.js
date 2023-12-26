import { defineStore } from "pinia";

export const useSudokuStore = defineStore("sudoku", {
    state: () => ({
        board: [
            [null,null,null,null,null,null,2,4,null],
            [null,4,null,null,3,2,null,null,null],
            [null,3,6,null,5,null,null,null,null],
            [null,null,5,null,null,null,null,3,9],
            [3,null,null,null,4,null,null,null,5],
            [4,9,null,null,null,null,7,null,null],
            [null,null,null,null,2,null,6,7,null],
            [null,null,null,1,7,null,null,8,null],
            [null,7,8,null,null,null,null,null,null],
        ],
        solution: [
            [5, 8, 9, 7, 6, 1, 2, 4, 3],
            [7, 4, 1, 9, 3, 2, 5, 6, 8],
            [2, 3, 6, 8, 5, 4, 1, 9, 7],
            [8, 6, 5, 2, 1, 7, 4, 3, 9],
            [3, 1, 7, 6, 4, 9, 8, 2, 5],
            [4, 9, 2, 5, 8, 3, 7, 1, 6],
            [9, 5, 4, 3, 2, 8, 6, 7, 1],
            [6, 2, 3, 1, 7, 5, 9, 8, 4],
            [1, 7, 8, 4, 9, 6, 3, 5, 2],
        ],
        difficulty: 0,
    }),
})