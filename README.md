# TaskList — Frontend

Interface utilisateur de l'application **TaskList**, construite avec **React 19**, **Vite** et **TypeScript**.

## Stack technique

- **Framework** : React 19
- **Build tool** : Vite
- **Langage** : TypeScript
- **Tests** : Vitest, React Testing Library
- **Qualité de code** : SonarQube
- **Conteneurisation** : Docker (multi-stage build, Nginx en production)
- **Sécurité** : Trivy (scan de vulnérabilités + SBOM)
- **Registre d'images** : DockerHub

## Installation

npm ci

## Lancer le projet en local

npm run dev

L'application démarre par défaut sur http://localhost:5173

## Build de production

npm run build
npm run preview

## Tests et couverture

npm run test:coverage

Couverture obtenue : 91.3% de branches (objectif 70%)

Le rapport de couverture est généré dans coverage/ (consommé par SonarQube), les résultats de tests dans reports/.

## Analyse de qualite (SonarQube)

sonar-scanner -Dsonar.host.url=https://sonarqube.cicd.kits.ext.educentre.fr -Dsonar.token=TOKEN

Configuration définie dans sonar-project.properties.

## Conteneurisation

Build de l'image (multi-stage : build Node puis service via Nginx) :

docker buildx build --tag tasklist-frontend:local --load .

Le conteneur de production sert les fichiers statiques buildés (dist/) via Nginx, configuré dans nginx.conf (gestion du fallback SPA et cache des assets).

Scan de securite Trivy :

trivy image --severity CRITICAL,HIGH --format table tasklist-frontend:local

Resultat : 0 vulnerabilite CRITICAL/HIGH (image basee sur nginx:alpine).

Generation des SBOM :

trivy image --format spdx-json --output sbom-spdx.json tasklist-frontend:local
trivy image --format cyclonedx --output sbom-cyclonedx.json tasklist-frontend:local

Publication sur DockerHub :

docker buildx build --platform linux/amd64 --tag okidock/tasklist-frontend:latest --sbom=true --provenance=true --push .

Image disponible sur https://hub.docker.com/r/okidock/tasklist-frontend

## Variables d'environnement

VITE_API_URL - URL de base de l'API backend (par defaut /api si non definie)

## Structure du projet

src/api - Client HTTP pour communiquer avec l'API backend
src/components - Composants React (TaskForm, TaskItem, TaskList)
src/hooks - Hook useTasks centralisant la logique d'etat et les appels API
src/types - Types TypeScript partages
src/__tests__ - Tests unitaires (composants, hook, client API)
