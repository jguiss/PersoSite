# Le Mas des Oliviers — Gaujac (Gard)

Site de location de vacances pour une maison à **Gaujac (30330, Gard)**, avec
un calendrier de disponibilités **synchronisé automatiquement avec Airbnb et
Booking.com** (lecture des flux iCal des deux plateformes, fusionnés en un
seul calendrier affiché sur le site).

> Site de démonstration généré pour montrer une implémentation complète et
> réaliste. Tout ce qui est marqué **`[à confirmer]`** dans `index.html` doit
> être validé/rempli avant mise en ligne réelle (voir la checklist en bas de
> ce document).

## Structure

```
gojac/
├── index.html                        # Site complet (HTML/CSS/JS auto-contenu)
├── netlify.toml                      # Config Netlify (redirections + fonctions)
├── netlify/
│   └── functions/
│       └── availability.js           # Fusion des calendriers iCal Airbnb + Booking
└── README.md                         # Ce fichier
```

Le front-end est un fichier unique, sans dépendance ni build (même logique
que le site principal du dépôt) : ouvrable directement dans un navigateur,
déployable tel quel sur n'importe quel hébergement statique. Seul le
calendrier de disponibilités a besoin d'un backend léger (une fonction
serverless) pour parler à Airbnb et Booking sans problème CORS — d'où le
choix de Netlify Functions, gratuites et suffisantes pour cet usage.

## Comment fonctionne la synchronisation des disponibilités

**Principe : iCal, pas d'API "officielle".** Airbnb et Booking.com ne
proposent pas d'API publique de réservation ouverte aux hébergeurs
individuels (elle est réservée aux gros partenaires/channel managers
certifiés). La méthode standard et fiable pour un particulier est la
**synchronisation par calendrier iCal** :

1. Chaque plateforme génère une URL `.ics` qui liste les dates bloquées de
   votre annonce (réservations, blocages manuels).
2. La fonction `netlify/functions/availability.js` récupère ces deux flux
   côté serveur, les fusionne, et les expose en JSON via `/api/availability`.
3. `index.html` interroge cet endpoint et affiche un calendrier unique avec
   un code couleur par plateforme (Airbnb / Booking / les deux).

C'est une synchronisation **en lecture** (les deux plateformes → le site).
Pour une synchronisation complète (le site → les plateformes, utile si vous
acceptez aussi des réservations en direct), il faut en plus :

- stocker les réservations prises en direct sur le site (base de données —
  non incluse ici, hors périmètre d'un site statique) ;
- générer votre propre flux `.ics` à partir de ces réservations ;
- l'importer dans Airbnb **et** Booking comme "calendrier externe" pour que
  les réservations directes bloquent aussi les deux plateformes.

Cette dernière étape n'est pas construite dans cette version (elle suppose
une prise de paiement + une base de données), mais l'architecture actuelle
(fonction serverless + endpoint JSON) est prête à l'accueillir.

### Récupérer les URL iCal

**Airbnb** (espace hôte) :
`Annonces → [votre annonce] → Disponibilités → Synchroniser les calendriers
→ Exporter le calendrier` → copier l'URL `.ics` proposée.

**Booking.com** (extranet) :
`Tarifs et disponibilités → Synchronisation des calendriers → Exporter le
calendrier` → copier l'URL `.ics` proposée.

### Configurer le site avec les vraies URL

Sur Netlify : `Site settings → Environment variables`, ajouter :

| Variable            | Valeur                                   |
|---------------------|-------------------------------------------|
| `AIRBNB_ICAL_URL`   | URL `.ics` exportée depuis Airbnb          |
| `BOOKING_ICAL_URL`  | URL `.ics` exportée depuis Booking.com     |

Sans ces variables, `/api/availability` renvoie automatiquement un jeu de
données de **démonstration** (généré à partir de la date du jour), et le
site affiche un bandeau "mode démonstration" — le site reste donc présentable
même avant d'avoir branché les vraies annonces.

## Déploiement (Netlify, recommandé)

1. Connecter le dépôt à Netlify (ou déployer en drag & drop du dossier
   `gojac/`).
2. Base directory : `gojac`
3. Build command : (aucune — site statique)
4. Publish directory : `.`
5. Functions directory : `netlify/functions` (déjà déclaré dans
   `netlify.toml`)
6. Ajouter les variables d'environnement `AIRBNB_ICAL_URL` /
   `BOOKING_ICAL_URL` une fois les annonces en ligne.
7. Le formulaire de contact utilise **Netlify Forms**
   (`data-netlify="true"`) : aucune configuration supplémentaire nécessaire
   sur Netlify, les soumissions apparaissent dans `Site → Forms`.

### Déploiement sur un autre hébergeur

Le site fonctionne sans fonction serverless (bascule automatique en mode
démonstration), mais pour une vraie synchronisation il faut un équivalent de
la fonction `availability.js` sur votre plateforme (Vercel/Cloudflare
Workers/etc. — la logique de parsing iCal est indépendante de Netlify et se
copie facilement). Le formulaire de contact devra aussi être remplacé
(service tiers ou `mailto:`).

## Checklist avant mise en ligne réelle

Rechercher `[à confirmer]` dans `index.html` — chaque occurrence correspond à
une information à valider :

- [ ] Nom commercial de la maison ("Le Mas des Oliviers" est un nom
      provisoire à valider/changer)
- [ ] Adresse exacte (affichée uniquement après réservation, mais à définir
      en interne pour la carte et les emails de confirmation)
- [ ] Capacité (chambres, salles de bain, voyageurs, m²)
- [ ] Équipements réels (piscine, clim, wifi, parking, animaux, etc.)
- [ ] Horaires d'arrivée / départ, conditions d'annulation
- [ ] Photos réelles (remplacer les visuels placeholder de la galerie —
      12 à 20 photos recommandées, format paysage)
- [ ] Liens réels vers les annonces Airbnb et Booking.com (actuellement
      pointent vers les pages d'accueil génériques)
- [ ] Coordonnées de contact (email, téléphone)
- [ ] **Numéro de déclaration "meublé de tourisme"** : en France, la location
      saisonnière d'une résidence doit en général être déclarée en mairie
      (et immatriculée si la commune l'exige) ; ce numéro doit apparaître sur
      les annonces Airbnb/Booking et, par cohérence, sur ce site.
- [ ] `AIRBNB_ICAL_URL` et `BOOKING_ICAL_URL` configurées sur l'hébergeur

## Prévisualisation locale

```bash
cd gojac
python3 -m http.server 8000   # puis http://localhost:8000
```

En local (ou sur un hébergement statique simple), `/api/availability`
n'existe pas : le calendrier bascule automatiquement en mode démonstration
côté client (aucune erreur visible, juste le bandeau "mode démonstration").
