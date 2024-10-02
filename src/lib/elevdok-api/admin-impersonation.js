import { env } from "$env/dynamic/private"
import { getInternalCache } from "$lib/internal-cache"
import { closeMongoClient, getMongoClient } from "$lib/mongo-client"
import { logger } from "@vtfk/logger"

const isGuid = (value) => {
  return String(value).match(/^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[4][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}$/)
}

/**
 * 
 * @param {import("$lib/authentication").User} user 
 * @returns 
 */
export const getAdminImpersonation = (user) => {
  if (!user.hasAdminRole) throw new Error('You do not have permission to do this')
  const internalCache = getInternalCache()
  const impersonation = internalCache.get(`${user.principalId}-impersonation`)
  return impersonation || null
}

/**
 * 
 * @param {import("$lib/authentication").User} user 
 * @param {string} target 
 * @param {"larer" | "leder"} type 
 * @returns
 */
export const setAdminImpersonation = async (user, target, type) => {
  if (!user.hasAdminRole) throw new Error('You do not have permission to do this')
  if (typeof target !== 'string') throw new Error('target må værra string')
    if (!target.endsWith(`@${env.FEIDENAVN_SUFFIX}`) && !isGuid(target)) throw new Error(`Target må ende på @${env.FEIDENAVN_SUFFIX} eller værra en guid`)
  if (!['larer', 'leder'].includes(type)) throw new Error('type må værra "larer" eller "leder"')
  const internalCache = getInternalCache()
  internalCache.set(`${user.principalId}-impersonation`, { target, type })
  logger('warn', [`Admin user ${user.principalName} is impersonating user ${target} (type: ${type})`, `${user.principalName} probably need to do this, but logging for extra safety.`, 'Saving impersonation-logEntry to db as well'])
  if (env.MOCK_API === 'true') return
  try {
    const mongoClient = await getMongoClient()
    const collection = mongoClient.db(env.MONGODB_DB_NAME).collection(env.MONGODB_USER_IMPERSONATION_COLLECTION)
    const logEntry = {
      timestamp: new Date().toISOString(),
      user: {
        principalName: user.principalName,
        principalId: user.principalId
      },
      impersonationTarget: target,
      impersonationRole: type
    }
    const insertLogResult = await collection.insertOne(logEntry)
    return insertLogResult
  } catch (error) {
    if (error.toString().startsWith('MongoTopologyClosedError')) {
      logger('warn', 'Oh no, topology is closed! Closing client')
      closeMongoClient()
    }
    throw error
  }
}

/**
 * 
 * @param {import("$lib/authentication").User} user 
 */
export const deleteAdminImpersonation = (user) => {
  if (!user.hasAdminRole) throw new Error('You do not have permission to do this')
  const internalCache = getInternalCache()
  internalCache.del(`${user.principalId}-impersonation`)
}