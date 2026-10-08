# Database Schema & Entity Relations — Echo

Echo uses Prisma ORM with dual-compatibility for SQLite (`prisma/dev.db`) during development and PostgreSQL in production environments.

## Core Models

### Workspace & Multi-Tenancy
- **User**: User accounts with email, password hash (`bcryptjs`), name, avatar.
- **Workspace**: Root tenancy boundary for all conversations, projects, and items.
- **WorkspaceMember**: Roles (`OWNER`, `ADMIN`, `MEMBER`, `VIEWER`).

### Project & Conversations
- **Project**: Groups related conversations, tracks project health status, and aggregates tasks.
- **Conversation**: Ingested conversation metadata, raw text, detected source format, status (`RAW`, `PROCESSING`, `ANALYZED`, `ERROR`).
- **ConversationMessage**: Normalized messages with `orderIndex`, `sender`, `timestamp`, and `content`.
- **Analysis**: High-level structured summary, topics, extraction metadata, and versioning.
- **AnalysisVersion**: Historical audit log of re-analyses.

### Intelligence Artifacts
- **Task**: Action items with title, priority (`LOW`, `MEDIUM`, `HIGH`, `URGENT`), status (`TODO`, `IN_PROGRESS`, `BLOCKED`, `DONE`), deadline, and source reference.
- **TaskAssignee**: Many-to-many relationship linking tasks to team members.
- **Decision**: Agreements and architectural choices with `status` (`CONFIRMED`, `PROPOSED`, `SUPERSEDED`) and rationale.
- **Commitment**: First-person pledges with promisor name, promised action, deadline, and source reference.
- **UnresolvedItem**: Open questions, blockers, and questions needing answer with `status` (`OPEN`, `RESOLVED`, `DROPPED`).
- **Conflict**: Contradictions between messages with `statementA`, `statementB`, severity (`LOW`, `MEDIUM`, `HIGH`), and status.
- **Entity**: Extracted subjects (technologies, systems, links, organizations).

### Activity & Notifications
- **ActivityLog**: Workspace audit trail for created tasks, updated statuses, and imports.
- **Notification**: User-level notifications for assignment and unresolved blocker alerts.
- **Comment**: Discussion threads attached to tasks, decisions, or unresolved questions.
