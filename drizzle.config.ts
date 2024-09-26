import "dotenv/config";

import { defineConfig } from "drizzle-kit";
export default defineConfig({
  dialect: "postgresql",
  schema: "./src/drizzle/schema/*",
  out: "./src/drizzle/migrationszzle",
  dbCredentials: {
    url: process.env.DATABASE_DIRECT_URL || "",
  },
});
