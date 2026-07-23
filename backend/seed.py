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
            full_name="Administrateur",
            role="admin",
            is_active=True,
        )
        db.add(admin)

        # Activities
        activities_data = [
            {"name": "Musculation", "slug": "musculation", "description": "Renforcez votre masse musculaire avec nos equipements de pointe et nos programmes personnalises.", "category": "force", "level": "all", "duration_minutes": 60, "max_capacity": 20, "order": 1},
            {"name": "HIIT Cardio", "slug": "hiit-cardio", "description": "Entrainement fractionne haute intensite pour bruler un maximum de calories en un minimum de temps.", "category": "cardio", "level": "intermediate", "duration_minutes": 45, "max_capacity": 15, "order": 2},
            {"name": "Yoga Vinyasa", "slug": "yoga-vinyasa", "description": "Fluidite, souplesse et serenite. Enchainements dynamiques pour equilibrer corps et esprit.", "category": "flexibility", "level": "beginner", "duration_minutes": 60, "max_capacity": 12, "order": 3},
            {"name": "Boxe Anglaise", "slug": "boxe-anglaise", "description": "Apprenez les techniques de boxe, ameliorez votre endurance et votre confiance en vous.", "category": "martial_arts", "level": "all", "duration_minutes": 60, "max_capacity": 16, "order": 4},
            {"name": "Zumba Fitness", "slug": "zumba-fitness", "description": "Dansez, bougez, amusez-vous ! Un cours energique sur des rythmes latinos entrainants.", "category": "dance", "level": "beginner", "duration_minutes": 45, "max_capacity": 25, "order": 5},
            {"name": "CrossFit", "slug": "crossfit", "description": "Depassez vos limites avec des WOD intenses combinant halterophilie, gym et cardio.", "category": "force", "level": "advanced", "duration_minutes": 60, "max_capacity": 12, "order": 6},
            {"name": "Pilates", "slug": "pilates", "description": "Renforcez votre sangle abdominale et ameliorez votre posture avec des exercices precis.", "category": "flexibility", "level": "all", "duration_minutes": 50, "max_capacity": 15, "order": 7},
            {"name": "Spinning", "slug": "spinning", "description": "Pedalez au rythme de la musique dans une ambiance electrique pour un cardio intense.", "category": "cardio", "level": "intermediate", "duration_minutes": 45, "max_capacity": 20, "order": 8},
            {"name": "Kickboxing", "slug": "kickboxing", "description": "Combinaison de coups de pieds et de poings pour un entrainement complet corps et esprit.", "category": "martial_arts", "level": "intermediate", "duration_minutes": 60, "max_capacity": 16, "order": 9},
            {"name": "Stretching", "slug": "stretching", "description": "Seance d'etirements pour ameliorer la souplesse et favoriser la recuperation musculaire.", "category": "flexibility", "level": "beginner", "duration_minutes": 30, "max_capacity": 20, "order": 10},
            {"name": "Body Pump", "slug": "body-pump", "description": "Renforcement musculaire avec barre et poids sur fond musical pour sculpter tout le corps.", "category": "force", "level": "intermediate", "duration_minutes": 55, "max_capacity": 18, "order": 11},
            {"name": "Danse Contemporaine", "slug": "danse-contemporaine", "description": "Exprimez-vous par le mouvement dans un cours alliant technique et creativite.", "category": "dance", "level": "all", "duration_minutes": 60, "max_capacity": 15, "order": 12},
        ]
        activities = []
        for data in activities_data:
            a = Activity(id=str(uuid4()), **data, is_active=True)
            db.add(a)
            activities.append(a)

        # Coaches
        coaches_data = [
            {"name": "Marc Dupont", "certifications": ["BPJEPS Force", "CrossFit L2"], "specialties": ["Musculation", "CrossFit", "Halterophilie"], "bio": "Passionne de force athletique depuis 12 ans, Marc accompagne ses eleves vers la performance.", "order": 1},
            {"name": "Sophie Martin", "certifications": ["Yoga Alliance RYT-500", "Pilates Mat"], "specialties": ["Yoga", "Pilates", "Meditation"], "bio": "Sophie allie douceur et exigence pour vous guider vers un equilibre entre force et souplesse.", "order": 2},
            {"name": "Lucas Bernard", "certifications": ["CQP Instructeur Fitness", "Les Mills BODYCOMBAT"], "specialties": ["HIIT", "Cardio", "Boxe"], "bio": "Ancien sportif de haut niveau, Lucas vous pousse a repousser vos limites.", "order": 3},
            {"name": "Camille Leroy", "certifications": ["DE Danse", "Instructrice Zumba"], "specialties": ["Zumba", "Danse", "Stretching"], "bio": "Avec Camille, chaque cours est une fete ! Sa joie de vivre est communicative.", "order": 4},
            {"name": "Antoine Moreau", "certifications": ["BPJEPS APT", "Certification TRX"], "specialties": ["CrossFit", "Functional Training", "Body Pump"], "bio": "Antoine cree des programmes fonctionnels qui transforment le quotidien de ses eleves.", "order": 5},
            {"name": "Lea Petit", "certifications": ["DE Kickboxing", "Premiers Secours"], "specialties": ["Kickboxing", "Boxe", "Cardio"], "bio": "Lea enseigne l'art du combat avec pedagogie et bienveillance.", "order": 6},
        ]
        coaches = []
        for data in coaches_data:
            c = Coach(id=str(uuid4()), **data, is_active=True)
            db.add(c)
            coaches.append(c)

        # Subscriptions
        subs_data = [
            {"name": "Basic", "price": 29.00, "duration_months": 1, "features": ["Acces salle de musculation", "Vestiaires et douches", "Horaires : 8h-20h", "Application mobile"], "order": 1},
            {"name": "Premium", "price": 49.00, "duration_months": 1, "features": ["Acces illimite 7j/7", "Tous les cours collectifs", "Programme personnalise", "Suivi nutritionnel", "Casier personnel"], "order": 2},
            {"name": "Elite", "price": 79.00, "duration_months": 1, "features": ["Tout le Premium inclus", "Coach personnel dedie", "Acces espace VIP", "Seances de cryotherapie", "Bilan corporel mensuel", "Invite gratuit 2x/mois"], "order": 3},
        ]
        for data in subs_data:
            db.add(Subscription(id=str(uuid4()), **data, is_active=True))

        # Schedule slots (weekly recurring)
        schedule_data = [
            # Lundi
            (0, "07:00", "08:00", 0, 0),  # Musculation - Marc
            (0, "09:00", "09:45", 1, 2),   # HIIT - Lucas
            (0, "10:30", "11:30", 2, 1),   # Yoga - Sophie
            (0, "12:00", "13:00", 3, 2),   # Boxe - Lucas
            (0, "17:30", "18:30", 5, 0),   # CrossFit - Marc
            (0, "19:00", "19:45", 4, 3),   # Zumba - Camille
            # Mardi
            (1, "07:00", "07:45", 7, 2),   # Spinning - Lucas
            (1, "09:30", "10:20", 6, 1),   # Pilates - Sophie
            (1, "12:00", "13:00", 0, 0),   # Musculation - Marc
            (1, "17:30", "18:15", 1, 2),   # HIIT - Lucas
            (1, "18:30", "19:30", 8, 5),   # Kickboxing - Lea
            (1, "19:30", "20:30", 2, 1),   # Yoga - Sophie
            # Mercredi
            (2, "07:00", "08:00", 5, 4),   # CrossFit - Antoine
            (2, "09:00", "09:45", 4, 3),   # Zumba - Camille
            (2, "10:30", "11:15", 7, 2),   # Spinning - Lucas
            (2, "14:00", "15:00", 0, 0),   # Musculation - Marc
            (2, "17:30", "18:30", 9, 1),   # Stretching - Sophie
            (2, "19:00", "19:45", 1, 2),   # HIIT - Lucas
            # Jeudi
            (3, "07:00", "08:00", 3, 5),   # Boxe - Lea
            (3, "09:30", "10:20", 6, 1),   # Pilates - Sophie
            (3, "12:00", "13:00", 0, 0),   # Musculation - Marc
            (3, "17:30", "18:30", 10, 4),  # Body Pump - Antoine
            (3, "18:30", "19:15", 4, 3),   # Zumba - Camille
            (3, "19:30", "20:15", 7, 2),   # Spinning - Lucas
            # Vendredi
            (4, "07:00", "07:45", 1, 2),   # HIIT - Lucas
            (4, "09:00", "10:00", 2, 1),   # Yoga - Sophie
            (4, "10:30", "11:30", 0, 0),   # Musculation - Marc
            (4, "14:00", "15:00", 8, 5),   # Kickboxing - Lea
            (4, "17:30", "18:30", 5, 4),   # CrossFit - Antoine
            (4, "19:00", "19:45", 11, 3),  # Danse - Camille
            # Samedi
            (5, "09:00", "10:00", 0, 0),   # Musculation - Marc
            (5, "10:30", "11:15", 7, 2),   # Spinning - Lucas
            (5, "14:00", "15:00", 2, 1),   # Yoga - Sophie
            (5, "16:00", "16:45", 4, 3),   # Zumba - Camille
            # Dimanche
            (6, "09:30", "10:30", 2, 1),   # Yoga - Sophie
            (6, "11:00", "11:50", 6, 1),   # Pilates - Sophie
            (6, "16:00", "16:45", 9, 3),   # Stretching - Camille
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
            ("Halteres (2-50 kg)", "Jeu complet d'halteres en fonte avec rack de rangement.", "musculation", 2),
            ("Machine Smith", "Smith machine guidee pour squats, developpes et rowings securises.", "musculation", 2),
            ("Tapis de course", "Tapis professionnels avec ecran tactile et programmes integres.", "cardio", 10),
            ("Velo elliptique", "Elliptiques avec resistance magnetique et suivi cardiaque.", "cardio", 8),
            ("Rameur", "Rameurs a resistance air/eau pour un cardio complet.", "cardio", 6),
            ("Velo spinning", "Velos de spinning professionnels avec resistance reglable.", "cardio", 20),
            ("Tapis de yoga", "Tapis epais antiderapants pour yoga, pilates et stretching.", "stretching", 25),
            ("Rouleau de massage", "Rouleaux en mousse pour l'auto-massage et la recuperation.", "stretching", 15),
            ("Sangles TRX", "Sangles de suspension pour entrainement fonctionnel.", "functional", 10),
            ("Kettlebells (4-32 kg)", "Jeu complet de kettlebells pour le functional training.", "functional", 3),
            ("Cordes de combat", "Battle ropes de 12m pour le conditionnement physique.", "functional", 4),
            ("Box jumps", "Boites pliometriques de differentes hauteurs.", "functional", 6),
            ("Casiers securises", "Casiers individuels avec serrure a code.", "locker", 120),
            ("Douches", "Douches individuelles avec eau chaude et gel douche fourni.", "locker", 12),
            ("Sauna", "Sauna finlandais 8 places pour la recuperation.", "locker", 1),
        ]
        for name, desc, zone, qty in equipment_data:
            db.add(Equipment(id=str(uuid4()), name=name, description=desc, zone=zone, quantity=qty, is_active=True))

        # Reviews
        reviews_data = [
            ("Alexandre Faure", 5, "Meilleure salle de la region ! Les coachs sont attentifs et l'ambiance au top."),
            ("Nadia Benali", 5, "Je cherchais une salle avec du yoga de qualite et j'ai trouve bien plus. Exceptionnel."),
            ("Pierre Lambert", 4, "Super salle, tres bien equipee. Les cours de HIIT sont intenses. Seul bemol : du monde aux heures de pointe."),
            ("Marie Blanc", 5, "Apres ma grossesse, FitnessPro m'a aidee a retrouver la forme. Programme adapte et bienveillant."),
            ("Thomas Petit", 5, "De debutant a 3 seances/semaine. Le CrossFit avec Marc a transforme mon physique."),
            ("Amina Diallo", 4, "J'ai gagne en muscle et en assurance. Les cours collectifs sont top pour la motivation."),
        ]
        for name, rating, comment in reviews_data:
            db.add(Review(id=str(uuid4()), author_name=name, rating=rating, comment=comment, is_approved=True))

        # Articles
        articles_data = [
            ("5 Exercices Incontournables pour Sculpter vos Abdominaux", "5-exercices-abdominaux", "Decouvrez les meilleurs exercices pour travailler vos abdominaux en profondeur.", "Les meilleurs mouvements pour un ventre tonique, adaptes a tous les niveaux."),
            ("Nutrition Sportive : Que Manger Avant et Apres l'Entrainement", "nutrition-sportive-avant-apres", "L'alimentation est la cle de la performance. Optimisez vos repas pour maximiser vos resultats.", "Optimisez vos repas pour de meilleures performances et une recuperation optimale."),
            ("Les Bienfaits du Yoga sur la Performance Sportive", "bienfaits-yoga-performance", "Le yoga ameliore la flexibilite, la concentration et la recuperation chez les sportifs.", "Comment le yoga ameliore flexibilite, concentration et recuperation."),
        ]
        for title, slug, content, excerpt in articles_data:
            db.add(Article(
                id=str(uuid4()), title=title, slug=slug, content=content, excerpt=excerpt,
                status="published", published_at=datetime.utcnow(), author_id=admin.id,
            ))

        # Transformations
        transformations_data = [
            ("Julien Moreau", "En 6 mois, j'ai perdu 15 kg et gagne en confiance.", "6 mois"),
            ("Marie Blanc", "Apres ma grossesse, FitnessPro m'a aidee a retrouver la forme.", "8 mois"),
            ("Thomas Petit", "De debutant a 3 seances/semaine. Mon physique et mon mental ont change.", "1 an"),
            ("Amina Diallo", "J'ai gagne en muscle et en assurance grace aux cours collectifs.", "4 mois"),
        ]
        for name, testimonial, duration in transformations_data:
            db.add(Transformation(
                id=str(uuid4()), member_name=name, testimonial=testimonial,
                duration_text=duration, is_featured=True, is_published=True,
            ))

        # Videos
        videos_data = [
            ("HIIT Bruleur de Graisse 30 min", "Seance HIIT complete pour bruler un maximum de calories.", "hiit-demo.mp4", "Cardio"),
            ("Routine Yoga Matinale", "15 minutes de yoga pour bien commencer la journee.", "yoga-morning.mp4", "Yoga"),
            ("Musculation : Seance Pectoraux", "Programme complet pour developper vos pectoraux.", "chest-workout.mp4", "Musculation"),
            ("Stretching Post-Entrainement", "10 minutes d'etirements essentiels apres votre seance.", "stretching.mp4", "Stretching"),
        ]
        for title, desc, url, cat in videos_data:
            db.add(Video(id=str(uuid4()), title=title, description=desc, video_url=url, category=cat, is_published=True))

        # Settings
        settings_data = [
            ("gym_name", "FitnessPro"),
            ("gym_address", "123 Rue du Sport, 75001 Paris"),
            ("gym_phone", "+33 1 23 45 67 89"),
            ("gym_email", "contact@fitnesspro.fr"),
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
