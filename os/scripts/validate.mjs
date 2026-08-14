import {readFile} from 'node:fs/promises';

const app=await readFile(new URL('../js/app.js',import.meta.url),'utf8');
const css=await readFile(new URL('../css/os.css',import.meta.url),'utf8');
const html=await readFile(new URL('../index.html',import.meta.url),'utf8');
const recipes=await readFile(new URL('../js/data/demo-recipes.js',import.meta.url),'utf8');
const failures=[];
if(/\b(confirm|prompt)\s*\(/.test(app)) failures.push('La interfaz aún contiene diálogos nativos.');
if(!html.includes('id="modal-root"')) failures.push('Falta el contenedor de modales.');
if(!html.includes('class="skip-link"')) failures.push('Falta el enlace de salto accesible.');
if(!css.includes(':focus-visible')) failures.push('Faltan estilos de foco accesibles.');
if(!css.includes('prefers-reduced-motion')) failures.push('Falta soporte para movimiento reducido.');
const forbiddenRecipeFields=['ingredients','ingredientes','formula','fórmula','procedure','procedimiento','cost','costo','supplier','proveedor'];
for(const field of forbiddenRecipeFields){
  const fieldPattern=new RegExp(`(?:^|[,{\\s])${field}\\s*:`, 'imu');
  if(fieldPattern.test(recipes)) failures.push(`El catálogo público contiene el campo sensible: ${field}.`);
}
if(!recipes.includes('isDemo:true')||!recipes.includes("accessLevel:'admin'")) failures.push('Las recetas deben estar marcadas como demostración y restringidas a administración.');
if(failures.length){console.error(failures.join('\n'));process.exit(1)}
console.log('Design-system lint passed.');
