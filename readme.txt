Compteur TP FTV – Description & Fonctionnalités
1. Objectif général
L’application permet de suivre jusqu’à six chronomètres indépendants pour des personnes ou équipes différentes. Elle facilite la comparaison des temps écoulés via un classement dynamique et propose des contrôles globaux (mode exclusif, reset général, réglage d’affichage).

2. Structure générale
L’application est construite avec HTML, CSS et JavaScript vanilla. Elle utilise des classes CSS pour structurer l’interface et des fonctions JavaScript pour gérer la logique des compteurs, le classement et la persistance des données.

3. Interface principale
Header : bouton “Stop timer si un autre est lancé” qui active/désactive le mode exclusif.
ON : démarrer un compteur arrête automatiquement tous les autres visibles.
OFF : chaque compteur fonctionne indépendamment.
Colonne de gauche (“styte_rank”) :
Sélecteur du nombre de participants (1 à 6). Masque les compteurs excédentaires.
Tableau de classement trié du temps le plus long au plus court ; il se met à jour à chaque tick, arrêt ou reset.
Bouton “Reset Timer” qui remet simultanément tous les chronos à zéro.
Zone principale (“style_timer”) :
Grille de cartes contenant pour chaque compteur :
Champ texte pour saisir un nom (défaut “Personne X”).
Affichage du temps (hh:mm:ss.cs).
Bouton “Play” (qui sert aussi de “Stop” après démarrage). Les boutons “Stop”/“Reset” dédiés existent dans le DOM mais restent masqués ; les actions passent exclusivement par “Play/Stop” et le bouton reset global.

4. Fonctionnement des compteurs
Chaque carte instancie un objet Timer :
Gère l’état local (startTime, elapsedTime, intervalId, nom).
Bouton principal commute entre start() et stop() via toggle().
Les coloris et libellés évoluent (Play vert, Stop rouge, etc.).
updateCounter() déclenche un rafraîchissement toutes les 10 ms quand le timer tourne.
Le mode exclusif s’applique via stopOtherTimers() : si actif, tout démarrage appelle Timer.stop() sur les autres instances encore visibles.
Le classement se calcule dans updateRanking() : il ne retient que les compteurs actuellement affichés.

4. Persistence & auto-save
Les états sont stockés dans localStorage (ftv_compteur_state_v1) :
Pour chaque timer : temps accumulé, horodatage du dernier démarrage (lastStartTime), statut (en cours ou non), valeur du champ texte.
paramètres globaux : mode exclusif, nombre de compteurs visibles.
À chaque action significative (Play/Stop/Reset/édition de nom/affichage), persistState() sérialise les données.
Au chargement :
restoreState() relit le JSON, restaure les noms, ré-affiche les bons compteurs et relance automatiquement les chronos qui étaient en cours (en reconstituant le temps écoulé à partir de lastStartTime).
Si aucune sauvegarde n’est présente, l’appli démarre avec les six compteurs visibles par défaut.

5. Adaptation visuelle
Mise en page flex (header, zone de gauche, zone principale, footer).
Les cartes de compteurs utilisent un design responsive (largeur via clamp, bordures arrondies).
Footer avec sélecteur de “Résolution” (pour les scripts annexes), label aligné à droite.