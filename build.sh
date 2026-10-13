#!/bin/bash
# Builds ./dist, the only folder Cloudflare publishes. Copies site files only:
# never .git, tooling, or config. Run automatically by `wrangler deploy` (see wrangler.jsonc).
set -euo pipefail
cd "$(dirname "$0")"
rm -rf dist && mkdir dist
tar --exclude='./dist' --exclude='./.git' --exclude='./.impeccable' --exclude='./.wrangler' \
    --exclude='./node_modules' --exclude='./worker.js' --exclude='./wrangler.jsonc' \
    --exclude='./build.sh' --exclude='*.py' --exclude='README.md' --exclude='.DS_Store' \
    --exclude='./.gitignore' -cf - . | tar -xf - -C dist
echo "build.sh: $(find dist -type f | wc -l | tr -d ' ') files in dist"
