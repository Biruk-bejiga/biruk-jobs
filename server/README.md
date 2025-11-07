## API Server

Express API with PostgreSQL (Drizzle ORM) and JWT-backed session cookies.

### Getting Started

1. Copy the environment template and fill in secrets:

   ```powershell
   cd server
   copy .env.example .env
   ```

2. Install dependencies:

   ```powershell
   npm install
   ```

3. Generate and run the initial migration (requires Postgres running and `DATABASE_URL` set):

   ```powershell
   npm run db:generate
   npm run db:migrate
   ```

4. Start the API server:

   ```powershell
   npm run dev
   ```

The API listens on `http://localhost:4000` by default. Change the `PORT` env var to override.

### Key Endpoints

- `POST /api/auth/register` employer/employee self-service registration.
- `POST /api/auth/login` issue access token + session cookie.
- `POST /api/auth/refresh` rotate the refresh token cookie.
- `POST /api/jobs` (employer/admin) create job postings.
- `POST /api/jobs/:id/apply` (employee) submit applications with cover letter + resume link.
- `GET /api/admin/users` (admin) manage user accounts.

All protected routes require a `Bearer <accessToken>` header. Refresh tokens are persisted (hashed) in Postgres and rotated per login.

### Database Schema Highlights

- `users` — core identity table with role enum (`employer`, `employee`, `admin`).
- `employer_profiles` & `employee_profiles` — extended metadata for each role.
- `jobs` — listings authored by employers/admins with salary, location, and status.
- `job_applications` — employees applying to jobs with cover letter + resume URL.
- `refresh_tokens` — tracks hashed refresh tokens for session management.

Inspect `db/schema.js` for the full schema definition and relationships.
