from datetime import date

from fastapi import APIRouter, Depends, HTTPException, Query, Response, status
from sqlalchemy.orm import Session

from app.core.dependencies import get_admin_user, get_db
from app.core.validators import UUIDStr
from app.models.models import User
from app.schemas.schemas import (
    EnrollmentCreate,
    EnrollmentDetailResponse,
    EnrollmentResponse,
)
from app.services import enrollment_service

router = APIRouter()

TYPE_XLSX = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"


@router.post("/", response_model=EnrollmentResponse, status_code=status.HTTP_201_CREATED)
def enroll(data: EnrollmentCreate, db: Session = Depends(get_db)):
    """Prend une reservation. Ouvert au public.

    La reponse porte `forwarded_to_google` : le site n'en depend pas — la place
    est prise dans tous les cas — mais le champ rend l'echec de recopie visible
    en cas de diagnostic.
    """
    return enrollment_service.enroll(db, data)


@router.get("/", response_model=list[EnrollmentDetailResponse])
def list_enrollments(
    depuis: date | None = Query(None, description="Date de seance minimale"),
    jusqu_a: date | None = Query(None, description="Date de seance maximale"),
    statut: str | None = Query(None, description="enrolled, waitlisted ou cancelled"),
    payment_type: str | None = Query(None),
    session_type: str | None = Query(None),
    activity_id: UUIDStr | None = Query(None),
    db: Session = Depends(get_db),
    admin: User = Depends(get_admin_user),
):
    """Toutes les reservations, filtrables — la liste du back-office."""
    return enrollment_service.get_all_enrollments(
        db,
        depuis=depuis,
        jusqu_a=jusqu_a,
        statut=statut,
        payment_type=payment_type,
        session_type=session_type,
        activity_id=activity_id,
    )


@router.get("/export.xlsx")
def export_enrollments(
    depuis: date | None = Query(None),
    jusqu_a: date | None = Query(None),
    statut: str | None = Query(None),
    payment_type: str | None = Query(None),
    session_type: str | None = Query(None),
    activity_id: UUIDStr | None = Query(None),
    db: Session = Depends(get_db),
    admin: User = Depends(get_admin_user),
):
    """Classeur Excel des reservations, filtre exactement comme la liste.

    Reserve a l'admin : la route exige donc un en-tete `Authorization`, qu'un
    simple lien de telechargement ne porte pas. Le back-office recupere le
    fichier par `fetch` puis declenche l'enregistrement lui-meme.
    """
    enrollments = enrollment_service.get_all_enrollments(
        db,
        depuis=depuis,
        jusqu_a=jusqu_a,
        statut=statut,
        payment_type=payment_type,
        session_type=session_type,
        activity_id=activity_id,
    )
    contenu = enrollment_service.export_xlsx(enrollments)
    nom = f"reservations-{date.today().isoformat()}.xlsx"
    return Response(
        content=contenu,
        media_type=TYPE_XLSX,
        headers={"Content-Disposition": f'attachment; filename="{nom}"'},
    )


@router.post("/{enrollment_id}/resend", response_model=EnrollmentResponse)
def resend_enrollment(
    enrollment_id: UUIDStr,
    db: Session = Depends(get_db),
    admin: User = Depends(get_admin_user),
):
    """Rejoue la recopie vers le formulaire Google apres un echec."""
    enrollment = enrollment_service.resend_to_google(db, enrollment_id)
    if not enrollment:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Enrollment not found")
    return enrollment


@router.delete("/{enrollment_id}")
def cancel_enrollment(enrollment_id: UUIDStr, db: Session = Depends(get_db)):
    success = enrollment_service.cancel_enrollment(db, enrollment_id)
    if not success:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Enrollment not found")
    return {"ok": True}


@router.get("/slot/{slot_id}", response_model=list[EnrollmentResponse])
def get_slot_enrollments(
    slot_id: UUIDStr,
    specific_date: date | None = Query(None),
    db: Session = Depends(get_db),
    admin: User = Depends(get_admin_user),
):
    return enrollment_service.get_slot_enrollments(db, slot_id, date=specific_date)


@router.get("/slot/{slot_id}/availability")
def get_slot_availability(
    slot_id: UUIDStr,
    specific_date: date | None = Query(None),
    db: Session = Depends(get_db),
):
    return enrollment_service.get_slot_availability(db, slot_id, date=specific_date)
