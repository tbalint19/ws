import { Elysia, InternalServerError, NotFoundError, error, t } from "elysia";
import { authPlugin } from "../../plugin/auth";
import { database } from "../../database/setup";
import { createInsertSchema } from "drizzle-typebox";
import { AuthenticationError } from "../../lib/authPlugin";
import { eq, and, count, like, or } from "drizzle-orm";
import {
  product,
  productProperty,
  productImage,
  productLink,
  productSuggestion,
  bundle,
  bundleOfOffer,
  offer,
} from "../../database/schema";
 
const ProductSchema = createInsertSchema(product)
const NewProductSchema = t.Omit(ProductSchema, [ 'id', 'createdAt', 'updatedAt' ])
const UpdatedProductSchema = t.Omit(ProductSchema, [ 'id', 'createdAt', 'updatedAt' ])

const ProductPropertySchema = createInsertSchema(productProperty)
const NewProductPropertySchema = t.Omit(ProductPropertySchema, [ 'id', 'createdAt', 'updatedAt', 'productId' ])
const UpdatedProductPropertySchema = t.Omit(ProductPropertySchema, [ 'id', 'createdAt', 'updatedAt', 'productId' ])

const ProductImageSchema = createInsertSchema(productImage)
const NewProductImageSchema = t.Omit(ProductImageSchema, [ 'id', 'createdAt', 'updatedAt', 'productId' ])

const ProductLinkSchema = createInsertSchema(productLink)
const NewProductLinkSchema = t.Omit(ProductLinkSchema, [ 'id', 'createdAt', 'updatedAt', 'productId' ])
const UpdatedProductLinkSchema = t.Omit(ProductLinkSchema, [ 'id', 'createdAt', 'updatedAt', 'productId' ])

const ProductSuggestionSchema = createInsertSchema(productSuggestion)
const NewProductSuggestionSchema = t.Omit(ProductSuggestionSchema, [ 'id', 'createdAt', 'updatedAt', 'productId' ])
const UpdatedProductSuggestionSchema = t.Omit(ProductSuggestionSchema, [ 'id', 'createdAt', 'updatedAt', 'productId', 'suggestionId' ])

const BundleSchema = createInsertSchema(bundle)
const NewBundleSchema = t.Omit(BundleSchema, [ 'id', 'createdAt', 'updatedAt', 'productId' ])
const UpdatedBundleSchema = t.Omit(BundleSchema, [ 'id', 'createdAt', 'updatedAt', 'productId' ])

