# Solving the Game Clue

How many turns does a four-player game of Clue take if everyone reasons perfectly? This project simulates 1,000 deals and shows every player's notebook turn by turn: ticks, crosses and numbered clues, with the reason behind each mark.

**Interactive page:** https://bilbo-22.github.io/solving-the-game-clue/

**Just want to win?** Read [STRATEGY.md](STRATEGY.md), the best strategy we found, step by step.

## Results

With four perfect logicians, a game is solved on **turn 21.5 on average** (a turn is one player's go, so about round 6).

| Every seat plays | Mean turn | Median | 90% done by | 95% done by | Slowest |
|---|---|---|---|---|---|
| Basic | 30.00 | 31 | 38 | 39 | 46 |
| Counting | 27.30 | 29 | 33 | 34 | 41 |
| Clauses | 21.72 | 22 | 26 | 27 | 31 |
| Perfect | 21.46 | 22 | 26 | 26 | 30 |

- **Tracking numbered clues is the biggest win.** It takes games from 27 turns to 22. Full exhaustive search adds very little on top.
- **Notation is a real edge.** One Perfect player among three Basic players wins 73–87% of games, depending on seat (a fair share is 25%).
- **Seat matters, mostly through hand size.** At an even table of Perfect players, seat 1 wins 43%, seat 2 28%, seats 3 and 4 about 14% each. Shifting the deal so seats 3 and 4 hold 5 cards flips this (21 / 20 / 29 / 31%), so the fifth card matters more than moving first.
- **No wrong accusations** in any game: every player only accuses when their notebook proves the answer.

## Questioning strategies

Every notebook below is Perfect; only the way of choosing a suggestion changes.

| 1,000 deals | Standard | Smart v1 | **Smart** (on the page) |
|---|---|---|---|
| Whole table, mean turn the game ends | 21.46 | 16.46 | **11.49** |
| Whole table, 95% solved by | 26 | 21 | **17** |
| One player using it vs 3 Standard, average win rate across seats | 25% | 40.9% | **59.4%** |
| One player using it vs 3 Smart v1 | | 25% | **52.7%** |

- **Standard:** in each unsolved category, name the envelope candidate the notebook knows least about.
- **Smart v1:** build 40 complete deals consistent with the notebook, try all 324 suggestions in each, and ask the one whose answer (who shows, which card) is hardest to predict. It also reads opponents' suggestions: a deal where an opponent holds a card they asked about counts for less (weight 0.3). That reading only steers the question; it never writes a mark.
- **Smart:** same sampling and opponent reading with 120 deals, but each suggestion is scored by the expected uncertainty left about the three envelope cards only. It hunts for the answer instead of learning about every card, and it wins even from seat 3 (46.6% vs 3 Standard).

**A rule a person can use:**

1. In each unsolved category, name the card that could still be the answer and has the most X's in its row (the card the most players have already ruled out).
2. If cards tie on X's, take the one with the fewest clue numbers on it.
3. In a solved category, name one of your own cards (or the solved card if you have none).

A whole table playing this way solves the game in 12.5 turns, and one such player beats three Standard players about 64% of the time. Smart still wins head to head. See [research/](research/) for how this was found from 2,125 logged Smart decisions.

Things that did not work:

- **Padding with your own cards** (one unknown plus two of your cards) loses about 13 points of win rate. It makes "nobody can answer" 3.6 times more likely, and that answer is public: the next player to move uses it first.
- **Hiding information** (penalizing what opponents learn from the answer) slowed the hider down more than the opponents.

## The rules each level uses

Each level keeps the rules of the levels before it and repeats them until nothing new follows.

1. **Basic.** A card is in exactly one place: a tick fills the rest of its row with X, and a row with one open cell left gets the tick. The envelope holds one card per category. Plus direct marks: your own hand, cards shown to you, and players who pass.
2. **Counting.** Hand sizes. If a player's cards are all known, the rest of their column is X. If only as many open cells remain as they have cards, all of them are ticks.
3. **Clauses.** When a player shows someone else a card, onlookers write the turn number on all three suggested cards in that player's column. When two of the three get an X, the third is a tick. Disjoint open clues that fill a player's remaining slots rule out every other card in their column. If nobody can answer a suggestion and the asker does not accuse, the asker must hold one of the three cards (otherwise all three would be in the envelope and they would have won), so onlookers record that as a clue too.
4. **Perfect.** Backtracking search over full deals consistent with everything observed. A cell is X if no consistent deal puts the card there, and a tick if every consistent deal does. Searches are capped at 5 million steps per cell; in 300 test games no search hit the cap. A cell the cap can't settle stays blank, so the notebook never claims more than it can prove.

## Assumptions

- 21 cards: 6 suspects, 6 weapons, 9 rooms. Seats 1–2 get 5 cards, seats 3–4 get 4.
- **No board** in the main results: every player can suggest any room every turn, so these are pure-deduction turn counts. An optional board mode (`opts.board`, 2 dice by default, secret passages, suggestions only in the room you stand in) is in `src/engine.js`; with it, games take 27.4 turns (Standard) and 18.3 (most-X rule). See [STRATEGY.md](STRATEGY.md#the-evidence). Board distances are reconstructed by hand and may be off by about 2 steps.
- Responders answer clockwise. A responder holding several cards re-shows one the asker has already seen when possible.
- Standard suggestions: in each unsolved category, name the envelope candidate the notebook knows least about. In a solved category, name a card from your own hand so the answer must come from the other two.
- Players accuse only when certain, at the start of their turn or right after their own suggestion.

## Run it

Needs Node.js 18 or newer. No dependencies.

```bash
node simulate.js        # 1,000 deals per configuration, writes results/results.json
node build.js           # builds index.html from src/template.html and the results
node test/verify.js     # soundness checks
```

## Ideas not yet tested

- Planning more than one question ahead.
- Unbiased sampling of consistent deals (the current sampler is a randomized backtracking search).
- A smarter responder: when holding two matching cards, show the one from the category the asker already knows most about.

## License

MIT
