import { compile } from 'json-schema-to-typescript';
import { readFileSync, writeFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const schemaPath = resolve(__dirname, '..', '..', 'DomainCraft', 'spec', 'domain.schema.json');
const outputPath = resolve(__dirname, '..', 'src', 'types', 'domain.generated.ts');

const schema = JSON.parse(readFileSync(schemaPath, 'utf-8'));

let ts = await compile(schema, 'DomainSchema', {
  cwd: dirname(schemaPath),
  bannerComment: '',
  style: { singleQuote: true },
});

// Rename root type from generated title-based name to DomainSchema
ts = ts.replace(/DomainCraftDomainYamlSchema/g, 'DomainSchema');

const header = `// @generated -- run \`npm run generate:types\` to regenerate
// Source: DomainCraft/spec/domain.schema.json
// Do not edit manually. Changes will be overwritten.

`;

writeFileSync(outputPath, header + ts, 'utf-8');
console.log(`Generated ${outputPath}`);
