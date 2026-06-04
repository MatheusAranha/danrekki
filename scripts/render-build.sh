#!/bin/bash
set -e

# pnpm-lock.yaml causes NX to activate its pnpm plugin which looks for
# node_modules/.modules.yaml — a file that only exists after a pnpm install.
rm -f pnpm-lock.yaml

# NODE_ENV=production makes npm skip devDependencies.
# --include=dev overrides that so nx, typescript, and @nx/* are installed.
# NX_DAEMON=false avoids daemon socket issues in container environments.
NX_DAEMON=false npm install --include=dev --legacy-peer-deps

# Build shared first (via dependsOn), then api
NX_DAEMON=false ./node_modules/.bin/nx build api

# node_modules/@danrekki/shared is a symlink to libs/shared/ (TypeScript source).
# Node 24's experimental strip-types picks up the .ts file and then fails on
# extensionless imports inside it. Replace with the compiled dist output.
rm -rf node_modules/@danrekki/shared
cp -r dist/libs/shared/. node_modules/@danrekki/shared

# NX copies source package.json verbatim — fix main to point at compiled JS.
sed -i 's|"./src/index.ts"|"./src/index.js"|g' node_modules/@danrekki/shared/package.json

# The compiled app.js imports from @danrekki/shared/domains/* directly, but
# the dist structure puts compiled files under src/domains/. Symlink it.
(cd node_modules/@danrekki/shared && ln -sf src/domains domains)

# Install shared's production deps in its own node_modules to isolate its ajv@8
# from the ajv@6 that eslint/jest hoist to the root via ajv-keywords peer dep.
(cd node_modules/@danrekki/shared && npm install --omit=dev --legacy-peer-deps)
