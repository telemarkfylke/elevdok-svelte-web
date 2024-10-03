import { getAuthenticatedUser } from '$lib/authentication'
import { getAllLeaderAccess } from '$lib/elevdok-api/leder-access'
import { json } from '@sveltejs/kit'

export const GET = async ({ params, request, url }) => {
  try {
    const user = await getAuthenticatedUser(request.headers)
    const leaderAccess = await getAllLeaderAccess(user)

    return json(leaderAccess)
  } catch (error) {
    return json({ message: 'Failed when getting all leader access', error: error.response?.data || error.stack || error.toString() }, { status: 400 })
  }
}
