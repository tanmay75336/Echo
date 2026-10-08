import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";
import { AppShell } from "@/components/layout/AppShell";
import { SettingsClient } from "./SettingsClient";

export default async function SettingsPage() {
  const user = await getCurrentUser();
  if (!user || !user.currentWorkspace) {
    redirect("/login");
  }

  const workspace = await prisma.workspace.findUnique({
    where: { id: user.currentWorkspace.id },
    include: {
      members: {
        include: { user: { select: { id: true, name: true, email: true } } },
      },
      _count: {
        select: {
          conversations: true,
          tasks: true,
          decisions: true,
          commitments: true,
          projects: true,
        },
      },
    },
  });

  return (
    <AppShell
      user={{
        name: user.name,
        email: user.email,
        currentWorkspace: {
          name: user.currentWorkspace.name,
          slug: user.currentWorkspace.slug,
        },
      }}
    >
      <SettingsClient user={user} workspace={workspace} />
    </AppShell>
  );
}
