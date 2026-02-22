import { execa } from 'execa';
import fs from 'fs/promises';
import { version } from 'os';
import path, { resolve } from 'path';

/**
 * Analyse un project pour obtenir la liste des dépendances à installer.
 * @param {string} projectPath - Chemin vers le dossier du projet
 * @returns {Object} - Un object contenant le nom, la version et l'url de chaque packet
 */

export async function getDependencyTree(projectPath) {
  console.log('🔍 Analyse des dépendances via NPM (calcul de l\'arbre)...');

  // 1. On lance la commande NPM
  // --package-lock-only : génère le lockfile sans télécharger le dossier node_modules
  await execa('npm', ['install', '--package-lock-only'], { cwd: projectPath });

  // 2. On lit le package-lock.json
  const lockfileContent = await fs.readFile(path.join(projectPath, 'package-lock.json'), 'utf-8');
  const lockfile = JSON.parse(lockfileContent);

  const dependencies = [];

  // 3. On extrait les infos utiles (nom, version, url du .tgz)
  // Dans lockfile v3, les dépendances sont dans "packages"
  for (const [pkgPath, info] of Object.entries(lockfile.packages)) {
    // On ignore l'entrée vide (qui est le projet lui-même)
    if (pkgPath === '' || !info.resolved) continue;
    
    // On nettoie le nom du paquet (on retire "node_modules/")
    // Si le paquet est à la racine, on le laisse tel quel
    const name = pkgPath.startsWith('node_modules/')
      ? pkgPath.replace('node_modules/', '')
      : pkgPath;

    dependencies.push({
      name: name,
      version: info.version,
      resolvedUrl: info.resolved, // L'url du téléchargement du paquet
      integrity: info.integrity, // Le hash pour vérifier est sain
    });
  }

  return dependencies;
}