"""
Host Finder Pro Enterprise — Main FastAPI application
"""
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import ORJSONResponse

from app.api import domains, subdomains, dns, files, scan, export, import_data, health
from app.core.database import init_db


@asynccontextmanager
async def lifespan(app: FastAPI):
    await init_db()
    yield


app = FastAPI(
    title="Host Finder Pro Enterprise",
    description="Complete Reconnaissance Platform — Your Entire Attack Surface. One Platform. Nothing Hidden.",
    version="1.0.0",
    default_response_class=ORJSONResponse,
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(health.router, tags=["Health"])
app.include_router(domains.router, prefix="/api/domains", tags=["Domains"])
app.include_router(subdomains.router, prefix="/api/subdomains", tags=["Subdomains"])
app.include_router(dns.router, prefix="/api/dns", tags=["DNS"])
app.include_router(files.router, prefix="/api/files", tags=["Files"])
app.include_router(scan.router, prefix="/api/scan", tags=["Scan"])
app.include_router(export.router, prefix="/api/export", tags=["Export"])
app.include_router(import_data.router, prefix="/api/import", tags=["Import"])


@app.get("/")
async def root():
    return {
        "name": "Host Finder Pro Enterprise",
        "version": "1.0.0",
        "tagline": "Your Entire Attack Surface. One Platform. Nothing Hidden.",
        "docs": "/docs",
    }
