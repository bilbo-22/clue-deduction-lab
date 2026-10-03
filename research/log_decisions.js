// Logs every Smart (envelope) decision: for each of the 324 possible questions,
// notebook features a person could read, sample-based probabilities, and the Smart score.
// Usage: node log_decisions.js <firstSeed> <games> <out.csv>
const fs = require('fs');
const E = require('../src/engine.js');
const { CAT_RANGE, ENV, NP } = E;
const [first, games, out] = [+process.argv[2] || 1, +process.argv[3] || 50, process.argv[4] || 'decisions.csv'];

function mulberry(seed) { let a = seed >>> 0; return () => { a = (a + 0x6D2B79F5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }

const cols = ['dec', 'seed', 'turn', 'me', 'q', 's', 'w', 'r'];
const per = ['mine', 'cand', 'envyes', 'heldother', 'st1', 'st2', 'st3', 'nunk', 'inclue', 'catsolved', 'penv', 'p1', 'p2', 'p3'];
for (const k of ['S', 'W', 'R']) for (const f of per) cols.push(k + '_' + f);
cols.push('envH', 'score', 'best', 'std');
const lines = [cols.join(',')];
let dec = 0;

function H(m, tot) { let h = 0; for (const v of m.values()) { const f = v / tot; if (f > 0) h -= f * Math.log2(f); } return h; }

for (let seed = first; seed < first + games; seed++) {
  const g = E.newGame(seed, [3, 3, 3, 3], { ask: ['envgoal', 'envgoal', 'envgoal', 'envgoal'] });
  g.onDecide = (K, me, game) => {
    const rng = mulberry(seed * 1000 + game.turn);
    const samples = [];
    for (let i = 0; i < 120; i++) { const s = K.search(-1, -1, rng); if (s) samples.push(s); }
    if (samples.length < 2) return;
    const hints = E.hintsFor(game, me);
    const wt = samples.map(own => { let x = 1; for (const h of hints) for (const c of h.cards) if (own[c] === h.p) x *= 0.3; return x; });
    const tot = wt.reduce((a, b) => a + b, 0);
    const envKey = own => { let k = 0; for (let c = 0; c < 21; c++) if (own[c] === ENV) k = k * 32 + c; return k; };
    const ek = samples.map(envKey);
    const envAll = new Map(); ek.forEach((k, j) => envAll.set(k, (envAll.get(k) || 0) + wt[j]));
    const envH = H(envAll, tot);
    const opp = [1, 2, 3].map(i => (me + i) % NP);
    // marginals
    const pEnv = new Float64Array(21), pOpp = [new Float64Array(21), new Float64Array(21), new Float64Array(21)];
    samples.forEach((own, j) => { for (let c = 0; c < 21; c++) { if (own[c] === ENV) pEnv[c] += wt[j] / tot; opp.forEach((o, k) => { if (own[c] === o) pOpp[k][c] += wt[j] / tot; }); } });
    const solved = CAT_RANGE.map(([a, b]) => { for (let c = a; c < b; c++) if (K.get(c, ENV) === 1) return 1; return 0; });
    const openCl = K.clauses.filter(cl => !cl.done);
    const feat = (c, k) => {
      let held = 0, nunk = 0;
      opp.forEach(o => { if (K.get(c, o) === 1) held = 1; if (K.get(c, o) === 0) nunk++; });
      if (K.get(c, ENV) === 0) nunk++;
      return [K.get(c, me) === 1 ? 1 : 0, K.get(c, ENV) !== 2 ? 1 : 0, K.get(c, ENV) === 1 ? 1 : 0, held,
        K.get(c, opp[0]), K.get(c, opp[1]), K.get(c, opp[2]), nunk,
        openCl.filter(cl => cl.cards.includes(c)).length, solved[k],
        pEnv[c].toFixed(3), pOpp[0][c].toFixed(3), pOpp[1][c].toFixed(3), pOpp[2][c].toFixed(3)];
    };
    const F = []; for (let c = 0; c < 21; c++) F[c] = feat(c, c < 6 ? 0 : c < 12 ? 1 : 2);
    const std = E.chooseSuggestion(K, mulberry(seed * 7 + game.turn)).join('-');
    const rows = []; let best = -Infinity;
    let qi = 0;
    for (let s = 0; s < 6; s++) for (let w = 6; w < 12; w++) for (let r = 12; r < 21; r++) {
      const q = [s, w, r];
      const groups = new Map();
      samples.forEach((own, j) => {
        let key = -1, split = [ -1 ];
        for (let i = 0; i < 3; i++) { const has = q.filter(c => own[c] === opp[i]); if (has.length) { split = has.map(c => opp[i] * 32 + c); break; } }
        for (const key of split) {
          if (!groups.has(key)) groups.set(key, { w: 0, m: new Map() });
          const gr = groups.get(key), ww = wt[j] / split.length;
          gr.w += ww; gr.m.set(ek[j], (gr.m.get(ek[j]) || 0) + ww);
        }
      });
      let exp = 0; for (const gr of groups.values()) exp += (gr.w / tot) * H(gr.m, gr.w);
      const score = envH - exp; // expected information about the envelope, in bits
      if (score > best) best = score;
      rows.push([dec, seed, game.turn, me, qi++, s, w, r, ...F[s], ...F[w], ...F[r], envH.toFixed(3), score.toFixed(4), 0, q.join('-') === std ? 1 : 0]);
    }
    rows.forEach(row => { if (Math.abs(+row[row.length - 3] - best) < 1e-9) row[row.length - 2] = 1; lines.push(row.join(',')); });
    dec++;
  };
  while (!g.over && g.turn < 200) E.playTurn(g);
}
fs.writeFileSync(out, lines.join('\n'));
console.log(`decisions ${dec}, rows ${lines.length - 1}`);
