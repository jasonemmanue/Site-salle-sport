"""Complete une base DEJA semee avec les donnees ajoutees apres coup.

    docker compose exec api python mise_a_jour_donnees.py

`seed.py` s'arrete net des que le compte administrateur existe : il ne peut donc
rien apporter a une base en service. Ce script fait le complement, et il est
ecrit pour etre rejouable — deux lancements de suite donnent le meme resultat.

Ce qu'il apporte :
  * le visuel de chaque sport, la ou l'activite n'en a aucun ;
  * l'activite « Boxe & Kick Boxing », ses trois formules et ses deux creneaux,
    absents du catalogue alors que « Abonnement de box » figurait deja dans les
    formules de paiement du formulaire de reservation ;
  * la miniature des videos.

Il ne touche jamais a une image televersee depuis le back-office : seules les
colonnes vides, ou pointant deja sur `/images/activites/`, sont ecrites.
"""

import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from uuid import uuid4

from sqlalchemy import create_engine
from sqlalchemy.orm import Session

from app.core.config import settings
from app.models.models import Activity, Coach, ScheduleSlot, Subscription, Video

# slug de l'activite -> rang d'affichage. L'insertion de la boxe en 4e position
# decale les trois activites suivantes : sans ce reglage, la boxe et HIIT Cardio
# porteraient toutes deux le rang 4 et leur ordre deviendrait arbitraire.
RANGS = {
    "musculation": 1,
    "seance-collective": 2,
    "kung-fu-wushu": 3,
    "boxe-kick-boxing": 4,
    "hiit-cardio": 5,
    "yoga": 6,
    "stretching": 7,
}

# slug de l'activite -> visuel livre avec le site public
IMAGES = {
    "musculation": "/images/activites/musculation.jpg",
    "seance-collective": "/images/activites/seance-collective.jpg",
    "kung-fu-wushu": "/images/activites/kung-fu-wushu.jpg",
    "boxe-kick-boxing": "/images/activites/boxe-kick-boxing.jpg",
    "hiit-cardio": "/images/activites/hiit-cardio.jpg",
    "yoga": "/images/activites/yoga.jpg",
    "stretching": "/images/activites/stretching.jpg",
}

# Miniature de video, par titre exact.
MINIATURES = {
    "Seance Musculation Complete": "/images/activites/musculation.jpg",
    "Seance Collective avec Leo": "/images/activites/seance-collective.jpg",
    "Initiation Kung-Fu Wushu": "/images/activites/kung-fu-wushu.jpg",
    "Boxe & Kick Boxing — Les bases": "/images/activites/boxe-kick-boxing.jpg",
    "Stretching Post-Entrainement": "/images/activites/stretching.jpg",
}

BOXE = {
    "name": "Boxe & Kick Boxing",
    "slug": "boxe-kick-boxing",
    "description": (
        "Cours de boxe et de kick boxing a ESLIE SPORT, Blochkauss residence "
        "Zeina. Mercredi et samedi de 15h a 16h30, enfants et adultes."
    ),
    "category": "martial_arts",
    "level": "all",
    "duration_minutes": 90,
    "max_capacity": 20,
    "image_url": IMAGES["boxe-kick-boxing"],
    "order": 4,
}

# Affiche officielle : mensualite a 15 000, contre 10 000 pour le Kung-Fu.
FORMULES_BOXE = [
    {"name": "Boxe & Kick Boxing — Inscription", "price": 10000, "duration_months": 0,
     "features": ["Inscription cours de boxe", "Boxe et kick boxing"], "order": 7},
    {"name": "Boxe & Kick Boxing — Mensuel", "price": 15000, "duration_months": 1,
     "features": ["Cours Mercredi 15h-16h30", "Cours Samedi 15h-16h30", "Enfants et adultes"], "order": 8},
    {"name": "Boxe & Kick Boxing — Tenue", "price": 20000, "duration_months": 0,
     "features": ["Tenue complete", "Obligatoire pour les cours"], "order": 9},
]

