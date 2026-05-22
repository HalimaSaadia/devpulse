# Issue Tracker API
Project Name: Devpulse
Live URL: [https://devpulse-server-ashen.vercel.app]

This is a simple Issue Tracker API. It lets users sign up, log in, and create or manage issues.

**Features**
- Sign up new users
- Log in users and return a JWT token
- Create an issue (only for logged-in users)
- View all issues (filter and sort)
- View one issue by id
- Update or delete an issue (only for logged-in users, role checks apply)

**Tech stack**
- Node.js
- TypeScript
- Express
- PostgreSQL (pg)
- JWT (jsonwebtoken)
- bcrypt for password hashing
- Dev: tsx, tsup
- Deploy: Vercel (optional)

**Setup (easy steps)**
1. Clone the repo:

   npm install
2. Create a file named `.env` in the project root with these values:

   PORT=3000
   CONNECTION_STRING=postgresql://USER:PASS@HOST:PORT/DB_NAME
   jwt_secret=my_jwt_secret

3. Install dependencies:

   npm install

4. Run in development:

   npm run dev

5. Build for production:

   npm run build

6. Start the built app:

   npm start

**API Endpoints (simple list)**
Base path: `/api`

- Auth
  - `POST /api/auth/signup` — body: `{ name, email, password, role? }` — create user
  - `POST /api/auth/login` — body: `{ email, password }` — returns `{ user, token }`

- Issues
  - `GET /api/issues` — list issues (query: `sort`, `type`, `status`)
  - `POST /api/issues` — create issue (auth required). body: `{ title, description, type }` — `reporter_id` is taken from your token
  - `GET /api/issues/:id` — get one issue by id
  - `PATCH /api/issues/:id` — update issue (auth required)
  - `DELETE /api/issues/:id` — delete issue (auth required)



**Database schema summary**
- `users` table:
  - `id` (serial primary key)
  - `name` (string)
  - `email` (string, unique)
  - `password` (string, hashed)
  - `role` (string, default `contributor`)
  - `created_at`, `updated_at` (timestamps)

- `issues` table:
  - `id` (serial primary key)
  - `title` (string)
  - `description` (text, at least 50 chars)
  - `type` (`bug` or `feature_request`)
  - `status` (`open`, `in_progress`, `resolved`, default `open`)
  - `reporter_id` (integer, id of `users`)
  - `created_at`, `updated_at` (timestamps)


