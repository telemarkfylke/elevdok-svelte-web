import { env } from '$env/dynamic/private'
import { error } from '@sveltejs/kit'
import { logger } from '@vtfk/logger'
import { getActiveRole } from './minelev-api/roles'
import { getAdminImpersonation } from './minelev-api/admin-impersonation'

/**
 * @typedef Role
 * @property {string} value
 * @property {string} roleName
 */

/**
 * @typedef Impersonation
 * @property {string} target
 * @property {"larer" | "leder"} type
 */

/**
 * @typedef User
 * @property {string} principalName upn
 * @property {string} principalId objectId
 * @property {string} audience guid for the app
 * @property {string} name displayName
 * @property {string} activeRole activeRole value
 * @property {Role[]} roles list of available roles
 * @property {boolean} hasAdminRole if user has admin role
 * @property {Impersonation} [impersonating] is adminuser impersonating another user
 *
*/

/**
 *
 * @param {Headers} headers
 * @returns {User} current user
 */
export const getAuthenticatedUser = async (headers) => {
  if (env.MOCK_AUTH === 'true' && env.NODE_ENV !== 'production') {
    logger('warn', ['env.MOCK_AUTH is true, injecting MS auth headers, enjoy your local testing - if this in prod, pray and delete everything'])
    headers.set('x-ms-client-principal-name', `demo.spokelse@${env.FEIDENAVN_SUFFIX}`)
    headers.set('x-ms-client-principal-id', '12345-4378493-fjdiofjd')

    // Create mock claims with necessary values
    const mockClaims = {
      auth_typ: 'aad',
      claims: [
        {
          typ: 'aud',
          val: 'guid-guid'
        },
        {
          typ: 'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress',
          val: `demo.spokelse@${env.FEIDENAVN_SUFFIX}`
        },
        {
          typ: 'name',
          val: 'Demo Spøkelse'
        },
        {
          typ: 'http://schemas.microsoft.com/identity/claims/objectidentifier',
          val: '12345-4378493-fjdiofjd'
        },
        {
          typ: 'preferred_username',
          val: `demo.spokelse@${env.FEIDENAVN_SUFFIX}`
        }
      ],
      name_typ: 'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress',
      role_typ: 'http://schemas.microsoft.com/ws/2008/06/identity/claims/role'
    }
    if (env.MOCK_AUTH_LARER_ROLE === 'true') {
      mockClaims.claims.push({
        typ: 'roles',
        val: env.DEFAULT_ROLE
      })
    }
    if (env.MOCK_AUTH_LEDER_ROLE === 'true') {
      mockClaims.claims.push({
        typ: 'roles',
        val: env.LEDER_ROLE
      })
    }
    if (env.MOCK_AUTH_ADMIN_ROLE === 'true') {
      mockClaims.claims.push({
        typ: 'roles',
        val: env.ADMIN_ROLE
      })
    }

    const mockClaimsBase64 = Buffer.from(JSON.stringify(mockClaims), 'utf-8').toString('base64')
    headers.set('x-ms-client-principal', mockClaimsBase64)
  }

  // Get MS Auth headers (https://learn.microsoft.com/en-us/azure/app-service/configure-authentication-user-identities)
  const principalName = headers.get('x-ms-client-principal-name')
  const principalId = headers.get('x-ms-client-principal-id')
  const encodedClaims = headers.get('x-ms-client-principal')

  if (!principalName || !principalId || !encodedClaims) {
    logger('warn', ['Missing authentication headers from Microsoft, something is wrong'])
    throw error(500, 'Missing authentication headers from Microsoft, something is wrong')
  }

  const decodedClaims = JSON.parse(Buffer.from(encodedClaims, 'base64').toString())
  if (!decodedClaims) throw error(500, 'Det e itj no token her')
  const roles = decodedClaims.claims.filter(claim => claim.typ === 'roles').map(claim => claim.val)
  const name = decodedClaims.claims.find(claim => claim.typ === 'name').val
  const audience = decodedClaims.claims.find(claim => claim.typ === 'aud').val

  let activeRole = ''
  if (roles.length === 0) throw new Error('DU HAKKE TILGANG PÅ NOE DU!')
  if (roles.length > 1) {
    // Check in db for activeRole for principalId (save principalName as well)
    logger('info', ['User has more than one role, checking for active role'])
    const activeDbRole = await getActiveRole(principalId)
    if (!activeDbRole) {
      if (roles.includes(env.LEDER_ROLE)) {
        activeRole = env.LEDER_ROLE // Default to leder if user have several, and none selected in db
      } else {
        activeRole = roles[0] // Else just set first role as active
      }
    } else {
      logger('info', [`User ${principalName} has active db role: ${activeDbRole}`, 'Verifying and setting active'])
      if (!roles.includes(activeDbRole)) {
        logger('warn', [`User ${principalName} has active db role: ${activeDbRole} - but no access to this role from entra auth. Will not use illegal role`])
        activeRole = roles[0]
      } else {
        logger('info', [`User ${principalName} has active db role: ${activeDbRole} and access to this role from entra auth. Will set active role as ${activeDbRole}`])
        activeRole = activeDbRole
      }
    }
    // Check that activeRole is present in current roles as well. If so - set as active, if not, just set first role as
  } else {
    activeRole = roles[0]
  }

  // Add displayNames to roles
  const repackedRoles = roles.map(role => {
    let roleName = ''
    if (role === env.DEFAULT_ROLE) roleName = 'Lærer'
    if (role === env.LEDER_ROLE) roleName = 'Leder / Rådgiver'
    if (role === env.ADMIN_ROLE) roleName = 'Administrator'
    if (!roleName) throw new Error(`HEIHEI, her mangler det displayName for rollen med verdi ${role}`)
    return {
      value: role,
      roleName
    }
  })

  let impersonating = null

  // Check if has admin role (for easier checks later on)
  const hasAdminRole = repackedRoles.some(role => role.value === env.ADMIN_ROLE)

  // Check if hasAdmin and is impersonating
  if (hasAdminRole) {
    const impersonation = getAdminImpersonation({ principalId, hasAdminRole })
    if (impersonation) impersonating = impersonation
  }

  return {
    principalName,
    principalId,
    name,
    audience,
    activeRole,
    roles: repackedRoles,
    hasAdminRole,
    impersonating
  }
}
