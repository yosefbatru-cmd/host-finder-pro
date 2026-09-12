from datetime import datetime
from sqlalchemy import String, Integer, Float, DateTime, Boolean, JSON, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.core.database import Base


class Subdomain(Base):
    __tablename__ = "subdomains"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    domain_id: Mapped[int] = mapped_column(ForeignKey("domains.id"), index=True)
    name: Mapped[str] = mapped_column(String(512), index=True, nullable=False)
    ip_addresses: Mapped[list | None] = mapped_column(JSON, default=list)
    http_status: Mapped[int | None] = mapped_column(Integer, nullable=True)
    server: Mapped[str | None] = mapped_column(String(255), nullable=True)
    technologies: Mapped[list | None] = mapped_column(JSON, default=list)
    ssl_info: Mapped[dict | None] = mapped_column(JSON, nullable=True)
    is_alive: Mapped[bool] = mapped_column(Boolean, default=False)
    source: Mapped[str | None] = mapped_column(String(100), nullable=True)
    risk_score: Mapped[float] = mapped_column(Float, default=0.0)
    screenshot_path: Mapped[str | None] = mapped_column(String(512), nullable=True)
    first_seen: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    last_seen: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    domain = relationship("Domain", back_populates="subdomains")
