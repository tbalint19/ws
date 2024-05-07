import { Elysia, t } from "elysia";
import { authPlugin } from "../plugin/auth";
import { database } from "../database/setup";
import { createInsertSchema } from "drizzle-typebox";
import { AuthenticationError } from "../lib/authPlugin";

/* 
const newCarSchema = createInsertSchema(cars, {
  id: t.Undefined(),
}) */

export const demo = new Elysia()
  .use(authPlugin)
  .post('/api/cars', async (ctx) => {
    if (!ctx.user)
      throw new AuthenticationError()

    return ""
  })