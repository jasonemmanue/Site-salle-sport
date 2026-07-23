from fastapi import APIRouter

from app.api.v1.routes import (
    activities,
    articles,
    auth,
    coaches,
    contact,
    enrollments,
    equipment,
    reviews,
    schedule,
    settings,
    stats,
    subscriptions,
    transformations,
    upload,
    videos,
)

router = APIRouter()

router.include_router(auth.router, prefix="/auth", tags=["Auth"])
router.include_router(activities.router, prefix="/activities", tags=["Activities"])
router.include_router(schedule.router, prefix="/schedule", tags=["Schedule"])
router.include_router(enrollments.router, prefix="/enrollments", tags=["Enrollments"])
router.include_router(subscriptions.router, prefix="/subscriptions", tags=["Subscriptions"])
router.include_router(coaches.router, prefix="/coaches", tags=["Coaches"])
router.include_router(articles.router, prefix="/articles", tags=["Articles"])
router.include_router(videos.router, prefix="/videos", tags=["Videos"])
router.include_router(transformations.router, prefix="/transformations", tags=["Transformations"])
router.include_router(equipment.router, prefix="/equipment", tags=["Equipment"])
router.include_router(reviews.router, prefix="/reviews", tags=["Reviews"])
router.include_router(contact.router, prefix="/contact", tags=["Contact"])
router.include_router(upload.router, prefix="/upload", tags=["Upload"])
router.include_router(settings.router, prefix="/settings", tags=["Settings"])
router.include_router(stats.router, prefix="/stats", tags=["Stats"])
