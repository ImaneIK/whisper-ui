// scripts/check-db.ts
import { prisma } from '@/lib/prisma';

async function checkConnection() {
  try {
    console.log("🔄 Testing database connection...");

    // Simple test query
    const result = await prisma.$queryRaw`SELECT 1 as connected;`;
    console.log("✅ Database is connected successfully!", result);

    // Optional: Check your models (if you have any)
    const userCount = await prisma.company.count(); // change 'user' to your actual model name
    console.log(`📊 Found ${userCount} companies in the database.`);

  } catch (error: any) {
    console.error("❌ Database connection failed:");
    console.error(error.message);
    if (error.code) console.error("Error Code:", error.code);
  } finally {
    await prisma.$disconnect();
  }
}

checkConnection();