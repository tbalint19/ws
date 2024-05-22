import { Elysia, InternalServerError, error, t } from "elysia";
import { authPlugin } from "../../plugin/auth";
import { database } from "../../database/setup";
import { createInsertSchema } from "drizzle-typebox";
import { AuthenticationError } from "../../lib/authPlugin";
import { location } from "../../database/schema";
import { eq, isNull, count } from "drizzle-orm";

const LocationSchema = createInsertSchema(location)
const NewLocationSchema = t.Omit(LocationSchema, [ 'id', 'createdAt', 'updatedAt' ])
const UpdateLocationSchema = t.Omit(LocationSchema, [ 'id', 'createdAt', 'updatedAt' ])

export const locations = new Elysia()
  .use(authPlugin)
  .get("/api/locations", async (ctx) => {
    if (!ctx.user)
      throw new AuthenticationError()

    const result = await database
      .select()
      .from(location)
      .catch(() => {})

    if (!result)
      throw new InternalServerError()

    return result
  })
  .post("/api/locations", async (ctx) => {
    if (!ctx.user)
      throw new AuthenticationError()

    const result = await database
      .insert(location)
      .values(ctx.body)
      .returning()
      .catch(() => {})

    if (!result)
      throw new InternalServerError()

    return result[0]
  }, {
    body: NewLocationSchema
  })
  .patch("/api/locations/:id", async (ctx) => {
    if (!ctx.user)
      throw new AuthenticationError() 

    const result = await database
      .update(location)
      .set(ctx.body)
      .where(eq(location.id, ctx.params.id))
      .returning()
      .catch(() => {})

    if (!result)
      throw new InternalServerError()

    return result[0]
  }, {
    body: UpdateLocationSchema
  })
  .delete("/api/locations/:id", async (ctx) => {
    if (!ctx.user)
      throw new AuthenticationError()

    // TODO Check if location has products

    const result = await database
      .delete(location)
      .where(eq(location.id, ctx.params.id))
      .returning()
      .catch(() => {})

    if (!result)
      throw new InternalServerError()

    return result[0]
  })