# (jour, debut, fin) — 2 = mercredi, 5 = samedi
CRENEAUX_BOXE = [(2, "15:00", "16:30"), (5, "15:00", "16:30")]

VIDEO_BOXE = {
    "title": "Boxe & Kick Boxing — Les bases",
    "description": (
        "Garde, deplacements et premiers enchainements avec les cours du "
        "mercredi et du samedi."
    ),
    "video_url": "boxe-bases.mp4",
    "category": "Arts Martiaux",
    "thumbnail_url": IMAGES["boxe-kick-boxing"],
}


def mettre_a_jour() -> None:
    engine = create_engine(settings.DATABASE_URL)
    faits: list[str] = []

    with Session(engine) as db:
        # ── L'activite Boxe & Kick Boxing ──
        boxe = db.query(Activity).filter_by(slug=BOXE["slug"]).first()
        if boxe is None:
            boxe = Activity(id=str(uuid4()), **BOXE, is_active=True)
            db.add(boxe)
            db.flush()
            faits.append("activite « Boxe & Kick Boxing » creee")

        # ── Les visuels manquants ──
        for slug, image in IMAGES.items():
            activite = db.query(Activity).filter_by(slug=slug).first()
            if activite is None:
                continue
            # Une photo televersee par l'admin vit sous /uploads/ : on la laisse.
            if activite.image_url and not activite.image_url.startswith("/images/activites/"):
                continue
            if activite.image_url != image:
                activite.image_url = image
                faits.append(f"visuel pose sur « {activite.name} »")

        # ── Le rang d'affichage ──
        for slug, rang in RANGS.items():
            activite = db.query(Activity).filter_by(slug=slug).first()
            if activite is not None and activite.order != rang:
                activite.order = rang
                faits.append(f"rang {rang} pour « {activite.name} »")

        # ── Les formules de la boxe ──
        for formule in FORMULES_BOXE:
            if db.query(Subscription).filter_by(name=formule["name"]).first() is None:
                db.add(Subscription(id=str(uuid4()), **formule, is_active=True))
                faits.append(f"formule « {formule['name']} » ({formule['price']} FCFA)")

        # ── Les creneaux de la boxe ──
        # `coach_id` est NOT NULL et l'affiche ne nomme personne : on retient le
        # coach « arts martiaux », a corriger depuis le back-office.
        coach = (
            db.query(Coach).filter(Coach.name == "Adonis").first()
            or db.query(Coach).filter(Coach.is_active.is_(True)).order_by(Coach.order).first()
        )
        if coach is None:
            print("Aucun coach en base : creneaux de boxe non crees.")
        else:
            for jour, debut, fin in CRENEAUX_BOXE:
                existant = (
                    db.query(ScheduleSlot)
                    .filter_by(activity_id=boxe.id, day_of_week=jour, start_time=debut)
                    .first()
                )
                if existant is None:
                    db.add(ScheduleSlot(
                        id=str(uuid4()), activity_id=boxe.id, coach_id=coach.id,
                        day_of_week=jour, start_time=debut, end_time=fin,
                        is_recurring=True, is_active=True,
                    ))
                    faits.append(f"creneau boxe jour {jour} {debut}-{fin}")

        # ── Les miniatures de video ──
        if db.query(Video).filter_by(title=VIDEO_BOXE["title"]).first() is None:
            db.add(Video(id=str(uuid4()), **VIDEO_BOXE, is_published=True))
            faits.append("video « Boxe & Kick Boxing — Les bases »")

        for titre, miniature in MINIATURES.items():
            video = db.query(Video).filter_by(title=titre).first()
            if video is None:
                continue
            if video.thumbnail_url and not video.thumbnail_url.startswith("/images/activites/"):
                continue
            if video.thumbnail_url != miniature:
                video.thumbnail_url = miniature
                faits.append(f"miniature posee sur « {titre} »")

        db.commit()

    if faits:
        print(f"{len(faits)} mise(s) a jour :")
        for f in faits:
            print(f"  - {f}")
    else:
        print("Rien a faire : la base est deja a jour.")


if __name__ == "__main__":
    mettre_a_jour()
