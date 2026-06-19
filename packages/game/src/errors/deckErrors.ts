export class InsufficientCardsError extends Error {
  readonly pile: string;
  readonly required: number;
  readonly available: number;

  constructor(pile: string, required: number, available: number) {
    super(`Not enough cards in ${pile}: need ${required}, have ${available}`);
    this.pile = pile;
    this.required = required;
    this.available = available;
  }
}
