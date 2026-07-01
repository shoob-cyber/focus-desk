# FocusDesk

FocusDesk is a productivity app built as a two-part monorepo:

- a Node.js and Express backend with Prisma and PostgreSQL
- a React and Vite frontend for task management, Pomodoro focus sessions, and dashboard analytics

The app supports email/password authentication, protected task CRUD, Pomodoro session logging, and a dashboard that summarizes focus activity with totals, streaks, and a weekly heatmap.

## Features

- User registration and login with JWT authentication
- Protected routes for authenticated users
- Task management with create, read, update, and delete actions
- Pomodoro timer with focus and break cycles
- Session logging linked to tasks
- Analytics dashboard with:
  - total sessions
  - total focus time
  - current streak
  - weekly focus heatmap
  - bar chart summary
- Light and dark theme support in the UI

## Tech Stack

### Backend

- Node.js
- Express
- Prisma
- PostgreSQL
- bcryptjs for password hashing
- jsonwebtoken for auth tokens
- cors and dotenv

### Frontend

- React 19
- Vite
- React Router
- Axios
- Tailwind CSS
- Recharts
- lucide-react
- dnd-kit packages for drag-and-drop support

## Project Structure

```text
focusdesk/
├── backend/
│   ├── server.js
│   ├── src/
│   │   ├── app.js
│   │   ├── controllers/
│   │   ├── middleware/
│   │   └── routes/
│   └── prisma/
│       ├── schema.prisma
│       └── migrations/
└── frontend/
    ├── vite.config.js
    └── src/
        ├── api/
        ├── components/
        ├── context/
        └── pages/
```

## Requirements

- Node.js 18 or newer
- npm
- PostgreSQL database

## Setup

Install dependencies in both apps:

```bash
cd backend
npm install

cd ../frontend
npm install
```

Create a database for the backend and configure the environment variables below.

## Environment Variables

### Backend

Create `backend/.env` with at least:

```env
DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE"
JWT_SECRET="your-secret-key"
PORT=5000
```

### Frontend

The frontend currently uses `http://localhost:5000/api` as its API base URL in `frontend/src/api/client.js`, and the Vite dev server proxies `/api` requests to the backend.

If you change the backend port or host, update:

- `frontend/src/api/client.js`
- `frontend/vite.config.js`

## Running Locally

Start the backend:

```bash
cd backend
npm run dev
```

Start the frontend in a second terminal:

```bash
cd frontend
npm run dev
```

By default:

- backend runs on `http://localhost:5000`
- frontend runs on `http://localhost:3000`

## Database

The Prisma schema defines three models:

- `User` for authentication
- `Task` for task tracking
- `PomodoroSession` for focus session history

To apply schema changes and create the database tables, run:

```bash
cd backend
npx prisma migrate dev
```

You can also open Prisma Studio with:

```bash
cd backend
npm run prisma:studio
```

## API Overview

### Public routes

- `POST /api/auth/register` - create a new user
- `POST /api/auth/login` - log in and receive a JWT
- `GET /` - basic health/status check

### Protected routes

All routes below require `Authorization: Bearer <token>`.

- `GET /api/tasks` - list the current user’s tasks
- `POST /api/tasks` - create a task
- `PUT /api/tasks/:id` - update a task
- `DELETE /api/tasks/:id` - delete a task
- `GET /api/sessions` - list the current user’s Pomodoro sessions
- `POST /api/sessions` - log a Pomodoro session
- `GET /api/analytics/dashboard` - get dashboard summary data

## Frontend Pages

- `/login` - sign in
- `/register` - create an account
- `/dashboard` - analytics and focus summary
- `/tasks` - task list and task creation
- `/timer` - Pomodoro timer and session logging

## Notes

- Authentication state is stored in `localStorage` as a JWT token and user profile.
- The backend uses Prisma with PostgreSQL, so the `DATABASE_URL` must point to a running Postgres instance before migrations or API calls will work.
- The frontend uses protected routes, so unauthenticated users are redirected to the login page.

## Available Scripts

### Backend

- `npm run dev` - start the API with nodemon
- `npm start` - start the API with Node
- `npm run prisma:migrate` - run Prisma migrations
- `npm run prisma:studio` - open Prisma Studio

### Frontend

- `npm run dev` - start the Vite dev server
- `npm run build` - build for production
- `npm run lint` - run ESLint
- `npm run preview` - preview the production build
