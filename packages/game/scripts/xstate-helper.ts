import { Project, SyntaxKind, SourceFile } from "ts-morph";
import * as path from "path";

async function loadReplacementsFromFile(
  sourceFile: SourceFile,
  _project: Project,
): Promise<Map<string, string>> {
  const map = new Map<string, string>();
  const filePath = sourceFile.getFilePath();

  let exports: Record<string, unknown>;
  try {
    // tsx supports dynamic import() of .ts files directly
    exports = await import(filePath);
  } catch (e) {
    console.warn(`  ⚠ Could not import ${filePath}: ${(e as Error).message}`);
    return map;
  }

  for (const [exportName, exportValue] of Object.entries(exports)) {
    if (exportName === "default") continue;

    if (
      typeof exportValue === "string" ||
      typeof exportValue === "number" ||
      typeof exportValue === "boolean"
    ) {
      // Plain constant: GAME_MACHINE_ID, START_GAME_COUNTDOWN_MS
      map.set(exportName, JSON.stringify(exportValue));
    } else if (
      typeof exportValue === "object" &&
      exportValue !== null &&
      !Array.isArray(exportValue)
    ) {
      // Enum-like object or const object: GameStates, GameTargets, etc.
      for (const [key, val] of Object.entries(exportValue)) {
        if (
          typeof val === "string" ||
          typeof val === "number" ||
          typeof val === "boolean"
        ) {
          map.set(`${exportName}.${key}`, JSON.stringify(val));
        }
      }
    }
  }

  return map;
}

async function buildReplacementsForMachineFile(
  machineFile: SourceFile,
  project: Project,
): Promise<Map<string, string>> {
  const replacements = new Map<string, string>();
  const machineDir = path.dirname(machineFile.getFilePath());

  for (const importDecl of machineFile.getImportDeclarations()) {
    const moduleSpecifier = importDecl.getModuleSpecifierValue();
    if (!moduleSpecifier.startsWith(".")) continue;

    // Resolve to absolute .ts path
    const resolvedBase = path.resolve(machineDir, moduleSpecifier);
    const candidates = [resolvedBase + ".ts", resolvedBase + "/index.ts"];

    let resolvedPath: string | null = null;
    for (const candidate of candidates) {
      try {
        await import(candidate); // probe
        resolvedPath = candidate;
        break;
      } catch {
        // try next
      }
    }

    if (!resolvedPath) {
      // Try via ts-morph as a last resort
      const tsFile = importDecl.getModuleSpecifierSourceFile();
      if (tsFile) resolvedPath = tsFile.getFilePath();
    }

    if (!resolvedPath) {
      console.warn(`  ⚠ Could not resolve: ${moduleSpecifier}`);
      continue;
    }

    const sourceFile =
      project.getSourceFile(resolvedPath) ??
      project.addSourceFileAtPath(resolvedPath);

    const extracted = await loadReplacementsFromFile(sourceFile, project);

    if (extracted.size > 0) {
      console.log(
        `  ↳ ${path.basename(resolvedPath)}: ${extracted.size} replacements`,
      );
      for (const [k, v] of extracted) {
        replacements.set(k, v);
      }
    }
  }

  return replacements;
}

async function processFile(
  project: Project,
  machineFile: SourceFile,
): Promise<void> {
  const filePath = machineFile.getFilePath();
  const fileName = path.basename(filePath, ".ts");

  console.log(`\nProcessing: ${filePath}`);

  const replacements = await buildReplacementsForMachineFile(
    machineFile,
    project,
  );
  console.log(`  Total: ${replacements.size} replacements`);

  const clonedProject = new Project({
    tsConfigFilePath: "tsconfig.package.json",
  });
  const clonedFile = clonedProject.getSourceFileOrThrow(filePath);

  // Pass 1: property access expressions (GameStates.WAITING, GameTargets.PLAYING, etc.)
  clonedFile
    .getDescendantsOfKind(SyntaxKind.PropertyAccessExpression)
    .forEach((node) => {
      const replacement = replacements.get(node.getText());
      if (replacement !== undefined) {
        node.replaceWithText(replacement);
      }
    });

  // Pass 2: standalone identifiers (GAME_MACHINE_ID, START_GAME_COUNTDOWN_MS)
  clonedFile.getDescendantsOfKind(SyntaxKind.Identifier).forEach((node) => {
    // Skip anything inside an import declaration
    if (node.getFirstAncestorByKind(SyntaxKind.ImportDeclaration)) return;

    const parent = node.getParent();

    // Skip property assignment keys (the "foo" in { foo: bar })
    if (parent?.getKind() === SyntaxKind.PropertyAssignment) {
      if (
        parent.asKindOrThrow(SyntaxKind.PropertyAssignment).getNameNode() ===
        node
      )
        return;
    }

    // Skip the object side of a property access — already handled in pass 1
    if (parent?.getKind() === SyntaxKind.PropertyAccessExpression) {
      if (
        parent
          .asKindOrThrow(SyntaxKind.PropertyAccessExpression)
          .getExpression() === node
      )
        return;
    }

    const replacement = replacements.get(node.getText());
    if (replacement !== undefined) {
      node.replaceWithText(replacement);
    }
  });

  const outputPath = `${fileName}.visualized.ts`;
  clonedFile.copy(outputPath, { overwrite: true }).saveSync();
  console.log(`  ✓ Written: ${outputPath}`);
}

async function main() {
  const project = new Project({ tsConfigFilePath: "tsconfig.package.json" });
  const srcDir = path.resolve("src");

  const machineFiles = project.getSourceFiles().filter((sf) => {
    const filePath = sf.getFilePath();
    return (
      filePath.startsWith(srcDir) &&
      /Machine\.ts$/.test(filePath) &&
      !filePath.endsWith(".visualized.ts")
    );
  });

  if (machineFiles.length === 0) {
    console.error("No *Machine.ts files found under src/");
    process.exit(1);
  }

  console.log(`Found ${machineFiles.length} machine file(s):`);
  machineFiles.forEach((sf) => console.log(`  - ${sf.getFilePath()}`));

  for (const machineFile of machineFiles) {
    await processFile(project, machineFile);
  }

  console.log("\nDone.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
