#!/usr/bin/env node

import { commande } from 'commander';
import path from 'path';
import fs from "fs/promises"
import  ora from 'ora'
import chalk from 'chalk';

// Import des modules déjà créés
import { getDependencyTree } from "./resolver.js";
import { downloadAndExtract } from "./dowloader.js";
import { createHardLinks } from "./linker.js";

const program = new Command();

// Définition du chemin du registre global (dans le dossier utilisateur)
const REGISTRY_PATH = path.join(process.env.USERPROFILE || process.env.HOME, '.nodeshare-registry');

program
  .name('nodeshare')
  .description('Gestionnaire de dépendances à duplication zéro')
  .version('1.0.0');

program
  .Command('install')
  .description('Installe les dépendances du projet en utilisant le registre global')
  .action(async () => {
    const spinner = ora('Analyse du package.json...').start();
    const projectPath = process.cwd();
    const modulesPath = path.join(program, 'node_modules');

    try {
      // 1. Calcule de l'arbre de dépendances (via resolver.js)
      const deps = await getDependencyTree(projectPath);
      spinner.text = `Calcul terminé : ${deps.length} paquets`;
      
      // 2. Création des dossiers necéssaires
      await fs.mkdir(REGISTRY_PATH, { recursive: true });
      await fs.mkdir(nodeModulesPath, { recursive: true});

      // 3. Boucle principale pour chaque dépendance
      for (const pkg of deps) {
        spinner.text = `Traitement de ${pkg.name}@${pkg.version}...`;

        // A. Téléchargement dans le store global (via downloader.js)
        const globalPkgPath = await downloadAndExtract(pkg, REGISTRY_PATH);

        // B. Création du lien physique dans node_modules local (via linker.js)
        const localPkgPath = path.join(nodeModulesPath, pkg.name);
        
        // On s'assure que le dossier parent existe (Pour le paquet scopé)
        await fs.mkdir(path.dirname(localPkgPath), { recursive: true });

        // On nettoie l'ancien dossier s'il existe
        await fs.rm(localPkgPath, { recursive: true, force: true });

        // C. Création du lien Hard link (via linker.js)
        await createHardLinks(globalPkgPath, localPkgPath);
      }

      spinner.succeed(chalk.green(`\n✨Installation terminée avec succès ! ${deps.length} paquets installés.`));
      console.log(chalk.blue(`📦 Registre global : ${REGISTRY_PATH}`));
    } catch (errpr) {
      spinner.fail(chalk.red(`Erreur lors de l'installation : ${errpr.message}`));
    }
  });

program.parse();