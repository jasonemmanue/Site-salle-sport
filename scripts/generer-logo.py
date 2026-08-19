"""Fabrique le logo transparent et les icones des deux sites, depuis la source.

Le logo d'origine (`scripts/logo-source.png`) est un JPEG-like aplati : le badge
rond y baigne dans un **fond blanc opaque**. Pose sur le bleu nuit du site, ce
fond dessinait un cadre clair autour du cercle — visible dans le header, dans le
pied de page et dans l'onglet du navigateur.

Ce script isole le badge et n'en garde que le disque :

1. seuil sur l'ecart au blanc pour trouver la boite englobante du badge ;
2. recadrage sur cette boite, puis mise au carre — le badge d'origine est une
   ellipse de 1163x1201, soit 3 % plus haute que large. Redresser cet ecart
   permet a `rounded-full` et aux icones carrees de tomber juste ; l'oeil ne le
   percoit pas ;
3. masque circulaire anti-crenele (calcule x4 puis reduit) legerement rentre,
   pour manger le liseré blanc du bord ;
4. declinaison aux formats attendus par Next.js.

Fichiers produits, identiques cote site public et cote back-office :

| Fichier | Taille | Fond |
|---------|--------|------|
| `public/logo.png` | 1024 (256 cote admin) | transparent |
| `frontend/public/filigrane.png` | 512 | transparent |
| `app/icon.png` | 512 | transparent |
| `app/apple-icon.png` | 180 | bleu nuit `#0F1724` |
| `app/favicon.ico` | 16/32/48/64 | transparent |

`apple-icon.png` est le seul a garder un fond : iOS ignore la transparence et
compose sur du noir, ce qui cerclerait le badge de noir sur l'ecran d'accueil.
Le bleu nuit est celui du site, donc le carre ne se voit pas.

Lancement (Pillow vient de l'image de l'API) :

    docker run --rm -v "$PWD:/work" salle-de-sport-api:latest \
        python /work/scripts/generer-logo.py
"""

from pathlib import Path

from PIL import Image, ImageChops, ImageDraw

RACINE = Path(__file__).resolve().parent.parent
SOURCE = RACINE / "scripts" / "logo-source.png"

TAILLE_LOGO = 1024
# Le back-office n'affiche jamais le logo au-dela de 96 px et sert ses images
# sans optimisation (`images.unoptimized`, faute de `sharp` dans son image
# Next 14). Lui livrer le fichier de 1024 px ferait telecharger 1,2 Mo pour une
# vignette de barre laterale.
TAILLE_LOGO_ADMIN = 256
TAILLE_ICONE = 512
TAILLE_APPLE = 180
# Filigrane des bannieres du site public. Il est appele depuis `globals.css`, qui
# ne passe pas par l'optimiseur de Next : c'est le fichier BRUT qui part sur le
# reseau. Servir `logo.png` ferait donc telecharger 1,2 Mo sur chaque page pour
# un fond a 10 % d'opacite. 512 px suffisent : le filigrane s'affiche a 340 px au
# plus, et a 62 vw sur telephone.
TAILLE_FILIGRANE = 512
TAILLES_FAVICON = [(16, 16), (32, 32), (48, 48), (64, 64)]
BLEU_NUIT = (15, 23, 36, 255)  # --color-dark

SUPERECHANTILLONNAGE = 4
# Le bord du badge garde un liseré du fond blanc d'origine : on rentre le masque
# de deux pixels pour le couper net.
RETRAIT_PX = 2


def _boite_du_badge(image: Image.Image) -> tuple[int, int, int, int]:
    """Boite englobante de tout ce qui n'est pas le fond blanc."""
    ecart = ImageChops.difference(
        image.convert("RGB"), Image.new("RGB", image.size, (255, 255, 255))
    ).convert("L")
    boite = ecart.point(lambda valeur: 255 if valeur > 12 else 0).getbbox()
    if boite is None:
        raise SystemExit("Aucun contenu detecte : la source est-elle entierement blanche ?")
    return boite


def _masque_circulaire(taille: int) -> Image.Image:
    grand = taille * SUPERECHANTILLONNAGE
    masque = Image.new("L", (grand, grand), 0)
    marge = RETRAIT_PX * SUPERECHANTILLONNAGE
    ImageDraw.Draw(masque).ellipse((marge, marge, grand - marge, grand - marge), fill=255)
    return masque.resize((taille, taille), Image.LANCZOS)


def fabrique_le_disque(source: Path, taille: int) -> Image.Image:
    image = Image.open(source).convert("RGBA")
    badge = image.crop(_boite_du_badge(image)).resize((taille, taille), Image.LANCZOS)
    badge.putalpha(_masque_circulaire(taille))
    return badge


def _ecrit(image: Image.Image, chemin: Path) -> None:
    chemin.parent.mkdir(parents=True, exist_ok=True)
    image.save(chemin, optimize=True)
    print(f"  {chemin.relative_to(RACINE)} — {chemin.stat().st_size // 1024} Ko")


def main() -> None:
    if not SOURCE.exists():
        raise SystemExit(f"Source introuvable : {SOURCE}")

    disque = fabrique_le_disque(SOURCE, TAILLE_LOGO)

    icone = disque.resize((TAILLE_ICONE, TAILLE_ICONE), Image.LANCZOS)

    # Apple : badge legerement rentre dans un carre plein, comme le veut iOS.
    apple = Image.new("RGBA", (TAILLE_APPLE, TAILLE_APPLE), BLEU_NUIT)
    marge = round(TAILLE_APPLE * 0.06)
    diametre = TAILLE_APPLE - 2 * marge
    apple.paste(disque.resize((diametre, diametre), Image.LANCZOS), (marge, marge), disque.resize((diametre, diametre), Image.LANCZOS))

    admin = disque.resize((TAILLE_LOGO_ADMIN, TAILLE_LOGO_ADMIN), Image.LANCZOS)

    # Filigrane : site public uniquement, le back-office n'en a pas.
    # Palette de 64 couleurs : a 10 % d'opacite derriere un degrade, la
    # posterisation ne se voit pas, et le fichier tombe de 286 a ~40 Ko. C'est du
    # poids reel — le CSS le telecharge sur dix pages.
    print("filigrane :")
    _ecrit(
        disque.resize((TAILLE_FILIGRANE, TAILLE_FILIGRANE), Image.LANCZOS)
        .quantize(colors=64, method=Image.Quantize.FASTOCTREE),
        RACINE / "frontend" / "public" / "filigrane.png",
    )

    for site in ("frontend", "admin"):
        print(f"{site} :")
        _ecrit(disque if site == "frontend" else admin, RACINE / site / "public" / "logo.png")
        _ecrit(icone, RACINE / site / "app" / "icon.png")
        _ecrit(apple, RACINE / site / "app" / "apple-icon.png")

        favicon = RACINE / site / "app" / "favicon.ico"
        favicon.parent.mkdir(parents=True, exist_ok=True)
        disque.save(favicon, format="ICO", sizes=TAILLES_FAVICON)
        print(f"  {favicon.relative_to(RACINE)} — {favicon.stat().st_size // 1024} Ko")


if __name__ == "__main__":
    main()
