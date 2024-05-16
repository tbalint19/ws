import { Elysia, t } from "elysia";
import { cors } from '@elysiajs/cors'
import { authPlugin } from "./plugin/auth";
import { products } from "./routes/admin/products";
import { categories } from "./routes/admin/categories";
import { upload } from "./routes/admin/s3";

const dev = async () => {
  const sleep = () => new Promise<void>((res, rej) => setTimeout(() => res(), 2000))
  await sleep()
  if (Math.random() > 0.5)
    throw new Error()
}

const api = new Elysia()
  .use(cors())
  .derive(async ctx => {
    //await dev()
    return ctx
  })
  .use(authPlugin)
  .use(categories)
  .use(products)
  .use(upload)
  .listen(3000);

console.log(
  `🦊 Elysia is running at ${api.server?.hostname}:${api.server?.port}`
);

export type API = typeof api
