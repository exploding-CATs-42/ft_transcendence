#!/usr/bin/env bash

set -euo pipefail

TARGET="$HOME/echoapi_for_vscode"
SOURCE="$(cd "$(dirname "$0")/.." && pwd)/tests/echoapi_for_vscode"

BACKUP="$HOME/echoapi_for_vscode.bak"

echo "Source: $SOURCE"
echo "Target: $TARGET"

if [ ! -d "$SOURCE" ]; then
  echo "ERROR: Source folder does not exist:"
  echo "$SOURCE"
  exit 1
fi

if [ -d "$TARGET" ]; then
  echo "Backing up existing folder to:"
  echo "$BACKUP"

  mv "$TARGET" "$BACKUP"
fi

echo "Installing echoapi_for_vscode..."

cp -R "$SOURCE" "$TARGET"

echo "Done."