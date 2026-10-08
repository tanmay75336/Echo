import { NextResponse } from "next/server";
import { setSessionCookie } from "@/lib/auth/session";
import { seedDemoWorkspace } from "@/lib/demo/seedDb";

export async function POST() {
  try {
    const demo = await seedDemoWorkspace();

    await setSessionCookie({
      userId: demo.user.id,
      email: demo.user.email,
      workspaceId: demo.workspace.id,
    });

    return NextResponse.json({
      success: true,
      user: demo.user,
      workspace: demo.workspace,
      conversationId: demo.conversationId,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Demo login failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
