# Web SSMS — SQL Server Management Studio Web

Interface web SSMS-like pour SQL Server, construite avec Angular 17 + Node.js/Express.

## Prérequis

- [Node.js 18+](https://nodejs.org/) (inclut npm)
- Une instance SQL Server accessible

## Installation & démarrage

### 1. Backend

```bash
cd backend
npm install
npm run dev        # démarre sur http://localhost:3000
```

### 2. Frontend

```bash
cd frontend
npm install
npm start          # démarre sur http://localhost:4200
```

Ouvrir **http://localhost:4200** dans le navigateur.

## Fonctionnalités

| Fonctionnalité | Description |
|---|---|
| Connexion SQL | Login/mot de passe, choix du serveur et port |
| Explorateur | Liste des bases (état, modèle de récupération) et logins |
| Éditeur SQL | CodeMirror avec coloration syntaxique, Ctrl+Entrée pour exécuter |
| Résultats | Grille paginée avec compteur de lignes et durée d'exécution |
| Créer une base | Dialog de création avec validation du nom |
| Supprimer une base | Sélection dans la liste + confirmation |
| Créer un login | Nom, mot de passe, base par défaut |
| Supprimer un login | Sélection dans la liste |
| Sauvegarde | BACKUP DATABASE vers un chemin configurable |

## Structure du projet

```
backend/
  src/
    index.js          # Serveur Express + sessions
    db.js             # Utilitaire connexion mssql
    routes/
      auth.js         # POST /api/connect, /disconnect, GET /api/status
      databases.js    # GET/POST/DELETE /api/databases
      logins.js       # GET/POST/DELETE /api/logins
      query.js        # POST /api/query
      backup.js       # POST /api/backup

frontend/
  src/app/
    login/            # Page de connexion
    dashboard/
      object-explorer/  # Arbre BD + Logins
      query-editor/     # Éditeur SQL + résultats
      admin/            # Dialogs CRUD + backup
    services/
      api.service.ts    # Appels HTTP vers le backend
      auth-state.ts     # Signal de session Angular
      auth.guard.ts     # Protection de route
```
