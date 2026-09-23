#!/usr/bin/env node
// Scaffold a new API module: node tools/make-module.mjs <Name>
import fs from 'fs';
const name = process.argv[2] ?? 'Widget';
const lower = name.toLowerCase();
const tpl = `import { Router } from 'express';\nexport const ${lower}Router = Router();\n${lower}Router.get('/', (_req, res) => res.json({ items: [] }));\n`;
fs.writeFileSync(`apps/api/src/modules/${lower}.ts`, tpl);
console.log(`Created apps/api/src/modules/${lower}.ts`);
