#!/usr/bin/env node

/**
 * Fetch version information from npm registry and generate versions.json
 * 
 * This script:
 * 1. Queries npm registry for published versions
 * 2. Scans spec/ directory for available schema versions
 * 3. Generates website/lib/versions.json with all version metadata
 * 
 * Run: npm run fetch-versions
 * Automatically runs on: npm run build
 */

const fs = require('fs');
const path = require('path');
const https = require('https');

const PACKAGE_NAME = '@bluefly/openstandardagents';
const NPM_REGISTRY = `https://registry.npmjs.org/${PACKAGE_NAME}`;
const SPEC_DIR = path.join(__dirname, '..', '..', 'spec');
const VERSIONS_JSON_PATH = path.join(__dirname, '..', 'lib', 'versions.json');
const PACKAGE_JSON_PATH = path.join(__dirname, '..', 'package.json');

// Fallback version from package.json
const packageJson = JSON.parse(fs.readFileSync(PACKAGE_JSON_PATH, 'utf8'));
const FALLBACK_VERSION = packageJson.version;

/**
 * Fetch data from npm registry
 */
function fetchNpmData() {
  return new Promise((resolve, reject) => {
    https.get(NPM_REGISTRY, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          resolve(json);
        } catch (e) {
          reject(new Error(`Failed to parse npm registry response: ${e.message}`));
        }
      });
    }).on('error', (err) => {
      reject(err);
    });
  });
}

/**
 * Scan spec directory for available schema versions
 */
function scanSpecDirectory() {
  const versions = [];
  
  if (!fs.existsSync(SPEC_DIR)) {
    return versions;
  }
  
  const entries = fs.readdirSync(SPEC_DIR, { withFileTypes: true });
  
  for (const entry of entries) {
    if (entry.isDirectory() && entry.name.startsWith('v')) {
      const version = entry.name.substring(1); // Remove 'v' prefix
      const schemaPath = path.join(SPEC_DIR, entry.name, `ossa-${version}.schema.json`);
      const schemaPathAlt = path.join(SPEC_DIR, entry.name, `ossa-${version.replace('-dev', '-dev')}.schema.json`);
      
      // Check if schema file exists
      if (fs.existsSync(schemaPath) || fs.existsSync(schemaPathAlt)) {
        const isDev = version.includes('-dev') || version.includes('-pre') || version.includes('-rc');
        const isStable = !isDev && !version.includes('dev');
        
        versions.push({
          version,
          tag: `v${version}`,
          apiVersion: `ossa/v${version}`,
          type: isDev ? 'dev' : isStable ? 'stable' : 'prerelease',
          schemaPath: fs.existsSync(schemaPath) ? schemaPath : schemaPathAlt,
          available: true
        });
      }
    }
  }
  
  return versions.sort((a, b) => {
    // Sort: stable versions first, then by version number
    if (a.type === 'stable' && b.type !== 'stable') return -1;
    if (a.type !== 'stable' && b.type === 'stable') return 1;
    return b.version.localeCompare(a.version, undefined, { numeric: true });
  });
}

/**
 * Main function
 */
async function main() {
  console.log('Fetching version information...');
  
  let npmData = null;
  let npmVersions = [];
  let distTags = {};
  
  // Try to fetch from npm registry
  try {
    console.log(`Querying npm registry: ${NPM_REGISTRY}`);
    npmData = await fetchNpmData();
    
    if (npmData.versions) {
      npmVersions = Object.keys(npmData.versions).sort((a, b) => {
        return b.localeCompare(a, undefined, { numeric: true });
      });
    }
    
    if (npmData['dist-tags']) {
      distTags = npmData['dist-tags'];
    }
    
    console.log(`Found ${npmVersions.length} published versions on npm`);
    console.log(`Dist tags:`, distTags);
  } catch (error) {
    console.warn(`Warning: Could not fetch from npm registry: ${error.message}`);
    console.warn('Using fallback version from package.json');
  }
  
  // Scan spec directory
  console.log(`Scanning spec directory: ${SPEC_DIR}`);
  const specVersions = scanSpecDirectory();
  console.log(`Found ${specVersions.length} schema versions in spec/`);
  
  // Determine stable version
  const stableVersion = distTags.latest || npmVersions.find(v => !v.includes('-dev') && !v.includes('-pre') && !v.includes('-rc')) || FALLBACK_VERSION;
  
  // Get dev versions
  const devVersions = npmVersions.filter(v => v.includes('-dev') || v.includes('-pre') || v.includes('-rc'));
  const latestDevVersion = distTags.dev || devVersions[0] || null;
  
  // Combine npm and spec versions
  const allVersions = [];
  const versionMap = new Map();
  
  // Add npm versions
  for (const version of npmVersions) {
    const isDev = version.includes('-dev') || version.includes('-pre') || version.includes('-rc');
    versionMap.set(version, {
      version,
      tag: `v${version}`,
      apiVersion: `ossa/v${version}`,
      type: isDev ? 'dev' : 'stable',
      published: true,
      available: true
    });
  }
  
  // Add spec versions (may not be published)
  for (const specVersion of specVersions) {
    if (!versionMap.has(specVersion.version)) {
      versionMap.set(specVersion.version, {
        ...specVersion,
        published: false
      });
    } else {
      // Update with schema path if available
      const existing = versionMap.get(specVersion.version);
      versionMap.set(specVersion.version, {
        ...existing,
        schemaPath: specVersion.schemaPath,
        available: true
      });
    }
  }
  
  // Convert to array and sort
  for (const [version, info] of versionMap) {
    allVersions.push(info);
  }
  
  allVersions.sort((a, b) => {
    if (a.type === 'stable' && b.type !== 'stable') return -1;
    if (a.type !== 'stable' && b.type === 'stable') return 1;
    return b.version.localeCompare(a.version, undefined, { numeric: true });
  });
  
  // Generate versions.json
  const versionsData = {
    stable: stableVersion,
    latest: stableVersion,
    dev: latestDevVersion,
    all: allVersions,
    stableVersions: allVersions.filter(v => v.type === 'stable'),
    devVersions: allVersions.filter(v => v.type === 'dev' || v.type === 'prerelease'),
    distTags,
    generatedAt: new Date().toISOString(),
    fallbackVersion: FALLBACK_VERSION
  };
  
  // Ensure lib directory exists
  const libDir = path.dirname(VERSIONS_JSON_PATH);
  if (!fs.existsSync(libDir)) {
    fs.mkdirSync(libDir, { recursive: true });
  }
  
  // Write versions.json
  fs.writeFileSync(VERSIONS_JSON_PATH, JSON.stringify(versionsData, null, 2));
  
  console.log(`✅ Generated ${VERSIONS_JSON_PATH}`);
  console.log(`   Stable: ${stableVersion}`);
  console.log(`   Dev: ${latestDevVersion || 'none'}`);
  console.log(`   Total versions: ${allVersions.length}`);
}

main().catch((error) => {
  console.error('Error:', error);
  process.exit(1);
});

