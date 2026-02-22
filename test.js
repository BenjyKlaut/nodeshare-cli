import fs from 'fs/promises';
import path from 'path';
import { createHardLinks } from './linker.js';

async function runTest() {
  const globalStore = './mock-global-store/react';
  const localProject = './mock-project/node_modules/react';

  console.log('🔄 Création du faux store global...');
  await fs.mkdir(globalStore, { recursive: true });
  await fs.writeFile(path.join(globalStore, 'index.js'), 'console.log("Hello from react");');
  await fs.writeFile(path.join(globalStore, 'package.json'), '{"name": "react", "version": "18.2.0"}');


  console.log('⚡Lancement de NodeShare Linker...');
  await createHardLinks(globalStore, localProject);

  console.log('✅ Terminé ! Vérifie le dossier ./mock-project/node_modules/react');
  console.log('💡 Essaie de modifier index.js dans le projet local, tu verras que le fichier est modifié dans le store global (c\'est le même espace physique !)');
}

runTest().catch(console.error);