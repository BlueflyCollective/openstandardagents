#!/usr/bin/env node

/**
 * Sync version from package.json to lib/version.ts
 *
 * Run: npm run sync-version
 * Automatically runs on: npm run dev, npm run build
 */

const fs = require('fs');
const path = require('path');

const packageJsonPath = path.join(__dirname, '..', 'package.json');
const versionTsPath = path.join(__dirname, '..', 'lib', 'version.ts');

// Read package.json
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
const version = packageJson.version;

// Generate version.ts content
const versionTsContent = `// OSSA version constants
// AUTO-GENERATED - DO NOT EDIT DIRECTLY
// Update package.json version instead, then run: npm run sync-version

export const OSSA_VERSION = "${version}";
export const OSSA_VERSION_TAG = \`v\${OSSA_VERSION}\`;
export const OSSA_API_VERSION = \`ossa/v\${OSSA_VERSION}\`;
export const OSSA_SCHEMA_VERSION = OSSA_VERSION;

// Utility to get schema path
export function getSchemaPath(ver = OSSA_VERSION): string {
  return \`/schemas/ossa-\${ver}.schema.json\`;
}

// Utility to get spec path
export function getSpecPath(ver = OSSA_VERSION): string {
  return \`/spec/v\${ver}/ossa-\${ver}.schema.json\`;
}
`;

// Write version.ts
fs.writeFileSync(versionTsPath, versionTsContent);

console.log(`✅ Synced version ${version} to lib/version.ts`);
