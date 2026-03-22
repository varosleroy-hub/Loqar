#!/bin/bash
set -euo pipefail

# Only run in remote (web) sessions
if [ "${CLAUDE_CODE_REMOTE:-}" != "true" ]; then
  exit 0
fi

echo "Installation des dépendances Loqar..."
cd "$CLAUDE_PROJECT_DIR"

# Install npm dependencies
npm install

echo "Environnement Loqar prêt ✓"
