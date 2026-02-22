import { getDependencyTree } from "./resolver.js";

async function run() {
  try {
    // On analyse le dossier actuel (.)
    const deps = await getDependencyTree(process.cwd());

    console.log(`✅ Analyse terminée ! ${deps.length} paquet identifiés`);
    console.log('Exemple du premier paquet trouvé :');
    console.log(deps[0]);
  } catch (error) {
    console.error('Erreur lors de l\'analyse :', error);
  }
}

run();