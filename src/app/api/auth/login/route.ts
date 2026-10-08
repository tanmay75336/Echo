import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { comparePassword, setSessionCookie } from "@/lib/auth/session";
import { z } from "zod";

const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, password } = LoginSchema.parse(body);

    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
      include: {
        memberships: {
          include: { workspace: true },
        },
      },
    });

    if (!user) {
      return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
    }

    const isValid = await comparePassword(password, user.passwordHash);
    if (!isValid) {
      return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
    }

    const defaultWorkspace = user.memberships[0]?.workspace;
    if (!defaultWorkspace) {
      return NextResponse.json({ error: "No workspace associated with this user" }, { status: 400 });
    }

    await setSessionCookie({
      userId: user.id,
      email: user.email,
      workspaceId: defaultWorkspace.id,
    });

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        workspaceId: defaultWorkspace.id,
      },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Login failed";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
