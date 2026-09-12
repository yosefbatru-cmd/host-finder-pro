# Host Finder Pro — Architecture

## Overview

Unified reconnaissance platform: domain intake → WHOIS + DNS + subdomain enum → HTTP/tech probe → file path discovery → persistence → export.

## Stack

- **API**: FastAPI (async), ORJSON responses
- **DB**: SQLAlchemy 2.0 async + SQLite (swap to Postgres via DATABASE_URL)
- **DNS**: dnspython async resolver
- **HTTP**: httpx
- **Frontend**: React 18 + Vite
- **Deploy**: Docker Compose (backend + nginx frontend)

## Scan Pipeline

1. Create ScanJob (queued)
2. Background task: run_full_scan
3. Stages: WHOIS → DNS enum → subdomain enum (CT + passive + brute) → tech probe → path probe
4. Persist Domain / Subdomain / DNSRecord / FileAsset
5. Job → completed with findings_count

## Extending

- Add premium passive sources in subdomain_service.py (SecurityTrails, Shodan) using env API keys
- Wire Nuclei / httpx CLI for deeper vuln correlation
- Add Redis + Celery/RQ for multi-worker scale
- Screenshot stage via Playwright/Chromium
