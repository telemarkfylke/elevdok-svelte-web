import { setActiveRole } from '$lib/api'
import { getAuthenticatedUser } from '$lib/authentication'
import { json } from '@sveltejs/kit'

export const POST = async ({ params, request, url }) => {
  try {
    const { requestedRole } = await request.json()
    if (!requestedRole || typeof requestedRole !== 'string') return json({ message: 'Missing "requestedRole" (string)' }, { status: 400 })

    const user = await getAuthenticatedUser(request.headers)
    await setActiveRole(user, requestedRole)

    return json({ requestedRole })
  } catch (error) {
    return json({ message: 'Failed when changing role for user', error: error.response?.data || error.stack || error.toString() }, { status: 500 })
  }
}
