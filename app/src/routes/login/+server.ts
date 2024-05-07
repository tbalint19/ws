import { redirect } from '@sveltejs/kit'
import { serverClient } from '../../api/serverClient.js'

export const GET = async (request) => {

  const code = request.url.searchParams.get("code")
  
  if (!code)
    throw redirect(308, "/")

  const response = await serverClient["social-login"].post({ code })
    .catch((err) => console.log(err))
  
  if (!response?.data)
    throw redirect(308, "/")


  request.cookies.set('session', response.data.sessionToken, {
    path: '/',
    httpOnly: true,
    sameSite: 'lax',
    secure: true,
    maxAge: 60 * 60 * 24 * 30
  })

  throw redirect(308, "/dashboard")
}