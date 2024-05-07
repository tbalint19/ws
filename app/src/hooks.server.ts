import { redirect } from "@sveltejs/kit"

const publicRoutes = [
  "/",
  "/login",
  "/hello",
]

export const handle = ({ event, resolve }) => {

  const path = event.url.pathname
  if (publicRoutes.includes(path))
    return resolve(event)

  const sessionToken = event.cookies.get("session")
  if (!sessionToken)
    throw redirect(307, "/")

  // all "real" authentication will happen on the server
  // sensitive data will not leak, even though this auth is superficial
  return resolve(event)
}