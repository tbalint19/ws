import type { Writable } from "svelte/store"
import { writable } from "svelte/store"

type ApiResponse<Res> = {
  data: Res;
  error: unknown;
  status: number;
}

type Options<T> = {
retries?: number
onSuccess?: (data: T, status: number) => void
onError?: (err: unknown, status?: number) => void
}

const enhance = <ParamType, ResponseType>(asyncFunction: (x?: ParamType) => Promise<ApiResponse<ResponseType>>, options: Options<ResponseType>): [
  (x: ParamType) => Promise<void>, Writable<ResponseType | null>, Writable<number | null>, Writable<boolean>
] => {
const isLoading = writable(false)
const data = writable<ResponseType | null>(null)
const status = writable<number | null>(null)

const execute = async (x: ParamType) => {
  let attempts = 0
  let retries = options.retries || 0
  while (attempts <= retries) {
    isLoading.set(true)
    const response = await asyncFunction(x).catch(() => {})
    isLoading.set(false)
    attempts += 1
    if (!response) {
      if (attempts > retries)
        return options.onError?.(null)
      else
        continue
    }

    if (!response.status) {
      if (attempts > retries)
        return options.onError?.(response.error)
      else
        continue
    }

    status.set(response.status)
    if (response.status > 299 && attempts > retries)
      options.onError?.(response.error, response.status)

    if (!response.data) {
      if (attempts > retries)
        return
      else
        continue
    }

    data.set(response.data)
    options.onSuccess?.(response.data, response.status)
    return
  }
}

return [ execute, data, status, isLoading ]
}