from uuid import uuid4

from sqlalchemy.orm import Session

from app.models.models import Setting


def get_settings(db: Session) -> list[Setting]:
    return db.query(Setting).all()


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
