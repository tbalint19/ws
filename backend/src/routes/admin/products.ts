import { Elysia, InternalServerError, NotFoundError, error, t } from "elysia";
import { authPlugin } from "../../plugin/auth";
import { database } from "../../database/setup";
import { createInsertSchema, createSelectSchema } from "drizzle-typebox";
import { AuthenticationError } from "../../lib/authPlugin";
import { eq, and, count, like, or, SQL, isNull, InferSelectModel } from "drizzle-orm";
import {
  product,
  productProperty,
  productImage,
  productLink,
  productSuggestion,
  bundle,
  bundleOfOffer,
  offer,
  categoryToProduct,
} from "../../database/schema";

type Product = InferSelectModel<typeof product>
const ProductSchema = createInsertSchema(product, {
  name: t.String({ minLength: 1 })
})
const NewProductSchema = t.Omit(ProductSchema, [ 'id', 'createdAt', 'updatedAt' ])
const UpdatedProductSchema = t.Omit(ProductSchema, [ 'id', 'createdAt', 'updatedAt', 'variantId' ])

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

type Bundle = InferSelectModel<typeof bundle>
const BundleSchema = createInsertSchema(bundle)
const NewBundleSchema = t.Omit(BundleSchema, [ 'id', 'createdAt', 'updatedAt', 'productId' ])
const UpdatedBundleSchema = t.Omit(BundleSchema, [ 'id', 'createdAt', 'updatedAt', 'productId' ])

const OfferSchema = createInsertSchema(offer)
const NewOfferSchema = t.Omit(OfferSchema, [ 'id', 'createdAt', 'updatedAt' ])
const UpdatedOfferSchema = t.Omit(OfferSchema, [ 'id', 'createdAt', 'updatedAt' ])

const BundleOfOfferSchema = createInsertSchema(bundleOfOffer)
const NewBundleOfOfferSchema = t.Omit(BundleOfOfferSchema, [ 'id', 'createdAt', 'updatedAt' ])
const UpdatedBundleOfOfferSchema = t.Omit(BundleOfOfferSchema, [ 'id', 'createdAt', 'updatedAt', 'offerId', 'bundleId' ])

