import { env } from '$env/dynamic/private'
import { getAuthenticatedUser } from '$lib/authentication'
import { getFile } from '$lib/elevdok-api/get-file'
import { json } from '@sveltejs/kit'

export const GET = async ({ params, request, url }) => {
  try {
    const user = await getAuthenticatedUser(request.headers)
    const studentFeidenavn = `${params.feidenavnPrefix}@${env.FEIDENAVN_SUFFIX}`
    const sourceId = params.sourceId
    const fileId = params.fileId
    const base64 = await getFile(user, studentFeidenavn, sourceId, fileId)
    return json(base64)
  } catch (error) {
    return json({ message: 'Failed when getting student', error: error.response?.data || error.stack || error.toString() }, { status: 500 })
  }
}
