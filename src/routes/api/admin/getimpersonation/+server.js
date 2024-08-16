import { getAdminImpersonation } from '$lib/api'
import { getAuthenticatedUser } from '$lib/authentication'
import { json } from '@sveltejs/kit'

export const GET = async ({ params, request, url }) => {
  try {
    const user = await getAuthenticatedUser(request.headers)
    const impersonation = getAdminImpersonation(user)

    return json({ impersonation })
  } catch (error) {
    return json({ message: 'Failed when getting user impersonation', error: error.response?.data || error.stack || error.toString() }, { status: 400 })
  }
}
