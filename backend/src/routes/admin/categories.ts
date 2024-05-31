import { Elysia, InternalServerError, error, t } from "elysia";
import { authPlugin } from "../../plugin/auth";
import { database } from "../../database/setup";
import { createInsertSchema } from "drizzle-typebox";
import { AuthenticationError } from "../../lib/authPlugin";
import { category, categoryToProduct } from "../../database/schema";
import { eq, isNull, count, and, InferSelectModel } from "drizzle-orm";

const CategorySchema = createInsertSchema(category)
const NewCategorySchema = t.Omit(CategorySchema, [ 'id', 'createdAt', 'updatedAt' ])
const UpdateCategorySchema = t.Omit(CategorySchema, [ 'id', 'createdAt', 'updatedAt' ])

type Category = InferSelectModel<typeof category>

export const categories = new Elysia()
  .use(authPlugin)
  .get("/api/categories", async (ctx) => {
    if (!ctx.user)
      throw new AuthenticationError()

    const categories = await database
      .select({ category })
      .from(category)
      .innerJoin(categoryToProduct, eq(categoryToProduct.categoryId, category.id))
      .where(eq(categoryToProduct.productId, ctx.query.productId))
      .catch(() => {})

    if (!categories)
      throw new InternalServerError()

    return categories.map(({ category }) => category)
  }, {
    query: t.Object({
      productId: t.String()
    })
  })
  .get("/api/categories/:id", async (ctx) => {
    if (!ctx.user)
      throw new AuthenticationError()

    const result = await database
      .select()
      .from(category)
      .where(eq(category.id, ctx.params.id))
      .catch(() => {})

    if (!result)
      throw new InternalServerError()

    if (!result.length)
      return error(404, "Category not found")
    return result[0]
  })
  .get("/api/subcategories/:id", async (ctx) => {
    if (!ctx.user)
      throw new AuthenticationError()

    const filter = ctx.params.id === "null" ?
      isNull(category.subcategoryOf) :
      eq(category.subcategoryOf, ctx.params.id)

    const result = await database
      .select()
      .from(category)
      .where(filter)
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

    const categoryToEditId = ctx.params.id
    const parentCategoryToBeId = ctx.body.subcategoryOf

    if (categoryToEditId === parentCategoryToBeId)
      return error(409, "Cyclic category creation")

    if (parentCategoryToBeId) {
      const categoryToEdit = await database
        .select()
        .from(category)
        .where(eq(category.id, categoryToEditId))
  
      let allIds: string[] = []
      let subcategories: Category[] = categoryToEdit
  
      while (subcategories.length) {
        let nextLayer: Category[] = []
        for (const subcategory of subcategories) {
          const relatedSubcategories = await database
            .select()
            .from(category)
            .where(eq(category.subcategoryOf, subcategory.id))
          nextLayer = [ ...nextLayer, ...relatedSubcategories ]
        }
        allIds = [ ...allIds, ...nextLayer.map(c => c.id) ]
        if (allIds.length !== [ ...new Set(allIds) ].length || nextLayer.map(c => c.id).includes(parentCategoryToBeId)) {
          return error(409, "Cyclic category creation")
        }
        subcategories = nextLayer
      }
    }

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
  .delete("/api/category-to-product", async (ctx) => {
    if (!ctx.user)
      throw new AuthenticationError()
    
    const result = await database
      .delete(categoryToProduct)
      .where(and(eq(categoryToProduct.productId, ctx.body.productId), eq(categoryToProduct.categoryId, ctx.body.categoryId)))
      .returning()
      .catch(() => {})

    if (!result)
      throw new InternalServerError()

    return result[0]
  }, {
    body: t.Object({
      productId: t.String(),
      categoryId: t.String(),
    })
  })
  .post("/api/category-to-product", async (ctx) => {
    if (!ctx.user)
      throw new AuthenticationError()
    
    const insertResult = await database
      .insert(categoryToProduct)
      .values({ categoryId: ctx.body.newRelatedCategoryId, productId: ctx.body.productId })
      .returning()
      .catch(() => {})

    if (!insertResult)
      throw new InternalServerError()

    if (!ctx.body.oldRelatedCategoryId)
      return { inserted: insertResult[0], deleted: null }

    const deleteResult = await database
      .delete(categoryToProduct)
      .where(and(eq(categoryToProduct.productId, ctx.body.productId), eq(categoryToProduct.categoryId, ctx.body.oldRelatedCategoryId)))
      .returning()
      .catch(() => {})

    if (!deleteResult)
      throw new InternalServerError()

    return { inserted: insertResult[0], deleted: deleteResult[0] }
  }, {
    body: t.Object({
      productId: t.String(),
      newRelatedCategoryId: t.String(),
      oldRelatedCategoryId: t.Optional(t.String()),
    })
  })



