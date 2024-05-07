import { migrate } from "drizzle-orm/postgres-js/migrator";
import { database, pool } from './setup';

(async () => {
  try {
    await migrate(database, { migrationsFolder: "sql" });
    console.log("Migration complete");
  } catch (error) {
    console.log(error);
  } finally {
    pool.end()
  }
})()

