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

