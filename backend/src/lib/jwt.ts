import { verify, sign, decode } from "jsonwebtoken"
import { Static, TAnySchema } from "@sinclair/typebox"
import { safeParse } from "./safeParse"

const secret = process.env.JWT_SECRET!
const config = { expiresIn: process.env.JWT_EXP! }

export const jwt = <const Schema extends TAnySchema>(schema: Schema) => {

  const safeVerify = (token: string) =>
    new Promise<Static<typeof schema> | null>((resolve, reject) => verify(token, secret, (error, payload) => {
      if (error) {
        return resolve(null)
      }
      const result = safeParse(schema, payload)
      if (!result.success)
        return resolve(null)
      return resolve(result.data)
    }))
  
  const safeSign = (payload: Static<typeof schema>) =>
    new Promise((resolve: (token: string | null) => void, reject) =>
      sign(payload, secret, config, (error, token) => {
        if (error)
          return resolve(null)
        if (!token)
          return resolve(null)
        resolve(token)
      }))

  const safeDecode = (token: string) => {
    const payload = decode(token) as unknown
    const result = safeParse(schema, payload)
    if (!result.success)
      return null
    return result.data
  }

  return {
    sign: safeSign,
    verify: safeVerify,
    decode: safeDecode,
  }
}