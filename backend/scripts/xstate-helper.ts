import { Project, SyntaxKind } from "ts-morph";
import { GameTargets } from "../src/game/targets";
import { GAME_MACHINE_ID, GameStates } from "../src/game/states";
import { GameEvents } from "../src/game/events";
import { GameActions } from "../src/game/actions";
import { GameGuards } from "../src/game/guards";
import { START_GAME_COUNTDOWN_MS } from "../src/constants/game";

// Build a lookup map of every identifier/expression → its runtime value
const replacements = new Map<string, string>([
  ...Object.entries(GameTargets).map(
    ([k, v]) => [`GameTargets.${k}`, JSON.stringify(v)] as [string, string],
  ),
  ...Object.entries(GameStates).map(
    ([k, v]) => [`GameStates.${k}`, JSON.stringify(v)] as [string, string],
  ),
  ...Object.entries(GameEvents).map(
    ([k, v]) => [`GameEvents.${k}`, JSON.stringify(v)] as [string, string],
  ),
  ...Object.entries(GameActions).map(
    ([k, v]) => [`GameActions.${k}`, JSON.stringify(v)] as [string, string],
  ),
  ...Object.entries(GameGuards).map(
    ([k, v]) => [`GameGuards.${k}`, JSON.stringify(v)] as [string, string],
  ),
  ["GAME_MACHINE_ID", JSON.stringify(GAME_MACHINE_ID)],
  ["START_GAME_COUNTDOWN_MS", String(START_GAME_COUNTDOWN_MS)],
]);

const project = new Project({ tsConfigFilePath: "tsconfig.json" });
const sourceFile = project.getSourceFileOrThrow("src/game/gameMachine.ts");

// Replace property access expressions (GameTargets.X, GameStates.X, etc.)
sourceFile
  .getDescendantsOfKind(SyntaxKind.PropertyAccessExpression)
  .forEach((node) => {
    const replacement = replacements.get(node.getText());
    if (replacement !== undefined) {
      node.replaceWithText(replacement);
    }
  });

// Replace standalone identifiers (GAME_MACHINE_ID, START_GAME_COUNTDOWN_MS)
sourceFile.getDescendantsOfKind(SyntaxKind.Identifier).forEach((node) => {
  if (node.getFirstAncestorByKind(SyntaxKind.ImportDeclaration)) return;

  const parent = node.getParent();
  if (parent?.getKind() === SyntaxKind.PropertyAssignment) {
    if (
      parent.asKindOrThrow(SyntaxKind.PropertyAssignment).getNameNode() === node
    )
      return;
  }

  const replacement = replacements.get(node.getText());
  if (replacement !== undefined) {
    node.replaceWithText(replacement);
  }
});

sourceFile.copy("gameMachine.visualized.ts", { overwrite: true }).saveSync();
