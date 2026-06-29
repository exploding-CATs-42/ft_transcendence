import type { Card } from "@exploding-cats/game-core";

export const fakePlayers = [
  { id: "1", avatarUrl: null, isAlive: true, name: "me" },
  { id: "2", avatarUrl: null, isAlive: true, name: "player1" },
  { id: "3", avatarUrl: null, isAlive: true, name: "player2" },
  { id: "4", avatarUrl: null, isAlive: true, name: "player3" },
  { id: "5", avatarUrl: null, isAlive: true, name: "player4" },
];

export const fakeCards: Card[] = [
  {
    id: 1,
    type: "FAVOR",
    name: "Favor",
    description:
      "Force any other player to give you 1 card from their hand. They choose which card to give you.",
    playable: true,
    targetRequired: true,
    comboEligible: true,
    playableOutOfTurn: false,
  },
  {
    id: 2,
    type: "SHUFFLE",
    name: "Shuffle",
    description:
      "Randomly shuffle the draw pile so that no one knows the order of the cards.",
    playable: true,
    targetRequired: false,
    comboEligible: true,
    playableOutOfTurn: false,
  },
  {
    id: 3,
    type: "SEE_THE_FUTURE",
    name: "See the Future",
    description:
      "Privately view the top 3 cards of the draw pile and put them back in the same order. Do not show other players.",
    playable: true,
    targetRequired: false,
    comboEligible: true,
    playableOutOfTurn: false,
  },
  {
    id: 4,
    type: "NOPE",
    name: "Nope",
    description:
      "Stop any action except an Exploding Kitten or a Defuse. Can be played at any time before an action resolves, even on another player's turn. A Nope can be Noped to create a Yup, and so on.",
    playable: true,
    targetRequired: false,
    comboEligible: true,
    playableOutOfTurn: true,
  },
  {
    id: 5,
    type: "DEFUSE",
    name: "Defuse",
    description:
      "Play instead of dying when you draw an Exploding Kitten. Place Defuse in the discard pile, then secretly reinsert the kitten anywhere in the draw pile.",
    playable: true,
    targetRequired: false,
    comboEligible: false,
    playableOutOfTurn: false,
  },
  {
    id: 6,
    type: "ATTACK",
    name: "Attack",
    description:
      "End your turn without drawing a card. Force the next player to take 2 turns in a row. Attacks stack — if the victim plays an Attack, all remaining turns transfer plus 2 more.",
    playable: true,
    targetRequired: false,
    comboEligible: true,
    playableOutOfTurn: false,
  },
  {
    id: 7,
    type: "SKIP",
    name: "Skip",
    description:
      "Immediately end your turn without drawing a card. When played against an Attack, only ends 1 of the 2 owed turns.",
    playable: true,
    targetRequired: false,
    comboEligible: true,
    playableOutOfTurn: false,
  },
  {
    id: 8,
    type: "TACOCAT",
    name: "Tacocat",
    description:
      "Powerless on its own. Play two Tacocats as a pair to steal a random card from another player, or three as a triple to name the card you want.",
    playable: false,
    targetRequired: false,
    comboEligible: true,
    playableOutOfTurn: false,
  },
];
