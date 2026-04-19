# HireFlow Deployment Guide

## Minimal Prerequisites
1. Node.js (for React frontend)
2. Python 3.10+ (for FastAPI backend)
3. Active Supabase project
4. OpenAI API Key

## Environment Setup
`.env` (root/backend):
```
OPENAI_API_KEY=your_key_here
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your_anon_key_here
```

`frontend/.env`:
```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key_here
```

## Backend Start
1. `pip install -r backend/requirements.txt`
2. Production Command: `uvicorn backend.app.main:app --host 0.0.0.0 --port 8000 --workers 4`
*(To serve with high concurrency, using a Gunicorn wrapper is recommended)*

## Frontend Build
1. `cd frontend`
2. `npm install`
3. `npm run build`
4. Serve the `dist/` directory output directly inside an Nginx server block or push to a static host (e.g. Vercel, Netlify).

## Supabase Config
Ensure your database contains the fully provisioned schema generated in Phase 1 (`roles`, `applications`, `reports`) configured and RLS policies mapped to `HR` authenticated users securely before linking live application network traffic.
