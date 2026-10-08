# API Reference — Echo

All API routes are served under `/api` and require an authenticated session cookie (`echo_session`) unless otherwise specified.

## Authentication
- `POST /api/auth/demo` — Logs into the instant demo sandbox with seed data pre-populated (No credentials required).
- `POST /api/auth/login` — Authenticates user via email and password; sets secure JWT cookie.
- `POST /api/auth/signup` — Registers a new user and creates an initial workspace.
- `POST /api/auth/logout` — Clears the authentication session cookie.
- `GET /api/auth/me` — Returns the currently authenticated user and active workspace.

## Conversations & Ingestion
- `GET /api/conversations` — Lists conversations in the active workspace with message counts and intelligence statistics.
- `POST /api/conversations` — Ingests a new conversation from raw text or uploaded document. Parses format and extracts initial messages.
- `GET /api/conversations/[id]` — Retrieves conversation details, full message stream, and extracted intelligence.
- `DELETE /api/conversations/[id]` — Cascading deletion of conversation and all extracted items.
- `POST /api/conversations/[id]/analyze` — Triggers or re-runs the AI intelligence extraction pipeline.

## Intelligence Items
- `GET /api/tasks` | `POST /api/tasks` — List and create workspace tasks.
- `PATCH /api/tasks/[id]` | `DELETE /api/tasks/[id]` — Update task status, priority, assignee, or remove task.
- `GET /api/decisions` | `POST /api/decisions` | `PATCH /api/decisions/[id]` — Decisions log endpoints.
- `GET /api/commitments` | `POST /api/commitments` | `PATCH /api/commitments/[id]` — Commitments endpoints.
- `GET /api/unresolved` | `PATCH /api/unresolved/[id]` — Unresolved questions and resolution endpoints.
- `GET /api/conflicts` | `PATCH /api/conflicts/[id]` — Conflicts and contradiction tracking endpoints.

## Projects & Health
- `GET /api/projects` | `POST /api/projects` — Workspace project management.
- `GET /api/projects/[id]` | `PATCH /api/projects/[id]` — Project detail with real-time explainable health scoring.

## Search, Export & AI Copilot
- `GET /api/search?q={query}` — Global search across conversations, tasks, decisions, and messages.
- `GET /api/export?format={json|csv|markdown}` — Full workspace intelligence export.
- `POST /api/ask` — Ask Echo workspace copilot with strict grounded context.
