from uuid import uuid4

from sqlalchemy.orm import Session

from app.models.models import Setting

# Cles exposees sans authentification au site public. Liste blanche explicite :
# la table `settings` est un fourre-tout cle/valeur, une nouvelle cle ne doit pas
# devenir publique par simple effet de bord.
PUBLIC_SETTING_KEYS = (
    "gym_name",
    "phone",
    "email",
    "address",
    "opening_hours",
    "facebook_url",
    "instagram_url",
    "youtube_url",
)


def get_settings(db: Session) -> list[Setting]:
    return db.query(Setting).all()


def get_public_settings(db: Session) -> list[Setting]:
    return db.query(Setting).filter(Setting.key.in_(PUBLIC_SETTING_KEYS)).all()


def get_setting_by_key(db: Session, key: str) -> Setting | None:
    return db.query(Setting).filter(Setting.key == key).first()


def update_setting(db: Session, key: str, value: str) -> Setting:
    setting = db.query(Setting).filter(Setting.key == key).first()
    if setting:
        setting.value = value
    else:
        setting = Setting(id=str(uuid4()), key=key, value=value)
        db.add(setting)
    db.commit()
    db.refresh(setting)
    return setting
