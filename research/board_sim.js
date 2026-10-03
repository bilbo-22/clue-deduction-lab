// Board-mode experiments. Usage: node research/board_sim.js <config> <deals> [dice] [start] [step]
// configs: std, mostx, smart (whole table); mostx1, smart1 (one such player vs 3 Standard, every seat)
// Prints one JSON line {turns:[], wins:[...], wrong, n}; use research/board_run.sh to shard across processes.
const { runGame } = require('../src/engine.js');
const [cfg, deals, dice = '2', start = '1', step = '1', floor]  = process.argv.slice(2);
const opts = ask => ({ board: { dice: +dice, floor: floor === undefined ? undefined : +floor }, ask });
const out = { turns: [], wins: [], wrong: 0, n: 0, noWin: 0 };
function one(seed, levels, ask) {
  const g = runGame(seed, levels, opts(ask));
  if (g.wrong) out.wrong += g.wrong;
  if (!g.over) out.noWin++;
  out.turns.push(g.turn); out.wins.push(g.winner); out.n++;
  return g;
}
for (let s = +start; s <= +deals; s += +step) {
  if (cfg === 'std') one(s, [3, 3, 3, 3], null);
  else if (cfg === 'mostx') one(s, [3, 3, 3, 3], Array(4).fill('likelydigits'));
  else if (cfg === 'smart') one(s, [4, 4, 4, 4], null);
  else {
    // one special player in each seat vs 3 Standard; record whether the special seat won (seat in 'wins' = 1 if special won)
    for (let seat = 0; seat < 4; seat++) {
      const m = cfg === 'mostx1' ? 'likelydigits' : 'basic';
      const lv = cfg === 'smart1' ? 4 : 3;
      const ask = [0, 1, 2, 3].map(i => (i === seat ? (cfg === 'smart1' ? 'envgoal' : m) : 'basic'));
      const g = one(s, [0, 1, 2, 3].map(i => (i === seat ? lv : 3)), ask);
      out.wins[out.wins.length - 1] = g.winner === seat ? 1 : 0;
      out.seatWins = out.seatWins || [0, 0, 0, 0]; out.seatWins[seat] += g.winner === seat ? 1 : 0;
    }
  }
}
console.log(JSON.stringify(out));
