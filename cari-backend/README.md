# Cari Backend

Express.js + TypeScript backend for Cari, an AI-powered career co-pilot.

## Scripts

```bash
npm run dev
npm run build
npm start
```

## Local API

Default base URL:

```text
http://localhost:3001/api/v1
```

Health check:

```text
GET /api/v1/health
```

## API Testing

Use Bruno for local API testing. It stores collections as files, which makes endpoint examples easy to keep in the repo.

Open the `bruno/` folder in Bruno and select the `Local` environment.

Current working requests:

- `Health / API Health`
- `Health / Supabase Health`
- `Health / API Health Direct`
- `Health / Supabase Health Direct`
- `Auth / Register - Job Seeker`
- `Auth / Register - Company`
- `Auth / Login`
- `Auth / Me`
- `Auth / Refresh Session`
- `Auth / Register - Job Seeker Direct`
- `Auth / Register - Company Direct`
- `Auth / Login Direct`
- `Auth / Me Direct`
- `Profile / Get My Profile Direct`
- `Profile / Update My Profile Direct`
- `Profile / Replace My Profile Direct`
- `Profile / Delete My Profile Direct`
- `Companies / Get My Company Direct`
- `Companies / Upsert My Company Direct`
- `Companies / Update My Company Direct`
- `Jobs / List Jobs Direct`
- `Jobs / Create Job Direct`
- `Jobs / Get Job Detail Direct`
- `Jobs / Update Job Direct`
- `Jobs / Delete Job Direct`
- `Analysis / Analyse CV Against JD Direct`
- `Resumes / Generate Resume Direct`
- `GitHub / Scrape GitHub Direct`
- `Applications / List Applications Direct`
- `Applications / Apply To Job Direct`
- `Applications / Update Application Status Direct`
- `Company Portal / Dashboard Direct`
- `Company Portal / Jobs Direct`
- `Company Portal / Applicants Direct`

After login, copy `data.session.accessToken` into the Bruno `Local` environment variable named `authToken`, then run `Auth / Me`.

If Bruno says `baseUrl` is missing, the `Local` environment is not selected. Use the two `Direct` health requests first; they do not depend on environment variables.

If an auth request says `Invalid URL`, use the matching `Direct` auth request. The direct requests hardcode `http://localhost:3001/api/v1` and do not need Bruno's `baseUrl` variable.

Profile requests require `authToken`. `Delete My Profile Direct` removes the Supabase Auth user, so use it only for disposable test accounts.

Job creation requires a company account. Register with `Auth / Register - Company Direct`, login, set `authToken`, then run `Companies / Upsert My Company Direct` before `Jobs / Create Job Direct`. Copy the created job `data.job.id` into Bruno's `jobId` variable for detail, update, and delete requests.

Analysis requires a job seeker account and `OPENAI_API_KEY` in `.env`. Register/login as a job seeker, set `authToken`, then run `Analysis / Analyse CV Against JD Direct`.

Resume generation also requires a job seeker account and `OPENAI_API_KEY`. Run `Resumes / Generate Resume Direct` to create and store a structured resume JSON record.

GitHub scraping requires a job seeker account and uses the public GitHub API. Run `GitHub / Scrape GitHub Direct` with any public username.

Applications require a job seeker token to apply. Set `jobId`, run `Applications / Apply To Job Direct`, then copy `data.application.id` into `applicationId` to test status updates. Company tokens can list and update applications for jobs owned by their company.

Company portal requests require a company token. Use `Company Portal / Dashboard Direct` for overview stats, `Company Portal / Jobs Direct` for company-owned jobs, and `Company Portal / Applicants Direct` after setting `jobId`.

The jobs and applications requests are included as placeholders for the next backend steps.

## Supabase

1. Create a Supabase project.
2. Copy `.env.example` to `.env` and fill in `SUPABASE_URL`, `SUPABASE_ANON_KEY`, and `SUPABASE_SERVICE_ROLE_KEY`.
3. Run `supabase/schema.sql` in the Supabase SQL editor.
4. Check `GET /api/v1/health/db`.
