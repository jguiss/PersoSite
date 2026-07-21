# julienguiss.com

Site personnel de Julien Guiss — marketeur web depuis 2003, d'Avignon à Québec.

Refonte complète : on abandonne l'ancien positionnement « services SEO » (Julien n'est pas
freelance) et le SEO-bait qui ne rankait pas, au profit d'un **site narratif** qui raconte
son histoire et rend la découverte agréable.

## Direction

- **Concept** : `guiss.exe` — le récit d'un parcours web présenté comme le *boot* d'un vieil
  ordinateur à écran ambre. Clin d'œil aux débuts du web (2003), revisité moderne : fluide,
  rapide, responsive.
- **Deux voix typographiques** : monospace pour la machine (UI, timeline, boot log), serif
  (Georgia) pour le récit humain.
- **Palette** : monde CRT ambre assumé (mono-thème), une seule touche froide cyan.
- **Zéro dépendance, zéro webfont** : un seul fichier `index.html` autonome → chargement
  instantané, déployable partout.

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
