import { timestamp, decimal, integer, pgTable, text, uuid } from "drizzle-orm/pg-core"

export const admin = pgTable("admin", {
  id: uuid("id").primaryKey().defaultRandom(),
  googleId: text("google_id").notNull(),
  username: text("username").notNull(),
})

export const product = pgTable("products", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  brand: text("brand"),
  model: text("model"),   // !
  description: text("description").notNull(),
  //availableAmount: decimal("available_amount", { precision: 12, scale: 2 }),
  // barcode
  
  // enum
  //unit: text("unit"),
  // darab, tomeg, terfogat, hosszusag

  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at', { mode: 'date', precision: 3 }).$onUpdate(() => new Date()),
})

export const productImage = pgTable("product_images", {
  id: uuid("id").primaryKey().defaultRandom(),
  url: text("url").notNull(),
  alt: text("alt"),
  productId: uuid("product_id").references(() => product.id).notNull(),

  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at', { mode: 'date', precision: 3 }).$onUpdate(() => new Date()),
})

export const productProperties = pgTable("product_properties", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  value: text("value").notNull(),
  productId: uuid("product_id").references(() => product.id).notNull(),

  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at', { mode: 'date', precision: 3 }).$onUpdate(() => new Date()),
})

export const bundle = pgTable("bundles", {
  id: uuid("id").primaryKey().defaultRandom(),
  price: decimal("price", { precision: 12, scale: 2 }).notNull(),
  currency: text("currency").notNull(),
  // VAT

  availableAfter: timestamp('available_before'),
  availableBefore: timestamp('available_before'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at', { mode: 'date', precision: 3 }).$onUpdate(() => new Date()),
})

export const productOfBundle = pgTable("product_of_bundles", {
  id: uuid("id").primaryKey().defaultRandom(),
  bundleId: uuid("bundle_id").references(() => bundle.id).notNull(),
  productId: uuid("product_id").references(() => product.id).notNull(),
  amount: decimal("amount", { precision: 12, scale: 2 }).notNull(),
  unit: text("unit").notNull(),

  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at', { mode: 'date', precision: 3 }).$onUpdate(() => new Date()),
})

export const productSuggestion = pgTable("product_suggestion", {
  id: uuid("id").primaryKey().defaultRandom(),
  productId: uuid("product_id").references(() => product.id).notNull(),
  suggestionId: uuid("suggestion_id").references(() => product.id).notNull(),

  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at', { mode: 'date', precision: 3 }).$onUpdate(() => new Date()),
})

export const productLinks = pgTable("product_links", {
  id: uuid("id").primaryKey().defaultRandom(),
  productId: uuid("product_id").references(() => product.id).notNull(),
  url: text("url").notNull(),
  alt: text("alt"),
  display: text("diplay"),
  summary: text("summary"),
  imgUrl: text("img_url"),

  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at', { mode: 'date', precision: 3 }).$onUpdate(() => new Date()),
})

export const productReview = pgTable("product_reviews", {
  id: uuid("id").primaryKey().defaultRandom(),
  productId: uuid("product_id").references(() => product.id).notNull(),
  start: integer("star").notNull(),
  content: text("content"),

  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at', { mode: 'date', precision: 3 }).$onUpdate(() => new Date()),
})

export const productQuestion = pgTable("product_question", {
  id: uuid("id").primaryKey().defaultRandom(),
  productId: uuid("product_id").references(() => product.id).notNull(),
  content: text("content").notNull(),
  answer: text("content"),

  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at', { mode: 'date', precision: 3 }).$onUpdate(() => new Date()),
})
