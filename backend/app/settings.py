from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    pg_url: str = "postgresql://postgres:postgres@postgres:5432/research"
    qdrant_url: str = "http://qdrant:6333"

settings = Settings()
