# Host Finder Pro Enterprise

**Your Entire Attack Surface. One Platform. Nothing Hidden.**

Not just networks. Not just hosts. Subdomains. Domains. Files. DNS records. Email addresses. Every surface exposed. Every hidden file found. Every connection mapped.

Host Finder Pro is a complete reconnaissance platform that unifies subdomain enumeration, DNS intelligence, file discovery, email surface mapping, technology detection, SSL history, ASN mapping, and full import/export into a single system.

## Features

### Subdomain & Domain Discovery
- Passive DNS (SecurityTrails, Shodan, PassiveTotal style sources)
- Certificate Transparency (crt.sh real-time)
- Wildcard detection
- Configurable brute-force wordlists (10k+ names)
- DNSSEC / NSEC3 analysis
- Zone transfer attempts (AXFR/IXFR)
- Subdomain permutation & historical tracking
- Resolution validation

### Domain Intelligence
- WHOIS (registrant, dates, registrar, nameservers)
- Domain age, expiration tracking, related domains
- TLD enumeration & reputation scoring

### DNS Record Deep Dive
- Full record types: A, AAAA, MX, NS, TXT, SPF, DKIM, DMARC, CAA, SRV
- SPF/DMARC/DKIM policy analysis
- TXT record secret extraction

### File & Document Discovery
- Google dork automation
- Wayback Machine scraping
- GitHub dorking
- S3 bucket discovery
- File crawling + OCR on PDFs
- Metadata & sensitive file detection

### Email Surface
- Harvesting from DNS, pages, WHOIS, certs
- Validation, breach cross-reference
- Pattern detection & org structure inference

### Web Technology Detection
- Frameworks, CMS, JS libraries, server software
- Hosting provider, SSL/TLS analysis
- Security headers & admin panel detection

### Import / Export
- CSV, JSON, XML, PDF, HTML, XLSX, YAML, Markdown
- Bulk ops, full-text search, retention policies

## Quick Start

```bash
git clone https://github.com/yosefbatru-cmd/host-finder-pro.git
cd host-finder-pro

# Backend
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

# Frontend
cd frontend
npm install
npm run dev
```

Open http://localhost:5173

## Docker

```bash
docker-compose up -d
```

## API

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/domains` | GET/POST/DELETE | Manage domains |
| `/api/subdomains` | GET | Enumerate subdomains |
| `/api/dns` | GET | DNS records |
| `/api/files` | GET | Discovered files |
| `/api/scan` | POST | Trigger scan |
| `/api/export` | GET | Export results |
| `/api/import` | POST | Bulk import |

Full OpenAPI at `/docs`.

## Built for

Enterprise security teams, pen testers, red teamers, bug bounty hunters, CISOs, DevSecOps, third-party risk, incident response.

Scan once. See everything. Track forever.
