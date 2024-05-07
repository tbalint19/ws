import { Elysia, t } from "elysia";
import { authPlugin } from "../../plugin/auth";
import { database } from "../../database/setup";
import { product, productProperties, topup } from "../../database/schema";
import { createInsertSchema } from "drizzle-typebox";
import { AuthenticationError } from "../../lib/authPlugin";
import { eq, sql } from "drizzle-orm";
 
const newProductSchema = createInsertSchema(product, {
  id: t.Undefined(),
})

const newTopupSchema = createInsertSchema(topup, {
  id: t.Undefined(),
})

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
    body: newProductSchema
  })
  .post("/api/topup", async (ctx) => {
    if (!ctx.user)
      throw new AuthenticationError()

    await database.transaction(async (tx) => {
      await tx
        .update(product)
        .set({ availableAmount: sql`${product.availableAmount} + ${ctx.body.amount}` })
        .where(eq(product.id, ctx.body.id)).returning()
      await tx.insert(topup).values(ctx.body.topup).returning()
    });

    return "ok"
  }, {
    body: t.Object({
      topup: newTopupSchema,
      amount: t.Number(),
      id: t.String()
    })
  })