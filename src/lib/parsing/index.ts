export interface NormalizedMessage {
  id: string;
  orderIndex: number;
  speaker: string | null;
  timestamp: string | null;
  content: string;
  metadata?: Record<string, unknown>;
}

export type ConversationSourceFormat =
  | "WHATSAPP"
  | "SLACK"
  | "DISCORD"
  | "TELEGRAM"
  | "TRANSCRIPT"
  | "CSV"
  | "TEXT";

export interface ParseResult {
  format: ConversationSourceFormat;
  messages: NormalizedMessage[];
  participants: string[];
  rawText: string;
}

// WhatsApp pattern examples:
// [10/24/23, 10:15:30 AM] Rahul: Let's do this
// 24/10/2023, 10:15 - Rahul: Let's do this
const WHATSAPP_REGEX_1 = /^\[?(\d{1,2}[/-]\d{1,2}[/-]\d{2,4}[,\s]+(?:\d{1,2}:\d{2}(?::\d{2})?(?:\s*[APap][Mm])?))\]?\s*[-–—]?\s*([^:]+?):\s*(.*)$/;
const WHATSAPP_REGEX_2 = /^(\d{1,2}\/\d{1,2}\/\d{2,4},\s*\d{1,2}:\d{2}\s*(?:am|pm|AM|PM)?)\s*-\s*([^:]+?):\s*(.*)$/;

// Meeting Transcript patterns:
// [00:12:45] Rahul: Let's check the database
// Rahul (00:12:45): Let's check
// Speaker 1 (Rahul): Let's check
const TRANSCRIPT_REGEX_1 = /^\[?(\d{1,2}:\d{2}(?::\d{2})?(?:\s*[APap][Mm])?)\]?\s*(?:Speaker\s*\d+\s*\()?(.*?)(?:\))?:\s*(.*)$/;
const TRANSCRIPT_REGEX_2 = /^Speaker\s*(\d+|[A-Za-z]+)(?:\s*\((.*?)\))?:\s*(.*)$/;

// Slack export pattern:
// Rahul [10:15 AM]
// or Rahul 10:15 AM
const SLACK_HEADER_REGEX = /^([A-Za-z0-9\s._-]+?)\s+\[?(\d{1,2}:\d{2}(?:\s*[APap][Mm])?)\]?$/;

// Discord pattern:
// Rahul — 10/24/2023 10:15 AM
const DISCORD_HEADER_REGEX = /^([A-Za-z0-9\s._-]+?)\s*—\s*(\d{1,2}\/\d{1,2}\/\d{2,4}\s+\d{1,2}:\d{2}(?:\s*[APap][Mm])?)$/;

// Telegram pattern:
// Rahul, [24.10.2023 10:15]
const TELEGRAM_HEADER_REGEX = /^([A-Za-z0-9\s._-]+?),\s*\[(\d{1,2}\.\d{1,2}\.\d{2,4}\s+\d{1,2}:\d{2})\]$/;

// Generic "Speaker: Message" pattern
const GENERIC_SPEAKER_REGEX = /^([A-Za-z0-9\s._-]{2,30}):\s*(.+)$/;

