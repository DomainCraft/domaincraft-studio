import { compile } from 'json-schema-to-typescript';
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const coreDir = resolve(__dirname, '..', '..', 'DomainCraft');

if (!existsSync(coreDir)) {
  console.warn(`Core repo not found at ${coreDir} — skipping type generation`);
  process.exit(0);
}

// Generate TypeScript types from the committed JSON Schema. No Go toolchain is
// needed here: the schema is produced by `make regenerate-spec` in the core.
// Runtime specmeta comes from the WASM binary (goSpecmeta), not from this step.

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
