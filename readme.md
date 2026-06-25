# Sahayogi Hub

Single setup guide for collaborators working on both the frontend and backend.

## Prerequisites

- Git
- Node.js (LTS recommended)
- npm (ships with Node.js)
- PHP 8.2+
- Composer
- A local database (PostgreSQL)

## Repo Structure

- `frontend/` - Next.js app
- `api-backend/` - Laravel API

## Initial Setup

### 1) Clone the repo

```bash
git clone <your-repo-url>
cd Sahayogi-hub
```

### 2) Backend (Laravel)

```bash
cd api-backend
composer install
cp .env.example .env
php artisan key:generate
```

Configure your database in `.env`, then run:

```bash
php artisan migrate
```

Start the API server:

```bash
php artisan serve
```

### 3) Frontend (Next.js)

```bash
cd ../frontend
npm install
cp .env.example .env.local
```

Start the frontend dev server:

```bash
npm run dev
```

## Daily Workflow

1. Pull latest changes:

```bash
git pull
```

2. Create a new branch for your task:

```bash
git checkout -b feature/<short-task-name>
```

3. Commit and push your changes:

```bash
git add .
git commit -m "<clear message>"
git push -u origin feature/<short-task-name>
```

Use a clear commit message and a brief PR description that summarizes what you changed.

4. Open a Pull Request.

## Weekly Branch Policy

- For every task each week, create a new branch.
- After everything from the previous week is merged, delete the old branch.

## Notes

- If you change backend env values, inform the team.


sahayogi-frontend/
├── app/
│   ├── (auth)/                 # login, register pages
│   │   ├── login/page.tsx
│   │   └── register/page.tsx
│   ├── (dashboard)/            # protected routes
│   │   ├── admin/
│   │   │   ├── page.tsx        # admin overview
│   │   │   ├── ngos/page.tsx   # verify NGOs
│   │   │   └── volunteers/page.tsx
│   │   ├── ngo/
│   │   │   ├── page.tsx
│   │   │   ├── opportunities/
│   │   │   └── applications/
│   │   └── volunteer/
│   │       ├── page.tsx
│   │       ├── opportunities/
│   │       └── badges/
│   ├── opportunities/          # public listing
│   ├── layout.tsx
│   └── page.tsx                # landing page
├── components/
│   ├── ui/                     # Button, Input, Badge, Modal…
│   ├── dashboard/              # StatsCard, Charts…
│   └── forms/                  # RegisterForm, OpportunityForm…
├── lib/
│   ├── api.ts                  # axios instance
│   ├── auth.ts                 # token helpers
│   └── utils.ts
└── store/
    └── authStore.ts            # Zustand auth state

sahayogi-backend/
├── app/
│   ├── Http/Controllers/
│   │   ├── AuthController.php
│   │   ├── NgoController.php
│   │   ├── VolunteerController.php
│   │   ├── OpportunityController.php
│   │   ├── ApplicationController.php
│   │   ├── ParticipationController.php
│   │   ├── BadgeController.php
│   │   └── AdminController.php
│   ├── Models/                 # all 12 models
│   └── Services/
│       ├── EligibilityService.php
│       ├── RankingService.php
│       └── BadgeService.php
├── database/migrations/        # all 12 tables
└── routes/api.php


Week 1
Sprint 1 — Setup & Auth
Initialize Laravel + Next.js. Set up PostgreSQL. Build register/login/logout. Role middleware. Basic landing page.

Week 2
Sprint 2 — Profiles
Volunteer profile CRUD. NGO profile CRUD. Skills table + pivot. Document upload (Cloudinary). Profile pages on frontend.

Week 3
Sprint 3 — NGO Verification (Admin)
Admin dashboard. Document review queue. Approve/Reject NGO flow. Email notification on verification. Admin stats page.

Week 4
Sprint 4 — Opportunities
NGO can create/edit/close campaigns. Public opportunity listing with filters. Opportunity detail page. Cover image upload.

Week 5
Sprint 5 — Eligibility Algorithm + Apply
Code EligibilityService (CTA algo). Show/hide Apply button based on eligibility. Volunteer applies. Quota algo auto-accepts/waitlists.

Week 6
Sprint 6 — Priority Ranking Algorithm
Code RankingService (Ψ formula). NGO views ranked applicant list with scores. Accept/Reject individual applicants. Haversine distance display.

Week 7
Sprint 7 — QR Check-in System
Generate QR tokens per accepted volunteer. Participation table creation. Check-in/checkout times. Hours calculation. QR code display on frontend.

Week 8
Sprint 8 — Digital Badges
BadgeService.php. Auto-issue on verification. Badge gallery page. Public verify URL. Trust score recalculation. Impact Portfolio page.

Week 9
Sprint 9 — Notifications
In-app notifications (bell icon). Email notifications for key events. Notification mark-as-read. Notification settings per user.

Week 10
Sprint 10 — Reports & Activity Logs
Report a volunteer/NGO. Admin resolves reports. Activity log viewer for admin. Export to CSV (admin stats).

Week 11
Sprint 11 — Polish & Testing
UI polish with brand colors. Mobile responsiveness. Unit tests for algorithms. API tests with Postman. Bug fixes.

Week 12
Sprint 12 — Deployment
Deploy Next.js to Vercel. Deploy Laravel to Render. PostgreSQL on Neon.tech. Set env vars. Final demo + documentation.