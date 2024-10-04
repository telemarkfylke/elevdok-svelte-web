import { getAuthenticatedUser } from '$lib/authentication'
import { getUserLogs } from '$lib/elevdok-api/user-logs'
import { json } from '@sveltejs/kit'

export const GET = async ({ params, request, url }) => {
  try {
    const user = await getAuthenticatedUser(request.headers)
    const studentNumber = url.searchParams.get('student_number')
    const userPrincipalId = url.searchParams.get('user_principal_id')
    const documentNumber = url.searchParams.get('document_number')

    const filter = {
      studentNumber,
      userPrincipalId,
      documentNumber
    }

    const logEntries = await getUserLogs(user, filter)

    return json(logEntries)
  } catch (error) {
    return json({ message: 'Failed when getting log entries', error: error.response?.data || error.stack || error.toString() }, { status: 400 })
  }
}
