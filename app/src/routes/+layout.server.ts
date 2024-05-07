export const prerender = false

export const load = (event) => {
  const sessionToken = event.cookies.get("session")
  return { sessionToken }
}