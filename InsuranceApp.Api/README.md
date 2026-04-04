# Insurance Management System

A full stack insurance management application built with React, TypeScript, C# ASP.NET Core 10, and PostgreSQL. Built as a portfolio project to demonstrate professional full stack development patterns.

## Live Demo

- **Frontend:** [your-app.vercel.app](https://your-app.vercel.app) _(update when deployed)_
- **API Docs:** [your-api.onrender.com/swagger](https://your-api.onrender.com/swagger) _(update when deployed)_

> Demo credentials: email `demo@demo.com` / password `Demo1234!` _(add these once you seed a demo user)_

## Features

- Client management — create, view, edit and delete insurance clients
- Policy management — multiple policies per client with type, premium and date range
- Claims tracking — log and manage claims against policies
- Risk ranking — clients automatically ranked Low / Medium / High / Critical based on claim count
- JWT authentication — secure login and registration with BCrypt password hashing
- Stats dashboard — live counts of clients, policies, claims and high risk clients
- Swagger UI — full interactive API documentation

## Tech Stack

### Frontend

| Technology            | Purpose                             |
| --------------------- | ----------------------------------- |
| React 18 + TypeScript | UI framework                        |
| Tailwind CSS v4       | Styling                             |
| React Query           | Server state management and caching |
| React Router          | Client-side routing                 |
| Axios                 | HTTP client with JWT interceptors   |
| Lucide React          | Icons                               |
| Vite                  | Build tool                          |

### Backend

| Technology            | Purpose                     |
| --------------------- | --------------------------- |
| ASP.NET Core 10       | Web API framework           |
| Entity Framework Core | ORM and database migrations |
| Npgsql                | PostgreSQL driver           |
| BCrypt.Net            | Password hashing            |
| JWT Bearer            | Authentication              |

### Database

| Technology         | Purpose             |
| ------------------ | ------------------- |
| PostgreSQL         | Production database |
| EF Core Migrations | Schema management   |

### Hosting

| Service           | Purpose             |
| ----------------- | ------------------- |
| Vercel            | Frontend hosting    |
| Render            | Backend API hosting |
| Render PostgreSQL | Database hosting    |

## Architecture

The backend follows a strict layered architecture:
Request → Controller → Service → Repository → Database

- **Controllers** — handle HTTP routing and input validation only
- **Services** — contain all business logic (including risk ranking calculation)
- **Repositories** — handle all database access via Entity Framework Core
- **DTOs** — Data Transfer Objects separate the API contract from database entities
- **Interfaces** — every service and repository is interface-first for testability

## Project Structure

InsuranceApp/
├── InsuranceApp.Api/
│ ├── Controllers/ # HTTP endpoints — Auth, Clients, Policies, Claims
│ ├── Services/ # Business logic — risk ranking, CRUD operations
│ ├── Repositories/ # Database access — EF Core queries
│ ├── Models/ # Database entities — Client, Policy, Claim, User
│ ├── DTOs/ # Data shapes — Create, Update, Response DTOs
│ ├── Data/ # AppDbContext and EF Core configuration
│ ├── Migrations/ # Auto-generated database migrations
│ ├── Dockerfile # Docker config for Render deployment
│ └── Program.cs # App configuration and dependency injection
└── InsuranceApp.Client/
└── src/
├── api/ # Axios instance and API functions
├── components/ # Shared UI — Layout, sidebar
├── context/ # Auth context and useAuth hook
├── pages/
│ ├── auth/ # Login and register pages
│ └── dashboard/ # Clients, policies, claims pages
└── types/ # TypeScript interfaces matching backend DTOs

## Database Schema

Users Clients

Id Id
Email FirstName
PasswordHash LastName
FirstName Email
LastName Phone
CreatedAt Address
DateOfBirth
CreatedAt
|
| one-to-many
↓
Policies

---

Id
PolicyNumber (unique)
Type
Premium
StartDate
EndDate
IsActive
ClientId (FK)
CreatedAt
|
| one-to-many
↓
Claims

---

Id
Description
Amount
Status
ClaimDate
PolicyId (FK)
CreatedAt

## Risk Ranking Logic

Clients are automatically ranked based on total claims across all their policies:

| Claims | Risk Level |
| ------ | ---------- |
| 0      | Low        |
| 1–2    | Medium     |
| 3–5    | High       |
| 6+     | Critical   |

## Running Locally

### Prerequisites

- .NET 10 SDK
- Node.js 18+
- PostgreSQL running locally

### Backend

```bash
cd InsuranceApp.Api
# Configure your connection string in appsettings.Development.json
dotnet run
# API runs at http://localhost:5260
# Swagger UI at http://localhost:5260/swagger
```

### Frontend

```bash
cd InsuranceApp.Client
npm install
npm run dev
# Runs at http://localhost:5173
```

### Database

Migrations run automatically on backend startup. To run manually:

```bash
cd InsuranceApp.Api
dotnet ef migrations add MigrationName
dotnet ef database update
```

### Environment Variables

The backend reads from `appsettings.Development.json` locally — this file is in `.gitignore` and never committed. Create it in `InsuranceApp.Api/` with:

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Host=localhost;Database=insuranceapp;Username=yourusername;Password="
  },
  "Jwt": {
    "Key": "your-secret-key-minimum-32-characters",
    "Issuer": "InsuranceApp",
    "Audience": "InsuranceApp"
  }
}
```

The frontend reads from a `.env.local` file in `InsuranceApp.Client/`:
VITE_API_URL=http://localhost:5260

## Deployment

The app is deployed with the frontend and backend as separate services:

- **Frontend** — Vercel detects the Vite project automatically. Set `VITE_API_URL` as an environment variable pointing to the Render API URL.
- **Backend** — Render builds from the Dockerfile in `InsuranceApp.Api/`. Set `ConnectionStrings__DefaultConnection`, `Jwt__Key`, `Jwt__Issuer`, and `Jwt__Audience` as environment variables in the Render dashboard.
- **Database** — PostgreSQL provisioned on Render. The Internal Database URL connects the API to the database. Migrations run automatically on startup.

## API Endpoints

| Method | Endpoint                  | Auth | Description                      |
| ------ | ------------------------- | ---- | -------------------------------- |
| POST   | /api/auth/register        | No   | Register a new user              |
| POST   | /api/auth/login           | No   | Login and receive JWT            |
| GET    | /api/clients              | Yes  | Get all clients with risk levels |
| POST   | /api/clients              | Yes  | Create a new client              |
| GET    | /api/clients/{id}         | Yes  | Get client by ID                 |
| PUT    | /api/clients/{id}         | Yes  | Update client                    |
| DELETE | /api/clients/{id}         | Yes  | Delete client and cascade        |
| GET    | /api/policies             | Yes  | Get all policies                 |
| GET    | /api/policies/{id}        | Yes  | Get policy by ID                 |
| GET    | /api/policies/client/{id} | Yes  | Get policies by client           |
| POST   | /api/policies             | Yes  | Create a new policy              |
| PUT    | /api/policies/{id}        | Yes  | Update policy                    |
| DELETE | /api/policies/{id}        | Yes  | Delete policy and cascade        |
| GET    | /api/claims               | Yes  | Get all claims                   |
| GET    | /api/claims/{id}          | Yes  | Get claim by ID                  |
| GET    | /api/claims/policy/{id}   | Yes  | Get claims by policy             |
| POST   | /api/claims               | Yes  | Create a new claim               |
| PUT    | /api/claims/{id}          | Yes  | Update claim status              |
| DELETE | /api/claims/{id}          | Yes  | Delete claim                     |
