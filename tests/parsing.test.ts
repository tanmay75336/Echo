import { describe, it, expect } from "vitest";
import { parseConversation, detectFormat } from "../src/lib/parsing";

describe("Conversation Ingestion & Parsing", () => {
  it("detects and parses WhatsApp format correctly", () => {
    const waText = `[10/24/23, 10:15:00 AM] Rahul: I'll finish backend Wednesday
[10/24/23, 10:16:30 AM] Tanmay: Great, Amit will prepare PPT`;

    const result = parseConversation(waText);
    expect(result.format).toBe("WHATSAPP");
    expect(result.messages.length).toBe(2);
    expect(result.messages[0].speaker).toBe("Rahul");
    expect(result.messages[0].content).toBe("I'll finish backend Wednesday");
    expect(result.messages[0].timestamp).toContain("10/24/23");
    expect(result.participants).toContain("Rahul");
    expect(result.participants).toContain("Tanmay");
  });

  it("detects and parses Slack headers correctly", () => {
    const slackText = `Rahul [10:15 AM]
I will take care of the database migration
Amit [10:20 AM]
I am on the UI components`;

    const result = parseConversation(slackText);
    expect(result.format).toBe("SLACK");
    expect(result.messages.length).toBe(2);
    expect(result.messages[0].speaker).toBe("Rahul");
    expect(result.messages[0].content).toContain("database migration");
  });

  it("detects and parses Meeting Transcripts correctly", () => {
    const transcriptText = `[00:12:45] Rahul: Let's use PostgreSQL for our database.
[00:13:10] Tanmay: Agreed, let's proceed with PostgreSQL.`;

    const result = parseConversation(transcriptText);
    expect(result.format).toBe("TRANSCRIPT");
    expect(result.messages.length).toBe(2);
    expect(result.messages[0].timestamp).toBe("00:12:45");
    expect(result.messages[0].speaker).toBe("Rahul");
  });

  it("detects and parses CSV format correctly", () => {
    const csvText = `Speaker,Timestamp,Message
Rahul,09:30 AM,"I will finish backend Wednesday"
Tanmay,09:35 AM,"Decision confirmed on Postgres"`;

    const result = parseConversation(csvText);
    expect(result.format).toBe("CSV");
    expect(result.messages.length).toBe(2);
    expect(result.messages[0].speaker).toBe("Rahul");
    expect(result.messages[0].content).toBe("I will finish backend Wednesday");
  });

  it("parses generic multi-line conversations", () => {
    const genericText = `Rahul: First line of thought.
Second line continuing the thought.
Tanmay: Understood!`;

    const result = parseConversation(genericText);
    expect(result.messages.length).toBe(2);
    expect(result.messages[0].speaker).toBe("Rahul");
    expect(result.messages[0].content).toContain("Second line continuing");
  });
});
