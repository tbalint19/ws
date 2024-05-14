import { redirect } from '@sveltejs/kit'
export const load = async (event) => {

  const sessionToken = event.cookies.get("session")

  if (sessionToken)
    throw redirect(308, "/dashboard")

  return { }
}