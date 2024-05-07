import { jwtDecode } from "jwt-decode"
import { z } from "zod"

export const jwt = <const Schema extends z.ZodTypeAny>(
  schema: Schema
) => {

  const safeDecode = (token: string): z.infer<typeof schema> | null => {
    const payload = jwtDecode(token)
    const result = schema.safeParse(payload)
    if (!result.success)
      return null
    return result.data
  }

  return {
    decode: safeDecode,
  }
}