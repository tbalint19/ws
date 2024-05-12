import { Elysia, t } from "elysia";
import { authPlugin } from "../../plugin/auth";
import { AuthenticationError } from "../../lib/authPlugin";
import { getPresignedUrl } from "../../lib/s3";

const sleep = () => new Promise<void>((res, rej) => setTimeout(() => res(), 2000))

export const upload = new Elysia()
  .use(authPlugin)
  .post("/api/upload/images", async (ctx) => {

    await sleep()
    if (Math.random() > 0.5)
      throw new Error()

    if (!ctx.user)
      throw new AuthenticationError()
    
    const url = await getPresignedUrl("images/", ctx.body.filename, ctx.body.type)
    return { url }
  }, {
    body: t.Object({
      filename: t.String(),
      type: t.String(),
    })
  })