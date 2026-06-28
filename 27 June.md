I came up to a conclusion that I want to have separately:

- playerMachine
- and a map of opponent machines

then when I receive an event from the server it already has to tell me whether
it's event for me or for one of the opponents. for example:

- OPPONENT_LEFT {opponentId: string}
- OPPONENT_PLAYED_CARD {card: Card}

and for me:

- TAKE_CARD
- EXLODE

so events that are meant for "my" state machine will have an imperative form,
while events meant for the "opponent" state machine will have the completed
action form.
