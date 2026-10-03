# Can a simple rule replace Smart?

Smart picks each question by imagining 120 consistent deals and scoring all 324 possible suggestions. This folder asks whether a rule a person can follow at the table gets close.

## Method

1. `log_decisions.js` plays 180 games where every seat is Smart and logs each decision: all 324 questions, notebook features a person can read (ticks, X's, open clues), the computer's probabilities, and Smart's score (expected information about the envelope, in bits). 2,125 decisions, 688,500 rows.
2. `rules_vs_smart.py` scores candidate rules and decision trees against Smart on held-out games.
3. `profile_picks.py` compares the questions Smart picks with the questions the standard player picks.
4. `disagreements.py` and `inspect.js` find and explain the turns where the simple rule and Smart disagree most.

```bash
node research/log_decisions.js 1 30 decisions.csv   # seeds 1-30
pip install -r research/requirements.txt
python research/rules_vs_smart.py                    # expects decisions.csv in the working directory
node research/inspect.js 173 15 4 11 20              # deal, turn, Smart's suspect/weapon/room card ids
```

## Findings

**No simple model copies Smart's choices.** Decision trees on readable notebook features reach a rank correlation of 0.65 with Smart's scores and pick Smart's exact question under 5% of the time. Adding the computer's probabilities raises that to 0.82 at depth 12.

**But the data shows what Smart does differently.** Averaged over the three cards in the chosen question:

| | Smart | Standard |
|---|---|---|
| X's for each opponent | 0.6–0.7 | about 0.2 |
| Chance the card is in the envelope (summed) | 1.04 | 0.56 |

Standard asks about the cards it knows least about. Smart asks about the cards most players have already ruled out, because those are the likeliest answers.

**That gives a rule anyone can use: in each unsolved category, name the possible card with the most X's in its row.** In a solved category, name one of your own cards (or the solved card).

| 1,000 deals | Whole table using it | One player using it vs 3 Standard |
|---|---|---|
| Standard | 21.46 turns | 25% |
| **Most X's** | **12.93 turns** | **64.3%** |
| Smart | 11.49 turns | 59.4% |

Head to head, Smart still wins: one Smart player vs three Most-X players wins 30.8%; one Most-X player vs three Smart players wins 21.9% (500 deals, fair share 25%).

**Breaking ties with clue numbers helps a little.** When cards tie on X's, prefer the one with the fewest open clue numbers on it, since a card in someone's clue is more likely in their hand (1,000 deals):

| Rule | Whole table | One player vs 3 Standard | One player vs 3 plain Most-X |
|---|---|---|---|
| Most X's | 12.93 turns | 64.3% | 25% |
| Most X's, then fewest clue numbers | 12.45 turns | 63.7% | 26.5% |
| Same, each clue number weighted by 1 / open cards in that clue | 12.42 turns | 63.9% | 26.5% |

The weighted version adds nothing over simply counting clue numbers.

## Why two X's matter so much

`two_x_vs_empty.py` takes Smart's chosen question, keeps two of its cards fixed and swaps the third, to compare a card with two X's against an empty line in the same category:

| Swap | 2-X card is the better question | Information about the envelope | Chance in envelope |
|---|---|---|---|
| Suspect: 2 X's vs empty line | 88% of 301 decisions | 1.27x | 65% vs 11% |
| Weapon: 2 X's vs empty line | 89% of 323 | 1.28x | 66% vs 11% |
| Room: 2 X's vs empty line | 92% of 234 | 1.41x | 65% vs 6% |
| 1 X vs empty line | 39–61% | about 1.0x | about 31% vs 20% |

A card with two X's can only be with one more player or in the envelope, so asking about it is close to a coin flip on the answer itself: either that player shows it, or nobody does and you have found it. An empty line is unlikely to be the answer and will probably just be shown. The gain starts at two X's; one X versus an empty line makes almost no difference. A 2-X card that only the last player in line could hold is a little weaker (1.21x), because an earlier answer can stop the question before it gets there.

## Where they disagree

The Most-X choice includes Smart's question in 47% of decisions and captures about 78% of Smart's information per question. Re-checking the biggest disagreements with 1,500 imagined deals instead of 120 showed two kinds:

- **Smart was wrong.** In 4 of the 5 biggest gaps, Most-X's question was as good as or better than Smart's once measured with more deals (for example deal 170, turn 18: about 4.4 envelope answers left vs Smart's 5.3). With 120 samples, Smart sometimes picks a question that only looked best by chance.
- **Smart was right because of clues.** Deal 173, turn 15: every candidate had at most one X, so X-counting could not separate them. Smart named the Wrench, which had no X's but a 60% chance of being in the envelope once the open clues are taken into account. About 12.4 answers left vs 14.6 for the Most-X pick.

**More imagined deals did not help in actual games.** One Smart player using 400 deals per decision against three Smart players using 120 won 24.8% (300 deals, fair share 25%). The occasional mis-pick from sampling noise costs too little to change who wins.

## Your questions give you away

A Most-X player almost always names cards they do not hold, so their questions leak their hand. Smart players read that: a deal where a player holds a card they asked about counts for less (weight 0.3). Turning that reading off shows what it is worth (300 deals, fair share 25%):

| One Most-X player against | Win rate |
|---|---|
| 3 Smart players who read questions | 23.4% |
| 3 Smart players who ignore questions | 40.1% |

Reading questions is worth about 17 points here, and without it Smart loses to the simple rule. Part of that gap is reading every opponent's questions, not just the Most-X player's, so it measures the value of reading in general rather than the leak alone.
