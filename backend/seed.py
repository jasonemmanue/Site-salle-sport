"""Seed the database with initial data: admin user, activities, subscriptions, coaches, schedule slots."""

import sys
import os

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from sqlalchemy import create_engine
from sqlalchemy.orm import Session
from app.core.config import settings
from app.core.security import hash_password
from app.models.models import (
    Base, User, Activity, Coach, ScheduleSlot, Subscription,
    Equipment, Review, Article, Video, Transformation, Setting,
)
from uuid import uuid4
from datetime import datetime, date


def seed():
    engine = create_engine(settings.DATABASE_URL)
    Base.metadata.create_all(bind=engine)

    with Session(engine) as db:
        if db.query(User).filter_by(email=settings.ADMIN_EMAIL).first():
            print("Database already seeded.")
            return

        # Admin user
        admin = User(
            id=str(uuid4()),
            email=settings.ADMIN_EMAIL,
            password_hash=hash_password(settings.ADMIN_PASSWORD),
            full_name="Administrateur ESLIE SPORT",
            role="admin",
            is_active=True,
        )
        db.add(admin)

        # Activities — donnees reelles ESLIE SPORT
        # `image_url` pointe sur `frontend/public/images/activites/`, livre avec
        # le site et produit par `scripts/telecharger-images-sports.mjs`. Sans
        # visuel, la carte de l'activite tombe sur son degrade de repli, presque
        # noir. L'admin peut televerser sa propre photo par-dessus.
        activities_data = [
            {"name": "Musculation", "slug": "musculation", "description": "Renforcez votre masse musculaire avec nos equipements de pointe. Salle ouverte tous les jours de 07h a 20h.", "category": "force", "level": "all", "duration_minutes": 60, "max_capacity": 20, "image_url": "/images/activites/musculation.jpg", "order": 1},
            {"name": "Seance Collective", "slug": "seance-collective", "description": "Seances de groupe encadrees par nos coachs certifies. Cardio, renforcement musculaire et bien-etre en groupe.", "category": "cardio", "level": "all", "duration_minutes": 90, "max_capacity": 25, "image_url": "/images/activites/seance-collective.jpg", "order": 2},
            {"name": "Kung-Fu Wushu", "slug": "kung-fu-wushu", "description": "Ecole de Kung-Fu Wushu Karate Academy ouverte dans la salle ESLIE SPORT a Blaukauss. Recoit toutes categories de personnes a partir de 4 ans.", "category": "martial_arts", "level": "all", "duration_minutes": 90, "max_capacity": 20, "image_url": "/images/activites/kung-fu-wushu.jpg", "order": 3},
            {"name": "Boxe & Kick Boxing", "slug": "boxe-kick-boxing", "description": "Cours de boxe et de kick boxing a ESLIE SPORT, Blochkauss residence Zeina. Mercredi et samedi de 15h a 16h30, enfants et adultes.", "category": "martial_arts", "level": "all", "duration_minutes": 90, "max_capacity": 20, "image_url": "/images/activites/boxe-kick-boxing.jpg", "order": 4},
            {"name": "HIIT Cardio", "slug": "hiit-cardio", "description": "Entrainement fractionne haute intensite pour bruler un maximum de calories en un minimum de temps.", "category": "cardio", "level": "intermediate", "duration_minutes": 45, "max_capacity": 15, "image_url": "/images/activites/hiit-cardio.jpg", "order": 5},
            {"name": "Yoga", "slug": "yoga", "description": "Fluidite, souplesse et serenite. Enchainements dynamiques pour equilibrer corps et esprit.", "category": "flexibility", "level": "beginner", "duration_minutes": 60, "max_capacity": 12, "image_url": "/images/activites/yoga.jpg", "order": 6},
            {"name": "Stretching", "slug": "stretching", "description": "Seance d'etirements pour ameliorer la souplesse et favoriser la recuperation musculaire.", "category": "flexibility", "level": "beginner", "duration_minutes": 30, "max_capacity": 20, "image_url": "/images/activites/stretching.jpg", "order": 7},
        ]
        activities = []
        for data in activities_data:
            a = Activity(id=str(uuid4()), **data, is_active=True)
            db.add(a)
            activities.append(a)

        # Coaches — donnees reelles ESLIE SPORT
        coaches_data = [
            {"name": "Toussaint", "certifications": ["Coach Musculation", "Preparation Physique"], "specialties": ["Musculation", "Force", "Preparation physique"], "bio": "Coach principal de la salle, Toussaint encadre les seances de musculation tous les jours de 07h a 20h.", "order": 1},
            {"name": "Leo", "certifications": ["Coach Fitness", "Entrainement Collectif"], "specialties": ["Seances collectives", "Cardio", "Renforcement"], "bio": "Specialiste des seances collectives, Leo motive le groupe avec energie et bienveillance. Cours les lundi, mercredi et vendredi.", "order": 2},
            {"name": "David", "certifications": ["Coach Fitness", "Cardio Training"], "specialties": ["Seances collectives", "Cardio", "Endurance"], "bio": "David anime les seances collectives du mardi et du samedi avec des programmes varies et dynamiques.", "order": 3},
            {"name": "Adonis", "certifications": ["Coach Sportif", "Arts Martiaux"], "specialties": ["Seances collectives", "Renforcement musculaire"], "bio": "Adonis encadre les seances collectives du jeudi avec un programme axe sur le renforcement et l'endurance.", "order": 4},
        ]
        coaches = []
        for data in coaches_data:
            c = Coach(id=str(uuid4()), **data, is_active=True)
            db.add(c)
            coaches.append(c)

        # Subscriptions — tarifs reels ESLIE SPORT (FCFA)
        subs_data = [
            {"name": "Seance individuelle / collective", "price": 3000, "duration_months": 0, "features": ["Acces a une seance", "Musculation ou cours collectif", "Accompagnement coach"], "order": 1},
            {"name": "Inscription mensuelle", "price": 5000, "duration_months": 1, "features": ["Frais d'inscription", "Acces a la salle", "Carte membre"], "order": 2},
            {"name": "Mensualite", "price": 30000, "duration_months": 1, "features": ["Acces illimite a la salle", "Tous les cours collectifs", "Musculation 07h-20h", "Suivi par les coachs"], "order": 3},
            {"name": "Kung-Fu Wushu — Inscription", "price": 10000, "duration_months": 0, "features": ["Inscription ecole Kung-Fu Wushu", "Karate Academy"], "order": 4},
            {"name": "Kung-Fu Wushu — Mensuel", "price": 10000, "duration_months": 1, "features": ["Cours Mercredi 14h-15h30", "Cours Samedi 10h-11h30", "A partir de 4 ans"], "order": 5},
            {"name": "Kung-Fu Wushu — Tenue", "price": 20000, "duration_months": 0, "features": ["Tenue de sport complete", "Obligatoire pour les cours"], "order": 6},
            # Boxe & Kick Boxing — affiche officielle : inscription 10 000,
            # mensualite 15 000 (et non 10 000 comme le Kung-Fu), tenue 20 000.
            {"name": "Boxe & Kick Boxing — Inscription", "price": 10000, "duration_months": 0, "features": ["Inscription cours de boxe", "Boxe et kick boxing"], "order": 7},
            {"name": "Boxe & Kick Boxing — Mensuel", "price": 15000, "duration_months": 1, "features": ["Cours Mercredi 15h-16h30", "Cours Samedi 15h-16h30", "Enfants et adultes"], "order": 8},
            {"name": "Boxe & Kick Boxing — Tenue", "price": 20000, "duration_months": 0, "features": ["Tenue complete", "Obligatoire pour les cours"], "order": 9},
        ]
        for data in subs_data:
            db.add(Subscription(id=str(uuid4()), **data, is_active=True))

        # Schedule slots — planning reel ESLIE SPORT
        # Indices: 0=Musculation, 1=Seance Collective, 2=Kung-Fu Wushu, 3=Boxe
        # Coaches: 0=Toussaint, 1=Leo, 2=David, 3=Adonis
        # Les affiches Kung-Fu et Boxe ne nomment aucun coach, mais la colonne
        # `coach_id` est NOT NULL : Adonis, seul coach a porter « arts martiaux »
        # dans ses specialites, encadre les deux par defaut. A corriger depuis
        # le back-office des que la salle communique les vrais noms.
        schedule_data = [
            # Musculation — Tous les jours 07h-20h (Toussaint)
            (0, "07:00", "20:00", 0, 0),  # Lundi
            (1, "07:00", "20:00", 0, 0),  # Mardi
            (2, "07:00", "20:00", 0, 0),  # Mercredi
            (3, "07:00", "20:00", 0, 0),  # Jeudi
            (4, "07:00", "20:00", 0, 0),  # Vendredi
            (5, "07:00", "20:00", 0, 0),  # Samedi
            (6, "07:00", "20:00", 0, 0),  # Dimanche
            # Seances collectives
            (0, "20:30", "22:00", 1, 1),  # Lundi — Leo
            (1, "18:00", "19:39", 1, 2),  # Mardi — David
            (2, "20:30", "22:00", 1, 1),  # Mercredi — Leo
            (3, "18:30", "20:30", 1, 3),  # Jeudi — Adonis
            (4, "20:30", "22:00", 1, 1),  # Vendredi — Leo
            (5, "07:00", "09:00", 1, 2),  # Samedi — David
            # Kung-Fu Wushu
            (2, "14:00", "15:30", 2, 3),  # Mercredi — 14h-15h30
            (5, "10:00", "11:30", 2, 3),  # Samedi — 10h-11h30
            # Boxe & Kick Boxing
            (2, "15:00", "16:30", 3, 3),  # Mercredi — 15h-16h30
            (5, "15:00", "16:30", 3, 3),  # Samedi — 15h-16h30
        ]
        for day, start, end, act_idx, coach_idx in schedule_data:
            db.add(ScheduleSlot(
                id=str(uuid4()),
                activity_id=activities[act_idx].id,
                coach_id=coaches[coach_idx].id,
                day_of_week=day,
                start_time=start,
                end_time=end,
                is_recurring=True,
                is_active=True,
            ))

        # Equipment
        equipment_data = [
            ("Banc de musculation", "Bancs reglables multi-positions pour presses et exercices divers.", "musculation", 8),
            ("Rack a squat", "Racks professionnels avec barres de securite et repose-barres.", "musculation", 4),
            ("Halteres", "Jeu complet d'halteres avec rack de rangement.", "musculation", 2),
            ("Machine Smith", "Smith machine guidee pour squats, developpes et rowings securises.", "musculation", 2),
            ("Tapis de course", "Tapis professionnels avec programmes integres.", "cardio", 6),
            ("Velo elliptique", "Elliptiques avec resistance magnetique et suivi cardiaque.", "cardio", 4),
            ("Tapis de sol", "Tapis pour exercices au sol, stretching et seances collectives.", "stretching", 25),
            ("Casiers", "Casiers individuels pour les membres.", "locker", 40),
        ]
        for name, desc, zone, qty in equipment_data:
            db.add(Equipment(id=str(uuid4()), name=name, description=desc, zone=zone, quantity=qty, is_active=True))

        # Reviews
        reviews_data = [
            ("Alexandre K.", 5, "Meilleure salle de Blaukauss ! Les coachs sont attentifs et l'ambiance au top."),
            ("Nadia B.", 5, "Les seances collectives avec Leo sont incroyables, on se depasse a chaque fois."),
            ("Pierre L.", 4, "Tres bien equipee pour la musculation. Coach Toussaint est vraiment professionnel."),
            ("Marie C.", 5, "Le Kung-Fu Wushu pour mes enfants, ils adorent ! Programme adapte a tous les ages."),
            ("Thomas D.", 5, "Salle propre, coachs motives, prix tres abordables. Je recommande."),
            ("Amina D.", 4, "J'ai gagne en forme grace aux seances collectives. Ambiance familiale."),
        ]
        for name, rating, comment in reviews_data:
            db.add(Review(id=str(uuid4()), author_name=name, rating=rating, comment=comment, is_approved=True))

        # Articles
        articles_data = [
            ("5 Exercices Incontournables pour Sculpter vos Abdominaux", "5-exercices-abdominaux", "Decouvrez les meilleurs exercices pour travailler vos abdominaux en profondeur.", "Les meilleurs mouvements pour un ventre tonique, adaptes a tous les niveaux."),
            ("Nutrition Sportive : Que Manger Avant et Apres l'Entrainement", "nutrition-sportive-avant-apres", "L'alimentation est la cle de la performance. Optimisez vos repas pour maximiser vos resultats.", "Optimisez vos repas pour de meilleures performances et une recuperation optimale."),
            ("Les Bienfaits du Kung-Fu Wushu pour les Enfants", "bienfaits-kung-fu-enfants", "Le Kung-Fu Wushu developpe la discipline, la confiance en soi et la coordination chez les enfants des 4 ans.", "Pourquoi inscrire votre enfant au Kung-Fu Wushu a ESLIE SPORT."),
        ]
        for title, slug, content, excerpt in articles_data:
            db.add(Article(
                id=str(uuid4()), title=title, slug=slug, content=content, excerpt=excerpt,
                status="published", published_at=datetime.utcnow(), author_id=admin.id,
            ))

        # Transformations
        transformations_data = [
            ("Julien M.", "En 6 mois de musculation avec Toussaint, j'ai pris 8 kg de muscle.", "6 mois"),
            ("Marie C.", "Les seances collectives m'ont aidee a perdre 12 kg et retrouver la forme.", "8 mois"),
            ("Thomas D.", "De debutant a passionne. Mon physique et mon mental ont change.", "1 an"),
            ("Amina D.", "J'ai gagne en force et en confiance grace aux coachs d'ESLIE SPORT.", "4 mois"),
        ]
        for name, testimonial, duration in transformations_data:
            db.add(Transformation(
                id=str(uuid4()), member_name=name, testimonial=testimonial,
                duration_text=duration, is_featured=True, is_published=True,
            ))

        # Videos
        # La miniature reprend le visuel du sport concerne : sans elle, la carte
        # video tombe sur un aplat sombre orne d'une icone.
        videos_data = [
            ("Seance Musculation Complete", "Programme complet pour developper votre masse musculaire avec Coach Toussaint.", "musculation-demo.mp4", "Musculation", "/images/activites/musculation.jpg"),
            ("Seance Collective avec Leo", "Apercu d'une seance collective energique avec Coach Leo.", "collective-leo.mp4", "Cardio", "/images/activites/seance-collective.jpg"),
            ("Initiation Kung-Fu Wushu", "Decouverte du Kung-Fu Wushu pour debutants a ESLIE SPORT.", "kungfu-initiation.mp4", "Arts Martiaux", "/images/activites/kung-fu-wushu.jpg"),
            ("Boxe & Kick Boxing — Les bases", "Garde, deplacements et premiers enchainements avec les cours du mercredi et du samedi.", "boxe-bases.mp4", "Arts Martiaux", "/images/activites/boxe-kick-boxing.jpg"),
            ("Stretching Post-Entrainement", "10 minutes d'etirements essentiels apres votre seance.", "stretching.mp4", "Stretching", "/images/activites/stretching.jpg"),
        ]
        for title, desc, url, cat, thumb in videos_data:
            db.add(Video(id=str(uuid4()), title=title, description=desc, video_url=url, category=cat, thumbnail_url=thumb, is_published=True))

        # Settings — infos reelles ESLIE SPORT
        settings_data = [
            ("gym_name", "ESLIE SPORT"),
            ("address", "Blaukauss, Abidjan, Cote d'Ivoire"),
            ("phone", "+225 0545079850"),
            ("email", "contact@esliesport.com"),
            ("opening_hours", "Lundi - Dimanche : 07h - 20h"),
            ("facebook_url", ""),
            ("instagram_url", ""),
            ("youtube_url", ""),
        ]
        for key, value in settings_data:
            db.add(Setting(id=str(uuid4()), key=key, value=value))

        db.commit()
        print("Database seeded successfully!")
        print(f"  Admin: {settings.ADMIN_EMAIL} / {settings.ADMIN_PASSWORD}")
        print(f"  Activities: {len(activities_data)}")
        print(f"  Coaches: {len(coaches_data)}")
        print(f"  Subscriptions: {len(subs_data)}")
        print(f"  Schedule slots: {len(schedule_data)}")
        print(f"  Equipment: {len(equipment_data)}")
        print(f"  Reviews: {len(reviews_data)}")


if __name__ == "__main__":
    seed()
