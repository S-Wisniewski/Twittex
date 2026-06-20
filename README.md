# Twittex

A full-stack social media platform with AI-powered content moderation. Users can post, follow, like, and reply; every post is automatically reviewed by a Llama 3 model running on AWS Bedrock, with moderation events streamed to connected clients in real time via SignalR.

## Stack

| Layer | Technology |
|---|---|
| Frontend | React 19, TypeScript, Vite, Tailwind CSS, Shadcn UI, TanStack Query |
| Backend | ASP.NET Core 10.0 (C#), Entity Framework Core, SignalR |
| Database | PostgreSQL |
| Auth | AWS Cognito (email + password, JWT) |
| AI moderation | AWS Bedrock — Meta Llama 3.2 1B |
| Storage | AWS S3 |
| Infrastructure | AWS ECS + RDS; Terraform; Docker |

## Features

- **Feed** — infinite-scroll timeline of posts from followed users
- **Posts** — create, like, reply, and view thread pages
- **Profiles** — avatar upload, bio, follower / following counts
- **Search** — find users and posts
- **Real-time moderation** — every post is scored by Llama 3 on creation; result is pushed via SignalR and surfaced in the UI
- **Notifications** — live notification sheet powered by SignalR
- **Content reports** — users can flag posts for review
- **i18n** — internationalisation via react-i18next
- **Dark / light mode**

## Running locally

### Prerequisites

- [Docker](https://www.docker.com/) and Docker Compose
- AWS credentials with access to Cognito and Bedrock (for auth and AI moderation)

### 1. Configure environment variables

Copy the example and fill in your values:

```bash
cp src/web/.env.example src/web/.env      # VITE_API_URL
```

Create a root `.env` for the backend (used by Docker Compose and `dotnet run`):

```bash
# .env (root of repo)
ConnectionStrings__DefaultConnection=Host=localhost;Port=5432;Database=moderation_db;Username=admin;Password=password
Cognito__Authority=https://cognito-idp.<region>.amazonaws.com/<pool-id>
Cognito__Audience=<app-client-id>
Cognito__Region=<region>
Bedrock__ModelId=us.meta.llama3-2-1b-instruct-v1:0
Bedrock__Region=<region>
```

### 2. Start everything with Docker Compose

```bash
docker-compose up
```

This starts:
- **PostgreSQL** on `localhost:5432`
- **API** on `http://localhost:8080`
- **Web** (Nginx) on `http://localhost:3000`

### Running services individually (for development)

**Backend**

```bash
cd src/api/ModerationSystem.Api
dotnet restore
dotnet run
```

**Frontend**

```bash
cd src/web
bun install
bun run dev     # Vite dev server, usually http://localhost:5173
```

### Run tests

```bash
cd src/api/ModerationSystem.Tests
dotnet test
```

## Project structure

```
src/
  api/
    ModerationSystem.Api/       # ASP.NET Core backend
      Controllers/              # HTTP layer (Auth, Post, User, Report)
      Services/                 # Business logic + AI + SignalR
      Models/Entities/          # EF Core entities
      Data/AppDbContext.cs
      Migrations/
    ModerationSystem.Tests/     # xUnit tests
  web/
    src/
      api/                      # Fetch clients per domain
      pages/                    # Full-page views
      components/               # Feature + Shadcn UI components
      hooks/
      router/routes.tsx
infrastructure/
  terraform/                    # AWS resources (ECS, RDS, ECR, Cognito)
.github/workflows/              # CI/CD (lint + type-check, ECR publish, deploy)
docker-compose.yml
```

## CI / CD

| Workflow | Trigger | Action |
|---|---|---|
| `quality-gate.yml` | Push / PR to `main` | Lint + type-check + backend tests + Vite build; manual approval gate for production; email notification on pass/fail |
| `auto-deploy.yml` | Push to `main` | SSH into EC2, pull latest, write `.env` from secrets, restart containers with `docker compose up -d --build` |
| `publish-ecr.yml` | Tag `v*` | Build API Docker image and push to ECR |
| `manual-deployment.yml` | Manual (workflow dispatch) | Deploy a specific ECR image tag to staging or production ECS |

The two deploy paths target different environments:
- **EC2 (auto-deploy)** — lightweight, triggered automatically on every merge to `main`
- **ECS (manual)** — production-grade, requires a tagged ECR image and explicit approval
