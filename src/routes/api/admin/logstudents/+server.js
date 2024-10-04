import { getAuthenticatedUser } from '$lib/authentication'
import { logStudentSearch } from '$lib/elevdok-api/user-logs'
import { json } from '@sveltejs/kit'
import { logger } from '@vtfk/logger'

export const GET = async ({ params, request, url }) => {
  try {
    const user = await getAuthenticatedUser(request.headers)
    const searchName = url.searchParams.get('search_name')

    const students = await logStudentSearch(user, searchName)
    return json(students)
  } catch (error) {
    logger('error', ['Failed when getting log students', error.response?.data || error.stack || error.toString()])
    return json({ message: 'Feilet ved henting av elever', error: error.response?.data || error.stack || error.toString() }, { status: 400 })
  }
}
