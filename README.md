# julienguiss.com

Site personnel de Julien Guiss — marketeur web depuis 2003, d'Avignon à Québec.

Refonte complète : on abandonne l'ancien positionnement « services SEO » (Julien n'est pas
freelance) et le SEO-bait qui ne rankait pas, au profit d'un **site narratif** qui raconte
son histoire et rend la découverte agréable.

## Direction retenue — « Kinetic »

Identité éditoriale façon studio de design : fond papier clair, typographie grotesque
géante, accent bleu électrique (+ vermillon), labels en monospace, grille et marquees.
Objectif « effet waouh », animations poussées mais au service du contenu.

- **Animations** (tout en code, zéro service externe) :
  - lettres du titre qui montent à l'ouverture ;
  - titre en parallaxe qui réagit à la souris ;
  - marquees qui accélèrent selon la vitesse de scroll ;
  - phrase géante avec un mot qui tourne en boucle ;
  - compteurs animés (2003 · 300+ · 20…) ;
  - curseur personnalisé + liens magnétiques (desktop).
- **Robuste** : contenu visible même sans JavaScript ; `prefers-reduced-motion` respecté ;
  effets souris désactivés sur tactile.
- **Zéro dépendance, zéro webfont** : un seul fichier `index.html` autonome → chargement
  instantané, déployable partout.

Les pistes écartées (Aurora, Blueprint) et l'ancienne V (Stranger Things) restent
consultables dans l'historique git et le dossier `concepts/`.

## Structure

| Section    | Contenu                                                        |
|------------|----------------------------------------------------------------|
| Hero       | Séquence de boot animée + nom + accroche                        |
| ~/parcours | Le récit « comment on devient expert » + timeline 2003 → auj.   |
| ~/méthode  | 4 convictions issues de 20 ans de métier                        |
| ~/perso    | Teaser du chapitre personnel (Avignon → Québec), à écrire       |
| ~/contact  | LinkedIn · X · YouTube                                           |

## À faire (contenu)

Le texte est un **premier jet** rédigé à partir des infos publiques. Tout ce qui est marqué
`[à confirmer]` dans `index.html` doit être validé avec Julien : dates exactes, intitulé de
poste, entreprise, jalons marquants, et surtout le **chapitre perso** (à raconter).

## Dev / déploiement

Site 100 % statique. Aucune étape de build.

```bash
# aperçu local
python3 -m http.server 8000   # puis http://localhost:8000
```

Déployable tel quel sur GitHub Pages, Netlify, Vercel ou tout hébergement statique.

## Autre projet dans ce dépôt : location Gaujac (Gard)

Le dossier [`gojac/`](gojac/) contient un site indépendant : une vitrine de
location de vacances pour une maison à Gaujac (Gard), avec calendrier de
disponibilités synchronisé Airbnb + Booking.com. Voir [`gojac/README.md`](gojac/README.md).
