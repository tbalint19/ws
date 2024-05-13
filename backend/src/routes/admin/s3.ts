import { Elysia, t } from "elysia";
import { authPlugin } from "../../plugin/auth";
import { AuthenticationError } from "../../lib/authPlugin";
import { getUrlForDelete, getUrlForUpload } from "../../lib/s3";
import { database } from "../../database/setup";
import { file } from "../../database/schema";
import { eq, like } from "drizzle-orm";

export const upload = new Elysia()
  .use(authPlugin)
  .get("/api/s3/images", async (ctx) => {
    if (!ctx.user)
      throw new AuthenticationError()

    const results = await database
      .select()
      .from(file)
      .where(like(file.name, `%${ctx.query.name}%`))
      .limit(+ctx.query.limit)

    return results
  }, {
    query: t.Object({
      name: t.String(),
      limit: t.String(),
    })
  })
  .post("/api/s3/images", async (ctx) => {
    if (!ctx.user)
      throw new AuthenticationError()
    
    const inserted = await database.insert(file).values({ name: ctx.body.filename }).returning().catch(() => {})
    if (!inserted)
      return { url: null, metadata: null }

    const metadata = inserted[0]
    const url = await getUrlForUpload("images/", metadata.id, ctx.body.type)
    if (!url)
      return { url: null, metadata: metadata }
    
    const updated = await database.update(file).set({ url: url.split("?")[0] }).where(eq(file.id, metadata.id)).returning().catch(() => {})
    if (!updated)
      return { url: null, metadata: null }
    
    return { url, metadata: updated[0] }
  }, {
    body: t.Object({
      filename: t.String(),
      type: t.String(),
    })
  })
  .patch("/api/s3/images", async (ctx) => {
    if (!ctx.user)
      throw new AuthenticationError()
    const result = await database.update(file).set({ name: ctx.body.name }).where(eq(file.id, ctx.body.id)).returning().catch(() => {})
    if (!result)
      throw new Error()

    return result[0]
  }, {
    body: t.Object({
      id: t.String(),
      name: t.String(),
    })
  })
  .delete("/api/s3/delete", async (ctx) => {
    if (!ctx.user)
      throw new AuthenticationError()

    const url = await getUrlForDelete("images/", ctx.body.id)

    return { url }
  }, {
    body: t.Object({
      id: t.String()
    })
  })
  .delete("/api/s3/delete-metadata", async (ctx) => {
    if (!ctx.user)
      throw new AuthenticationError()

    const result = await database.delete(file).where(eq(file.id, ctx.body.id)).returning()

    return result[0]
  }, {
    body: t.Object({
      id: t.String()
    })
  })








