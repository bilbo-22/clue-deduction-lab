# How to win at Clue

This is the best strategy we found by simulating tens of thousands of four-player games. It needs a pencil and the standard notebook, no computer. Each step builds on the one before. Read them in order and you will know what to write, what to ask, where to walk and when to accuse.

The numbers behind every claim are in [The evidence](#the-evidence) at the bottom.

---

## Step 1. Know what you are racing for

Three cards are in the envelope: one suspect, one weapon, one room. The first player to name all three correctly wins.

Your goal is to know the answer **before anyone else does**. A fully filled notebook is not the goal. Every question should move you closer to the three envelope cards. A question that only teaches you about other players' hands is a weaker question.

---

## Step 2. Set up your notebook

Make a grid with one row per card (21 rows) and one column per opponent (3 columns).

| Mark | Meaning |
|---|---|
| ✓ | This player has this card |
| ✗ | This player does not have this card |
| a number, like **7** | On turn 7 this player showed *one* of the three cards named, but you did not see which |

Before the first question, tick your own cards. Put ✗ in every opponent's column on those rows, since nobody else can hold a card you hold.

---

## Step 3. Write down everything that happens, including other people's turns

Every question in the game tells you something, even when you are not the one asking.

- **Someone shows you a card.** Write ✓ for that player on that card, and ✗ for everyone else on that row.
- **A player says "I can't answer."** That player has none of the three cards. Write ✗ for them on all three rows.
- **A player shows a card to someone else.** You don't know which card. Write that turn's number in that player's column on all three named rows.

The numbers are where most players lose information. Tracking them is the biggest single improvement in our tests: it cut games from 27 turns to 22 when everyone did it.

---

## Step 4. Squeeze every conclusion out of the notebook

Go through these checks again after every turn, until none of them gives you anything new.

1. **A card is in exactly one place.** If a row has a ✓, everyone else on that row is ✗. If a row has ✗ for every player, that card is in the envelope.
2. **One card per category in the envelope.** Once you know the envelope's weapon, every other weapon is in someone's hand. A weapon with only one open cell left goes to that player.
3. **Resolve numbers.** If two of the three rows with number 7 in a player's column turn into ✗, the third one is a ✓. They showed that card.
4. **Count hands.** Players hold 5, 5, 4 and 4 cards in a 4-player game. If you know all 4 of a player's cards, the rest of their column is ✗. If only 4 open cells are left in a 4-card player's column, all of them are ✓.
5. **Separate numbers fill a hand.** If a 4-card player has 4 different numbers whose rows don't overlap, each number hides a different card. That accounts for all 4 of their cards, so every row with no number in their column is ✗.
6. **Silence with no accusation.** If nobody can answer a player's question and that player does not accuse, they must hold at least one of the cards they named. Otherwise they would have all three answers and would have won. Treat it like a number in their column.

These six rules capture almost everything. A computer that searches every possible deal is only about a quarter of a turn faster.

---

## Step 5. Choose your question: the "most X's" rule

This is the step where good players pull away. In each of the three categories:

1. **Name the card with the most ✗'s in its row**, among the cards that could still be in the envelope.
2. **Tie?** Take the one with the fewest numbers on its row.
3. **Category already solved?** Name one of your own cards, or the answer card if you hold none. That way the question only tests the other two categories.

**Why it works.** A card with two ✗'s can only be in one place besides the envelope, so the answer is close to a coin flip. Either the last player shows it, or nobody does and you have found it. An empty row is almost certainly in someone's hand and will just be shown to you. In our data, a card with two ✗'s was the better question 88–92% of the time, and its chance of being in the envelope was about 65%, compared with about 10% for an empty row.

**Why it beats the natural instinct.** Most players ask about the cards they know least about. That fills the notebook, but it rarely finds the envelope. The most-X rule asks about cards that are nearly cornered.

---

## Step 6. On the board: choosing where to walk

With dice, you can only name the room you are standing in, so where you walk becomes part of the strategy.

1. **Never walk into a room you know someone holds.** You learn nothing from it, and opponents can keep dragging you back there.
2. **Weigh the value of a room against the distance to it.** Prefer the room the most-X rule would pick. But a decent room two turns away beats a great room six turns away. Every turn spent walking is a turn without a question.
3. **Use the secret passages** (Kitchen ↔ Study, Lounge ↔ Conservatory). They get you to a new room without rolling.
4. **When the room is already solved,** any room you hold, or the answer room, is a free spot to keep asking about the suspect and weapon.
5. **Every room still gets you a suspect and a weapon.** Even a poor room is worth stopping in if it's close.

With the board and two dice, an average game is about 27 turns among ordinary players, and about 18 when everyone plays this way.

---

## Step 7. Accuse the moment you are sure, never earlier

When your notebook proves all three cards, accuse right away. That includes the moment after your own question. If nobody can answer your question, check immediately. That silence often completes the answer, and in our games the asker won on that same turn in every such case (141 of 141).

Never guess. Every simulated player accused only when certain, and none ever made a wrong accusation.

---

## Step 8. Things that sound clever but don't pay

| Idea | Result |
|---|---|
| **Bluffing**, naming a card you hold to mislead others | It always lost. It costs you more information than it hides. |
| **Padding**, naming two of your own cards with one unknown | About 13 points of win rate lost. "Nobody could answer" becomes public news the next player uses first. |
| **Hiding**, avoiding questions about cards everyone knows you lack | No gain. When it leaks, you have already won that turn. |
| **Choosing which card to show** when you hold several of the named cards | No measurable effect. |
| **Roughly reading others' questions**, as in "they asked about the Rope, so they probably don't have it" | It helps only when few players do it. When everyone does it, they all chase the same cards. |

**Reading others' questions does help, but only when done carefully.** A player who names a card usually doesn't hold it, so that is real information. Just don't let it outweigh actual ✗'s. Treat it as a hint and not as a mark.

---

## The whole strategy on one card

1. Mark everything, including other players' turns, and write the turn numbers.
2. After every turn, run the six checks in Step 4.
3. Ask about the card with the **most ✗'s**. On a tie, take the one with the **fewest numbers**. In a solved category, name your own card.
4. On the board, walk to the **best nearby room** and never into a room someone is known to hold.
5. Accuse **the moment you are sure**, and especially right after nobody answers you.

---

## The evidence

All numbers come from the simulator in this repository: four players, the standard 21 cards, hands of 5/5/4/4. "Turn" means one player's go. "Win rate vs 3 Standard" is one player using the strategy against three players who ask about the card they know least about, averaged over all four seats. The fair share is 25%.

### Without the board (pure deduction, any room every turn)

| Strategy | Whole table, mean turns | One player vs 3 Standard |
|---|---|---|
| Standard (ask what you know least about) | 21.46 | 25% |
| Most-X rule | 12.93 | 64.3% |
| Most-X rule with the fewest-numbers tie-break | 12.45 | 63.7% |
| Smart (computer: 120 sampled deals, scores the envelope uncertainty left) | 11.49 | 59.4% |

Head to head, the computer's Smart beats the most-X rule without a board. One Smart player against three most-X players wins 30.8%, and one most-X player against three Smart players wins 21.9%.

### With the board (1,000 deals unless noted, 0 wrong accusations)

| Setup | 1 die | 2 dice |
|---|---|---|
| Standard table, mean turns | 39.06 | 27.38 |
| Most-X table, mean turns | 29.99 | 18.27 |
| Smart table, mean turns (300 deals) | 28.67 | 17.72 |
| One most-X player vs 3 Standard | 47.4% | 52.9% |
| One Smart player vs 3 Standard (400 / 600 games) | 44.5% | 47.8% |

With dice, the simple rule does at least as well as the computer, because where you can walk limits which rooms you can name. The board distances were reconstructed by hand and may be off by about 2 steps, so treat the seat-by-seat results with care.

### Why the most-X rule works

| Comparison (from 2,125 logged Smart decisions) | Card with 2 ✗'s is the better question | Information gained | Chance in envelope |
|---|---|---|---|
| Suspect, 2 ✗'s vs empty row | 88% | 1.27× | 65% vs 11% |
| Weapon | 89% | 1.28× | 66% vs 11% |
| Room | 92% | 1.41× | 65% vs 6% |
| 1 ✗ vs empty row | 39–61% | about 1.0× | 31% vs 20% |

### Notebook rules

| Every seat uses | Mean turns (no board) |
|---|---|
| One place per card + one per category | 30.00 |
| + hand counting | 27.30 |
| + numbered clues | 21.72 |
| + full search of every possible deal | 21.46 |

### Game theory (one player against three, 400–1,000 deals per cell)

| Experiment | Win rate |
|---|---|
| Bluffing, any rate, any opponents | 21.8–24.7% |
| Rough reading vs non-readers | about 27% |
| Not reading vs three rough readers | about 30% |
| Choosing which card to show (5 policies) | 24.2–25.7% |
| Hiding from public deductions | 24.4–25.1% (17.8% when overdone) |

### Where to dig deeper

- [README.md](README.md): setup, notebook levels, assumptions and how to run everything
- [research/README.md](research/README.md): how the most-X rule was found, disagreements with Smart, and the game theory
- Interactive notebooks: https://bilbo-22.github.io/solving-the-game-clue/
