"""
VanthAI Backend — Settings
Single source of truth for all environment variables.
No URL, path, model name, or key is hardcoded anywhere else.
"""
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
    )

    # ── Project ────────────────────────────────────────────
    project_name: str = "vanthai"

    # ── WebSocket route fragments ──────────────────────────
    ws_cloudcare_chat: str = "ws/v1/vanthai/cloudcare/chatagent"
    ws_cloudcare_voice: str = "ws/v1/vanthai/cloudcare/voiceagent"
    ws_itr_chat: str = "ws/v1/vanthai/itr/chatagent"
    ws_itr_voice: str = "ws/v1/vanthai/itr/voiceagent"

    # ── LLM ───────────────────────────────────────────────
    google_ai_api_key: str = ""
    gemma_text_model: str = "gemma-4-31b-it"
    gemini_voice_model: str = "gemini-3.1-flash-live-preview"
    lmstudio_base_url: str = "http://host.docker.internal:1234/v1"
    lmstudio_voice_model: str = "gemma-4-e4b"

    # ── Database ──────────────────────────────────────────
    postgres_host: str = "postgres"
    postgres_port: int = 5432
    postgres_db: str = "vanthai"
    postgres_user: str = "vanthai"
    postgres_password: str = "changeme"

    @property
    def database_url(self) -> str:
        from urllib.parse import quote_plus
        encoded_pass = quote_plus(self.postgres_password)
        return (
            f"postgresql+psycopg://{self.postgres_user}:{encoded_pass}"
            f"@{self.postgres_host}:{self.postgres_port}/{self.postgres_db}"
        )

    @property
    def database_url_sync(self) -> str:
        from urllib.parse import quote_plus
        encoded_pass = quote_plus(self.postgres_password)
        return (
            f"postgresql+psycopg2://{self.postgres_user}:{encoded_pass}"
            f"@{self.postgres_host}:{self.postgres_port}/{self.postgres_db}"
        )

    # ── Redis ─────────────────────────────────────────────
    redis_url: str = "redis://redis:6379"
    redis_session_ttl: int = 300  # seconds — sliding window, reset on each message

    # ── Optional observability ────────────────────────────
    langchain_tracing_v2: bool = False
    langchain_api_key: str = ""


settings = Settings()
