import { boolean, timestamp, doublePrecision, integer, pgTable, text, uuid, AnyPgColumn, date } from "drizzle-orm/pg-core"

export const invitation = pgTable("invitation", {
  email: text("email").notNull(),
  inviter: uuid("inviter").references((): AnyPgColumn => admin.id),

  id: uuid("id").primaryKey().defaultRandom(),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at', { mode: 'date', precision: 3 }).$onUpdate(() => new Date()),
})

export const admin = pgTable("admin", {
  invitationId: uuid("invitation_id").references((): AnyPgColumn => invitation.id),

  googleId: text("google_id").notNull(),
  username: text("username").notNull(),

  id: uuid("id").primaryKey().defaultRandom(),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at', { mode: 'date', precision: 3 }).$onUpdate(() => new Date()),
})

export const location = pgTable("location", {
  name: text("name").notNull(),
  googleMapUrl: text("google_map_url"),
  
  id: uuid("id").primaryKey().defaultRandom(),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at', { mode: 'date', precision: 3 }).$onUpdate(() => new Date()),
})

export const category = pgTable("category", {
  subcategoryOf: uuid("subcategory_of").references((): AnyPgColumn => category.id),

  name: text("name").notNull(),

  id: uuid("id").primaryKey().defaultRandom(),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at', { mode: 'date', precision: 3 }).$onUpdate(() => new Date()),
})

export const product = pgTable("product", {
  versionOf: uuid("version_of").references((): AnyPgColumn => product.id),

  name: text("name"),
  brand: text("brand"),
  model: text("model"),
  description: text("description"),
  displayUnit: text("display_unit"),
  isArchived: boolean("is_archived").default(false),
  
  id: uuid("id").primaryKey().defaultRandom(),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at', { mode: 'date', precision: 3 }).$onUpdate(() => new Date()),
})

export const categoryToProduct = pgTable("category_to_product", {
  productId: uuid("product_id").references((): AnyPgColumn => product.id, { onDelete: 'cascade' }),
  categoryId: uuid("category_id").references((): AnyPgColumn => category.id),

  id: uuid("id").primaryKey().defaultRandom(),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at', { mode: 'date', precision: 3 }).$onUpdate(() => new Date()),
})

export const productAtLocation = pgTable("product_at_location", {
  locationId: uuid("location_id").references(() => location.id).notNull(),
  productId: uuid("product_id").references(() => product.id, { onDelete: 'cascade' }).notNull(),
  
  expires: timestamp("expires"),
  amount: doublePrecision("amount").notNull(),
  
  id: uuid("id").primaryKey().defaultRandom(),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at', { mode: 'date', precision: 3 }).$onUpdate(() => new Date()),
})

export const file = pgTable("file", {
  name: text("name").notNull(),
  folder: text("folder").notNull(),
  url: text("url"),
  
  id: uuid("id").primaryKey().defaultRandom(),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at', { mode: 'date', precision: 3 }).$onUpdate(() => new Date()),
})

export const productImage = pgTable("product_image", {
  productId: uuid("product_id").references(() => product.id, { onDelete: 'cascade' }).notNull(),
  fileId: uuid("file_id").references(() => file.id).notNull(),
  
  id: uuid("id").primaryKey().defaultRandom(),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at', { mode: 'date', precision: 3 }).$onUpdate(() => new Date()),
})

export const productProperty = pgTable("product_property", {
  productId: uuid("product_id").references(() => product.id, { onDelete: 'cascade' }).notNull(),

  name: text("name").notNull(),
  value: text("value").notNull(),
  description: text("description"),
  
  id: uuid("id").primaryKey().defaultRandom(),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at', { mode: 'date', precision: 3 }).$onUpdate(() => new Date()),
})

export const bundle = pgTable("bundle", {
  productId: uuid("product_id").references(() => product.id, { onDelete: 'cascade' }).notNull(),
  name: text("name"),
  multiplier: doublePrecision("multiplier").notNull(),
  
  id: uuid("id").primaryKey().defaultRandom(),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at', { mode: 'date', precision: 3 }).$onUpdate(() => new Date()),
})

export const offer = pgTable("offer", {
  price: doublePrecision("price").notNull(),
  currency: text("currency").notNull(),
  availableAfter: timestamp('available_before'),
  availableBefore: timestamp('available_before'),

  id: uuid("id").primaryKey().defaultRandom(),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at', { mode: 'date', precision: 3 }).$onUpdate(() => new Date()),
})

export const bundleOfOffer = pgTable("bundle_of_offer", {
  bundleId: uuid("bundle_id").references(() => bundle.id, { onDelete: 'cascade' }).notNull(),
  offerId: uuid("offer_id").references(() => offer.id).notNull(),
  
  amount: doublePrecision("amount").notNull(),
  
  id: uuid("id").primaryKey().defaultRandom(),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at', { mode: 'date', precision: 3 }).$onUpdate(() => new Date()),
})

export const productSuggestion = pgTable("product_suggestion", {
  productId: uuid("product_id").references(() => product.id, { onDelete: 'cascade' }).notNull(),
  suggestionId: uuid("suggestion_id").references(() => product.id).notNull(),

  content: text("content").notNull(),
  
  id: uuid("id").primaryKey().defaultRandom(),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at', { mode: 'date', precision: 3 }).$onUpdate(() => new Date()),
})

export const productLink = pgTable("product_link", {
  productId: uuid("product_id").references(() => product.id, { onDelete: 'cascade' }).notNull(),
  imageId: uuid("image_id").references(() => file.id),
  
  url: text("url").notNull(),
  display: text("diplay").notNull(),
  summary: text("summary"),
  
  id: uuid("id").primaryKey().defaultRandom(),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at', { mode: 'date', precision: 3 }).$onUpdate(() => new Date()),
})

export const productReview = pgTable("product_review", {
  productId: uuid("product_id").references(() => product.id, { onDelete: 'cascade' }).notNull(),
  
  start: integer("star").notNull(),
  content: text("content"),
  
  id: uuid("id").primaryKey().defaultRandom(),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at', { mode: 'date', precision: 3 }).$onUpdate(() => new Date()),
})

export const productQuestion = pgTable("product_question", {
  productId: uuid("product_id").references(() => product.id, { onDelete: 'cascade' }).notNull(),
  
  content: text("content").notNull(),
  
  id: uuid("id").primaryKey().defaultRandom(),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at', { mode: 'date', precision: 3 }).$onUpdate(() => new Date()),
})

export const answer = pgTable("answer", {
  questionId: uuid("question_id").references(() => productQuestion.id, { onDelete: 'cascade' }).notNull(),

  content: text("content").notNull(),
  
  id: uuid("id").primaryKey().defaultRandom(),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at', { mode: 'date', precision: 3 }).$onUpdate(() => new Date()),
})

export const topup = pgTable("topup", {
  productAtLocationId: uuid("product_at_location_id").references(() => productAtLocation.id, { onDelete: 'cascade' }).notNull(),
  fileId: uuid("file_id").references(() => file.id),

  amount: doublePrecision("available_amount").default(0).notNull(),
  price: doublePrecision("price"),
  currency: text("currency"),
  
  id: uuid("id").primaryKey().defaultRandom(),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at', { mode: 'date', precision: 3 }).$onUpdate(() => new Date()),
})
