# HaxDef

Vulnerability scanning web application for small and medium businesses.

## Architecture

- **Frontend**: React + Vite + Tailwind CSS → Netlify
- **Backend**: Supabase (Auth, PostgreSQL, Storage, Edge Functions)
- **Scan Engine**: Railway.app (Docker + Nuclei + security tools)
- **Reports**: Google Gemini API + PDFMake

## Project Structure

```
haxdef/
├── frontend/    # React app (Netlify)
├── backend/     # Supabase Edge Functions + Migrations
├── worker/      # Scan engine (Railway Docker)
└── docs/        # Documentation
```

## Getting Started

See `docs/` for setup instructions.
