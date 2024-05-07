import type { API } from "../../../backend/src/index"
import { treaty } from "@elysiajs/eden"
import { PUBLIC_RPC_URL } from "$env/static/public"

export const createClient = (token?: string) => treaty<API>(PUBLIC_RPC_URL, {
  onRequest: () => {
    return { headers: { authorization: token || "" } }
  }
})

export type AppClient = ReturnType<typeof createClient>