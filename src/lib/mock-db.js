import { logger } from '@vtfk/logger'
import NodeCache from 'node-cache'

let mockDb = null

/**
 *
 * @returns { import('node-cache') }
 */
export const getMockDb = () => {
  if (!mockDb) {
    logger('info', ['mock-db', 'Mock db does not exist - creating'])
    mockDb = new NodeCache({ stdTTL: 10000 })
    logger('info', ['mock-db', 'Mock db created - returning'])
  }
  return mockDb
}
