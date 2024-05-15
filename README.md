# Cashless-services
<a name="readme-top"></a>

[![Contributors][contributors-shield]][contributors-url]
[![Forks][forks-shield]][forks-url]
[![Stargazers][stars-shield]][stars-url]
[![Issues][issues-shield]][issues-url]

<!-- PROJECT LOGO -->
<br />
<div align="center">
  <a href="https://github.com/nico-vrn/Cashless-services">
    <img src="Images/logo_nfc.png" alt="Logo" width="150" height="150">
  </a>

  <h3 align="center">Système de Cashless</h3>

  <p align="center">
    Un système robuste de Cashless sur le modèle de ce qui est utilisé en festival.
    <br />
   </p>
</div>

## À propos du projet 

Ce projet implémente un système de cashless complet qui permet d'avoir une interface avec le solde de la carte quand elle est présenté sur le lecteur NFC, ainsi que d'incrémenter / décrémenter et d'initialiser de nouvelles cartes.

## Prérequis

Pour utiliser ce système, vous aurez besoin de :

* Un appareil NFC compatible (par exemple, ACR122U)
* Un ordinateur avec support NFC
* [Node.js](https://nodejs.org/en/download/)
* Bibliothèque `nfc-pcsc` pour la communication avec les appareils NFC

## Installation

1. Clonez le dépôt sur votre ordinateur local :

```sh
git clone https://github.com/nico-vrn/NFCKeyManagement.git
```

2. Installez les dépendances Node.js nécessaires :
```sh
npm install
```

3. Connectez votre lecteur NFC à votre ordinateur.

4. Exécutez les scripts pour initialiser ou lire les cartes :

```sh 
node initCard.js
node readCard.js
```

## Fonctionnalités principales

- Initialisation sécurisée des cartes NFC avec des clés uniques
- Lecture et vérification des clés stockées sur les cartes
- Gestion sécurisée des clés stockées localement
- Interface web pour voir le solde / incrémenter / décrémenter le solde de la carte

## Contribution 
Les contributions sont les bienvenues ! Pour contribuer, suivez les étapes suivantes :

1. Forkez le dépôt.
2. Créez une nouvelle branche pour votre fonctionnalité ou correctif.
3. Faites vos modifications et committez-les.
4. Poussez votre branche et créez une pull request.

## Auteurs

- Lefranc Nicolas, [@nico-vrn](https://github.com/nico-vrn)

## Licence

Ce projet est sous licence MIT - voir le fichier [LICENSE](LICENSE) pour plus de détails.


<!-- MARKDOWN LINKS & IMAGES -->
<!-- https://www.markdownguide.org/basic-syntax/#reference-style-links -->
[contributors-shield]: https://img.shields.io/github/contributors/nico-vrn/Cashless-services
?style=for-the-badge
[contributors-url]: https://github.com/nico-vrn/Cashless-services/graphs/contributors
[forks-shield]: https://img.shields.io/github/forks/nico-vrn/Cashless-services.svg?style=for-the-badge
[forks-url]: https://github.com/nico-vrn/Cashless-services/network/members
[stars-shield]: https://img.shields.io/github/stars/nico-vrn/Cashless-services.svg?style=for-the-badge
[stars-url]: https://github.com/nico-vrn/Cashless-services/stargazers
[issues-shield]: https://img.shields.io/github/issues/nico-vrn/Cashless-services.svg?style=for-the-badge
[issues-url]: https://github.com/nico-vrn/Cashless-services/issues