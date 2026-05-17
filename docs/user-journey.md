# LaunchPad — User Journey & Backend Reference

## Overview

LaunchPad is an AI-powered career co-pilot for fresh tech graduates and career pivoters. It combines a smart resume builder, job compatibility analyser, personalised skill roadmap, built-in job platform, and a gamified experience throughout.

Two user roles exist: **Job Seeker** and **Company**.

---

## Backend Tech Stack

| Layer | Technology |
|---|---|
| Framework | Express.js (TypeScript strict, no `any`) |
| AI — Analysis | OpenAI `gpt-4o-mini` via `openai` npm package |
| AI — Resume generation | OpenAI `gpt-4.1-mini` via `openai` npm package |
| Database | Supabase (PostgreSQL) + Supabase Auth |
| Deployment | Railway |

**Build order:**
1. Project setup + folder structure
2. Supabase connection + schema
3. Auth routes (register, login, role-based)
4. User profile routes (CRUD)
5. Jobs routes (list, detail, company CRUD)
6. Analysis route (CV + JD → OpenAI → result)
7. Resume generation route (OpenAI → formatted JSON)
8. GitHub scraping route (public API)
9. Applications routes (apply, list, status update)
10. Company portal routes

---

## User Journeys

### 1. Onboarding Flow

```
/ (root)
  → check localStorage "lp_onboarded"
  → if true:  redirect to /dashboard
  → if false: redirect to /login
```

**Register (Seeker):**
1. `/login` — toggle "Job Seeker" role, fill name + email + password → Submit
2. `/onboarding` — 6-step wizard:
   - Step 1: Welcome (Cuppy wave animation, intro text)
   - Step 2: Identity (full name, target role input with suggestions)
   - Step 3: Career Goals (role selection from preset list + custom)
   - Step 4: Skill Audit (multi-select skill chips, custom skill input)
   - Step 5: Portfolio (CV PDF upload → +50 XP badge)
   - Step 6: Integration (GitHub username → repo scan)
3. Complete → set `lp_onboarded=true` in cookie + localStorage → `/dashboard`

**Register (Company):**
1. `/login` — toggle "Company" role, fill company name + email + password
2. `/company/dashboard` — company-specific flow

---

### 2. Seeker — Dashboard

**Entry:** `/dashboard` (requires `lp_onboarded=true`)

**Mobile layout:**
- TopBar (Cuppy avatar + "LaunchPad" brand + streak/XP badges)
- Hero card (greeting + level + XP progress ring + streak count)
- ATS Score + Skill Match quick stats
- Daily Quests list (3 quests with XP rewards)
- Cuppy tip message
- BottomNav

**Desktop layout:**
- Sidebar (nav + user row + "View Progress" button)
- Main column: hero, quests, recent applications
- Right panel (280px): ATS score ring, skill match ring, quick actions

**Key interactions:**
- Complete quest → haptic + XP toast (+30 to +70 XP)
- Level up → celebrate animation + confetti (future)
- "Browse Jobs" → `/jobs`
- "Start Roadmap" → `/roadmap`

---

### 3. Seeker — Jobs (Browse)

**Entry:** `/jobs` → default tab "Browse Jobs"

**Flow:**
1. Browse job cards (title, company, location, work mode, salary range, match %)
2. Tap job card → compatibility sheet slides up (mobile) or right panel shows (desktop)
3. Compatibility sheet shows: match score, skills you have, skills you're missing
4. "Apply" button → application created → status: `APPLIED`
5. "Tailor Resume" → `/resume/tailored/[jobId]`

**Data shown:** `MOCK_JOBS`, `MOCK_COMPATIBILITY`

---

### 4. Seeker — Jobs (Analyse)

**Entry:** `/jobs` → tab "Analyse a Job"

**Flow:**
1. Upload CV (PDF drag-drop or file picker)
2. Paste job description (text area) OR GitHub profile fetch
3. Tap "Analyse" → Cuppy thinking animation (loading state)
4. Results screen:
   - Match score (0–100) with label (Strong Match / Close Match / Not Ready Yet)
   - Cuppy state changes: `happy` ≥85, `judgy` 60–84, `sad` <60
   - Strengths tab: 3 strength cards with descriptions
   - Gaps tab: 3 gap cards with fix instructions
   - CV Fixes tab: original → improved bullet rewrites
   - Keywords tab: present vs missing keywords
5. "Fix These Gaps" → links to Roadmap skills
6. "New Analysis" → resets flow

**Backend:** `POST /api/analyse` → sends CV text + JD text → OpenAI gpt-4o-mini → returns `AnalysisResult`

---

### 5. Seeker — Roadmap

**Entry:** `/roadmap`

**Layout (desktop):** Sidebar + skill tree (left, scrollable) + progress panel (right 320px)
**Layout (mobile):** Vertical spine tree with centered nodes + BottomNav

