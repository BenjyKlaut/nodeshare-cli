import { getDependencyTree } from './resolver.js';
import { downloadAndExtract } from "./dowloader.js";
import path from 'path';

/**
 * Fonction principale qui lance le processus de téléchargement et d'extraction
 * @param {string} packageName 
 * @param {string} version 
 */
async function run() {
  const REGISTERY_PATH = path.join(process.cwd(), 'NodeShare_Registery');

  // 1. On trouve ce qu'il faut
  const deps = await getDependencyTree(process.cwd());

  // 2. On télécharge tout pour (pour le test on prend juste deux pour aller vite)
  console.log('🚀 Début de téléchargement des 2 premiers paquets...');
  for (let i = 0; i < Math.min(deps.length, 2); i++) {
    await downloadAndExtract(deps[i], REGISTERY_PATH);
  }

  console.log(`\n✅ Terminé ! Regardez dans le dossier ${REGISTERY_PATH}`)
}

run().catch(console.error);