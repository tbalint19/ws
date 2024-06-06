import * as tables from "../../src/database/schema"
import { jwt } from "../../src/lib/jwt";
import { login } from "../../src/plugin/auth";
import { SessionSchema } from "../../src/plugin/auth";
import { database } from "../../src/database/setup";

export const getAuth = async () => {
  const { sign } = jwt(SessionSchema)
  const user = await login({ sub: "123" })
  if (!user)
    throw new Error("Login error")
  const token = await sign(user)
  if (!token)
    throw new Error("JWT error")
  return { "authorization": `Bearer ${token}` }
}

export const clearDB = async () => {
  /* await database.delete(tables.offer)
  await database.delete(tables.offerOfLocation)
  await database.delete(tables.bundleOfOffer)

  await database.delete(tables.categoryToProduct)
  await database.delete(tables.category)
 */
  await database.delete(tables.product)

/*   await database.delete(tables.bundle)
  await database.delete(tables.productAtLocation)
  await database.delete(tables.productImage)
  await database.delete(tables.productLink)
  await database.delete(tables.productProperty)
  await database.delete(tables.productQuestion)
  await database.delete(tables.answer)
  await database.delete(tables.productReview)
  await database.delete(tables.productSuggestion)
  await database.delete(tables.topup)
  
  await database.delete(tables.file)
  await database.delete(tables.location)
  await database.delete(tables.admin)
  await database.delete(tables.invitation) */
}