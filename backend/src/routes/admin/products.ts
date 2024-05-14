import { Elysia, NotFoundError, t } from "elysia";
import { authPlugin } from "../../plugin/auth";
import { database } from "../../database/setup";
import { product, productProperties, topup } from "../../database/schema";
import { createInsertSchema } from "drizzle-typebox";
import { AuthenticationError } from "../../lib/authPlugin";
import { eq, sql } from "drizzle-orm";
 
const NewProductSchema = createInsertSchema(product)

export const products = new Elysia()
  .use(authPlugin)
  .get("/api/products", async (ctx) => {
    if (!ctx.user)
      throw new AuthenticationError()

    const products = await database.select().from(product)

    return products
  })
  .post('/api/products', async (ctx) => {
    if (!ctx.user)
      throw new AuthenticationError()

    const result = await database.insert(product).values(ctx.body).returning()

    return result
  }, {
    body: t.Omit(NewProductSchema, [ 'id', 'createdAt', 'updatedAt' ])
  })
  .patch("/api/products", async (ctx) => {
    if (!ctx.user)
      throw new AuthenticationError()

    if (!ctx.body.id)
      throw new NotFoundError()

    const result = await database.update(product).set(ctx.body).where(eq(product.id, ctx.body.id)).returning()

    return result

  }, {
    body: t.Omit(NewProductSchema, [ 'createdAt', 'updatedAt' ])
  })