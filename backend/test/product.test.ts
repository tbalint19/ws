import { describe, expect, it, beforeEach, afterAll } from "bun:test";
import { getAuth, clearDB } from "./util";
import { database } from "../src/database/setup";
import { product } from "../src/database/schema";
import { treaty } from "@elysiajs/eden";
import { api } from "../src";

describe("Product related endpoint tests", () => {

  beforeEach(async () => {
    await clearDB()
  })

  afterAll(async () => {
    await clearDB()
  })

  it("should not return products without admin token", async () => {
    // given
    const client = treaty(api)

    // when
    const response = await client.api.products.get({ query: { name: '' } })

    // then
    expect(response.status).toBe(401)
  })

  it("should return http200 when admin token is sent", async () => {
    // given
    const auth = await getAuth()
    const client = treaty(api, { headers: { ...auth, } })

    // when
    const response = await client.api.products.get({ query: { name: '' } })

    // then
    expect(response.status).toBe(200)
    expect(response.data).toEqual([])
  })

  it("should not create a product when admin token is not sent", async () => {
    // given
    const client = treaty(api)

    // when
    const response = await client.api.products.post({ product: { name: 'test' } })

    // then
    const rows = await database.select().from(product)

    expect(rows).toEqual([])
    expect(response.status).toBe(401)
  })

  it("should create a product without category when admin token is sent", async () => {
    // given
    const auth = await getAuth()
    const client = treaty(api, { headers: { ...auth, } }) 

    // when
    const response = await client.api.products.post({ product: { name: 'test' } })

    // then
    const rows = await database.select().from(product)
    expect(rows).toHaveLength(1)

    const insertedProduct = rows[0]
    expect(insertedProduct.name).toBe('test')

    expect(response.status).toBe(200)
    expect(response.data).not.toBeNull()
    expect(response.data!.product.id).toEqual(insertedProduct.id)
  })

  it("should not create product when category does not exist", async () => {
    // given
    const auth = await getAuth()
    const client = treaty(api, { headers: { ...auth, } })

    // when
    const response = await client.api.products.post({ product: { name: 'test' }, categoryId: '1' })

    // then
    const products = await database.select().from(product)
    expect(products).toEqual([])

    expect(response.status).toBe(500) // TODO should be 404
  })

})