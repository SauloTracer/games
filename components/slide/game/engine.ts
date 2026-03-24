export function createOrderedBoard(size: number) {
  return Array.from({ length: size * size }, (_, index) => (index === size * size - 1 ? 0 : index + 1));
}

export function isSolvedBoard(board: number[]) {
  for (let index = 0; index < board.length - 1; index += 1) {
    if (board[index] !== index + 1) {
      return false;
    }
  }

  return board[board.length - 1] === 0;
}

export function getEmptyIndex(board: number[]) {
  return board.indexOf(0);
}

export function areIndicesAdjacent(size: number, left: number, right: number) {
  const leftRow = Math.floor(left / size);
  const leftCol = left % size;
  const rightRow = Math.floor(right / size);
  const rightCol = right % size;
  return Math.abs(leftRow - rightRow) + Math.abs(leftCol - rightCol) === 1;
}

export function moveTile(board: number[], size: number, tileIndex: number) {
  const emptyIndex = getEmptyIndex(board);
  if (!areIndicesAdjacent(size, tileIndex, emptyIndex)) {
    return null;
  }

  const next = [...board];
  [next[tileIndex], next[emptyIndex]] = [next[emptyIndex], next[tileIndex]];
  return next;
}

export function countInversions(board: number[]) {
  const numbers = board.filter((value) => value !== 0);
  let inversions = 0;

  for (let left = 0; left < numbers.length; left += 1) {
    for (let right = left + 1; right < numbers.length; right += 1) {
      if (numbers[left] > numbers[right]) {
        inversions += 1;
      }
    }
  }

  return inversions;
}

export function isSolvableBoard(board: number[], size: number) {
  const inversions = countInversions(board);
  if (size % 2 === 1) {
    return inversions % 2 === 0;
  }

  const emptyRowFromBottom = size - Math.floor(getEmptyIndex(board) / size);
  if (emptyRowFromBottom % 2 === 0) {
    return inversions % 2 === 1;
  }

  return inversions % 2 === 0;
}

function shuffle<T>(items: T[]) {
  const next = [...items];
  for (let index = next.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(Math.random() * (index + 1));
    [next[index], next[randomIndex]] = [next[randomIndex], next[index]];
  }
  return next;
}

export function createShuffledBoard(size: number) {
  const ordered = createOrderedBoard(size);
  let shuffled = ordered;

  do {
    shuffled = shuffle(ordered);
  } while (!isSolvableBoard(shuffled, size) || isSolvedBoard(shuffled));

  return shuffled;
}
