// scripts/generate-schema.js
import RefParser from '@apidevtools/json-schema-ref-parser';
import fs from 'fs/promises';

const input = 'api-spec.yaml';
const output = './src/schemas/dereferenced-schema.json';

try {
    const dereferenced = await RefParser.dereference(input);
    await fs.writeFile(output, JSON.stringify(dereferenced, null, 2));
    console.log('✅ Schema dereferenced and saved to', output);
} catch (err) {
    console.error('❌ Error dereferencing schema:', err);
}