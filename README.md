# 🚀 Utilisation
Dans n'importe quel projet Node.js (contenant un package.json) :

# 🏗️ Architecture Technique
L'outil est décomposé en 4 modules clés :

Resolver : Calcule l'arbre de dépendances exact.

Downloader : Récupère les tarballs NPM et les extrait dans le cache global.

Linker : Crée les liens physiques entre le cache et le projet local.

CLI : Interface de commande pilotée par Commander.js.
---
Projet réalisé dans un but pédagogique pour explorer les profondeurs du système de fichiers et de l'écosystème Node.js.
