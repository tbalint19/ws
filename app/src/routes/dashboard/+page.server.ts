import { redirect } from '@sveltejs/kit'
import { serverClient } from '../../api/serverClient.js'
export const load = async (event) => {

  const sessionToken = event.cookies.get("session")

  if (!sessionToken)
    throw redirect(308, "/")

  return { items: [] }
}