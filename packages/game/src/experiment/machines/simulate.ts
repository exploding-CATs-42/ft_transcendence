import { createActor } from 'xstate';
import { gameMachine } from './gameMachine';
import type { GameEmitted } from './gameMachine';

// ─── Helpers ─────────────────────────────────────────────────────────────────

function log(label: string, value?: unknown): void {
  const formatted = value !== undefined ? `: ${JSON.stringify(value)}` : '';
  console.log(`[${label}]${formatted}`);
}

function printSnapshot(gameActor: ReturnType<typeof createActor<typeof gameMachine>>): void {
  const snap = gameActor.getSnapshot();
  const gameState = snap.value;
  const playerStates = Object.fromEntries(
    Object.entries(snap.context.players).map(([id, ref]) => [
      id,
      ref.getSnapshot().value,
    ]),
  );
  log('game state', gameState);
  log('player states', playerStates);
  console.log('');
}

// ─── Setup ───────────────────────────────────────────────────────────────────

const gameActor = createActor(gameMachine);

// Listen for emitted READINESS_CONFIRMED events from the game machine.
gameActor.on('READINESS_CONFIRMED', (event: GameEmitted) => {
  log('🎉 READINESS_CONFIRMED emitted', { playerId: event.playerId });
});

gameActor.start();

// ─── Simulation ──────────────────────────────────────────────────────────────

console.log('=== Initial state ===');
printSnapshot(gameActor);

console.log('=== Player "alice" joins ===');
gameActor.send({ type: 'PLAYER_JOINED', playerId: 'alice' });
printSnapshot(gameActor);

console.log('=== Player "bob" joins ===');
gameActor.send({ type: 'PLAYER_JOINED', playerId: 'bob' });
printSnapshot(gameActor);

// Alice confirms readiness → READINESS_CONFIRMED should fire
console.log('=== Alice confirms readiness ===');
gameActor.send({ type: 'CONFIRM_READINESS', playerId: 'alice' });
printSnapshot(gameActor);

// Bob confirms readiness → READINESS_CONFIRMED should fire
console.log('=== Bob confirms readiness ===');
gameActor.send({ type: 'CONFIRM_READINESS', playerId: 'bob' });
printSnapshot(gameActor);

// Transition to in-game
console.log('=== Game starts ===');
gameActor.send({ type: 'START_GAME' });
printSnapshot(gameActor);

// Late-joiner charlie — joins and readies up while in-game
console.log('=== Player "charlie" joins (in-game) ===');
gameActor.send({ type: 'PLAYER_JOINED', playerId: 'charlie' });
printSnapshot(gameActor);

console.log('=== Charlie confirms readiness (in-game) ===');
gameActor.send({ type: 'CONFIRM_READINESS', playerId: 'charlie' });
printSnapshot(gameActor);

gameActor.stop();
