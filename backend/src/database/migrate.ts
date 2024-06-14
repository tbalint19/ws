import { migrate } from "drizzle-orm/postgres-js/migrator";
import { drizzle } from "drizzle-orm/postgres-js"
import postgres from "postgres";

if (!process.env.CONNECTION_STRING)
  throw new Error("No connection string specified")

const migrationClient = postgres(process.env.CONNECTION_STRING, { max: 1 })
const database = drizzle(migrationClient);

const run = async () => {
  try {
    await migrate(database, { migrationsFolder: "sql" });
    console.log("Migration complete");
  } catch (error) {
    console.log(error);
  } finally {
    await migrationClient.end()
    console.log("Connection closed")
  }
}

run()

