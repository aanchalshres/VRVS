# Volunteer Response and Verification System

A volunteer-NGO matching platform that connects volunteers with meaningful opportunities. NGOs post tasks, volunteers discover and apply, and admins manage verifications, analytics, and platform settings.

## Tech Stack

- **Frontend:** Next.js 14 (App Router), TypeScript, Tailwind CSS, shadcn/ui
- **Backend:** Laravel 11 API with Sanctum authentication
- **Database:** PostgreSQL 15+
- **Recommendation:** TF-IDF vectorization, Cosine Similarity, Haversine Distance, Trust Score ranking

## Repo Structure

- `frontend/` — Next.js frontend
- `api-backend/` — Laravel API backend

## Prerequisites

- Node.js 18+ / npm
- PHP 8.2+ / Composer
- PostgreSQL 15+

## Initial Setup

### Backend

```bash
cd api-backend
composer install
cp .env.example .env
php artisan key:generate
```

Configure your database in `.env`, then run:

```bash
php artisan migrate --seed
php artisan serve
```

### Frontend

```bash
cd frontend
npm install
cp .env.example .env.local
npm run dev
```

## Role-Based Workflows

| Role | Capabilities |
|------|-------------|
| **Volunteer** | Browse tasks, apply, track participation, manage skills and documents, view certificates and ratings |
| **NGO** | Post and manage tasks, review applications, track attendance, issue certificates, rate volunteers |
| **Admin** | Verify NGOs and volunteers, moderate tasks and reviews, manage categories/skills, view analytics and reports |

## Key Subsystems

