import { createClient } from "@libsql/client"

const client = createClient({
  url: process.env.TURSO_DATABASE_URL!,
  authToken: process.env.TURSO_AUTH_TOKEN!,
  // Add connection resilience
  syncUrl: process.env.TURSO_DATABASE_URL!,
  syncInterval: 0, // Disable sync for better performance
})

export { client as db }
