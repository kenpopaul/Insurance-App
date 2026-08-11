# Insurance App

A full-stack insurance management system: an ASP.NET Core Web API backed by PostgreSQL, with a React + TypeScript client. It tracks clients, their policies, and the claims filed against those policies, and computes a per-client risk level from claims history.

## Stack

| Layer    | Tech |
|----------|------|
| API      | ASP.NET Core (.NET 10), Entity Framework Core, PostgreSQL (Npgsql), JWT auth, Swashbuckle/OpenAPI |
| Client   | React 19, TypeScript, Vite, Tailwind CSS, TanStack Query, React Router, Axios |
| Tests    | xUnit + Moq |

## Project layout

```
InsuranceApp.Api/         ASP.NET Core Web API
  Controllers/             HTTP endpoints (Auth, Clients, Policies, Claims)
  Services/                Business logic (risk scoring, DTO mapping, auth)
  Repositories/             Data access over EF Core
  Models/                   EF entities (Client, Policy, Claim, User)
  DTOs/                     Request/response contracts
  Data/                     AppDbContext
  Migrations/               EF Core migrations

InsuranceApp.Api.Tests/   xUnit test project for the API

InsuranceApp.Client/      React + Vite frontend
  src/api/                  Axios client + per-resource API calls
  src/pages/                Route-level pages (auth, dashboard)
  src/components/           Shared UI components
  src/context/              React context (auth state)
```

## Domain model

- **Client** — has many **Policies**
- **Policy** — belongs to a Client, has many **Claims**
- **Claim** — belongs to a Policy

A client's `TotalClaims` is the sum of claims across *all* of their policies, and it drives their `RiskLevel`:

| Total claims | Risk level |
|--------------|------------|
| 0            | Low        |
| 1–2          | Medium     |
| 3–5          | High       |
| 6+           | Critical   |

This logic lives in `ClientService.MapToDto` and is covered by the boundary tests in `InsuranceApp.Api.Tests`.

## Getting started

### Prerequisites

- [.NET 10 SDK](https://dotnet.microsoft.com/download)
- [Node.js](https://nodejs.org/) 18+
- PostgreSQL running locally (or a connection string to a remote instance)

### 1. API

```bash
cd InsuranceApp.Api
```

Create `appsettings.Development.json` (gitignored — not committed) with your local database and a JWT signing key:

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Host=localhost;Database=insuranceapp;Username=<your-user>;Password=<your-password>"
  },
  "Jwt": {
    "Key": "a-dev-only-secret-at-least-32-characters-long",
    "Issuer": "InsuranceApp",
    "Audience": "InsuranceApp"
  }
}
```

Apply migrations and run (migrations also run automatically on startup):

```bash
dotnet run
```

The API listens on `http://localhost:5260` by default and serves Swagger UI at `/swagger`.

### 2. Client

```bash
cd InsuranceApp.Client
npm install
```

Point the client at your API by setting `VITE_API_URL` (defaults to `http://localhost:5260` if unset) — e.g. in `InsuranceApp.Client/.env.local`:

```
VITE_API_URL=http://localhost:5260
```

Then start the dev server:

```bash
npm run dev
```

### 3. Tests

```bash
dotnet test InsuranceApp.Api.Tests/InsuranceApp.Api.Tests.csproj
```

Or run everything in the solution:

```bash
dotnet build InsuranceApp.slnx
dotnet test InsuranceApp.slnx
```

## API overview

All routes below `/api` except `/api/auth/*` require a `Bearer` JWT (obtained via login/register).

| Resource | Endpoints |
|----------|-----------|
| Auth     | `POST /api/auth/register`, `POST /api/auth/login` |
| Clients  | `GET /api/clients`, `GET /api/clients/{id}`, `POST /api/clients`, `PUT /api/clients/{id}`, `DELETE /api/clients/{id}` |
| Policies | `GET /api/policies`, `GET /api/policies/{id}`, `GET /api/policies/client/{clientId}`, `POST /api/policies`, `PUT /api/policies/{id}`, `DELETE /api/policies/{id}` |
| Claims   | `GET /api/claims`, `GET /api/claims/{id}`, `GET /api/claims/policy/{policyId}`, `POST /api/claims`, `PUT /api/claims/{id}`, `DELETE /api/claims/{id}` |

## Deployment

- **API**: containerized via `InsuranceApp.Api/Dockerfile`.
- **Client**: deployed to Vercel (`InsuranceApp.Client/vercel.json`), configured to talk to the deployed API via `VITE_API_URL`.
