import { drizzle } from "drizzle-orm/postgres-js"
import postgres from "postgres";

if (!process.env.CONNECTION_STRING)
  throw new Error("No connection string specified")

const queryClient = postgres(process.env.CONNECTION_STRING, { max: 10, max_lifetime: 30*60, idle_timeout: 20 })

export const database = drizzle(queryClient)