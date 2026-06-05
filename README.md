# Co-Working Space Management

> **TitikTemu** — A production-ready Space Booking System built as a university final project.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 14 (App Router), TypeScript, Tailwind CSS |
| Backend | Node.js, Express.js, TypeScript |
| Database | MongoDB 7 (via Mongoose) |
| Auth | JWT (httpOnly cookies) |
| DevOps | Docker & Docker Compose |

---

## Quick Start

### Prerequisites
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) installed and running

### 1. Clone & Start

```bash
git clone <your-repo-url>
cd "Co-Working Space Management"
docker compose up --build
```

The services will start:
- **Frontend** → http://localhost:3000
- **Backend API** → http://localhost:5000/api
- **MongoDB** → localhost:27017

### 2. Seed the Database

After all containers are running, seed the database with sample spaces and an admin user:

```bash
docker exec coworking_backend npm run seed
```

### 3. Default Accounts

| Role | Email | Password |
|---|---|---|
| Admin | admin@ledger.com | Admin@1234 |
| User | user@ledger.com | User@1234 |

---

## Environment Variables

### Backend (`backend/.env`)

```env
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb://admin:password123@localhost:27017/coworking_db?authSource=admin
JWT_SECRET=super_secret_jwt_key_change_in_production_2024
FRONTEND_URL=http://localhost:3000
```

### Frontend (`frontend/.env.local`)

```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

---

## API Reference

### Auth
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login, returns JWT cookie |
| POST | `/api/auth/logout` | Clear JWT cookie |
| GET | `/api/auth/me` | Get current user |

### Spaces
| Method | Endpoint | Description | Auth |
|---|---|---|---|
| GET | `/api/spaces` | List all spaces | Public |
| GET | `/api/spaces/:id` | Get space detail | Public |
| POST | `/api/spaces` | Create space | Admin |
| PUT | `/api/spaces/:id` | Update space | Admin |
| DELETE | `/api/spaces/:id` | Delete space | Admin |

### Bookings
| Method | Endpoint | Description | Auth |
|---|---|---|---|
| GET | `/api/bookings` | Get user's bookings | User |
| GET | `/api/bookings/:id` | Get booking detail | User |
| POST | `/api/bookings` | Create booking | User |
| PATCH | `/api/bookings/:id/status` | Update booking status | User/Admin |

### Admin
| Method | Endpoint | Description | Auth |
|---|---|---|---|
| GET | `/api/admin/stats` | Dashboard statistics | Admin |
| GET | `/api/admin/bookings` | All bookings | Admin |

---

## Project Structure

```
.
├── frontend/           # Next.js 14 App
│   ├── src/
│   │   ├── app/        # App Router pages
│   │   ├── components/ # Reusable UI components
│   │   ├── lib/        # API client & auth context
│   │   └── types/      # TypeScript interfaces
│   └── Dockerfile
├── backend/            # Express.js API
│   ├── src/
│   │   ├── config/     # DB connection
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── models/     # Mongoose schemas
│   │   ├── routes/
│   │   └── scripts/    # Seeder
│   └── Dockerfile
└── docker-compose.yml
```
