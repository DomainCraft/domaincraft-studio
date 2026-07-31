import { compile } from 'json-schema-to-typescript';
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { execSync } from 'child_process';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const coreDir = resolve(__dirname, '..', '..', 'DomainCraft');

// --- 1. Generate TypeScript types from JSON Schema ---

const schemaPath = resolve(coreDir, 'spec', 'domain.schema.json');
const typesOutput = resolve(__dirname, '..', 'src', 'types', 'domain.generated.ts');

if (!existsSync(schemaPath)) {
  console.warn(`Schema not found at ${schemaPath} — skipping`);
} else {
  const schema = JSON.parse(readFileSync(schemaPath, 'utf-8'));
  let ts = await compile(schema, 'DomainSchema', {
    cwd: dirname(schemaPath),
    bannerComment: '',
    style: { singleQuote: true },
  });
  ts = ts.replace(/DomainCraftDomainYamlSchema/g, 'DomainSchema');
  writeFileSync(typesOutput, `// @generated — run \`npm run generate:types\` to regenerate\n// Source: DomainCraft/spec/domain.schema.json\n// Do not edit manually.\n\n` + ts, 'utf-8');
  console.log(`Generated ${typesOutput}`);
}

// --- 2. Generate constants.ts from specmeta (Go source of truth) ---

const constantsOutput = resolve(__dirname, '..', 'src', 'lib', 'constants.ts');

const spec = JSON.parse(execSync(`go run ./cmd/specmeta-json/`, { cwd: coreDir, encoding: 'utf-8' }));
const fmtSet = new Set(['email', 'url', 'ipv4']);
const fmtValidators = (spec.stringValidationModifiers || []).filter(v => fmtSet.has(v));

const arr = (name, vals) => `export const ${name} = [${vals.map(v => `'${v}'`).join(', ')}] as const;`;
const set = (name, vals) => `export const ${name} = new Set([${vals.map(v => `'${v}'`).join(', ')}]);`;

writeFileSync(constantsOutput, `// @generated — run \`npm run generate:types\` to regenerate
// Source: DomainCraft/internal/specmeta/specmeta.go
// Do not edit manually.

${arr('PRIMITIVE_FIELD_TYPES', spec.primitiveFieldTypes)}

${set('STRING_FIELD_TYPES', spec.stringFieldTypes)}
${set('NUMERIC_FIELD_TYPES', spec.numericFieldTypes)}

 ${arr('STRING_VALIDATION_MODIFIERS', spec.stringValidationModifiers)}
 ${arr('STRING_FORMAT_VALIDATORS', fmtValidators)}
 ${arr('NUMERIC_VALIDATION_MODIFIERS', spec.numericValidationModifiers)}

${arr('ON_DELETE_VALUES', spec.onDeleteValues)}

${arr('INDEX_TYPES', spec.indexTypes)}

${arr('DATABASES', spec.databases)}
${arr('API_STYLES', spec.apiStyles)}
${arr('AUTH_TYPES', spec.authTypes)}

${arr('FEATURES', spec.features)}

${arr('CACHE_PROVIDERS', spec.cacheProviders)}
${arr('MULTI_TENANCY_MODES', spec.multiTenancyModes)}
${arr('PERMISSION_KEYS', spec.permissionKeys)}
${arr('SORT_DIRECTIONS', spec.sortDirections)}
`, 'utf-8');

console.log(`Generated ${constantsOutput}`);
