import { seedDemoWorkspace } from "../src/lib/demo/seedDb";
import { prisma } from "../src/lib/db/prisma";

async function main() {
  console.log("🌱 Seeding realistic Echo demo workspace...");
  const result = await seedDemoWorkspace();
  console.log(`✅ Demo workspace seeded successfully:`);
  console.log(`   User: ${result.user.email} (Password: demouser123)`);
  console.log(`   Workspace: ${result.workspace.name} (${result.workspace.slug})`);
  console.log(`   Conversation ID: ${result.conversationId}`);
}

main()
  .catch((e) => {
    console.error("❌ Seeding failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
