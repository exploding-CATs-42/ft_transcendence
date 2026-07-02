import {
  CardType,
  type Player,
  type Card,
  type CardDefinition,
  type Deck,
} from "../types";
import { validateDeckSizes } from "./deckValidation";
import { DEFAULT_GAME_RULES } from "../constants";
import rawCards from "../constants/cards.json";
import { shuffle } from "./shuffle";

export const cardDefinitions = rawCards as CardDefinition[];

export const createDeck = (): Deck => {
  let id = 0;

  const deck: Deck = [];

  for (const definition of cardDefinitions) {
    const { count, ...cardData } = definition;
    for (let i = 0; i < count; i++) {
      deck.push({
        id: id++,
        ...cardData,
      });
    }
  }

  return deck;
};

/**
 * Deals the initial cards to all players
 *
 * @param deck The source deck used for dealing. This deck is not modified.
 * @param players The players participating in the game.
 *
 * @returns A newly created shuffled deck containing all the cards
 * remaining after the deal
 *
 * @note This function does not modify the provided `deck`.
 *
 * @warning This function mutates the provided `players` array by assigning
 * cards to each player's `hand` property.
 *
 * @throws Error If the deck does not contain enough cards to satisfy the
 * game setup requirements.
 */
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
  shuffle(mainDeck);

  // Deal defuses and regular cards
  const DEFUSES_AMOUNT = DEFAULT_GAME_RULES.defusesDealtPerPlayer;
  const REGULAR_CARDS_AMOUNT = DEFAULT_GAME_RULES.dealtCardsPerPlayer;
  players.forEach((player) => {
    const regularCards = draw(mainDeck, REGULAR_CARDS_AMOUNT)!;
    const defuseCards = draw(defuses, DEFUSES_AMOUNT)!;

    player.hand = [...regularCards, ...defuseCards];
  });

  // Insert enough exploding kittens and defuses back into the deck
  const kittensToInsert = draw(explodingKittens, players.length - 1)!;
  const defusesToInsert = draw(defuses, Math.min(defuses.length, 2))!;
  const finalDeck = [...mainDeck, ...defusesToInsert, ...kittensToInsert];

  // and shuffle it again to distribute the kittens inside the deck
  shuffle(finalDeck);

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
