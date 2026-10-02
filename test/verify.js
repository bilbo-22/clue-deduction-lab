// Soundness checks: no contradictions, no wrong accusations, and the tick rule always holds.
const { runGame } = require('../src/engine.js');
let rows = 0, broken = 0, games = 0;
for (let s = 1; s <= 200; s++) for (const lv of [0, 1, 2, 3]) {
  const g = runGame(s, [lv, lv, lv, lv], { full: true });
  games++;
  if (!g.over || g.wrong) throw new Error(`Deal ${s} level ${lv} did not end cleanly`);
  for (const snap of g.snaps) for (const k of snap) for (let c = 0; c < 21; c++) {
    const row = [...k.g.slice(c * 5, c * 5 + 5)];
    if (row.includes(1)) { rows++; if (row.filter(v => v === 2).length !== 4) broken++; }
  }
}
console.log(`${games} games, ${rows} ticked rows checked, ${broken} broken`);
if (broken) process.exit(1);
