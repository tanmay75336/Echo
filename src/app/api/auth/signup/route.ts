import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { hashPassword, setSessionCookie } from "@/lib/auth/session";
import { z } from "zod";

const SignupSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  workspaceName: z.string().min(2, "Workspace name must be at least 2 characters").optional(),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const data = SignupSchema.parse(body);

    const existingUser = await prisma.user.findUnique({
      where: { email: data.email.toLowerCase() },
    });

    if (existingUser) {
      return NextResponse.json({ error: "Email is already registered" }, { status: 400 });
    }

    const passwordHash = await hashPassword(data.password);

    // Create user and initial workspace in a transaction
    const user = await prisma.$transaction(async (tx) => {
      const newUser = await tx.user.create({
        data: {
          name: data.name,
          email: data.email.toLowerCase(),
          passwordHash,
        },
      });

      const wsName = data.workspaceName || `${data.name}'s Workspace`;
      const slug = `${wsName.toLowerCase().replace(/[^a-z0-9]/g, "-")}-${Date.now().toString().slice(-4)}`;

      const workspace = await tx.workspace.create({
        data: {
          name: wsName,
          slug,
          members: {
            create: {
              userId: newUser.id,
              role: "OWNER",
            },
          },
        },
      });

      return {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        workspaceId: workspace.id,
      };
    });

    await setSessionCookie({
      userId: user.id,
      email: user.email,
      workspaceId: user.workspaceId,
    });

    return NextResponse.json({
      success: true,
      user,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Signup failed";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