export const products = new Elysia()
  .use(authPlugin)
  .get("/api/products", async (ctx) => {
    if (!ctx.user)
      throw new AuthenticationError()

    const filters: SQL[] = []
    if (ctx.query.name)
      filters.push(like(product.name, `%${ctx.query.name}%`))

    if (ctx.query.category) {
      if (ctx.query.category === "orphan") {
        filters.push(isNull(categoryToProduct.categoryId))
        filters.push(isNull(product.variantOf))
      }
      else if (ctx.query.category !== "null")
        filters.push(eq(categoryToProduct.categoryId, ctx.query.category))
    }

    const result = await database
      .select({ product })
      .from(product)
      .leftJoin(categoryToProduct, eq(product.id, categoryToProduct.productId))
      .where(and(...filters))
      .catch(() => {})
    
    if (!result)
      throw new InternalServerError()

    return result.map(({ product }) => product)
  }, {
    query: t.Object({
      name:  t.Optional(t.String()),
      category:  t.Optional(t.String()),
    })
  })
  .get("/api/products/:id", async (ctx) => {
    if (!ctx.user)
      throw new AuthenticationError()

    const result = await database
      .select()
      .from(product)
      .where(eq(product.id, ctx.params.id))
      .catch(() => {})

    // and all related properties

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
      .where(eq(product.variantOf, ctx.params.productId))
      .catch(() => {})

    if (!result)
      throw new InternalServerError()

    return result
  })
  .post('/api/products', async (ctx) => {
    if (!ctx.user)
      throw new AuthenticationError()

    const variantOf = ctx.body.product.variantOf
    let parentProduct: Product | null = null
    if (variantOf) {
      const result = await database
        .select()
        .from(product)
        .where(eq(product.id, variantOf))
        .catch(() => {})

      if (!result)
        throw new InternalServerError()

      parentProduct = result[0]
      if (!parentProduct)
        throw new NotFoundError()
      
      if (parentProduct && parentProduct.variantOf)
        return error(409, 'This product is already a variant of another product')
    }

    const result = await database.transaction(async (transaction) => {
      const insertedProducts = await transaction
        .insert(product)
        .values(ctx.body.product)
        .returning()
        .catch(() => {})
      if (!insertedProducts || !insertedProducts[0])
        return

      if (parentProduct) {
        const relatedBundles = await transaction
          .select()
          .from(bundle)
          .where(eq(bundle.productId, parentProduct.id))
          .catch(() => {})

        if (!relatedBundles)
          return transaction.rollback()

        for (const { id, createdAt, updatedAt, productId, ...relatedBundle } of relatedBundles) {
          const result = await transaction
            .insert(bundle)
            .values({ ...relatedBundle, productId: insertedProducts[0].id })
            .returning()
            .catch(() => {})
          
          if (!result || !result[0])
            return transaction.rollback()
        }
      }

      const categoryId = ctx.body.categoryId
      if (!categoryId)
        return { product: insertedProducts[0], categoryToProduct: null }
      
      const insertedCategories = await transaction
        .insert(categoryToProduct)
        .values({ productId: insertedProducts[0].id, categoryId: categoryId })
        .returning()
        .catch(() => {})

      if (!insertedCategories || !insertedCategories[0])
        return transaction.rollback()

      return { product: insertedProducts[0], categoryToProduct: insertedCategories[0] }
    }).catch(() => {})

    if (!result)
      throw new InternalServerError()

    return result
  }, {
    body: t.Intersect([
      t.Object({
        product: NewProductSchema
      }),
      t.Object({
        categoryId: t.Optional(t.String())
      })
    ])
  })
  .patch("/api/products/:id", async (ctx) => {
    if (!ctx.user)
      throw new AuthenticationError()

    const updatedProducts = await database
      .update(product)
      .set(ctx.body)
      .where(eq(product.id, ctx.params.id))
      .returning()
      .catch(() => {})

    if (!updatedProducts || !updatedProducts[0])
      throw new InternalServerError()

    return { product: updatedProducts[0] }
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

    return result[0]
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

    return result[0]
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

    return result[0]
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

    const relatedProducts = await database
      .select()
      .from(product)
      .where(eq(product.id, ctx.params.productId))
      .catch(() => {})

    if (!relatedProducts)
      throw new InternalServerError()

    if (!relatedProducts[0])
      throw new NotFoundError()

    const variants = await database
      .select()
      .from(product)
      .where(eq(product.variantOf, ctx.params.productId))
      .catch(() => {})

    if (!variants)
      throw new InternalServerError()

    const transactionResult = await database.transaction(async (transaction) => {
      let insertedBundles: Bundle[] = []
      for (const product of [ ...relatedProducts, ...variants ]) {
        const result = await transaction
          .insert(bundle)
          .values({ productId: product.id, ...ctx.body })
          .returning()
          .catch(() => {})

        if (!result) {
          transaction.rollback()
          return
        }

        insertedBundles.push(result[0])
      }

      return insertedBundles[0]
    }).catch(() => {})

    if (!transactionResult)
      throw new InternalServerError()

    return transactionResult
  }, {
    body: NewBundleSchema
  })
  .patch("/api/bundles/:productId/:id", async (ctx) => {
    if (!ctx.user)
      throw new AuthenticationError()

    const relatedProducts = await database
      .select()
      .from(product)
      .where(eq(product.id, ctx.params.productId))
      .catch(() => {})

    if (!relatedProducts)
      throw new InternalServerError()

    if (!relatedProducts[0])
      throw new NotFoundError()

    const variants = await database
      .select()
      .from(product)
      .where(eq(product.variantOf, ctx.params.productId))
      .catch(() => {})

    if (!variants)
      throw new InternalServerError()

    const bundles = await database
      .select()
      .from(bundle)
      .where(eq(bundle.id, ctx.params.id))

    if (!bundles)
      throw new InternalServerError()

    if (!bundles[0])
      throw new NotFoundError()

    const transactionResult = await database.transaction(async (transaction) => {
      let updatedBundles: Bundle[] = []
      for (const product of [ ...relatedProducts, ...variants ]) {
        const result = await transaction
          .update(bundle)
          .set(ctx.body)
          .where(and(eq(bundle.productId, product.id), eq(bundle.name, bundles[0].name)))
          .returning()
          .catch(() => {})
        
        if (!result) {
          transaction.rollback()
          return
        }
        
        updatedBundles.push(result[0])
      }

      return updatedBundles[0]
    }).catch(() => {})

    if (!transactionResult)
      throw new InternalServerError()

    return transactionResult
  }, {
    body: UpdatedBundleSchema
  })
  .delete("/api/bundles/:productId/:id", async (ctx) => {
    if (!ctx.user)
      throw new AuthenticationError()

    const relatedProducts = await database
      .select()
      .from(product)
      .where(eq(product.id, ctx.params.productId))
      .catch(() => {})

    if (!relatedProducts)
      throw new InternalServerError()

    if (!relatedProducts[0])
      throw new NotFoundError()

    const variants = await database
      .select()
      .from(product)
      .where(eq(product.variantOf, ctx.params.productId))
      .catch(() => {})

    if (!variants)
      throw new InternalServerError()

    const bundles = await database
      .select()
      .from(bundle)
      .where(eq(bundle.id, ctx.params.id))

    if (!bundles)
      throw new InternalServerError()

    if (!bundles[0])
      throw new NotFoundError()

    const transactionResult = await database.transaction(async (transaction) => {
      let deletedBundles: Bundle[] = []
      for (const product of [ ...relatedProducts, ...variants ]) {

        const relatedOffers = await transaction
          .select({ count: count() })
          .from(bundleOfOffer)
          .innerJoin(bundle, eq(bundleOfOffer.bundleId, bundle.id))
          .where(and(eq(bundle.name, bundles[0].name), eq(bundle.productId, product.id)))
    
        if (relatedOffers[0].count > 0) {
          transaction.rollback()
          return
        }

        const result = await transaction
          .delete(bundle)
          .where(and(eq(bundle.productId, product.id), eq(bundle.name, bundles[0].name)))
          .returning()
          .catch(() => {})

        if (!result) {
          transaction.rollback()
          return
        }

        deletedBundles.push(result[0])
      }

      return deletedBundles[0]
    }).catch(() => {})

    if (!transactionResult)
      return error(403, "Cannot delete bundle with related offers")

    return transactionResult
  })
  .get("/api/offers", async (ctx) => {
    if (!ctx.user)
      throw new AuthenticationError()

    const result = ctx.query.bundleId ?
      await database
        .select({ offer })
        .from(offer)
        .innerJoin(bundleOfOffer, eq(bundleOfOffer.offerId, offer.id))
        .innerJoin(bundle, eq(bundle.id, bundleOfOffer.bundleId))
        .where(eq(bundle.id, ctx.query.bundleId))
        .catch(() => {}) :
      await database
        .select({ offer })
        .from(offer)
        .leftJoin(bundleOfOffer, eq(bundleOfOffer.offerId, offer.id))
        .where(isNull(bundleOfOffer.bundleId))
        .catch(() => {})

    if (!result)
      throw new InternalServerError()

    return result.map(row => row.offer)
  }, {
    query: t.Object({
      bundleId: t.Optional(t.String())
    })
  })
  .post("/api/offers", async (ctx) => {
    if (!ctx.user)
      throw new AuthenticationError()

    const result = await database
      .insert(offer)
      .values(ctx.body)
      .returning()
      .catch((e) => {console.log(e)})

    if (!result)
      throw new InternalServerError()

    return result[0]
  }, {
    body: NewOfferSchema
  })
  .patch("/api/offers/:id", async (ctx) => {
    if (!ctx.user)
      throw new AuthenticationError()

    const result = await database
      .update(offer)
      .set(ctx.body)
      .where(eq(offer.id, ctx.params.id))
      .returning()
      .catch(() => {})

    if (!result)
      throw new InternalServerError()

    return result[0]
  }, {
    body: UpdatedOfferSchema
  })
  .delete("/api/offers/:id", async (ctx) => {
    if (!ctx.user)
      throw new AuthenticationError()

    const result = await database
      .delete(offer)
      .where(eq(offer.id, ctx.params.id))
      .returning()
      .catch(() => {})

    if (!result)
      throw new InternalServerError()

    return result[0]
  })
  .get("/api/bundle-of-offer", async (ctx) => {
    if (!ctx.user)
      throw new AuthenticationError()

    const result = await database
      .select({ bundle, product, bundleOfOffer })
      .from(bundleOfOffer)
      .where(eq(bundleOfOffer.offerId, ctx.query.offerId))
      .innerJoin(bundle, eq(bundle.id, bundleOfOffer.bundleId))
      .innerJoin(product, eq(product.id, bundle.productId))
      .catch(() => {})

    if (!result)
      throw new InternalServerError()

    return result
  }, {
    query: t.Object({
      offerId: t.String(),
    })
  })
  .post("/api/bundle-of-offer", async (ctx) => {
    if (!ctx.user)
      throw new AuthenticationError()

    const result = await database
      .insert(bundleOfOffer)
      .values({ ...ctx.body })
      .returning()
      .catch(() => {})

    if (!result)
      throw new InternalServerError() 

    return result[0]
  }, {
    body: NewBundleOfOfferSchema
  })
  .patch("/api/bundle-of-offer/:id", async (ctx) => {
    if (!ctx.user)
      throw new AuthenticationError()

    const result = await database
      .update(bundleOfOffer)
      .set(ctx.body)
      .where(eq(bundleOfOffer.id, ctx.params.id))
      .returning()
      .catch(() => {})

    if (!result)
      throw new InternalServerError()

    return result[0]
  }, {
    body: UpdatedBundleOfOfferSchema
  })
  .delete("/api/bundle-of-offer/:id", async (ctx) => {
    if (!ctx.user)
      throw new AuthenticationError()

    const result = await database
      .delete(bundleOfOffer)
      .where(eq(bundleOfOffer.id, ctx.params.id))
      .returning()
      .catch(() => {})

    if (!result)
      throw new InternalServerError()

    return result[0]
  })
    




















