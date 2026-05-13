import { GameContext } from "./types";

export const dealCards = ({ context }: { context: GameContext }) => {
  const players = context.players.map((player, i) => ({
    ...player,
    hand: context.deck.slice(
      i * context.cardsPerPlayer,
      (i + 1) * context.cardsPerPlayer
    )
  }));

  const dealtCount = players.length * context.cardsPerPlayer;

  return {
    players,
    deck: context.deck.slice(dealtCount)
  };
};

export const drawTopCard = ({ context }: { context: GameContext }) => {
  const top = context.deck[0];
  if (top === undefined) return {};

  const players = context.players.map((player, i) =>
    i === context.currentPlayerIndex
      ? { ...player, hand: [...player.hand, top] }
      : player
  );

  return {
    deck: context.deck.slice(1),
    players
  };
};
