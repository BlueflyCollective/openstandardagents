import fs from 'fs';
import path from 'path';
import { SchemaExplorer } from '@/components/schema/SchemaExplorer';

function loadSchema(): any {
  const schemaPath = path.join(
    process.cwd(),
    '../../spec/v0.2.2/ossa-0.2.2.schema.json'
  );

  // Fallback to v0.1.9 if v0.2.2 doesn't exist
  const fallbackPath = path.join(
    process.cwd(),
    '../../spec/ossa-v0.1.9.schema.json'
  );

  const finalPath = fs.existsSync(schemaPath) ? schemaPath : fallbackPath;

  if (!fs.existsSync(finalPath)) {
    return null;
  }

  const schemaContent = fs.readFileSync(finalPath, 'utf8');
  return JSON.parse(schemaContent);
}

export default function SchemaPage(): JSX.Element {
  const schema = loadSchema();

  if (!schema) {
    return (
      <div className="container mx-auto max-w-7xl px-4 py-8">
        <h1 className="text-4xl font-bold mb-4">Schema Explorer</h1>
        <p className="text-lg text-gray-600">
          Schema file not found. Please ensure the OSSA schema is available.
        </p>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-7xl px-4 py-8">
      <h1 className="text-4xl font-bold mb-4">OSSA Schema Explorer</h1>
      <p className="text-lg text-gray-600 mb-8">
        Explore the OSSA v0.2.2 JSON Schema interactively. Understand the
        structure, properties, and validation rules.
      </p>
      <SchemaExplorer schema={schema} />
    </div>
  );
}

