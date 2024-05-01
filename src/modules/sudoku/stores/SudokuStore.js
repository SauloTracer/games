import { defineStore } from "pinia";
import sudokuDatabase from "@/assets/sudoku.json";

export const Difficulty = {
    EASY: "easy",
    MEDIUM: "medium",
    HARD: "hard",
    EXPERT: "expert",
}

export const useSudokuStore = defineStore("sudoku", {
    state: () => ({
        board: [[], [], [], [], [], [], [], [], []],
    }),
    actions: {
        getBoard(difficulty) {
            // console.log(sudokuDatabase.length);
            // console.log("Easy", sudokuDatabase.filter((game) => parseFloat(game[1]) >= 0 && parseFloat(game[1]) <= 2).length);
            // console.log("Medium", sudokuDatabase.filter((game) => parseFloat(game[1]) >= 2.1 && parseFloat(game[1]) <= 3).length);
            // console.log("Hard", sudokuDatabase.filter((game) => parseFloat(game[1]) >= 4.1 && parseFloat(game[1]) <= 6).length);
            // console.log("Harder", sudokuDatabase.filter((game) => parseFloat(game[1]) >= 6.1 && parseFloat(game[1]) <= 99999).length);

            let subset = sudokuDatabase;
            if(difficulty) {
                let limit = [0,0];
                if (difficulty === Difficulty.EASY) limit = [0,3];
                if (difficulty === Difficulty.MEDIUM) limit = [3.1, 5];
                if (difficulty === Difficulty.HARD) limit = [5.1, 7];
                if (difficulty === Difficulty.EXPERT) limit = [7.1, 99999];
                subset = sudokuDatabase.filter((game) => {
                    const rating = parseFloat(game[1]);
                    return rating >= limit[0] && rating <= limit[1];
                });
            }

            const game = subset[Math.floor(Math.random() * subset.length)][0];
            // separate board into rows
            const rows = game.match(/.{1,9}/g);
            // separate rows into columns
            const columns = rows.map((row) => row.replace(".", "0").split(""));
            // convert columns to numbers
            const board = columns.map((column) => column.map((cell) => parseInt(cell)));
            this.board = board;
        }
    },
})