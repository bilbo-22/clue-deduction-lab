# Clue Deduction Lab

How many turns does a four-player game of Clue take if everyone reasons perfectly? This project simulates 1,000 deals and shows every player's notebook turn by turn: ticks, crosses and numbered clues, with the reason behind each mark.

**Interactive page:** https://bilbo-22.github.io/clue-deduction-lab/

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
- **Seat matters.** At an even table of Perfect players, seat 1 wins 43%, seat 2 28%, seats 3 and 4 about 14% each. Seats 1 and 2 move first and hold 5 cards instead of 4.
- **No wrong accusations** in any game: every player only accuses when their notebook proves the answer.

## The rules each level uses

Each level keeps the rules of the levels before it and repeats them until nothing new follows.

1. **Basic.** A card is in exactly one place: a tick fills the rest of its row with X, and a row with one open cell left gets the tick. The envelope holds one card per category. Plus direct marks: your own hand, cards shown to you, and players who pass.
2. **Counting.** Hand sizes. If a player's cards are all known, the rest of their column is X. If only as many open cells remain as they have cards, all of them are ticks.
3. **Clauses.** When a player shows someone else a card, onlookers write the turn number on all three suggested cards in that player's column. When two of the three get an X, the third is a tick. Disjoint open clues that fill a player's remaining slots rule out every other card in their column.
4. **Perfect.** Backtracking search over full deals consistent with everything observed. A cell is X if no consistent deal puts the card there, and a tick if every consistent deal does. Searches are capped per cell; a cell the cap can't settle stays blank, so the notebook never claims more than it can prove.

## Assumptions

- 21 cards: 6 suspects, 6 weapons, 9 rooms. Seats 1–2 get 5 cards, seats 3–4 get 4.
- **No board.** Every player can suggest any room every turn, so these are pure-deduction turn counts. Real games with dice and movement run longer.
- Responders answer clockwise. A responder holding several cards re-shows one the asker has already seen when possible.
- Suggestions: in each unsolved category, name the envelope candidate the notebook knows least about. In a solved category, name a card from your own hand so the answer must come from the other two.
- Players accuse only when certain, at the start of their turn or right after their own suggestion.

## Run it

Needs Node.js 18 or newer. No dependencies.

```bash
node simulate.js        # 1,000 deals per configuration, writes results/results.json
node build.js           # builds index.html from src/template.html and the results
node test/verify.js     # soundness checks
```

## Ideas not yet tested

- Probabilistic notebooks: count consistent deals to rank envelope candidates.
- Choosing suggestions to maximize expected information.
- Endgame guessing: accuse when your chance of being right beats your chance of winning by waiting.
- Modeling what opponents know, and reading their suggestions for hints.

## License

MIT
