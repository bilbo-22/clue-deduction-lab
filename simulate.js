// Runs the 1,000-game experiments and writes results/results.json.
// Usage: node simulate.js [games]
const fs = require('fs');
const { runGame, LEVELS } = require('./src/engine.js');
const games = +process.argv[2] || 1000;

function run(levels) {
  const t = [], w = [];
  for (let s = 1; s <= games; s++) {
    const g = runGame(s, levels);
    if (!g.over || g.wrong) throw new Error(`Deal ${s} did not end cleanly`);
    t.push(g.turn); w.push(g.winner);
  }
  return { levels, t, w };
}
function summary(r) {
  const s = [...r.t].sort((a, b) => a - b), n = s.length;
  const q = f => s[Math.min(n - 1, Math.ceil(f * n) - 1)];
  const wins = [0, 0, 0, 0]; r.w.forEach(x => wins[x]++);
  const mean = s.reduce((a, b) => a + b, 0) / n;
  return `${r.levels.map(l => LEVELS[l][0]).join('')}  mean ${mean.toFixed(2)}  median ${q(0.5)}  p90 ${q(0.9)}  p95 ${q(0.95)}  max ${s[n - 1]}  wins ${wins.map(x => (x / n * 100).toFixed(1) + '%').join(' ')}`;
}

const out = {
  same: [0, 1, 2, 3].map(l => run([l, l, l, l])),
  mixed: [0, 1, 2, 3].map(seat => run([0, 1, 2, 3].map(p => (p === seat ? 3 : 0)))),
  // Smart questions vs standard questions; every notebook is Perfect.
  smartAll: run([4, 4, 4, 4]),
  smartSeat: [0, 1, 2, 3].map(seat => run([0, 1, 2, 3].map(p => (p === seat ? 4 : 3)))),
};
fs.writeFileSync('results/results.json', JSON.stringify(out));
[...out.same, ...out.mixed, out.smartAll, ...out.smartSeat].forEach(r => console.log(summary(r)));
