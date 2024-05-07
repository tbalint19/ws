import { timestamp, doublePrecision, integer, pgTable, text, uuid, AnyPgColumn } from "drizzle-orm/pg-core"

export const admin = pgTable("admin", {
  id: uuid("id").primaryKey().defaultRandom(),
  googleId: text("google_id").notNull(),
  username: text("username").notNull(),

  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at', { mode: 'date', precision: 3 }).$onUpdate(() => new Date()),
})

export const product = pgTable("product", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name"),
  brand: text("brand"),
  model: text("model"),
  description: text("description"),

  versionOf: uuid("version_of").references((): AnyPgColumn => product.id),

  availableAmount: doublePrecision("available_amount").default(0),
  displayUnit: text("display_unit"),  // darab, pár, szál

  grossWeightOfUnitInKg: doublePrecision("gross_weight_of_unit_in_kg"),
  netWeightOfUnitInKg: doublePrecision("net_weight_of_unit_in_kg"),
  grossVolumeOfUnitInLiter: doublePrecision("gross_volume_of_unit_in_liter"),
  netVolumeOfUnitInLiter: doublePrecision("net_volume_of_unit_in_liter"),
  grossWidthInMeter: doublePrecision("gross_width_in_meter"),
  netWidthInMeter: doublePrecision("net_width_in_meter"),
  grossHeightInMeter: doublePrecision("gross_height_in_meter"),
  netHeightInMeter: doublePrecision("net_height_in_meter"),
  grossLengthInMeter: doublePrecision("gross_length_in_meter"),
  netLengthInMeter: doublePrecision("net_length_in_meter"),

  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at', { mode: 'date', precision: 3 }).$onUpdate(() => new Date()),
})

export const productImage = pgTable("product_image", {
  id: uuid("id").primaryKey().defaultRandom(),
  url: text("url").notNull(),
  alt: text("alt"),
  productId: uuid("product_id").references(() => product.id).notNull(),

  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at', { mode: 'date', precision: 3 }).$onUpdate(() => new Date()),
})

export const productProperties = pgTable("product_property", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  value: text("value").notNull(),
  description: text("description"),
  productId: uuid("product_id").references(() => product.id).notNull(),

  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at', { mode: 'date', precision: 3 }).$onUpdate(() => new Date()),
})

export const bundle = pgTable("bundle", {
  id: uuid("id").primaryKey().defaultRandom(),
  productId: uuid("product_id").references(() => product.id).notNull(),
  name: text("name"),   // raklap
  multiplier: doublePrecision("multiplier").notNull(),

  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at', { mode: 'date', precision: 3 }).$onUpdate(() => new Date()),
})

export const offer = pgTable("offer", {
  id: uuid("id").primaryKey().defaultRandom(),
  price: doublePrecision("price").notNull(),
  currency: text("currency").notNull(),
  // VAT

  availableAfter: timestamp('available_before'),
  availableBefore: timestamp('available_before'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at', { mode: 'date', precision: 3 }).$onUpdate(() => new Date()),
})

export const bundleOfOffer = pgTable("bundle_of_offer", {
  id: uuid("id").primaryKey().defaultRandom(),
  bundleId: uuid("bundle_id").references(() => bundle.id).notNull(),
  offerId: uuid("offer_id").references(() => offer.id).notNull(),
  amount: doublePrecision("amount").notNull(),

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

export const productLink = pgTable("product_link", {
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

export const productReview = pgTable("product_review", {
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

export const bill = pgTable("bill", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name"),
  url: text("url"),

  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at', { mode: 'date', precision: 3 }).$onUpdate(() => new Date()),
})

export const topup = pgTable("topup", {
  id: uuid("id").primaryKey().defaultRandom(),
  productId: uuid("product_id").references(() => product.id).notNull(),
  amount: doublePrecision("available_amount").default(0).notNull(),
  billUrl: text("bill_url"),
  price: doublePrecision("price"),
  currency: text("currency"),

  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at', { mode: 'date', precision: 3 }).$onUpdate(() => new Date()),
})
