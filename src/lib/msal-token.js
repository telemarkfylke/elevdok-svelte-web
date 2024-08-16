import { env } from '$env/dynamic/private'
import { ConfidentialClientApplication } from '@azure/msal-node'
import { logger } from '@vtfk/logger'
import NodeCache from 'node-cache'

const cache = new NodeCache({ stdTTL: 4000 })

/**
 *
 * @param {Object} config
 * @param {string} config.scope
 * @param {boolean} [config.forceNew]
 */
export const getMsalToken = async (config) => {
  if (!config.scope) throw new Error('Missing required parameter config.scope')
  const cacheKey = `${config.scope}token`

  const cachedToken = cache.get(cacheKey)
  if (!config.forceNew && cachedToken) {
    // logger('info', ['getMsalToken', 'found valid token in cache, will use that instead of fetching new'])
    return cachedToken.substring(0, cachedToken.length - 2)
  }

  logger('info', ['getMsalToken', 'no token in cache, fetching new from Microsoft'])

  const confidentialClientApplication = new ConfidentialClientApplication({
    auth: {
      clientId: env.APPREG_CLIENT_ID,
      authority: `https://login.microsoftonline.com/${env.APPREG_TENANT_ID}/`,
      clientSecret: env.APPREG_CLIENT_SECRET
    }
  })

  const token = await confidentialClientApplication.acquireTokenByClientCredential({
    scopes: [config.scope]
  })
  const expires = Math.floor((token.expiresOn.getTime() - new Date()) / 1000)
  logger('info', ['getMsalToken', `Got token from Microsoft, expires in ${expires} seconds.`])
  cache.set(cacheKey, `${token.accessToken}==`, expires) // Haha, just to make the cached token not directly usable
  logger('info', ['getMsalToken', 'Token stored in cache'])

  return token.accessToken
}
