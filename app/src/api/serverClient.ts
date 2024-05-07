import type { API } from "../../../backend/src/index"
import { treaty } from "@elysiajs/eden"
import { PUBLIC_RPC_URL } from "$env/static/public"

export const serverClient = treaty<API>(PUBLIC_RPC_URL)