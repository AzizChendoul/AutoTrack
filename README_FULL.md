AutoTrack — Système de Gestion de Maintenance Automobile Distribué
![Java](https://img.shields.io/badge/Java-ED8B00?style=for-the-badge&logo=java&logoColor=white)
![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white)
![Bootstrap](https://img.shields.io/badge/Bootstrap-563D7C?style=for-thebadge&logo=bootstrap&logoColor=white)
![CORBA](https://img.shields.io/badge/Architecture-CORBA-blue?style=for-the-badge)
![RMI](https://img.shields.io/badge/Architecture-RMI-red?style=for-the-badge)
**AutoTrack** est une solution complète permettant le suivi intelligent de l'entretien des véhicules. Ce
projet académique démontre l'intégration d'architectures distribuées classiques (**Java RMI** &
**CORBA**) avec une interface **Web** moderne.
---
## L'Équipe (Contributors)
Projet réalisé par les étudiants de la **Faculté des Sciences de Sfax (FSS)** :
- **Nour Elhak Ben Mefteh**
- **Aziz Chandoul**
- **Hachem Touati**
- **Omar Ben Ayed**
---
## Fonctionnalités Clés
### 1. Frontend (Interface Web)
- **Dashboard Réactif :** Visualisation immédiate de l'état du véhicule.
- **Logique Métier Avancée :** Distinction intelligente entre :
- *Usure Mécanique* (Basée sur les Km : Vidange, Freins).
 - *Usure Temporelle* (Basée sur le Temps : Assurance, Batterie).
  **Simulateur IoT :** Bouton de synchronisation pour récupérer des données télémétriques.
- **Notifications :** Intégration des alertes natives du navigateur/OS.
### 2. Backend (Systèmes Distribués)
- **Module CORBA (Interopérabilité) :**
 - Simulation d'un capteur de vitesse matériel.
 - Communication via IDL (`autotrack.idl`).
 - Pont simulé entre le Web et le Backend Java.
- **Module RMI (Java-to-Java) :**
 - Système de diagnostic mécanique.
 - **Types Complexes :** Utilisation d'objets sérialisés (`VehicleInfo`) pour le transfert de données riches
sur le réseau.
---
## Architecture Technique
| Composant | Technologie | Description |
| :--- | :--- | :--- |
| **Frontend** | HTML5 / JS / Bootstrap 5 | Interface utilisateur et logique de présentation. |
| **Stockage** | LocalStorage API | Persistance des données côté client. |
| **RMI** | Java JDK | Communication d'objets distants (Diagnostic). |
| **CORBA** | Java JDK 8 (ORB) | Communication inter-langages (Capteur). |
---
## Installation & Démarrage
### Prérequis
- **Java JDK 8** (Obligatoire pour la partie CORBA `idlj`).
- Un navigateur web moderne.
### 1. Installation
Clonez le dépôt :
```bash
git clone https://github.com/votre-username/autotrack.git
cd autotrack
2. Lancer l'Interface Web
Ouvrez simplement le fichier frontend/index.html dans votre navigateur.
3. Lancer le Module CORBA (Simulation Capteur)
Ouvrir 3 terminaux distincts.
Terminal 1 (Annuaire) :
codeBash
cd corba_java
tnameserv -ORBInitialPort 1050
Terminal 2 (Serveur) :
codeBash
java CorbaServer -ORBInitialPort 1050 -ORBInitialHost localhost
Terminal 3 (Client) :
codeBash
java CorbaClient -ORBInitialPort 1050 -ORBInitialHost localhost
4. Lancer le Module RMI (Diagnostic)
Ouvrir 2 terminaux distincts.
Terminal 1 (Serveur) :
codeBash
cd rmi_java
java RmiServer
Terminal 2 (Client) :
codeBash
java RmiClient