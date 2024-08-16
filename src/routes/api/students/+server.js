import { ADMIN_ROLE, DEFAULT_ROLE } from '$env/static/private'
import { getUserData } from '$lib/api'
import { getAuthenticatedUser } from '$lib/authentication'
import { fintTeacher } from '$lib/fintfolk-api/teacher'
import { json } from '@sveltejs/kit'

export const GET = async ({ params, request }) => {
  const user = await getAuthenticatedUser(request.headers)
  const userData = await getUserData(user)
  return json(userData)
}
