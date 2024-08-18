import { getUserLogs } from '$lib/api'
import { getAuthenticatedUser } from '$lib/authentication'
import { json } from '@sveltejs/kit'

export const GET = async ({ params, request, url }) => {
  try {
    const user = await getAuthenticatedUser(request.headers)
    const searchValue = url.searchParams.get('search')
    const logEntries = await getUserLogs(user, searchValue)

    return json(logEntries)
  } catch (error) {
    return json({ message: 'Failed when getting log entries', error: error.response?.data || error.stack || error.toString() }, { status: 400 })
  }
}
