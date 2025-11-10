-- Seed data for local testing
-- Run inside your Neon connection or any psql client after migrations.
BEGIN;

-- Shared password hash for testing accounts: Password123!
-- Generated with bcrypt (12 rounds) via `bcrypt.hash('Password123!', 12)`
-- $2a$12$VWjeGzGCBwz/27hip2EIXuMn6dkMON77gjUQeXjmFvND1vQlgwl9e

INSERT INTO users (id, email, password_hash, role, full_name, phone, location, is_active)
VALUES
  ('c8a7f1c1-40f4-49b0-a70f-d5b6cf6b1af0', 'admin@example.com', '$2a$12$VWjeGzGCBwz/27hip2EIXuMn6dkMON77gjUQeXjmFvND1vQlgwl9e', 'admin', 'FlexiSphere Admin', '+1-555-0100', 'Remote', true)
ON CONFLICT (email) DO NOTHING;

INSERT INTO users (id, email, password_hash, role, full_name, phone, location, is_active)
VALUES
  ('e6f2a7f2-d2d1-4e56-9fb5-77a8c4a2cd61', 'employer@example.com', '$2a$12$VWjeGzGCBwz/27hip2EIXuMn6dkMON77gjUQeXjmFvND1vQlgwl9e', 'employer', 'Aiden Carter', '+1-555-0111', 'Austin, TX', true)
ON CONFLICT (email) DO NOTHING;

INSERT INTO employer_profiles (id, user_id, company_name, company_website, company_description, company_size, industry, headquarters, founded_year)
VALUES
  ('4c7d8b2c-d2a0-4fa9-a37a-77301ff3fc9f', 'e6f2a7f2-d2d1-4e56-9fb5-77a8c4a2cd61',
   'FlexiSphere Labs', 'https://flexisphere.example.com',
   'Building flexible SaaS platforms for distributed teams.', '51-200',
   'Software', 'Austin, TX', 2018)
ON CONFLICT (user_id) DO NOTHING;

INSERT INTO users (id, email, password_hash, role, full_name, phone, location, is_active)
VALUES
  ('3c944c3b-2c3f-4b8c-8f13-6fe8894321d9', 'employee@example.com', '$2a$12$VWjeGzGCBwz/27hip2EIXuMn6dkMON77gjUQeXjmFvND1vQlgwl9e', 'employee', 'Morgan Lee', '+1-555-0122', 'Denver, CO', true)
ON CONFLICT (email) DO NOTHING;

INSERT INTO employee_profiles (id, user_id, headline, location, years_experience, resume_url, portfolio_url, bio)
VALUES
  ('f27c39eb-4bd7-4f0f-9c12-32dc842f30ab', '3c944c3b-2c3f-4b8c-8f13-6fe8894321d9',
   'React engineer focused on UX', 'Denver, CO', 5,
   'https://example.com/morgan-lee-resume.pdf', 'https://example.com/morgan-lee-portfolio',
   'Frontend developer specializing in React, accessibility, and design systems.')
ON CONFLICT (user_id) DO NOTHING;

INSERT INTO jobs (id, employer_id, title, slug, summary, description, responsibilities, requirements, location, is_remote, employment_type, salary_min, salary_max, salary_currency, status, published_at, closing_date)
VALUES
  ('1f2dde38-9634-4a79-acf0-5f7a25d0a8a4', 'e6f2a7f2-d2d1-4e56-9fb5-77a8c4a2cd61',
   'Senior React Engineer', 'senior-react-engineer-flexisphere',
   'Own mission-critical UI experiences for FlexiSphere''s SaaS suite.',
   'We are hiring a Senior React Engineer to lead feature delivery and champion frontend excellence.',
   'Design, build, and ship product experiences in React; partner with design and platform teams.',
   '7+ years of frontend experience, deep React expertise, experience with testing and accessibility.',
   'Austin, TX (Hybrid)', true, 'full_time', 130000, 160000, 'USD', 'published', '2025-01-02T15:00:00Z', '2025-12-31T23:59:59Z')
ON CONFLICT (slug) DO NOTHING;

INSERT INTO jobs (id, employer_id, title, slug, summary, description, responsibilities, requirements, location, is_remote, employment_type, salary_min, salary_max, salary_currency, status, published_at, closing_date)
VALUES
  ('ac0dbea9-768e-47ac-b07f-8ddc2d1ff8a2', 'e6f2a7f2-d2d1-4e56-9fb5-77a8c4a2cd61',
   'React Native Developer', 'react-native-developer-flexisphere',
   'Deliver mobile features for our companion apps alongside the web platform.',
   'Help expand our product surface to mobile by building performant React Native experiences.',
   'Implement new app modules, integrate REST/GraphQL APIs, collaborate with product and QA.',
   '5+ years with React Native, ship-to-store experience, familiarity with TypeScript and CI/CD.',
   'Remote (US)', true, 'contract', 90000, 120000, 'USD', 'published', '2025-02-10T12:00:00Z', NULL)
ON CONFLICT (slug) DO NOTHING;

COMMIT;
