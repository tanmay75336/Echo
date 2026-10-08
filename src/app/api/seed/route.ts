import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { seedDemoWorkspace } from "@/lib/demo/seedDb";

export async function POST() {
  try {
    const user = await getCurrentUser();
    const result = await seedDemoWorkspace(user?.id);
    return NextResponse.json({ success: true, ...result });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to seed demo data";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
