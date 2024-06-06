import { describe, expect, it, beforeAll, beforeEach, afterAll, afterEach } from "bun:test";
import { getAuth, clearDB } from "./util";
import { database } from "../src/database/setup";
import { product } from "../src/database/schema";
import { treaty } from "@elysiajs/eden";
import { api } from "../src";

describe.skip("API and DB tests", () => {

  beforeEach(async () => {
    await clearDB()
  })

  afterAll(async () => {
    await clearDB()
  })

  it("should return 401 without token", async () => {
    // given


    // when
    const response = await api.handle(new Request('http://localhost/api/products'))

    // then
    expect(response.status).toBe(401)
  })
  
  it("should return 200 with token", async () => {
    // given
    const auth = await getAuth()

    // when
    const response = await api.handle(new Request('http://localhost/api/products', { headers: { ...auth, } }))

    // then
    expect(response.status).toBe(200)
  })

  it("should return 401 with wrong token", async () => {
    // given

    // when
    const response = await api.handle(new Request('http://localhost/api/products', { headers: { 'authorization': 'wrongtoken' } }))

    //then
    expect(response.status).toBe(401)
  })

  it("should work with eden treaty", async () => {
    // given
    const auth = await getAuth()
    const client = treaty(api, { headers: { ...auth, }  })
    
    // when
    const response = await client.api.products.get({ query: { name: '' } })
    
    // then
    const rows = await database.select().from(product)
    
    expect(rows).toHaveLength(0)
    expect(response.status).toBe(200)
    expect(response.data).toHaveLength(0)
  })
})