export const products = new Elysia()
  .use(authPlugin)
  .get("/api/products", async (ctx) => {
    if (!ctx.user)
      throw new AuthenticationError()

    const result = !ctx.query.name ? await database
      .select()
      .from(product)
      .catch(() => {}) : await database
      .select()
      .from(product)
      .where(or(like(product.name, ``), like(product.brand, ``), like(product.model, ``)))
      .catch(() => {})
    
    if (!result)
      throw new InternalServerError()

    return result
  }, {
    query: (t.Object({ name: t.Optional(t.String()) }))
  })
  .get("/api/products/:id", async (ctx) => {
    if (!ctx.user)
      throw new AuthenticationError()

    const result = await database
      .select()
      .from(product)
      .where(eq(product.id, ctx.params.id))
      .catch(() => {})

    if (!result)
      throw new InternalServerError()

    return result[0]
  })
  .get("/api/variants/:productId", async (ctx) => {
    if (!ctx.user)
      throw new AuthenticationError()

    const result = await database
      .select()
      .from(product)
      .where(eq(product.versionOf, ctx.params.productId))
      .catch(() => {})

    if (!result)
      throw new InternalServerError()

    return result
  })
  .post('/api/products', async (ctx) => {
    if (!ctx.user)
      throw new AuthenticationError()

    const result = await database
      .insert(product)
      .values(ctx.body)
      .returning()
      .catch(() => {})

    if (!result)
      throw new InternalServerError()

    return result
  }, {
    body: NewProductSchema
  })
  .patch("/api/products/:id", async (ctx) => {
    if (!ctx.user)
      throw new AuthenticationError()

    const result = await database
      .update(product)
      .set(ctx.body)
      .where(eq(product.id, ctx.params.id))
      .returning()
      .catch(() => {})

    if (!result)
      throw new InternalServerError()

    return result[0]
  }, {
    body: UpdatedProductSchema
  })
  .delete("/api/products/:id", async (ctx) => {
    if (!ctx.user)
      throw new AuthenticationError()

    const result = await database
      .delete(product)
      .where(eq(product.id, ctx.params.id))
      .returning()
      .catch(() => {})

    if (!result)
      throw new InternalServerError()
  
    return result[0]
  })
  .get("/api/properites/:productId", async (ctx) => {
    if (!ctx.user)
      throw new AuthenticationError()

    const result = await database
      .select()
      .from(productProperty)
      .where(eq(productProperty.productId, ctx.params.productId))
      .catch(() => {})

    if (!result) 
      throw new InternalServerError()

    return result
  })
  .post("/api/properites/:productId", async (ctx) => {
    if (!ctx.user)
      throw new AuthenticationError() 

    const result = await database
      .insert(productProperty)
      .values({ productId: ctx.params.productId, ...ctx.body })
      .returning()
      .catch(() => {})

    if (!result)
      throw new InternalServerError()

    return result
  }, {
    body: NewProductPropertySchema
  })
  .patch("/api/properites/:productId/:id", async (ctx) => {
    if (!ctx.user)  
      throw new AuthenticationError()

    const result = await database
      .update(productProperty)
      .set(ctx.body)
      .where(and(eq(productProperty.productId, ctx.params.productId), eq(productProperty.id, ctx.params.id)))
      .returning()
      .catch(() => {})

    if (!result) 
      throw new InternalServerError()

    return result
  }, {
    body: UpdatedProductPropertySchema
  })
  .delete("/api/properites/:productId/:id", async (ctx) => {
    if (!ctx.user)
      throw new AuthenticationError()

    const result = await database
      .delete(productProperty)
      .where(and(eq(productProperty.productId, ctx.params.productId), eq(productProperty.id, ctx.params.id)))
      .returning()
      .catch(() => {})

    if (!result)
      throw new InternalServerError()

    return result
  })
  .get("/api/images/:productId", async (ctx) => {
    if (!ctx.user)
      throw new AuthenticationError()

    const result = await database
      .select()
      .from(productImage)
      .where(eq(productImage.productId, ctx.params.productId))
      .catch(() => {})

    if (!result)
      throw new InternalServerError()

    return result
  })
  .post("/api/images/:productId", async (ctx) => {
    if (!ctx.user)  
      throw new AuthenticationError()

    const result = await database
      .insert(productImage)
      .values({ productId: ctx.params.productId, ...ctx.body })
      .returning()
      .catch(() => {})

    if (!result)
      throw new InternalServerError()

    return result
  }, {
    body: NewProductImageSchema
  })
  .delete("/api/images/:productId/:id", async (ctx) => {
    if (!ctx.user)
      throw new AuthenticationError()

    const result = await database
      .delete(productImage)
      .where(and(eq(productImage.productId, ctx.params.productId), eq(productImage.id, ctx.params.id)))
      .returning()

    if (!result)
      throw new InternalServerError()

    return result
  })
  .get("/api/links/:productId", async (ctx) => {
    if (!ctx.user)
      throw new AuthenticationError()

    const result = await database
      .select()
      .from(productLink)
      .where(eq(productLink.productId, ctx.params.productId))
      .catch(() => {})

    if (!result)
      throw new InternalServerError()

    return result    
  })
  .post("/api/links/:productId", async (ctx) => {
    if (!ctx.user)
      throw new AuthenticationError()

    const result = await database
      .insert(productLink)
      .values({ productId: ctx.params.productId, ...ctx.body })
      .returning()
      .catch(() => {})
  }, {
    body: NewProductLinkSchema
  })
  .patch("/api/links/:productId/:id", async (ctx) => {
    if (!ctx.user)
      throw new AuthenticationError()

    const result = await database
      .update(productLink)
      .set(ctx.body)
      .where(and(eq(productLink.productId, ctx.params.productId), eq(productLink.id, ctx.params.id)))
      .returning()
      .catch(() => {})

    if (!result)
      throw new InternalServerError()

    return result
  }, {
    body: UpdatedProductLinkSchema
  })
  .delete("/api/links/:productId/:id", async (ctx) => {
    if (!ctx.user)
      throw new AuthenticationError()

    const result = await database
      .delete(productLink)
      .where(and(eq(productLink.productId, ctx.params.productId), eq(productLink.id, ctx.params.id)))
      .returning()
      .catch(() => {})

    if (!result)
      throw new InternalServerError()

    return result
  })
  .get("/api/suggestions/:productId", async (ctx) => {
    if (!ctx.user) 
      throw new AuthenticationError()

    const result = await database
      .select()
      .from(productSuggestion)
      .where(eq(productSuggestion.productId, ctx.params.productId))
      .innerJoin(product, eq(product.id, productSuggestion.suggestionId))
      .catch(() => {})  

    if (!result)
      throw new InternalServerError()

    return result
  })
  .post("/api/suggestions/:productId", async (ctx) => {
    if (!ctx.user)
      throw new AuthenticationError()

    const result = await database
      .insert(productSuggestion)
      .values({ productId: ctx.params.productId, ...ctx.body })
      .returning()
      .catch(() => {})

    if (!result)
      throw new InternalServerError()

    return result
  }, {
    body: NewProductSuggestionSchema
  })
  .patch("/api/suggestions/:productId/:id", async (ctx) => {
    if (!ctx.user)
      throw new AuthenticationError()

    const result = await database
      .update(productSuggestion)
      .set(ctx.body)
      .where(and(eq(productSuggestion.productId, ctx.params.productId), eq(productSuggestion.id, ctx.params.id)))
      .returning()

    if (!result)
      throw new InternalServerError()

    return result
  }, {
    body: UpdatedProductSuggestionSchema
  })
  .delete("/api/suggestions/:productId/:id", async (ctx) => {
    if (!ctx.user)
      throw new AuthenticationError()

    const result = await database
      .delete(productSuggestion)
      .where(and(eq(productSuggestion.productId, ctx.params.productId), eq(productSuggestion.id, ctx.params.id)))
      .returning()

    if (!result)
      throw new InternalServerError()

    return result
  })
  .get("/api/bundles/:productId", async (ctx) => {
    if (!ctx.user)
      throw new AuthenticationError()

    const result = await database
      .select()
      .from(bundle)
      .where(eq(bundle.productId, ctx.params.productId))
      .catch(() => {})

    if (!result)
      throw new InternalServerError()

    return result
  })
  .post("/api/bundles/:productId", async (ctx) => {
    if (!ctx.user)
      throw new AuthenticationError()

    const result = await database
      .insert(bundle)
      .values({ productId: ctx.params.productId, ...ctx.body })
      .returning()
      .catch(() => {})
  }, {
    body: NewBundleSchema
  })
  .patch("/api/bundles/:productId/:id", async (ctx) => {
    if (!ctx.user)
      throw new AuthenticationError()

    const result = await database
      .update(bundle)
      .set(ctx.body)
      .where(and(eq(bundle.productId, ctx.params.productId), eq(bundle.id, ctx.params.id)))
      .returning()
      .catch(() => {})
  }, {
    body: UpdatedBundleSchema
  })
  .delete("/api/bundles/:productId/:id", async (ctx) => {
    if (!ctx.user)
      throw new AuthenticationError()

    const relatedOffers = await database
      .select({ count: count() })
      .from(bundleOfOffer)
      .where(eq(bundleOfOffer.bundleId, ctx.params.id))

    if (relatedOffers[0].count > 0)
      return error(403 ,"Cannot delete bundle with related offers")

    const result = await database
      .delete(bundle)
      .where(and(eq(bundle.productId, ctx.params.productId), eq(bundle.id, ctx.params.id)))
      .returning()
      .catch(() => {})

    if (!result)
      throw new InternalServerError()

    return result
  })
  .get("/api/offers/:productId", async (ctx) => {
    if (!ctx.user)
      throw new AuthenticationError()

    const result = await database
      .select()
      .from(offer)
      .innerJoin(bundleOfOffer, eq(bundleOfOffer.offerId, offer.id))
      .innerJoin(bundle, eq(bundle.id, bundleOfOffer.bundleId))
      .innerJoin(product, eq(product.id, bundle.productId))
      .where(eq(product.id, ctx.params.productId))

    if (!result)
      throw new InternalServerError()

    return result.map(row => row.offer)
  })



















