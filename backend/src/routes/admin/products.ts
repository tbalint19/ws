import { Elysia, t } from "elysia";
import { authPlugin } from "../../plugin/auth";
import { database } from "../../database/setup";
import { product, productProperties } from "../../database/schema";
import { createInsertSchema } from "drizzle-typebox";
import { AuthenticationError } from "../../lib/authPlugin";
import { eq } from "drizzle-orm";
 
const newProductSchema = createInsertSchema(product, {
  id: t.Undefined(),
})

export const products = new Elysia()
  .use(authPlugin)
  .get("/api/products", async (ctx) => {
    if (!ctx.user)
      throw new AuthenticationError()

    const products = await database.select().from(product).innerJoin(productProperties, eq(product.id, productProperties.productId))

    return products
  })
  .post('/api/products', async (ctx) => {
    if (!ctx.user)
      throw new AuthenticationError()

    await database.transaction(async (tx) => {
      const result = await tx.insert(product).values(ctx.body).returning()
      const idOfCreatedProduct = result[0].id
      await tx.insert(productProperties).values({ name: "demo prop", value: "demo val", productId: idOfCreatedProduct })
    })

    return "ok"
  }, {
    body: newProductSchema
  })