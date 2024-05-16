import { Elysia, InternalServerError, error, t } from "elysia";
import { authPlugin } from "../../plugin/auth";
import { database } from "../../database/setup";
import { createInsertSchema } from "drizzle-typebox";
import { AuthenticationError } from "../../lib/authPlugin";
import { category } from "../../database/schema";
import { eq, isNull, count } from "drizzle-orm";

const CategorySchema = createInsertSchema(category)
const NewCategorySchema = t.Omit(CategorySchema, [ 'id', 'createdAt', 'updatedAt' ])
const UpdateCategorySchema = t.Omit(CategorySchema, [ 'id', 'createdAt', 'updatedAt' ])

export const categories = new Elysia()
  .use(authPlugin)
  .get("/api/categories", async (ctx) => {
    if (!ctx.user)
      throw new AuthenticationError()

    const result = await database
      .select()
      .from(category)
      .where(isNull(category.subcategoryOf))
      .catch(() => {})

    if (!result)
      throw new InternalServerError()

    return result
  })
  .get("/api/categories/:id", async (ctx) => {
    if (!ctx.user)
      throw new AuthenticationError()

    const result = await database
      .select()
      .from(category)
      .where(eq(category.subcategoryOf, ctx.params.id))
      .catch(() => {})

    if (!result)
      throw new InternalServerError()

    return result
  })
  .post('/api/categories', async (ctx) => {
    if (!ctx.user)
      throw new AuthenticationError()

    const result = await database
      .insert(category)
      .values(ctx.body)
      .returning()
      .catch(() => {})

    if (!result)
      throw new InternalServerError()

    return result[0]
  }, {
    body: NewCategorySchema
  })
  .patch("/api/categories/:id", async (ctx) => {
    if (!ctx.user)
      throw new AuthenticationError()

    const result = await database
      .update(category)
      .set(ctx.body)
      .where(eq(category.id, ctx.params.id))
      .returning()
      .catch(() => {})

    if (!result)
      throw new InternalServerError()

    return result[0]
  }, {
    body: UpdateCategorySchema
  })
  .delete("/api/categories/:id", async (ctx) => {
    if (!ctx.user)
      throw new AuthenticationError()

    const numberOfSubcategories = await database
      .select({ count: count() })
      .from(category)
      .where(eq(category.subcategoryOf, ctx.params.id))

    if (numberOfSubcategories[0].count > 0)
      return error(409, "Category has subcategories")

    const result = await database
      .delete(category)
      .where(eq(category.id, ctx.params.id))
      .returning()
      .catch(() => {})

    if (!result)
      throw new InternalServerError()

    return result[0]
  })



