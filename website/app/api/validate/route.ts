import { NextResponse } from 'next/server';
import Ajv from 'ajv';
import addFormats from 'ajv-formats';
import fs from 'fs';
import path from 'path';
import yaml from 'yaml';
import { STABLE_VERSION, getSchemaPath } from '@/lib/version';

const ajv = new Ajv({ allErrors: true, verbose: true });
addFormats(ajv);

let schemaCache: any = null;

function loadSchema(version?: string): any {
  if (schemaCache) {
    return schemaCache;
  }

  const targetVersion = version || STABLE_VERSION;
  const schemaPath = getSchemaPath(targetVersion);

  if (!schemaPath || !fs.existsSync(schemaPath)) {
    // Fallback to stable version schema
    const fallbackPath = path.join(
      process.cwd(),
      '..',
      'spec',
      `v${STABLE_VERSION}`,
      `ossa-${STABLE_VERSION}.schema.json`
    );
    
    if (!fs.existsSync(fallbackPath)) {
      throw new Error(`OSSA schema not found for version ${targetVersion}`);
    }
    
    const schemaContent = fs.readFileSync(fallbackPath, 'utf8');
    schemaCache = JSON.parse(schemaContent);
    return schemaCache;
  }

  const schemaContent = fs.readFileSync(schemaPath, 'utf8');
  schemaCache = JSON.parse(schemaContent);
  return schemaCache;
}

export async function POST(request: Request): Promise<NextResponse> {
  try {
    const { content, version } = await request.json();

    if (!content || typeof content !== 'string') {
      return NextResponse.json(
        { valid: false, errors: [{ path: '', message: 'Content is required' }] },
        { status: 400 }
      );
    }

    // Extract version from content if not provided
    let targetVersion = version;
    if (!targetVersion) {
      try {
        const parsed = yaml.parse(content) || JSON.parse(content);
        if (parsed.apiVersion) {
          // Extract version from apiVersion: ossa/v0.2.3
          const match = parsed.apiVersion.match(/ossa\/v?(\d+\.\d+\.\d+)/);
          if (match) {
            targetVersion = match[1];
          }
        }
      } catch {
        // Ignore parsing errors, will use default
      }
    }

    const schema = loadSchema(targetVersion);
    const validate = ajv.compile(schema);

    let parsed: any;
    try {
      parsed = yaml.parse(content);
    } catch (yamlError) {
      try {
        parsed = JSON.parse(content);
      } catch (jsonError) {
        return NextResponse.json({
          valid: false,
          errors: [{ path: '', message: 'Invalid YAML or JSON format' }],
        });
      }
    }

    const valid = validate(parsed);

    if (!valid && validate.errors) {
      return NextResponse.json({
        valid: false,
        errors: validate.errors.map((error) => ({
          path: error.instancePath || error.schemaPath || '',
          message: error.message || 'Validation error',
        })),
      });
    }

    return NextResponse.json({ valid: true, errors: [] });
  } catch (error) {
    return NextResponse.json(
      {
        valid: false,
        errors: [
          {
            path: '',
            message: error instanceof Error ? error.message : 'Unknown error',
          },
        ],
      },
      { status: 500 }
    );
  }
}

