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

## Architecture Decision Records

### ADR-1: PostgreSQL as the primary database

**Decision:** PostgreSQL hosted on AWS RDS (production) and as a Docker container (local).

**Context:** We needed a relational database that could handle the social graph (follows, likes, replies) with referential integrity, support soft-delete patterns, and integrate smoothly with Entity Framework Core.

**Alternatives considered:**
- *MySQL / MariaDB* — similar capability, wider hosting support
- *MongoDB* — document model fits posts naturally but loses relational guarantees for the social graph
- *SQLite* — fine for local dev but not suitable for production multi-instance deployments

**Rationale:** PostgreSQL has first-class support in Npgsql (the EF Core provider), handles composite-key join tables (`PostLikes`, `UserFollows`) cleanly, and RDS makes managed hosting straightforward. The team already had PostgreSQL experience.

**Trade-offs:** More ops overhead than a managed NoSQL service; schema migrations must be applied deliberately (`dotnet ef database update`). Horizontal write scaling would require additional work (read replicas, sharding) if the platform grew significantly.

---

### ADR-2: AWS Cognito for authentication

**Decision:** User registration, login, and JWT issuance are delegated entirely to AWS Cognito. The backend only validates tokens — it never stores passwords.

**Context:** Building a secure auth system (hashing, token rotation, email verification, brute-force protection) from scratch is high-risk and time-consuming. We needed email + password auth with email confirmation out of the box.

**Alternatives considered:**
- *Custom JWT auth* — full control, but significant security surface
- *Auth0 / Clerk* — polished DX, but adds a third-party dependency and cost at scale
- *Keycloak (self-hosted)* — open-source, but heavy to operate

**Rationale:** Cognito integrates natively with the rest of the AWS stack already in use (IAM, RDS, Bedrock). Standard `JwtBearer` middleware validates tokens without any custom code. Email verification and password reset come for free.

**Trade-offs:** Cognito's API is verbose and its error messages are opaque. Local development requires real AWS credentials — there is no fully offline auth path. Vendor lock-in to AWS is deepened.

---

### ADR-3: AWS Bedrock (Meta Llama 3.2 1B) for content moderation

**Decision:** Every post is scored for harmful content by calling the Llama 3.2 1B Instruct model via the AWS Bedrock managed inference API. The result is written to an audit `Logs` table.

**Context:** The platform needed automatic content moderation at post-creation time. Running a model in-process or self-hosting would add significant infrastructure complexity. The model had to be invokable from the existing .NET backend without a Python sidecar.

**Alternatives considered:**
- *OpenAI moderation API* — purpose-built endpoint, very simple, but adds an external paid dependency outside the AWS ecosystem
- *AWS Comprehend* — native AWS service, but limited to sentiment/entity tasks, not flexible enough for custom moderation prompts
- *Self-hosted model on ECS* — full control, no per-call cost at scale, but requires GPU instances and MLOps work
- *Larger Llama variant (8B / 70B)* — higher accuracy, but significantly higher latency and cost per inference

**Rationale:** Bedrock keeps everything inside AWS (same IAM role, same VPC), requires no additional infrastructure, and the AWSSDK.BedrockRuntime package works directly from .NET. The 1B parameter model is fast enough to run synchronously during post creation without noticeably degrading API response time.

**Trade-offs:** Per-call cost at high volume; the 1B model is less accurate than larger variants and may miss nuanced policy violations. Moderation prompt quality directly determines effectiveness — this is not a calibrated classifier. Cold-start latency on Bedrock can occasionally spike.

---

### ADR-4: SignalR for real-time event delivery

**Decision:** Moderation results and user notifications are pushed from the server to connected browser clients using ASP.NET Core SignalR over WebSockets (with long-polling fallback).

**Context:** After a post is moderated, the result needs to appear in the UI without the user polling. Notifications (follows, likes, replies) also need to be delivered promptly.

**Alternatives considered:**
- *Server-Sent Events (SSE)* — simpler protocol, browser-native, unidirectional — sufficient for push-only scenarios
- *Raw WebSockets* — full control, but requires manual connection management, reconnect logic, and message framing
- *Polling* — simplest implementation, but wasteful and adds latency
- *AWS API Gateway WebSocket* — serverless, but requires a significant architectural shift away from ECS-hosted API

**Rationale:** SignalR is first-class in ASP.NET Core with zero additional dependencies. It handles reconnection, transport negotiation, and hub abstractions automatically. The `@microsoft/signalr` JS client pairs directly with the server hub. Given the backend is already .NET, this was the lowest-friction real-time option.

**Trade-offs:** SignalR connections are stateful and sticky — horizontal scaling requires a backplane (e.g., Redis). In the current single-instance deployment this is not an issue, but it becomes a constraint before scaling out. WebSocket connections also consume server resources proportional to concurrent users.

---

### ADR-5: React SPA (Vite + Bun) instead of a server-rendered framework

**Decision:** The frontend is a client-rendered React 19 SPA built with Vite and bundled/run with Bun. It is served as static files from Nginx.

**Context:** We needed a modern, fast frontend DX that the team could iterate on quickly. The application is highly interactive (infinite scroll feed, real-time updates, dialogs) — characteristics that suit a client-rendered approach.

**Alternatives considered:**
- *Next.js (App Router)* — SSR/SSG, better SEO, larger ecosystem — the most common React alternative
- *Remix* — server-side data loading, progressive enhancement
- *SvelteKit* — smaller bundle, but different language means onboarding cost

**Rationale:** A social media feed behind authentication has minimal SEO requirements (content is not public-crawlable). The Vite dev server is significantly faster than Next.js for hot-reload iteration. Bun replaces npm/yarn and speeds up installs and script runs. Serving static files from Nginx decouples frontend deployment from the API.

**Trade-offs:** No server-side rendering means a longer time-to-first-meaningful-paint on slow connections and no built-in SEO for public pages. Public post URLs, if ever needed, would require additional SSR or pre-rendering work. The static bundle must be rebuilt and redeployed whenever frontend code changes.
