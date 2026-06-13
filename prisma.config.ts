import "dotenv/config";
import { defineConfig, env } from "@prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",

  datasource: {
    url: env("DATABASE_URL"),        // For runtime (your app)
    // directUrl: env("DIRECT_URL"), // Uncomment if you have separate direct connection
  },
});