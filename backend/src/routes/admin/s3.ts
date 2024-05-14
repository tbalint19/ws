import { Elysia, InternalServerError, NotFoundError, t } from "elysia";
import { authPlugin } from "../../plugin/auth";
import { AuthenticationError } from "../../lib/authPlugin";
import { getUrlForDelete, getUrlForUpload } from "../../lib/s3";
import { database } from "../../database/setup";
import { file } from "../../database/schema";
import { eq, like } from "drizzle-orm";
import axios from "axios";

export const upload = new Elysia()
  .use(authPlugin)
  .get("/api/files", async (ctx) => {
    if (!ctx.user)
      throw new AuthenticationError()

    const results = await database
      .select()
      .from(file)
      .where(like(file.name, `%${ctx.query.name}%`))
      .limit(+ctx.query.limit)
      .catch(() => {})
    
    if (!results)
      throw new InternalServerError()

    return results
  }, {
    query: t.Object({
      name: t.String(),
      limit: t.String(),
    })
  })
  .post("/api/files", async (ctx) => {
    if (!ctx.user)
      throw new AuthenticationError()
    
    const inserted = await database
      .insert(file)
      .values({ name: ctx.body.filename, folder: ctx.body.folder })
      .returning()
      .catch(() => {})
    if (!inserted)
      throw new InternalServerError()

    const metadata = inserted[0]
    const url = await getUrlForUpload(`${ctx.body.folder}/`, metadata.id, ctx.body.type)
    if (!url)
      throw new InternalServerError()
    
    const updated = await database
      .update(file)
      .set({ url: url.split("?")[0] })
      .where(eq(file.id, metadata.id))
      .returning()
      .catch(() => {})
    if (!updated)
      throw new InternalServerError()
    
    return { url, metadata: updated[0] }
  }, {
    body: t.Object({
      folder: t.String(),
      filename: t.String(),
      type: t.String(),
    })
  })
  .patch("/api/files/:id", async (ctx) => {
    if (!ctx.user)
      throw new AuthenticationError()
    const result = await database
      .update(file)
      .set({ name: ctx.body.name })
      .where(eq(file.id, ctx.params.id))
      .returning()
      .catch(() => {})
    if (!result)
      throw new InternalServerError()

    return result[0]
  }, {
    body: t.Object({
      name: t.String(),
    })
  })
  .delete("/api/files/:id", async (ctx) => {
    if (!ctx.user)
      throw new AuthenticationError()

    const metadata = await database
      .select({ folder: file.folder })
      .from(file)
      .where(eq(file.id, ctx.params.id))
      .catch(() => {})

    if (!metadata)
      throw new InternalServerError()

    if (!metadata[0])
      throw new NotFoundError()

    const url = await getUrlForDelete(`${metadata}/`, ctx.params.id)
    if (!url)
      throw new InternalServerError()
    const response = await axios.delete(url).catch(err => console.log(err))
    if (!response)
      throw new InternalServerError()

    const result = await database
      .delete(file)
      .where(eq(file.id, ctx.params.id))
      .returning()
      .catch(() => {})

    if (!result)
      throw new InternalServerError()
    
    return result[0]
  })
