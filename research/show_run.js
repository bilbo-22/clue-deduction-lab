// node show_run.js <focalPolicy> <askMode> <level> <deals> <start> <step>
const { runGame } = require('../src/engine.js');
const [pol, ask, lv, deals, start, step] = process.argv.slice(2);
let w = 0, n = 0, turns = 0;
for (let s = +start; s <= +deals; s += +step) for (let seat = 0; seat < 4; seat++) {
  const show = [0, 1, 2, 3].map(i => (i === seat ? pol : 'asker'));
  const g = runGame(s, Array(4).fill(+lv), { ask: Array(4).fill(ask), show });
  n++; turns += g.turn; if (g.winner === seat) w++;
}
console.log(JSON.stringify({ w, n, turns }));
