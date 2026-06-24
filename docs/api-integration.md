# API Integration — SmartRecruit

This document describes how the frontend integrates with the Spring Boot API running on the local network (example host: `192.168.1.79`). It includes endpoints, sample payloads, and environment configuration.

## Base URL

- Default: `http://192.168.1.79:8080`
- Override via environment variable: set `VITE_API_HOST` in a `.env` file (for example `VITE_API_HOST=http://192.168.1.79:8080`).

## Endpoints (example)

- Jobs
  - GET /api/jobs — list jobs
  - GET /api/jobs/{id} — get job
  - POST /api/jobs — create job
  - PUT /api/jobs/{id} — update job
  - DELETE /api/jobs/{id} — delete job

- Candidates
  - GET /api/candidates — list candidates
  - GET /api/candidates/{id} — get candidate
  - POST /api/candidates — create candidate
  - PUT /api/candidates/{id} — update candidate
  - DELETE /api/candidates/{id} — delete candidate

Note: The frontend uses `/api/...` paths. Adjust Spring Boot controller mappings or the `VITE_API_HOST` to match your server.

## Sample payloads

Create job (POST /api/jobs)

{
"title": "Frontend Engineer",
"location": "Bucharest",
"description": "Work on Vue.js application",
"status": "OPEN"
}

Create candidate (POST /api/candidates)

{
"name": "Ana Popescu",
"email": "ana@example.com",
"phone": "+40 7xx xxx xxx",
"resumeUrl": "https://..."
}

## Authentication

This wrapper assumes no authentication. If your Spring Boot API requires auth (JWT/OAuth), update `src/services/api.ts` to attach tokens to `Authorization` header.

## Romanian / English

UI translations live in `src/i18n`. The API docs above are language-neutral; UI labels are provided in English and Romanian.
