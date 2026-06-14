// Libraries
import { randomUUID } from "crypto";
// Project level
import rawCards from "constants/cards.json";
// Local level
import { CardType, Player, Card, CardDefinition, Deck } from "game/types";
import { DEFAULT_GAME_RULES } from "game/constants";
import { validateDeckSizes } from "./deckValidation";

export const cardDefinitions = rawCards as CardDefinition[];

export const createDeck = (): Deck => {
  const deck: Deck = [];

  for (const definition of cardDefinitions) {
    const { count, ...cardData } = definition;
    for (let i = 0; i < count; i++) {
      deck.push({
        id: randomUUID(),
        ...cardData,
      });
    }
  }

  return deck;
};

// Fisher–Yates/Knuth shuffle
export const shuffleDeck = (deck: Deck): void => {
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [deck[i], deck[j]] = [deck[j]!, deck[i]!];
  }
};

export const dealInitialCards = (deck: Deck, players: Player[]): Deck => {
  // Split deck into 3 piles
  const { explodingKittens, defuses, mainDeck } = splitDeck(deck);
  validateDeckSizes(
    mainDeck,
    defuses,
    explodingKittens,
    players.length,
    DEFAULT_GAME_RULES,
  );

  // Shuffle regular cards
  shuffleDeck(mainDeck);

  // Deal defuses and regular cards
  const DEFUSES_AMOUNT = DEFAULT_GAME_RULES.defusesDealtPerPlayer;
  const REGULAR_CARDS_AMOUNT = DEFAULT_GAME_RULES.dealtCardsPerPlayer;
  players.forEach((player) => {
    const regularCards = draw(mainDeck, REGULAR_CARDS_AMOUNT)!;
    const defuseCards = draw(defuses, DEFUSES_AMOUNT)!;

    player.hand = [...regularCards, ...defuseCards];
  });

  // Insert enough exploding kittens and the rest of the defuses back to the deck
  const kittensToInsert = draw(explodingKittens, players.length - 1)!;
  const finalDeck = [...mainDeck, ...defuses, ...kittensToInsert];

  // and shuffle it again to distribute the kittens inside the deck
  shuffleDeck(finalDeck);

  return finalDeck;
};

/**
 * Splits a deck into 3 piles: exploding kittens, defuse cards, and all remaining cards.
 *
 * Iterates through the provided deck and categorizes each card based on its
 * type. The original deck is not modified.
 *
 * @param deck The deck to split.
 *
 * @returns An object containing:
 * - `explodingKittens`: All cards with type `EXPLODING_KITTEN`.
 * - `defuses`: All cards with type `DEFUSE`.
 * - `mainDeck`: All remaining cards.
 */
const splitDeck = (deck: Deck) => {
  const explodingKittens: Card[] = [];
  const defuses: Card[] = [];
  const mainDeck: Card[] = [];

  for (const card of deck) {
    if (card.type === CardType.EXPLODING_KITTEN) {
      explodingKittens.push(card);
    } else if (card.type === CardType.DEFUSE) {
      defuses.push(card);
    } else mainDeck.push(card);
  }

  return {
    explodingKittens,
    defuses,
    mainDeck,
  };
};

export const draw = (deck: Deck, amount: number): Card[] | undefined => {
  return deck.splice(0, amount);
};

export const drawOneCard = (deck: Deck): Card | undefined => {
  const cards = draw(deck, 1);
  if (!cards) return undefined;

  const card = cards[0];
  return card;
};
