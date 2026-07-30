# Todo App

A full-stack, production-grade Todo application — Node.js + Express backend with Prisma ORM and PostgreSQL, JWT authentication, Zod validation, Swagger API docs, a React (Vite) frontend, Docker containerization, and a GitHub Actions CI pipeline.

## Tech Stack

- **Backend:** Node.js + Express.js
- **Database:** PostgreSQL
- **ORM:** Prisma
- **Authentication:** JWT (JSON Web Tokens) + bcrypt password hashing
- **Validation:** Zod
- **Documentation:** Swagger (OpenAPI) at `/api-docs`
- **Testing:** Postman collection (`backend/postman_collection.json`)
- **Frontend:** React (Vite)
- **Version Control:** Git + GitHub
- **Containerization:** Docker & Docker Compose
- **CI/CD:** GitHub Actions
- **Deployment:** Render or Railway

## Project Structure

```
todo-app/
├── backend/
│   ├── prisma/schema.prisma   # User + Todo models
│   ├── lib/prisma.js          # Prisma client singleton
│   ├── middleware/            # JWT auth + Zod validation middleware
│   ├── validators/            # Zod schemas
│   ├── routes/                # auth.js (register/login), todos.js (CRUD)
│   ├── swagger.js             # OpenAPI config
│   ├── postman_collection.json
│   ├── server.js
│   └── Dockerfile
├── frontend/
│   ├── src/
│   │   ├── App.jsx            # Todo list (JWT-protected)
│   │   └── Auth.jsx           # Login / Register
│   └── Dockerfile
├── docker-compose.yml
└── .github/workflows/ci.yml
```

## API Endpoints

| Method | Endpoint            | Auth required | Description          |
|--------|----------------------|:---:|-----------------------|
| POST   | /api/auth/register   | No  | Create a new account  |
| POST   | /api/auth/login      | No  | Log in, get JWT token |
| GET    | /api/todos           | Yes | Get all your todos    |
| GET    | /api/todos/:id       | Yes | Get a single todo     |
| POST   | /api/todos           | Yes | Create a new todo     |
| PUT    | /api/todos/:id       | Yes | Update a todo         |
| DELETE | /api/todos/:id       | Yes | Delete a todo         |
| GET    | /health              | No  | Health check          |
| GET    | /api-docs             | No  | Swagger UI            |

Protected routes require an `Authorization: Bearer <token>` header, using the token returned from register/login.

## Running Locally (without Docker)

**Backend:**
```bash
cd backend
cp .env.example .env          # set DATABASE_URL and JWT_SECRET
npm install
npx prisma migrate dev --name init   # creates tables in your local PostgreSQL
npm run dev
```

**Frontend:**
```bash
cd frontend
npm install
npm run dev
```

Frontend runs on `http://localhost:5173`, backend on `http://localhost:5000`. API docs at `http://localhost:5000/api-docs`.

## Running with Docker (recommended)

From the project root:

```bash
docker-compose up --build
```

This starts three containers:
- `db` — PostgreSQL on port 5432
- `backend` — Express API on port 5000 (runs `prisma migrate deploy` automatically on startup)
- `frontend` — React app served via nginx on port 3000

Visit `http://localhost:3000` once all containers are up.

## Testing the API

Import `backend/postman_collection.json` into Postman. It includes:
- Register / Login (auto-saves the JWT token to a collection variable)
- Full Todo CRUD (auto-saves the created todo's id)
- Health check

Run **Register** (or **Login**) first, then the rest of the requests will automatically use the saved token.

## Deployment

1. Push the repo to GitHub with proper commits.
2. GitHub Actions (`.github/workflows/ci.yml`) installs dependencies, generates the Prisma client, and builds both backend and frontend on every push to `main`.
3. Deploy `backend` + a managed PostgreSQL instance on **Render** or **Railway**. Set `DATABASE_URL` and `JWT_SECRET` as environment variables there.
4. Deploy `frontend` on **Render**, **Railway**, or **Vercel**, setting `VITE_API_URL` to the deployed backend's `/api` URL (e.g. `https://your-backend.onrender.com/api`).

## Concepts Demonstrated

- REST API design with proper HTTP status codes (2xx/4xx/5xx)
- Client-server architecture & request/response lifecycle
- JWT-based authentication & password hashing
- Schema validation (Zod) and centralized error handling
- CORS handling
- Non-blocking I/O / async architecture (Node.js event loop)
- ORM-based database access (Prisma) with migrations
- API documentation (OpenAPI/Swagger)
- Containerization with Docker & multi-container orchestration with Docker Compose
- CI automation with GitHub Actions
