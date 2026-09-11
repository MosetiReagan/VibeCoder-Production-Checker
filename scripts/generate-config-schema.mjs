import fs from 'node:fs';
import { zodToJsonSchema } from 'zod-to-json-schema';
import { configSchema } from '../dist/config.js';

const schema = zodToJsonSchema(configSchema, 'ProductionCheckConfig');
fs.writeFileSync('docs/config-schema.json', `${JSON.stringify(schema, null, 2)}\n`);
