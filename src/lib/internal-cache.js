import { logger } from '@vtfk/logger'
import NodeCache from 'node-cache'

let internalCache = null

/**
 *
 * @returns { import('node-cache') }
 */
export const getInternalCache = () => {
  if (!internalCache) {
    logger('info', ['internal-cache', 'Internal cache does not exist - creating'])
    internalCache = new NodeCache({ stdTTL: 10000 })
    logger('info', ['internal-cache', 'Internal cache created - returning'])
  }
  return internalCache
}

/**
 *
 * @returns { import('node-cache') }
 */
export const resetInternalCache = () => {
  if (!internalCache) {
    return true
  }
  logger('info', ['internal-cache', 'Resetting internal cache'])
  internalCache.flushAll()
  logger('info', ['internal-cache', 'Reset internal cache - done'])
  return true
}
