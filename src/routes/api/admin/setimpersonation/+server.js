import { getAuthenticatedUser } from '$lib/authentication'
import { setAdminImpersonation } from '$lib/elevdok-api/admin-impersonation'
import { json } from '@sveltejs/kit'

export const POST = async ({ params, request, url }) => {
  try {
    const { target, type } = await request.json()
    if (!type) return json({ message: 'Missing "type"' }, { status: 400 })
    if (!target) return json({ message: 'Missing "target"' }, { status: 400 })

    const user = await getAuthenticatedUser(request.headers)
    await setAdminImpersonation(user, target, type)

    return json({ target, type })
  } catch (error) {
    return json({ message: 'Failed when setting user impersonation', error: error.response?.data || error.stack || error.toString() }, { status: 400 })
  }
}
