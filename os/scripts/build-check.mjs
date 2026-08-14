import {access,readFile} from 'node:fs/promises';

const required=['../index.html','../css/os.css','../js/app.js','../js/auth/supabase-auth.js','../js/ui.js','../js/data/demo-recipes.js','../js/data/demo-production-plan.js','../js/data/demo-production-orders.js','../js/data/demo-inventory.js','../js/data/demo-management.js','../js/repositories/recipe-repository.js','../js/import/docx-reader.js','../js/import/cuadernito-azul-profile.js','../js/import/recipe-normalizer.js','../js/import/recipe-validator.js','../js/import/recipe-parser.js','../js/production/production-engine.js','../js/production/production-order-model.js','../js/inventory/inventory-engine.js','../js/finance/management-engine.js','../js/permissions.js','../manifest.webmanifest','../sw.js','../assets/icon.svg'];
for(const path of required) await access(new URL(path,import.meta.url));
const html=await readFile(new URL('../index.html',import.meta.url),'utf8');
const manifest=JSON.parse(await readFile(new URL('../manifest.webmanifest',import.meta.url),'utf8'));
if(!html.includes('./js/app.js')||!html.includes('./css/os.css')) throw new Error('Los assets principales no están enlazados.');
if(manifest.name!=='Le Miski OS'||manifest.scope!=='./') throw new Error('La PWA no conserva nombre o alcance seguro.');
console.log('Static build validation passed.');
