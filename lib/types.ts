export type Difficulty = "easy" | "medium" | "hard" | "expert";

export type GameMode = "zen" | "three-strikes";

export type AdItem = {
  id: number;
  title: string;
  link: string;
  image: string;
  clicks: number;
};

export type Cell = {
  row: number;
  col: number;
  given: boolean;
  value: number | null;
  answer: number;
  candidates: number[];
  storedCandidates: number[];
  markColor: string | null;
  status: "idle" | "correct" | "wrong";
};
