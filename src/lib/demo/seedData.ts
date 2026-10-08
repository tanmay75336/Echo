export interface RawDemoMessage {
  speaker: string;
  timestamp: string;
  content: string;
}

export const REALISTIC_DEMO_CONVERSATION: RawDemoMessage[] = [
  { speaker: "Tanmay", timestamp: "09:30 AM", content: "Good morning team! Let's kick off our sprint planning for Echo." },
  { speaker: "Amit", timestamp: "09:31 AM", content: "Morning Tanmay! Ready when you guys are." },
  { speaker: "Rahul", timestamp: "09:32 AM", content: "Morning all. Just grabbing coffee, give me 2 mins." },
  { speaker: "Sneha", timestamp: "09:33 AM", content: "Morning! I reviewed the PR from yesterday, looks solid overall." },
  { speaker: "Tanmay", timestamp: "09:35 AM", content: "Great. Our key deliverable for this week is the conversation ingestion and action board extraction." },
  { speaker: "Amit", timestamp: "09:36 AM", content: "For the frontend, what formats are we prioritizing first?" },
  { speaker: "Tanmay", timestamp: "09:37 AM", content: "WhatsApp exports, Slack text, Zoom/meeting transcripts, and raw text paste." },
  { speaker: "Rahul", timestamp: "09:38 AM", content: "I was looking at the DB layer. Should we use MongoDB or PostgreSQL for the relational mappings?" },
  { speaker: "Sneha", timestamp: "09:40 AM", content: "MongoDB is fast to set up, but what about the source traceability? We need exact foreign keys from tasks back to conversation messages." },
  { speaker: "Tanmay", timestamp: "09:41 AM", content: "Exactly. The foreign key constraint between extracted entities and source messages is non-negotiable." },
  { speaker: "Rahul", timestamp: "09:43 AM", content: "Agreed. Let's use PostgreSQL for our production database with Prisma ORM because of the strict relational model." },
  { speaker: "Tanmay", timestamp: "09:44 AM", content: "Decision confirmed: PostgreSQL + Prisma. Rahul, please configure PostgreSQL and initial Prisma schema." },
  { speaker: "Rahul", timestamp: "09:45 AM", content: "I will finish the backend auth and ingestion API by Wednesday." },
  { speaker: "Amit", timestamp: "09:47 AM", content: "Nice! Once that's ready, I can wire up the three-panel conversation viewer." },
  { speaker: "Sneha", timestamp: "09:49 AM", content: "Should we deploy on AWS ECS or stick to Vercel and Neon for the initial pilot?" },
  { speaker: "Tanmay", timestamp: "09:51 AM", content: "Good question. Let's see how our Docker build performs first before committing to AWS." },
  { speaker: "Amit", timestamp: "09:53 AM", content: "Also, what about the investor presentation slides?" },
  { speaker: "Amit", timestamp: "09:54 AM", content: "I'll prepare the PPT and slide deck by Thursday afternoon." },
  { speaker: "Tanmay", timestamp: "09:56 AM", content: "Thanks Amit. Tanmay, I will prepare project screenshots and demo walk-through by Thursday." },
  { speaker: "Sneha", timestamp: "09:58 AM", content: "I will write the Vitest integration suite and test all chat parsers by Friday." },
  { speaker: "Rahul", timestamp: "10:02 AM", content: "Anyone wants coffee? Heading to the pantry." },
  { speaker: "Amit", timestamp: "10:03 AM", content: "Get me an iced latte please!" },
  { speaker: "Rahul", timestamp: "10:04 AM", content: "Done." },
  { speaker: "Tanmay", timestamp: "10:15 AM", content: "Back to the architecture. How are we doing prompt structuring for the AI extraction?" },
  { speaker: "Rahul", timestamp: "10:17 AM", content: "We should enforce strict Zod schemas and JSON mode. No raw prose parsing." },
  { speaker: "Sneha", timestamp: "10:19 AM", content: "Agreed. If the AI model returns an invalid message index like #999, we must reject it in code." },
  { speaker: "Tanmay", timestamp: "10:20 AM", content: "Yes! Deterministic post-processing is our safety net." },
  { speaker: "Amit", timestamp: "10:22 AM", content: "What color theme are we going with for the UI? Linear dark or Notion clean light?" },
  { speaker: "Tanmay", timestamp: "10:25 AM", content: "Let's go with a sleek, high-contrast dark theme inspired by Linear with restrained indigo accents." },
  { speaker: "Amit", timestamp: "10:26 AM", content: "Love that. I will start building the component design system today." },
  { speaker: "Sneha", timestamp: "10:30 AM", content: "Who is responsible for rate-limiting the upload endpoints?" },
  { speaker: "Tanmay", timestamp: "10:32 AM", content: "Rahul, can you add rate-limiting to the conversation upload endpoint?" },
  { speaker: "Rahul", timestamp: "10:34 AM", content: "Yes, I'll add rate-limiting with a 10MB file limit." },
  { speaker: "Amit", timestamp: "11:00 AM", content: "Quick check: on the mobile layout, should the AI intelligence panel be a bottom drawer?" },
  { speaker: "Tanmay", timestamp: "11:02 AM", content: "Yes, on mobile use a responsive bottom sheet instead of squishing columns." },
  { speaker: "Sneha", timestamp: "11:15 AM", content: "Hey guys, quick question on Auth: are we supporting social OAuth or email/password first?" },
  { speaker: "Tanmay", timestamp: "11:17 AM", content: "Email and password with secure bcrypt and JWT session cookie first for the MVP." },
  { speaker: "Rahul", timestamp: "02:15 PM", content: "Hey team, heads up — I have family visiting unexpectedly and won't be available until Friday." },
  { speaker: "Amit", timestamp: "02:18 PM", content: "Wait Rahul, didn't you commit to finishing backend auth and ingestion by Wednesday?" },
  { speaker: "Tanmay", timestamp: "02:20 PM", content: "This is a potential blocker for Amit's frontend integration. Rahul, can you hand off the database migrations to Sneha?" },
  { speaker: "Rahul", timestamp: "02:22 PM", content: "Yes, I can push the schema branch right now before I leave." },
  { speaker: "Sneha", timestamp: "02:24 PM", content: "Got it, I'll take over the schema migrations so Amit isn't blocked." },
  { speaker: "Amit", timestamp: "02:26 PM", content: "Phew, that saves us. Thanks Sneha!" },
  { speaker: "Tanmay", timestamp: "02:30 PM", content: "Sneha, please review the backend PR by Wednesday EOD." },
  { speaker: "Sneha", timestamp: "02:31 PM", content: "Will do, on it." },
  { speaker: "Amit", timestamp: "03:45 PM", content: "The task board will have TODO, IN_PROGRESS, BLOCKED, and DONE columns, right?" },
  { speaker: "Tanmay", timestamp: "03:47 PM", content: "Yes, with priority badges (Low, Medium, High, Urgent) and source citation pills." },
  { speaker: "Sneha", timestamp: "04:10 PM", content: "Did we decide on how long we keep conversation data in the database?" },
  { speaker: "Tanmay", timestamp: "04:15 PM", content: "Users should have full privacy control: they can delete conversations, projects, or their workspace anytime." },
  { speaker: "Amit", timestamp: "04:30 PM", content: "Awesome. I'm wrapping up the landing page hero copy: 'Your conversations are full of decisions. Echo turns them into action.'" },
  { speaker: "Tanmay", timestamp: "04:32 PM", content: "That tagline is gold. Let's make sure the interactive demo is front and center." },
  { speaker: "Rahul", timestamp: "05:00 PM", content: "Schema branch pushed: feature/prisma-postgres-models. Over to you Sneha." },
  { speaker: "Sneha", timestamp: "05:05 PM", content: "Branch pulled. Looking at it now." },
  { speaker: "Tanmay", timestamp: "05:30 PM", content: "Great sync today everyone. Let's execute!" },
];

export function getDemoConversationText(): string {
  return REALISTIC_DEMO_CONVERSATION.map(
    (m) => `[${m.timestamp}] ${m.speaker}: ${m.content}`
  ).join("\n");
}
