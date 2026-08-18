from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    DATABASE_URL: str = "postgresql://sport_user:changeme@db:5432/salle_sport_db"
    REDIS_URL: str = "redis://redis:6379/0"
    SECRET_KEY: str = "dev-secret-key"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7
    ADMIN_EMAIL: str = "admin@sport.com"
    ADMIN_PASSWORD: str = "changeme"
    UPLOAD_DIR: str = "./uploads"
    MAX_UPLOAD_SIZE_MB: int = 5
    # Formulaire Google d'enregistrement de la salle. Le site y recopie chaque
    # reservation pour que la feuille de reponses existante continue de vivre.
    # Mettre GOOGLE_FORM_ENABLED a false coupe la recopie sans rien casser :
    # l'enregistrement local, lui, a toujours lieu.
    GOOGLE_FORM_ID: str = "1FAIpQLSfiKgySwuURrPtz5C7XNmzl9ma0BUDklBiOd7VDa9vK6LAVwQ"
    GOOGLE_FORM_ENABLED: bool = True
    GOOGLE_FORM_TIMEOUT: int = 10
    CORS_ORIGINS: list[str] = ["http://localhost:3000", "http://localhost:3001", "http://localhost:3003"]

    model_config = {"env_file": ".env", "extra": "ignore"}


settings = Settings()
