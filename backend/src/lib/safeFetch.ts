import { Static, TAnySchema } from "@sinclair/typebox"
import { safeParse } from "./safeParse"

type HttpResponse<Data> = {
  success: true
  status: number
  data: Data
} | {
  success: false
  status: number | null
}

type Options = {
  url: string
  headers?: Record<string, string>
  payload?: any
}

export const safeFetch = async <const ResponseSchema extends TAnySchema>(
  options: Options,
  responseSchema: ResponseSchema
): Promise<HttpResponse<Static<typeof responseSchema>>> => {
  try {
    const { url, headers, payload } = options
    const response = await fetch(url, {
      method: payload ? "POST" : "GET",
      headers: headers ? {
        'Content-Type': 'application/json',
        ...headers
      } : {
        'Content-Type': 'application/json',
      },
      body: payload ? JSON.stringify(payload) : undefined
    })

    if (!response.ok)
      return {
        success: false,
        status: response.status
      }

    const responseData = await response.json()
    const result = safeParse(responseSchema, responseData)
    if (!result.success)
      return {
        success: false,
        status: response.status
      }
    return {
      success: true,
      status: response.status,
      data: result.data
    }
  } catch (error) {
    return {
      success: false,
      status: null
    }
  }
}