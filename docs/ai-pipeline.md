# AI Pipeline & Source Traceability — Echo

## Pipeline Architecture

The intelligence pipeline takes a normalized list of conversation messages and extracts:
1. **Summary & Overview**: High-level abstract, key takeaways, and discussion topics.
2. **Action Items / Tasks**: Titles, descriptions, priorities, deadlines, assignees, and source indices.
3. **Decisions**: Formal decisions agreed upon, rationale, status, and participants.
4. **Commitments**: First-person explicit pledges ("I will deliver the OpenAPI spec tomorrow").
5. **Unresolved Items**: Open questions or ambiguities needing clarification.
6. **Contradictions & Conflicts**: Disagreements between participants or contradictory deadlines/commitments.
7. **Entities**: Technologies, documents, external tools, and system components mentioned.

## Verification & Traceability

1. **Order Index Matching**: Each message parsed is assigned a sequential `orderIndex` (0, 1, 2, ...).
2. **AI Citation**: The extraction schema requires `sourceMessageOrderIndex: z.number().int().min(0)`.
3. **Database Linking**: When persisting items to Prisma in an atomic transaction:
   - The message ID matching `orderIndex` is linked to `sourceMessageId`.
   - The item maintains `sourceMessageOrderIndex` for instant zero-latency UI matching.
4. **Interactive Jump**:
   - In the 3-panel Conversation Viewer (`src/app/conversations/[id]/ConversationViewerClient.tsx`), clicking the **Source** pill immediately:
     - Dispatches an active message scroll event.
     - Automatically smoothly centers the source message in view.
     - Applies the CSS animation class `highlight-flash` (electric blue/indigo glow with pulsing ring).

## Supported Providers

- **Google Gemini**: Uses `@google/generative-ai` with structured JSON schema response MIME type.
- **OpenAI**: Uses `openai` package with `response_format: { type: "json_object" }`.
- **Local Heuristics**: Pure TypeScript regex and sentence analysis fallback. Ensures offline functionality, instant unit test speed, and zero API costs during development.
