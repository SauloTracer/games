import { defineStore } from "pinia";
import sudokuDatabase from "@/assets/sudoku.json";

const Difficulty = {
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
        getBoard() {
            // console.log(sudokuDatabase.length);
            // console.log("Easy", sudokuDatabase.filter((game) => parseFloat(game[1]) >= 0 && parseFloat(game[1]) <= 2).length);
            // console.log("Medium", sudokuDatabase.filter((game) => parseFloat(game[1]) >= 2.1 && parseFloat(game[1]) <= 4).length);
            // console.log("Hard", sudokuDatabase.filter((game) => parseFloat(game[1]) >= 4.1 && parseFloat(game[1]) <= 6).length);
            // console.log("Harder", sudokuDatabase.filter((game) => parseFloat(game[1]) >= 6.1 && parseFloat(game[1]) <= 99999).length);

            let subset = sudokuDatabase;
            const difficulty = "expert";
            if(difficulty) {
                let limit = [0,0];
                if (difficulty === Difficulty.EASY) limit = [0,2];
                if (difficulty === Difficulty.MEDIUM) limit = [2.1, 4];
                if (difficulty === Difficulty.HARD) limit = [4.1, 6];
                if (difficulty === Difficulty.EXPERT) limit = [6.1, 99999];
                subset = sudokuDatabase.filter((game) => {
                    const rating = parseFloat(game[1]);
                    return rating >= limit[0] && rating <= limit[1];
                });
            }

            console.log(subset[Math.floor(Math.random() * subset.length)]);
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