import fs from 'fs/promises';
import { createWriteStream } from 'fs';
import path from 'path';
import { pipeline } from 'stream/promises';
import * as tar from 'tar';

/**
 * Télécharge un fichier .tgz et l'extrait dans le dossier de destination
 * @param {string} pkg - URL du fichier .tgz
 * @param {string} registryPath - Dossier de destination
 */
export async function downloadAndExtract(pkg, registryPath) {
  // Le chemin final :
  const targetDir = path.join(registryPath, `${pkg.name}@${pkg.version}`);

  // 1. Vérifier si on l'a déjà
  try {
    await fs.access(targetDir)
    // console.log(`⏩ ${pkg.name}@${pkg.version} est déjà dans le cache.`);
    return targetDir;
  } catch {
    // Si erreur ce que le dossier n'exise pas, on continue
  }

  console.log(`📥 Téléchargement de ${pkg.name}@${pkg.version}...`);

  // 2. Créer le dossier temporaire pour l'extraction
  await fs.mkdir(targetDir, {recursive: true});

  // 3. Télécharger et extraire à la volée
  const response = await fetch(pkg.resolvedUrl);
  if (!response.ok) throw new Error(`Erreur HTTP: ${response.statusText}`);

  // NPM emballe toujours ses fichiers dans un sous-dossier appelé 'package'
  // 'STRIP 1': permet de supprimer le dossier 'package' inutile à l'extraction
  await tar.x({
    cwd: targetDir,
    strip: 1,
    body: response.body
  });

  return targetDir;
}