**Flow:**
1. View skill phases: Foundation → Core → Advanced → Job Ready
2. Completed skills: yellow/green, with checkmark
3. In-progress skills: pulsing glow
4. Locked skills: dimmed
5. Tap skill node → sheet opens (mobile: slides up, desktop: slides right)
6. Sheet shows: skill name, description, "Learn" link, XP reward
7. "Mark Complete" → haptic + XP toast → skill status updates to `completed`
8. Progress ring updates in right panel

**State:** Local React state (no API yet). Future: `PATCH /api/roadmap/:userId/:skillId` → `{ status: 'completed' }`

---

### 6. Seeker — Profile

**Entry:** `/profile`

**Tabs:** Profile | Resume

**Profile tab:**
- Right panel (desktop): Profile Health ring (SVG, based on section completeness), Cuppy Tip, Quick Actions
- Accordion sections (all expandable):
  - Summary (editable in edit mode)
  - Projects (GitHub sync banner, toggle on/off resume)
  - Skills (4 subsections: languages, frameworks, tools, soft — removable chips in edit mode)
  - Experience (bullet points, "Improve with AI" link)
  - Education
  - Certifications
  - Awards
  - App Settings (dark mode toggle, notifications, Sign Out)
- Edit mode: "Edit Profile" button in header toggles edit mode

**Resume tab:**
- Sub-tabs: Foundation | Tailored
- Foundation: full CV document preview (rendered in correct resume format)
- Tailored: empty state "Browse Jobs to tailor your resume" CTA

**Quick Actions:** Export PDF, Tailor Resume → `/jobs`, Share Profile

---

### 7. Seeker — Tailored Resume

**Entry:** `/resume/tailored/[jobId]` (accessed from job detail)

**Flow:**
1. Show job title + company at top
2. Render tailored CV (adjusted summary, reordered skills, relevant experience highlighted)
3. Cuppy tip: "This resume is optimised for [Job Title]"
4. Actions: Download PDF, Apply Now → creates application, Share

**Backend (future):** `POST /api/resume/tailor` → sends profile + job description → OpenAI gpt-4.1-mini → returns tailored resume JSON

---

### 8. Seeker — Handoff

**Entry:** `/handoff` (redirect after onboarding or profile completion trigger)

**Flow:**
1. Show profile health summary
2. Extension installation prompt (optional)
3. Feature highlights: Real-time Sync, Contextual Parsing, Cross-Platform
4. CTA: "Start Your Roadmap" → `/roadmap`
5. CTA: "Browse Jobs" → `/jobs`

---

## Company User Journeys

### 9. Company — Dashboard

**Entry:** `/company/dashboard`

**Layout:**
- Credibility score display
- Active job listings (title, applicant count, posted date, status)
- "Post a Job" CTA → `/company/jobs/new`
- Applicant overview stats

---

### 10. Company — Post Job

**Entry:** `/company/jobs/new`

**Form fields:**
- Job title
- Description (rich text)
- Required skills (multi-select or tag input)
- Nice-to-have skills
- Location
- Work mode (Remote / Hybrid / On-site)
- Job type (Full-time / Part-time / Internship / Contract)
- Salary range + currency

**Submit → `POST /api/jobs`** → job created → redirect to `/company/dashboard`

---

### 11. Company — View Applicants

**Entry:** `/company/jobs/[jobId]/applicants`

**List:** Applicant cards showing:
- Seeker name + initials avatar
- Target role
- Match score (if CV was analysed)
- Applied date
- Application status badge

**Actions per applicant:**
- Shortlist → `PATCH /api/applications/:id` → `{ status: 'INTERVIEW' }`
- Reject → `PATCH /api/applications/:id` → `{ status: 'REJECTED' }`
- View Profile → opens seeker's profile (read-only view)

---

## Backend Data Entities

### User
```
id            UUID PK
email         TEXT UNIQUE NOT NULL
name          TEXT NOT NULL
role          ENUM('seeker', 'company') NOT NULL
xp            INTEGER DEFAULT 0
streak        INTEGER DEFAULT 0
level         ENUM('NEWCOMER','TRAINEE','PILOT','EXPERT','HIRED') DEFAULT 'NEWCOMER'
onboarded     BOOLEAN DEFAULT FALSE
created_at    TIMESTAMPTZ DEFAULT NOW()
```

### Profile (seeker only)
```
id            UUID PK
user_id       UUID FK → users.id
summary       TEXT
target_role   TEXT
ats_score     INTEGER
skill_match   INTEGER
updated_at    TIMESTAMPTZ
```

### Education
```
id, user_id FK, institution, degree, field, start_date, end_date, grade, is_current
```

### Experience
```
id, user_id FK, company, role, type ENUM, start_date, end_date, is_current, bullets JSONB
```

