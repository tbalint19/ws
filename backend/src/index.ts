import { Elysia, t } from "elysia";
import { cors } from '@elysiajs/cors'
import { authPlugin } from "./plugin/auth";
import { products } from "./routes/admin/products";
import { upload } from "./routes/admin/upload";

const api = new Elysia()
  .use(cors())
  .use(authPlugin)
  .use(products)
  .use(upload)
  .listen(3000);

console.log(
  `🦊 Elysia is running at ${api.server?.hostname}:${api.server?.port}`
);

export type API = typeof api
