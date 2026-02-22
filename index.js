#!/usr/bin/env node

import { Command } from 'commander';
import path from 'path';
import fs from "fs/promises";
import ora from 'ora';
import chalk from 'chalk';

// Import des modules (vérifie bien l'orthographe de downloader.js)
import { getDependencyTree } from "./resolver.js";
import { downloadAndExtract } from "./downloader.js"; // J'ai corrigé l'éventuelle faute "dowloader"
import { createHardLinks } from "./linker.js";

const program = new Command();

const REGISTRY_PATH = path.join(process.env.USERPROFILE || process.env.HOME, '.nodeshare-registry');

program
  .name('nodeshare')
  .description('Gestionnaire de dépendances à duplication zéro')
  .version('1.0.0');

program
  .command('install') // minuscule ici
  .description('Installe les dépendances du projet en utilisant le registre global')
  .action(async () => {
    const spinner = ora('Analyse du package.json...').start();
    const projectPath = process.cwd();
    const nodeModulesPath = path.join(projectPath, 'node_modules'); // Corrigé

    try {
      // 1. Calcul de l'arbre
      const deps = await getDependencyTree(projectPath);
      spinner.text = `Calcul terminé : ${deps.length} paquets`;
      
      // 2. Création des dossiers
      await fs.mkdir(REGISTRY_PATH, { recursive: true });
      await fs.mkdir(nodeModulesPath, { recursive: true });

      // 3. Boucle principale
      for (const pkg of deps) {
        spinner.text = `Traitement de ${pkg.name}@${pkg.version}...`;

        const globalPkgPath = await downloadAndExtract(pkg, REGISTRY_PATH);
        const localPkgPath = path.join(nodeModulesPath, pkg.name);
        
        await fs.mkdir(path.dirname(localPkgPath), { recursive: true });
        await fs.rm(localPkgPath, { recursive: true, force: true });

        await createHardLinks(globalPkgPath, localPkgPath);
      }

      spinner.succeed(chalk.green(`\n✨ Installation terminée ! ${deps.length} paquets mutualisés.`));
      console.log(chalk.blue(`📦 Registre global : ${REGISTRY_PATH}`));
    } catch (error) { // Corrigé "errpr"
      spinner.fail(chalk.red(`Erreur lors de l'installation : ${error.message}`));
    }
  });

program.parse();