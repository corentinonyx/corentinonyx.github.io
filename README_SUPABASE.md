# Configuration Supabase pour le Compteur TP FTV

## Étapes de configuration

### 1. Créer un projet Supabase
1. Allez sur [https://supabase.com](https://supabase.com)
2. Créez un compte ou connectez-vous
3. Créez un nouveau projet
4. Notez votre URL de projet et votre clé API (clé "public")

### 2. Configurer la base de données
1. Dans votre projet Supabase, allez dans "SQL Editor"
2. Copiez et collez le contenu du fichier `supabase_schema.sql`
3. Exécutez le script SQL pour créer les tables

### 3. Configurer les permissions
1. Allez dans "Authentication" > "Settings"
2. Dans "Site URL", ajoutez `http://localhost` si vous testez en local
3. **IMPORTANT** : Allez dans "Database" > "Tables"
4. Exécutez le contenu du fichier `supabase_policies.sql` dans le SQL Editor
5. OU manuellement : Pour chaque table (`sessions` et `session_participants`), cliquez sur les trois points et sélectionnez "Edit Policies"
6. Ajoutez des politiques pour autoriser les opérations CRUD (SELECT, INSERT, UPDATE, DELETE) pour "Anonymous"

### 3. Alternative - Désactiver RLS (pour tests rapides)
Si vous avez des problèmes de permissions, vous pouvez temporairement désactiver RLS :
```sql
ALTER TABLE sessions DISABLE ROW LEVEL SECURITY;
ALTER TABLE session_participants DISABLE ROW LEVEL SECURITY;
```

### 4. Configurer le client JavaScript
Ouvrez le fichier `supabase-client.js` et remplacez :
- `VOTRE_URL_SUPABASE` par l'URL de votre projet Supabase
- `VOTRE_CLE_SUPABASE` par votre clé publique

Exemple :
```javascript
this.supabaseUrl = 'https://votre-projet.supabase.co';
this.supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...';
```

## Fonctionnalités

### Sauvegarde dynamique
- Cliquez sur "💾 Sauvegarder dans la base" pour enregistrer la session actuelle
- Les données sauvegardées incluent :
  - Informations de la session (date, nombre de participants, temps total, etc.)
  - Données de chaque participant (nom, temps, écart par rapport à la moyenne)
  - Statistiques d'équité

### Consultation des sessions
- Cliquez sur "📊 Voir les sessions" pour afficher l'historique
- Pour chaque session vous pouvez :
  - Voir les détails complets
  - Supprimer une session
  - Voir si l'équité était respectée

## Structure des données

### Table `sessions`
- `id`: Identifiant unique de la session
- `date`: Date et heure de la session
- `participant_count`: Nombre de participants
- `tolerance_threshold`: Seuil de tolérance utilisé
- `total_session_time`: Temps total de la session (ms)
- `average_time`: Temps moyen par participant (ms)
- `equity_respected`: Si l'équité était respectée
- `max_deviation`: Écart maximum en pourcentage

### Table `session_participants`
- `id`: Identifiant unique
- `session_id`: Référence à la session
- `participant_name`: Nom du participant
- `time_ms`: Temps de parole (ms)
- `deviation_percentage`: Écart par rapport à la moyenne
- `rank`: Classement dans la session

## Sécurité

Pour une utilisation en production :
1. Activez Row Level Security (RLS) dans Supabase
2. Créez des politiques appropriées pour limiter l'accès
3. Utilisez des clés de service pour les opérations serveur si nécessaire
4. Ajoutez une authentification utilisateur si vous voulez des sessions privées

## Dépannage

### Erreur "Failed to load resource: the server responded with a status of 400"
C'est l'erreur la plus courante. Causes possibles :

1. **Permissions RLS non configurées** 
   - Solution : Exécutez le fichier `supabase_policies.sql` dans le SQL Editor
   - Ou désactivez temporairement RLS avec les commandes SQL alternatives

2. **Tables non créées**
   - Vérifiez que vous avez bien exécuté `supabase_schema.sql`
   - Allez dans "Database" > "Tables" pour vérifier que les tables existent

3. **Mauvaise clé API**
   - Assurez-vous d'utiliser la clé "public" (pas la clé "service_role")
   - La clé doit commencer par `sb_publishable_`

### Erreur "Client Supabase non initialisé"
- Vérifiez que vous avez bien configuré l'URL et la clé dans `supabase-client.js`
- Assurez-vous que votre navigateur peut accéder à l'API Supabase

### Erreur de connexion
- Vérifiez vos permissions dans Supabase
- Assurez-vous que les tables ont bien été créées
- Vérifiez les politiques RLS si elles sont activées

### Données non sauvegardées
- Vérifiez que vous avez des données actives dans les compteurs
- Assurez-vous que les compteurs ne sont pas tous à 00:00:00.00
- Ouvrez la console du navigateur (F12) pour voir les erreurs détaillées

### Vérifier que tout fonctionne
1. Ouvrez la console du navigateur (F12)
2. Essayez de sauvegarder une session
3. Regardez les logs dans la console pour voir les erreurs détaillées
