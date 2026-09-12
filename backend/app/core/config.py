from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    app_name: str = "Host Finder Pro Enterprise"
    version: str = "1.1.0"
    database_url: str = "sqlite+aiosqlite:///./hostfinder.db"
    debug: bool = True
    max_concurrent_dns: int = 50
    max_subdomain_wordlist: int = 10000
    scan_timeout_seconds: int = 300
    securitytrails_api_key: str = ""
    shodan_api_key: str = ""
    virustotal_api_key: str = ""
    github_token: str = ""

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"


@lru_cache
def get_settings() -> Settings:
    return Settings()
