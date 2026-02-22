import fs from 'fs/promises';
import path from 'path';

/**
 * Fonction recursive pour lier un dossier source (store local)
 * vers un dossier de destination (node_modules) via des hard links
 * 
 * @param {string} src - Chemin vers le package dans le store global
 * @param {string} dest - Chemin vers le node_modules du dossier
 */

export async function createHardLinks(src, dest) {
    // 1. On crée le dossier de destination (ex: node_modules/react)
    await fs.mkdir(dest, { recursive: true });

    // 2. On lit le contenu du dossier source
    const entries = await fs.readdir(src, { withFileTypes: true });

    for (let entry of entries) {
        const srcPath = path.join(src, entry.name);
        const destpath = path.join(dest, entry.name);

        if (entry.isDirectory()) {
            // Si c'est un dossier, on rappelle la fonction récursivement
            await createHardLinks(srcPath, destpath);
        } else {
            // Si c'est un fichier, on crée le Hard Link !
            try {
                await fs.link(srcPath, destpath);
            } catch (err) {
                // Si le lien existe déjà (EEXIST), on l'ignore. Sinon on lève 
                if (err.code !== 'EEXIST') {
                    throw err;
                }
            }
        }
    }
}