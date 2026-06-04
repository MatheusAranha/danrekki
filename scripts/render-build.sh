#!/bin/bash
set -e

# pnpm-lock.yaml causes NX to activate its pnpm plugin which looks for
# node_modules/.modules.yaml — a file that only exists after a pnpm install.
# Removing it before an npm install makes NX use the npm plugin instead.
rm pnpm-lock.yaml

# NODE_ENV=production is set on Render, which makes npm skip devDependencies.
# --include=dev overrides that so nx, typescript, and @nx/* are installed.
npm install --include=dev --legacy-peer-deps

# Build shared first (dependsOn), then api
./node_modules/.bin/nx build api

# At this point node_modules/@danrekki/shared is a symlink to libs/shared/
# (TypeScript source). Node 24 loads the .ts file via experimental strip-types
# and then fails on extensionless imports inside it.
# Replace the link with the compiled dist output so Node resolves plain JS.
rm -rf node_modules/@danrekki/shared
cp -r dist/libs/shared/. node_modules/@danrekki/shared
# NX copies the source package.json verbatim, so main still says ./src/index.ts.
# Point it to the compiled file instead.
sed -i 's|"./src/index.ts"|"./src/index.js"|g' node_modules/@danrekki/shared/package.json