export function detectFormat(text: string): ConversationSourceFormat {
  const lines = text.split(/\r?\n/).filter((l) => l.trim().length > 0);
  if (lines.length === 0) return "TEXT";

  // Check CSV: first line contains commas with speaker/name/message keywords
  const firstLine = lines[0].toLowerCase();
  if (
    firstLine.includes(",") &&
    (firstLine.includes("speaker") || firstLine.includes("message") || firstLine.includes("content") || firstLine.includes("text"))
  ) {
    return "CSV";
  }

  let waCount = 0;
  let slackCount = 0;
  let discordCount = 0;
  let telegramCount = 0;
  let transcriptCount = 0;
  let genericCount = 0;

  for (const line of lines.slice(0, 20)) {
    if (WHATSAPP_REGEX_1.test(line) || WHATSAPP_REGEX_2.test(line)) waCount++;
    else if (SLACK_HEADER_REGEX.test(line)) slackCount++;
    else if (DISCORD_HEADER_REGEX.test(line)) discordCount++;
    else if (TELEGRAM_HEADER_REGEX.test(line)) telegramCount++;
    else if (TRANSCRIPT_REGEX_1.test(line) || TRANSCRIPT_REGEX_2.test(line)) transcriptCount++;
    else if (GENERIC_SPEAKER_REGEX.test(line)) genericCount++;
  }

  if (waCount >= 2) return "WHATSAPP";
  if (slackCount >= 2) return "SLACK";
  if (discordCount >= 2) return "DISCORD";
  if (telegramCount >= 2) return "TELEGRAM";
  if (transcriptCount >= 2) return "TRANSCRIPT";
  if (genericCount >= 2) return "TEXT";

  return "TEXT";
}

