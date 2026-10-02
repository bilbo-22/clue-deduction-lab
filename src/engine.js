// ===== Clue engine: deal, play, and per-player deduction =====
const SUSPECTS = ['Scarlet', 'Mustard', 'White', 'Green', 'Peacock', 'Plum'];
const WEAPONS = ['Candlestick', 'Dagger', 'Lead Pipe', 'Revolver', 'Rope', 'Wrench'];
const ROOMS = ['Kitchen', 'Ballroom', 'Conservatory', 'Dining Room', 'Billiard Room', 'Library', 'Lounge', 'Hall', 'Study'];
const CARDS = [...SUSPECTS, ...WEAPONS, ...ROOMS];
const CAT = CARDS.map((_, i) => (i < 6 ? 0 : i < 12 ? 1 : 2));
const CAT_RANGE = [[0, 6], [6, 12], [12, 21]];
const CAT_NAME = ['Suspect', 'Weapon', 'Room'];
const N = 21, NP = 4, ENV = 4, NL = 5;
const UNK = 0, YES = 1, NO = 2;
const LEVELS = ['Basic', 'Counting', 'Clauses', 'Perfect'];
const LOC_NAME = l => (l === ENV ? 'Envelope' : 'P' + (l + 1));

function rngFrom(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6D2B79F5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
function shuffle(arr, rng) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

// One player's notebook. level: 0 Basic, 1 Counting, 2 Clauses, 3 Perfect.
class Know {
  constructor(me, sizes, level) {
    this.me = me;
    this.level = level;
    this.sizes = [...sizes, 3];
    this.g = new Int8Array(N * NL);
    this.why = new Array(N * NL).fill(null);
    this.clauses = [];
    this.contra = false;
    this.turn = 0;
    this.newFacts = [];
  }
  get(c, l) { return this.g[c * NL + l]; }
  set(c, l, v, kind, text) {
    const i = c * NL + l, cur = this.g[i];
    if (cur === v) return false;
    if (cur !== UNK) { this.contra = true; return false; }
    this.g[i] = v;
    this.why[i] = { turn: this.turn, kind, text };
    this.newFacts.push({ c, l, v, kind, text });
    return true;
  }
  initHand(hand) {
    const own = new Set(hand);
    for (let c = 0; c < N; c++) this.set(c, this.me, own.has(c) ? YES : NO, 'hand', own.has(c) ? 'In my hand' : 'Not in my hand');
    this.propagate();
  }
  observePass(p, cards, t) {
    this.turn = t;
    for (const c of cards) this.set(c, p, NO, 'pass', `P${p + 1} passed on turn ${t}`);
    this.propagate();
  }
  observeShown(p, card, t) {
    this.turn = t;
    this.set(card, p, YES, 'shown', `P${p + 1} showed me this on turn ${t}`);
    this.propagate();
  }
  observeClause(p, cards, t) {
    this.turn = t;
    if (this.level >= 2) this.clauses.push({ id: t, p, cards: [...cards], done: false, note: '' });
    this.propagate();
  }

  // Fixpoint of every rule this player's level knows.
  propagate() {
    let changed = true;
    while (changed && !this.contra) {
      changed = false;
      // Card rule: each card lives in exactly one place.
      for (let c = 0; c < N; c++) {
        let yesAt = -1, open = 0, last = -1;
        for (let l = 0; l < NL; l++) {
          const v = this.get(c, l);
          if (v === YES) yesAt = l;
          if (v !== NO) { open++; last = l; }
        }
        if (yesAt >= 0) {
          for (let l = 0; l < NL; l++) if (l !== yesAt && this.get(c, l) === UNK)
            changed = this.set(c, l, NO, 'card', `${CARDS[c]} is with ${LOC_NAME(yesAt)}`) || changed;
        } else if (open === 1) {
          changed = this.set(c, last, YES, 'card', `Every other place is ruled out for ${CARDS[c]}`) || changed;
        } else if (open === 0) this.contra = true;
      }
      // Envelope holds exactly one card per category.
      for (let k = 0; k < 3; k++) {
        const [a, b] = CAT_RANGE[k];
        let yes = -1, open = 0, last = -1;
        for (let c = a; c < b; c++) {
          const v = this.get(c, ENV);
          if (v === YES) yes = c;
          if (v !== NO) { open++; last = c; }
        }
        if (yes >= 0) {
          for (let c = a; c < b; c++) if (c !== yes && this.get(c, ENV) === UNK)
            changed = this.set(c, ENV, NO, 'env', `Envelope ${CAT_NAME[k].toLowerCase()} is ${CARDS[yes]}`) || changed;
        } else if (open === 1) {
          changed = this.set(last, ENV, YES, 'env', `Only ${CAT_NAME[k].toLowerCase()} left that nobody can hold`) || changed;
        } else if (open === 0) this.contra = true;
      }
      if (this.level >= 1) changed = this.countRule() || changed;
      if (this.level >= 2) changed = this.clauseRule() || changed;
    }
  }
  countRule() {
    let changed = false;
    for (let p = 0; p < NP; p++) {
      if (p === this.me) continue;
      let yes = 0, unk = 0;
      for (let c = 0; c < N; c++) { const v = this.get(c, p); if (v === YES) yes++; else if (v === UNK) unk++; }
      const n = this.sizes[p];
      if (yes > n || yes + unk < n) { this.contra = true; return false; }
      if (unk === 0) continue;
      if (yes === n) {
        for (let c = 0; c < N; c++) if (this.get(c, p) === UNK)
          changed = this.set(c, p, NO, 'count', `P${p + 1}'s ${n} cards are all known`) || changed;
      } else if (yes + unk === n) {
        for (let c = 0; c < N; c++) if (this.get(c, p) === UNK)
          changed = this.set(c, p, YES, 'count', `P${p + 1} holds ${n} cards and only ${n} slots remain open`) || changed;
      }
    }
    return changed;
  }
  clauseRule() {
    let changed = false;
    for (const cl of this.clauses) {
      if (cl.done) continue;
      const hit = cl.cards.find(c => this.get(c, cl.p) === YES);
      if (hit !== undefined) { cl.done = true; cl.note = `explained by ${CARDS[hit]}`; continue; }
      const open = cl.cards.filter(c => this.get(c, cl.p) !== NO);
      if (open.length === 0) { this.contra = true; return false; }
      if (open.length === 1) {
        changed = this.set(open[0], cl.p, YES, 'clause', `Clue #${cl.id}: P${cl.p + 1} showed a card and the other two are ruled out`) || changed;
        cl.done = true; cl.note = `resolved to ${CARDS[open[0]]}`;
      }
    }
    // Disjoint open clauses each need their own card from the hand.
    for (let p = 0; p < NP; p++) {
      if (p === this.me) continue;
      const sets = this.clauses.filter(cl => !cl.done && cl.p === p && !cl.cards.some(c => this.get(c, p) === YES))
        .map(cl => ({ id: cl.id, open: cl.cards.filter(c => this.get(c, p) === UNK) }))
        .sort((x, y) => x.open.length - y.open.length);
      if (!sets.length) continue;
      const used = new Set(), picked = [];
      for (const s of sets) if (s.open.every(c => !used.has(c))) { s.open.forEach(c => used.add(c)); picked.push(s.id); }
      let yes = 0;
      for (let c = 0; c < N; c++) if (this.get(c, p) === YES) yes++;
      const n = this.sizes[p];
      if (yes + picked.length > n) { this.contra = true; return false; }
      if (yes + picked.length === n) {
        for (let c = 0; c < N; c++) if (!used.has(c) && this.get(c, p) === UNK)
          changed = this.set(c, p, NO, 'pack', `P${p + 1} has ${yes} known + clues ${picked.map(i => '#' + i).join(', ')} fill all ${n} slots`) || changed;
      }
    }
    return changed;
  }

  // Perfect play: a cell is decided when no consistent full deal disagrees.
  deepen() {
    if (this.level < 3 || this.contra) return;
    let again = true;
    while (again && !this.contra) {
      again = false;
      const seen = new Uint8Array(N * NL);
      const mark = sol => { for (let c = 0; c < N; c++) seen[c * NL + sol[c]] = 1; };
      const base = this.search(-1, -1);
      if (base === null) { this.contra = true; return; }
      if (!base) return;
      mark(base);
      for (let c = 0; c < N; c++) for (let l = 0; l < NL; l++) {
        const i = c * NL + l;
        if (this.g[i] !== UNK || seen[i]) continue;
        const sol = this.search(c, l);
        if (sol) mark(sol);
        else if (sol === false) seen[i] = 1;
        else if (sol === null) again = this.set(c, l, NO, 'search', `No consistent deal puts ${CARDS[c]} with ${LOC_NAME(l)}`) || again;
      }
      for (let c = 0; c < N; c++) {
        let cnt = 0, at = -1;
        for (let l = 0; l < NL; l++) if (seen[c * NL + l]) { cnt++; at = l; }
        if (cnt === 1 && this.get(c, at) === UNK)
          again = this.set(c, at, YES, 'search', `Every consistent deal puts ${CARDS[c]} with ${LOC_NAME(at)}`) || again;
      }
      this.propagate();
    }
  }
  // Backtracking search for one full deal consistent with the notebook.
  // Returns the owner array, null if none exists, or false if the node budget ran out.
  search(forceC, forceL) {
    const dom = [];
    const owner = new Int8Array(N).fill(-1);
    const cnt = new Int8Array(NL);
    const envCat = [0, 0, 0];
    const order = [];
    for (let c = 0; c < N; c++) {
      let d = [];
      for (let l = 0; l < NL; l++) if (this.get(c, l) !== NO) d.push(l);
      if (c === forceC) d = d.includes(forceL) ? [forceL] : [];
      if (!d.length) return null;
      dom[c] = d;
      if (d.length === 1) {
        const l = d[0];
        owner[c] = l; cnt[l]++;
        if (l === ENV) envCat[CAT[c]]++;
      } else order.push(c);
    }
    for (let l = 0; l < NL; l++) if (cnt[l] > this.sizes[l]) return null;
    if (envCat.some(x => x > 1)) return null;
    order.sort((x, y) => dom[x].length - dom[y].length);
    const clauses = this.clauses.filter(cl => !cl.done);
    const sizes = this.sizes;
    let budget = 60000;
    const feasible = from => {
      for (let l = 0; l < NL; l++) {
        const need = sizes[l] - cnt[l];
        if (need === 0) continue;
        let av = 0;
        for (let j = from; j < order.length && av < need; j++) if (dom[order[j]].includes(l)) av++;
        if (av < need) return false;
      }
      for (let k = 0; k < 3; k++) {
        if (envCat[k]) continue;
        let ok = false;
        for (let j = from; j < order.length && !ok; j++) { const c = order[j]; if (CAT[c] === k && dom[c].includes(ENV)) ok = true; }
        if (!ok) return false;
      }
      for (const cl of clauses) {
        let ok = false;
        for (const c of cl.cards) {
          if (owner[c] === cl.p || (owner[c] === -1 && dom[c].includes(cl.p))) { ok = true; break; }
        }
        if (!ok) return false;
      }
      return true;
    };
    if (!feasible(0)) return null;
    const dfs = i => {
      if (--budget < 0) return false;
      if (i === order.length) return true;
      const c = order[i];
      for (const l of dom[c]) {
        if (cnt[l] >= sizes[l]) continue;
        if (l === ENV && envCat[CAT[c]]) continue;
        owner[c] = l; cnt[l]++;
        if (l === ENV) envCat[CAT[c]]++;
        if (feasible(i + 1) && dfs(i + 1)) return true;
        owner[c] = -1; cnt[l]--;
        if (l === ENV) envCat[CAT[c]]--;
        if (budget < 0) return false;
      }
      return false;
    };
    const ok = dfs(0);
    if (ok) return owner;
    return budget < 0 ? false : null;
  }
  solution() {
    const out = [];
    for (let k = 0; k < 3; k++) {
      const [a, b] = CAT_RANGE[k];
      let f = -1;
      for (let c = a; c < b; c++) if (this.get(c, ENV) === YES) f = c;
      if (f < 0) return null;
      out.push(f);
    }
    return out;
  }
  candidates() {
    return CAT_RANGE.map(([a, b]) => { let n = 0; for (let c = a; c < b; c++) if (this.get(c, ENV) !== NO) n++; return n; });
  }
  known() { let n = 0; for (let i = 0; i < N * NL; i++) if (this.g[i]) n++; return n; }
  snapshot() {
    return {
      g: Int8Array.from(this.g), why: this.why.slice(),
      clauses: this.clauses.map(cl => ({ ...cl, cards: cl.cards.slice() })),
      cands: this.candidates(), known: this.known(),
    };
  }
}

// Pick a suggestion: in each unsolved category ask about the least-known envelope candidate;
// in a solved category, use a card I hold (or the answer) so it reveals nothing about that category.
function chooseSuggestion(K, rng) {
  return CAT_RANGE.map(([a, b]) => {
    let solved = -1;
    for (let c = a; c < b; c++) if (K.get(c, ENV) === YES) solved = c;
    if (solved >= 0) {
      const mine = [];
      for (let c = a; c < b; c++) if (K.get(c, K.me) === YES) mine.push(c);
      return mine.length ? mine[Math.floor(rng() * mine.length)] : solved;
    }
    let best = -1, pool = [];
    for (let c = a; c < b; c++) {
      if (K.get(c, ENV) === NO) continue;
      let u = 0;
      for (let l = 0; l < NL; l++) if (K.get(c, l) === UNK) u++;
      if (u > best) { best = u; pool = [c]; } else if (u === best) pool.push(c);
    }
    return pool[Math.floor(rng() * pool.length)];
  });
}

function newGame(seed, levels, opts = {}) {
  const rng = rngFrom(seed);
  const env = CAT_RANGE.map(([a, b]) => a + Math.floor(rng() * (b - a)));
  const rest = shuffle(CARDS.map((_, i) => i).filter(i => !env.includes(i)), rng);
  const hands = [[], [], [], []];
  rest.forEach((c, i) => hands[i % NP].push(c));
  hands.forEach(h => h.sort((x, y) => x - y));
  const sizes = hands.map(h => h.length);
  const knows = hands.map((h, p) => { const K = new Know(p, sizes, levels[p]); K.initHand(h); return K; });
  if (opts.full) knows.forEach(K => K.deepen());
  const game = { seed, rng, env, hands, sizes, knows, levels, turn: 0, over: false, winner: -1, wrong: 0, events: [], shownTo: hands.map(() => new Map()), full: !!opts.full, snaps: [] };
  if (opts.full) game.snaps.push(knows.map(K => K.snapshot()));
  return game;
}

function accuse(game, p, sol, ev) {
  ev.accusation = sol;
  const right = sol.every((c, i) => c === game.env[i]);
  ev.correct = right;
  if (right) { game.over = true; game.winner = p; } else game.wrong++;
}

function playTurn(game) {
  const t = ++game.turn;
  const p = (t - 1) % NP;
  const K = game.knows[p];
  game.knows.forEach(k => { k.newFacts = []; k.turn = t; });
  const ev = { turn: t, player: p, suggestion: null, passes: [], responder: -1, shown: -1, accusation: null, facts: null };
  K.deepen();
  let sol = K.solution();
  if (sol) {
    accuse(game, p, sol, ev);
  } else {
    const sug = chooseSuggestion(K, game.rng);
    ev.suggestion = sug;
    for (let i = 1; i < NP; i++) {
      const r = (p + i) % NP;
      const has = sug.filter(c => game.hands[r].includes(c));
      if (!has.length) {
        ev.passes.push(r);
        game.knows.forEach(k => { if (k.me !== r) k.observePass(r, sug, t); });
        continue;
      }
      const prior = game.shownTo[r].get(p) || new Set();
      const reuse = has.filter(c => prior.has(c));
      const card = reuse.length ? reuse[0] : has[Math.floor(game.rng() * has.length)];
      prior.add(card); game.shownTo[r].set(p, prior);
      ev.responder = r; ev.shown = card;
      game.knows.forEach(k => {
        if (k.me === p) k.observeShown(r, card, t);
        else if (k.me !== r) k.observeClause(r, sug, t);
      });
      break;
    }
    K.deepen();
    sol = K.solution();
    if (sol) accuse(game, p, sol, ev);
  }
  if (game.full) {
    game.knows.forEach(k => k.deepen());
    game.snaps.push(game.knows.map(k => k.snapshot()));
  }
  ev.facts = game.knows.map(k => k.newFacts);
  game.events.push(ev);
  if (game.knows.some(k => k.contra)) throw new Error('Contradiction in game ' + game.seed);
  return ev;
}

function runGame(seed, levels, opts) {
  const g = newGame(seed, levels, opts);
  while (!g.over && g.turn < 500) playTurn(g);
  return g;
}

if (typeof module !== 'undefined') module.exports = { runGame, newGame, playTurn, CARDS, LEVELS };
