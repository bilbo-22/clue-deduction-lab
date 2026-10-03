// Derives the room-to-room step table used by src/engine.js (BOARD_DIST / START_DIST) from an
// approximate 24 x 25 grid of the classic board. Run: node research/board_grid.js
// Rooms are rectangles [row0,row1,col0,col1]; every other cell is corridor except the cellar.
// Door = the corridor cell in front of a doorway. Layout reconstructed from memory of the US board.
const ROOMS = ['Kitchen', 'Ballroom', 'Conservatory', 'Dining Room', 'Billiard Room', 'Library', 'Lounge', 'Hall', 'Study'];
const RECT = [[18, 24, 18, 23], [17, 23, 8, 15], [19, 24, 0, 5], [9, 15, 17, 23], [12, 16, 0, 5], [6, 10, 0, 5], [0, 5, 17, 23], [0, 5, 9, 13], [0, 3, 0, 6]];
const CELLAR = [8, 14, 9, 13];
const DOORS = [[[17, 19]], [[16, 9], [16, 14], [19, 7], [19, 16]], [[18, 4]], [[12, 16], [8, 17]], [[12, 6], [17, 1]], [[8, 6], [5, 3]], [[6, 17]], [[6, 10], [6, 12], [4, 14]], [[4, 6]]];
// Classic start squares: Scarlet, Mustard, White, Green.
const START = [[0, 16], [7, 23], [24, 9], [0, 14]];
const R = 25, C = 24;
const inR = (r, c, b) => r >= b[0] && r <= b[1] && c >= b[2] && c <= b[3];
const wall = (r, c) => RECT.some(b => inR(r, c, b)) || inR(r, c, CELLAR);
function bfs(sr, sc) {
  const d = Array.from({ length: R }, () => Array(C).fill(-1)); d[sr][sc] = 0;
  const q = [[sr, sc]];
  while (q.length) {
    const [r, c] = q.shift();
    for (const [dr, dc] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
      const a = r + dr, b = c + dc;
      if (a < 0 || b < 0 || a >= R || b >= C || wall(a, b) || d[a][b] >= 0) continue;
      d[a][b] = d[r][c] + 1; q.push([a, b]);
    }
  }
  return d;
}
const dist = ROOMS.map(() => ROOMS.map(() => 0));
for (let i = 0; i < 9; i++) for (let j = 0; j < 9; j++) {
  if (i === j) continue;
  let best = 99;
  for (const [r, c] of DOORS[i]) { const d = bfs(r, c); for (const [r2, c2] of DOORS[j]) best = Math.min(best, d[r2][c2] + 2); }
  dist[i][j] = best;
}
const start = START.map(([r, c]) => { const d = bfs(r, c); return ROOMS.map((_, j) => Math.min(...DOORS[j].map(([r2, c2]) => d[r2][c2])) + 1); });
console.log('const BOARD_DIST = ' + JSON.stringify(dist).replace(/\],\[/g, '],\n  [') + ';');
console.log('const START_DIST = ' + JSON.stringify(start).replace(/\],\[/g, '],\n  [') + ';');
