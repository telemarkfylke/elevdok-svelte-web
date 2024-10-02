import { getUserData } from '$lib/api'
import { getAuthenticatedUser } from '$lib/authentication'
import { json } from '@sveltejs/kit'

export const GET = async ({ params, request }) => {
  const user = await getAuthenticatedUser(request.headers)
  const userData = await getUserData(user)
  return json({ user, ...userData })
}
