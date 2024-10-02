import { setActiveRole } from '$lib/api'
import { getAuthenticatedUser } from '$lib/authentication'
import { error, redirect } from '@sveltejs/kit'
import { logger } from '@vtfk/logger'

/** @type {import('./$types').Actions} */
export const actions = {
  changeActiveRole: async (event) => {
    try {
      const requestedRole = (await event.request.formData()).get('active_role')
      if (!requestedRole) {
        throw error(400, 'Missing required formdata "active_role')
      }
      const user = await getAuthenticatedUser(event.request.headers)
      await setActiveRole(user, requestedRole)
    } catch (err) {
      logger('error', ['Failed when changing active role for user', err.response?.data || err.stack || err.toString()])
      throw error(500, `Failed when changing active role. Error: ${err.response?.data || err.stack || err.toString()}`)
    }
    throw redirect(303, '/')
  }
}
