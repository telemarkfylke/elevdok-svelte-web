import { getAuthenticatedUser } from '$lib/authentication'
import { deleteAdminImpersonation } from '$lib/elevdok-api/admin-impersonation'
import { json } from '@sveltejs/kit'

export const DELETE = async ({ params, request, url }) => {
  try {
    const user = await getAuthenticatedUser(request.headers)
    deleteAdminImpersonation(user)

    return json({ message: 'Deleted' })
  } catch (error) {
    return json({ message: 'Failed when deleting user impersonation', error: error.response?.data || error.stack || error.toString() }, { status: 400 })
  }
}
