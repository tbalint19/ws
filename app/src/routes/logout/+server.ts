import { redirect } from '@sveltejs/kit'

export const GET = async (event) => {
  
  event.cookies.delete("session", {
    path: '/',
    httpOnly: true,
    sameSite: 'lax',
    secure: true,
  })

  throw redirect(307, "/")  
}