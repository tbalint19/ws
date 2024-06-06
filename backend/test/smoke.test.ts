import { describe, expect, it, beforeAll, beforeEach, afterAll, afterEach } from "bun:test";

const sleep = (sec: number) => new Promise(resolve => setTimeout(resolve, sec*1000))

describe.skip("Smoke tests", () => {

  beforeAll(async () => {
    console.log(process.env.NODE_ENV)
    console.log("beforeAll")
    await sleep(0.5)
    console.log("sleep done in beforeAll")
  })

  beforeEach(async () => {
    console.log("beforeEach")
    await sleep(0.1)
    console.log("sleep done in beforeEach")
  })

  afterEach(async () => {
    console.log("afterEach")
    await sleep(0.1)
    console.log("sleep done in afterEach")
  })

  afterAll(async () => {
    console.log("afterAll")
    await sleep(0.5)
    console.log("sleep done in afterAll")
  })

  it("should run 1", async () => {
    console.log("1 runs")
    expect(1+1).toBe(2)
  })

  it("should run 2", async () => {
    console.log("2 runs")
    expect(1+1).toBe(2)
  })

  it("should run 3", async () => {
    console.log("3 runs")
    expect(1+1).toBe(2)
  })
})