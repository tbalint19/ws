import { Value } from '@sinclair/typebox/value'
import { Static, TAnySchema } from "@sinclair/typebox"

type SafeParseResult<Data> = {
  success: true
  data: Data
} | {
  success: false
}

export const safeParse = <const Schema extends TAnySchema>(
  schema: Schema,
  data: unknown
): SafeParseResult<Static<typeof schema>> => {
  try {
    const result = Value.Decode(schema, data)
    return { success: true, data: result }
  } catch (error) {
    return { success: false }
  }
}