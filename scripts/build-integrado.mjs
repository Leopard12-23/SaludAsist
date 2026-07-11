// scripts/build-integrado.mjs — arma el deploy único que pide el
// instructivo: UNA carpeta estática (dist-integrado/) con la contenedora
// en la raíz y cada módulo en su subcarpeta (/vue/, /angular/).
import { execSync } from 'node:child_process';
import { existsSync, rmSync, cpSync, mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const raiz = path.resolve(fileURLToPath(import.meta.url), '..', '..');

function ejecutar(comando, cwd) {
  console.log(`\n> (${cwd}) ${comando}`);
  execSync(comando, { cwd, stdio: 'inherit' });
}

function construirProyecto(carpeta, comando = 'npm run build') {
  const cwd = path.join(raiz, carpeta);
  if (!existsSync(path.join(cwd, 'node_modules'))) ejecutar('npm install', cwd);
  ejecutar(comando, cwd);
}

console.log('== 1/4: contenedora (vanilla-ts) ==');
construirProyecto('contenedora');

console.log('== 2/4: módulo Vue ==');
construirProyecto('vue');

console.log('== 3/4: módulo Angular ==');
construirProyecto('angular', 'npx ng build --base-href /angular/');

console.log('== 4/4: ensamblando dist-integrado/ ==');
const salida = path.join(raiz, 'dist-integrado');
rmSync(salida, { recursive: true, force: true });
mkdirSync(salida, { recursive: true });

cpSync(path.join(raiz, 'contenedora', 'dist'), salida, { recursive: true });
cpSync(path.join(raiz, 'vue', 'dist'), path.join(salida, 'vue'), { recursive: true });
cpSync(path.join(raiz, 'angular', 'dist', 'angular-doctor', 'browser'), path.join(salida, 'angular'), { recursive: true });

console.log(`\n✅ Listo: ${salida}`);
console.log('   Probar localmente con: npx vite preview --outDir dist-integrado --port 4600');