export function parseCSV(rawText: string): NormalizedMessage[] {
  const lines = rawText.split(/\r?\n/).filter((l) => l.trim().length > 0);
  if (lines.length === 0) return [];

  const header = lines[0].split(",").map((h) => h.trim().toLowerCase().replace(/^["']|["']$/g, ""));
  const speakerIdx = header.findIndex((h) => h.includes("speaker") || h.includes("name") || h.includes("sender") || h.includes("author") || h.includes("user"));
  const contentIdx = header.findIndex((h) => h.includes("message") || h.includes("content") || h.includes("text") || h.includes("body"));
  const timeIdx = header.findIndex((h) => h.includes("time") || h.includes("date") || h.includes("timestamp"));

  const messages: NormalizedMessage[] = [];
  for (let i = 1; i < lines.length; i++) {
    const rawLine = lines[i];
    // Simple CSV parser supporting quotes
    const values: string[] = [];
    let cur = "";
    let inQuotes = false;
    for (let c = 0; c < rawLine.length; c++) {
      const char = rawLine[c];
      if (char === '"' || char === "'") {
        inQuotes = !inQuotes;
      } else if (char === "," && !inQuotes) {
        values.push(cur.trim());
        cur = "";
      } else {
        cur += char;
      }
    }
    values.push(cur.trim());

    const content = contentIdx !== -1 ? values[contentIdx] : values.slice(1).join(", ");
    if (!content) continue;

    messages.push({
      id: `msg-${messages.length + 1}`,
      orderIndex: messages.length + 1,
      speaker: speakerIdx !== -1 && values[speakerIdx] ? values[speakerIdx] : null,
      timestamp: timeIdx !== -1 && values[timeIdx] ? values[timeIdx] : null,
      content,
    });
  }

  return messages;
}

export function parseConversation(rawText: string): ParseResult {
  const format = detectFormat(rawText);

  if (format === "CSV") {
    const messages = parseCSV(rawText);
    const participants = Array.from(new Set(messages.map((m) => m.speaker).filter(Boolean) as string[]));
    return { format, messages, participants, rawText };
  }

  const lines = rawText.split(/\r?\n/);
  const messages: NormalizedMessage[] = [];
  let currentMessage: NormalizedMessage | null = null;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    // Check WhatsApp 1
    const wa1Match = line.match(WHATSAPP_REGEX_1);
    if (wa1Match) {
      if (currentMessage) messages.push(currentMessage);
      currentMessage = {
        id: `msg-${messages.length + 1}`,
        orderIndex: messages.length + 1,
        timestamp: wa1Match[1].trim(),
        speaker: wa1Match[2].trim(),
        content: wa1Match[3].trim(),
      };
      continue;
    }

    // Check WhatsApp 2
    const wa2Match = line.match(WHATSAPP_REGEX_2);
    if (wa2Match) {
      if (currentMessage) messages.push(currentMessage);
      currentMessage = {
        id: `msg-${messages.length + 1}`,
        orderIndex: messages.length + 1,
        timestamp: wa2Match[1].trim(),
        speaker: wa2Match[2].trim(),
        content: wa2Match[3].trim(),
      };
      continue;
    }

    // Check Discord header
    const discordMatch = line.match(DISCORD_HEADER_REGEX);
    if (discordMatch) {
      if (currentMessage) messages.push(currentMessage);
      currentMessage = {
        id: `msg-${messages.length + 1}`,
        orderIndex: messages.length + 1,
        speaker: discordMatch[1].trim(),
        timestamp: discordMatch[2].trim(),
        content: "",
      };
      continue;
    }

    // Check Telegram header
    const telegramMatch = line.match(TELEGRAM_HEADER_REGEX);
    if (telegramMatch) {
      if (currentMessage) messages.push(currentMessage);
      currentMessage = {
        id: `msg-${messages.length + 1}`,
        orderIndex: messages.length + 1,
        speaker: telegramMatch[1].trim(),
        timestamp: telegramMatch[2].trim(),
        content: "",
      };
      continue;
    }

    // Check Slack header
    const slackMatch = line.match(SLACK_HEADER_REGEX);
    if (slackMatch && i + 1 < lines.length) {
      if (currentMessage) messages.push(currentMessage);
      currentMessage = {
        id: `msg-${messages.length + 1}`,
        orderIndex: messages.length + 1,
        speaker: slackMatch[1].trim(),
        timestamp: slackMatch[2].trim(),
        content: "",
      };
      continue;
    }

    // Check Transcript 1 [00:12] Rahul: ...
    const trans1Match = line.match(TRANSCRIPT_REGEX_1);
    if (trans1Match) {
      if (currentMessage) messages.push(currentMessage);
      currentMessage = {
        id: `msg-${messages.length + 1}`,
        orderIndex: messages.length + 1,
        timestamp: trans1Match[1].trim(),
        speaker: trans1Match[2].trim() || null,
        content: trans1Match[3].trim(),
      };
      continue;
    }

    // Check Transcript 2 Speaker 1 (Rahul): ...
    const trans2Match = line.match(TRANSCRIPT_REGEX_2);
    if (trans2Match) {
      if (currentMessage) messages.push(currentMessage);
      currentMessage = {
        id: `msg-${messages.length + 1}`,
        orderIndex: messages.length + 1,
        timestamp: null,
        speaker: trans2Match[2]?.trim() || `Speaker ${trans2Match[1]}`,
        content: trans2Match[3].trim(),
      };
      continue;
    }

    // Check Generic "Speaker: Message"
    const genericMatch = line.match(GENERIC_SPEAKER_REGEX);
    if (genericMatch && !line.startsWith("http://") && !line.startsWith("https://")) {
      if (currentMessage) messages.push(currentMessage);
      currentMessage = {
        id: `msg-${messages.length + 1}`,
        orderIndex: messages.length + 1,
        timestamp: null,
        speaker: genericMatch[1].trim(),
        content: genericMatch[2].trim(),
      };
      continue;
    }

    // Multi-line continuation: attach line to currentMessage content
    if (currentMessage) {
      currentMessage.content = currentMessage.content
        ? `${currentMessage.content}\n${line}`
        : line;
    } else {
      // First line without speaker prefix
      currentMessage = {
        id: `msg-${messages.length + 1}`,
        orderIndex: messages.length + 1,
        timestamp: null,
        speaker: null,
        content: line,
      };
    }
  }

  if (currentMessage) {
    messages.push(currentMessage);
  }

  // Filter out any completely empty content
  const cleanMessages = messages.filter((m) => m.content.trim().length > 0);

  const participants = Array.from(
    new Set(cleanMessages.map((m) => m.speaker).filter(Boolean) as string[])
  );

  return {
    format,
    messages: cleanMessages,
    participants,
    rawText,
  };
}
