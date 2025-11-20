#!/usr/bin/env node

/**
 * Generate examples index JSON for static export
 * Run during build to create examples.json
 */

const fs = require('fs');
const path = require('path');

const examplesDir = path.join(__dirname, '../../examples');
const outputFile = path.join(__dirname, '../public/examples.json');

function getAllExamples() {
  const examples = [];

  if (!fs.existsSync(examplesDir)) {
    console.log('⚠️  Examples directory not found:', examplesDir);
    return examples;
  }

  function traverseDir(dir, category = '') {
    const entries = fs.readdirSync(dir, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      const relativePath = path.relative(examplesDir, fullPath);

      if (entry.isDirectory()) {
        traverseDir(fullPath, entry.name);
      } else if (
        entry.isFile() &&
        (entry.name.endsWith('.yml') ||
          entry.name.endsWith('.yaml') ||
          entry.name.endsWith('.json') ||
          entry.name.endsWith('.ts'))
      ) {
        try {
          const content = fs.readFileSync(fullPath, 'utf8');
          examples.push({
            name: entry.name,
            path: relativePath,
            content,
            category: category || 'root',
          });
        } catch (error) {
          console.warn(`⚠️  Skipping ${fullPath}:`, error.message);
        }
      }
    }
  }

  traverseDir(examplesDir);
  return examples;
}

const examples = getAllExamples();

// Ensure public directory exists
const publicDir = path.dirname(outputFile);
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

fs.writeFileSync(outputFile, JSON.stringify(examples, null, 2));
console.log(`✅ Generated ${outputFile} with ${examples.length} examples`);

