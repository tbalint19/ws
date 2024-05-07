import { Elysia, t } from "elysia";
import { cors } from '@elysiajs/cors'
import { authPlugin } from "./plugin/auth";
import { products } from "./routes/admin/products";

const api = new Elysia()
  .use(cors())
  .use(authPlugin)
  .use(products)
  .listen(3000);

console.log(
  `🦊 Elysia is running at ${api.server?.hostname}:${api.server?.port}`
);

export type API = typeof api