### Project
```
id, user_id FK, name, description, tech_stack JSONB, bullets JSONB,
start_date, end_date, repo_url, live_url, source ENUM('github','manual'),
featured_on_base BOOLEAN, featured_order INTEGER
```

### Skill
```
id, user_id FK, category ENUM('language','framework','tool','soft'), name TEXT
```

### Certification / Award
```
id, user_id FK, name, issuer, date / year
```

### Job
```
id            UUID PK
company_id    UUID FK → users.id (company role)
title         TEXT NOT NULL
description   TEXT
required_skills   JSONB
nice_to_have_skills JSONB
location      TEXT
work_mode     ENUM('Remote','Hybrid','On-site')
type          ENUM('Full-time','Part-time','Internship','Contract')
salary_min    INTEGER
salary_max    INTEGER
currency      TEXT DEFAULT 'RM'
is_active     BOOLEAN DEFAULT TRUE
posted_at     TIMESTAMPTZ DEFAULT NOW()
```

### Application
```
id            UUID PK
job_id        UUID FK → jobs.id
user_id       UUID FK → users.id (seeker)
status        ENUM('APPLIED','VIEWED','INTERVIEW','REJECTED','OFFER') DEFAULT 'APPLIED'
tailored_resume_id UUID FK → resumes.id NULLABLE
applied_at    TIMESTAMPTZ DEFAULT NOW()
```

### Analysis
```
id            UUID PK
user_id       UUID FK → users.id
job_id        UUID FK → jobs.id NULLABLE
match_score   INTEGER
result        JSONB   -- full AnalysisResult object
created_at    TIMESTAMPTZ DEFAULT NOW()
```

### RoadmapProgress
```
id            UUID PK
user_id       UUID FK → users.id
skill_id      TEXT    -- e.g. 'git', 'docker', 'system-design-basics'
status        ENUM('completed','in-progress','available','locked')
updated_at    TIMESTAMPTZ DEFAULT NOW()
```

### Resume (tailored)
```
id            UUID PK
user_id       UUID FK → users.id
job_id        UUID FK → jobs.id
content       JSONB   -- full tailored resume JSON from OpenAI
created_at    TIMESTAMPTZ DEFAULT NOW()
```

---

## API Route Map (future backend)

| Method | Route | Description |
|---|---|---|
| POST | `/api/auth/register` | Register user (seeker or company) |
| POST | `/api/auth/login` | Login → returns session token |
| GET | `/api/profile/:userId` | Get full profile |
| PUT | `/api/profile/:userId` | Update profile sections |
| GET | `/api/jobs` | List active jobs (paginated, filterable) |
| GET | `/api/jobs/:jobId` | Get job detail |
| POST | `/api/jobs` | Create job (company only) |
| PUT | `/api/jobs/:jobId` | Update job (company only) |
| POST | `/api/analyse` | CV + JD → OpenAI → AnalysisResult |
| POST | `/api/resume/tailor` | Profile + job → tailored resume JSON |
| GET | `/api/github/:username` | Fetch public repos + tech stack |
| POST | `/api/applications` | Apply to job |
| GET | `/api/applications/:userId` | List seeker's applications |
| GET | `/api/jobs/:jobId/applicants` | List applicants (company only) |
| PATCH | `/api/applications/:id` | Update application status |
| GET | `/api/roadmap/:userId` | Get roadmap progress |
| PATCH | `/api/roadmap/:userId/:skillId` | Mark skill complete/in-progress |
| GET | `/api/company/:companyId/jobs` | List company's jobs |

---

## Cuppy Mascot States by Context

| Screen / State | Cuppy Animation | File |
|---|---|---|
| Onboarding (all steps) | wave | `wave mascot.json` |
| Dashboard, success states | happy (smiling) | `smiling mascot.json` |
| Analyse loading, processing | thinking (wait) | `wait mascot.json` |
| Empty states, error, judgy result | idle/judgy (sad) | `Sad mascot.json` |
| Strong match result (≥85) | happy (smiling) | `smiling mascot.json` |
| Close match (60–84) | judgy (sad) | `Sad mascot.json` |
| Not ready (<60) | idle (sad) | `Sad mascot.json` |

---

## XP System

| Action | XP Reward |
|---|---|
| Complete onboarding | +100 XP |
| Upload CV | +50 XP |
| Mark roadmap skill complete | +30–70 XP (varies by skill) |
| Apply to a job | +20 XP |
| Complete daily quest | +30–70 XP |
| Tailor a resume | +40 XP |
| Connect GitHub | +30 XP |

**Level thresholds:**
- NEWCOMER: 0–99 XP
- TRAINEE: 100–299 XP
- PILOT: 300–599 XP
- EXPERT: 600–999 XP
- HIRED: 1000+ XP ⭐
