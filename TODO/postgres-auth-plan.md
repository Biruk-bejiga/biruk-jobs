# Postgres & Auth Upgrade Plan

- [x] Replace file-based persistence with PostgreSQL via an ORM (e.g., Prisma or Sequelize).
  - [x] Define schema for admin profile data and future entities (jobs, users, disputes).
  - [x] Add migration tooling and environment-specific configuration.
  - [x] Implement data access layer and update Express routes to use the database.
- [x] Introduce authentication with secure session or JWT flow.
  - [x] Choose auth strategy (e.g., JWT + refresh tokens stored in HttpOnly cookies).
  - [x] Add user model with hashed passwords and password update endpoint.
  - [x] Protect admin routes with middleware enforcing authentication/authorization.
- [x] Harden server infrastructure.
  - [x] Centralize error handling and validation.
  - [x] Add logging, request rate limiting, and security headers (helmet).
  - [x] Provide `.env.example` documenting required secrets (DB URL, JWT secret).
- [ ] Update frontend to leverage auth state and handle protected routes.
  - [ ] Add login flow and persist auth tokens securely.
  - [ ] Guard admin pages; surface error and loading states gracefully.
- [x] Document setup and update scripts.
  - [x] Expand README with database setup, migrations, env vars, and auth usage.
  - [ ] Add npm scripts for running dev server and backend concurrently (e.g., `npm run dev:full`).

## Initial PostgreSQL Schema Sketch

- `users` — UUID PK, unique email, bcrypt hash, role enum (`employer`, `employee`, `admin`), profile basics, status flags.
- `employer_profiles` — one-to-one with users, company metadata (name, website, size, industry, HQ, founded year).
- `employee_profiles` — one-to-one with users, career headline, location, experience, resume/portfolio URLs, bio summary.
- `jobs` — authored by employer/admin, slug, description, responsibilities, requirements, location, salary range + currency, employment type enum, lifecycle timestamps.
- `job_applications` — applicant ↔ job link, cover letter, resume URL, status enum (`submitted`, `in_review`, `shortlisted`, `rejected`, `withdrawn`, `hired`).
- `job_application_messages` — threaded messages between employer/admin and applicant for each application.
- `refresh_tokens` — hashed refresh token storage with expiration, user agent, IP, revocation metadata.
