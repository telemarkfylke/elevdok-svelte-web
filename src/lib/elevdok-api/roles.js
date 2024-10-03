import { env } from '$env/dynamic/private'
import { getMockDb } from '$lib/mock-db'
import { closeMongoClient, getMongoClient } from '$lib/mongo-client'
import { logger } from '@vtfk/logger'

/**
 *
 * @param {string} principalId
 * @returns
 */
export const getActiveRole = async (principalId) => {
  if (env.MOCK_API === 'true') {
    const mockDb = getMockDb()
    const activeRole = mockDb.get('activeRole')
    return activeRole || null
  }
  try {
    const mongoClient = await getMongoClient()
    const collection = mongoClient.db(env.MONGODB_DB_NAME).collection(env.MONGODB_USER_SETTINGS_COLLECTION)
    const userSettings = await collection.findOne({ principalId })
    if (!userSettings) return null
    return userSettings.activeRole || null
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
 * @param {string} requestedRole
 * @returns
 */
export const setActiveRole = async (user, requestedRole) => {
  logger('info', [`${user.principalName} requested role change to role: ${requestedRole}`])
  if (!user.roles.some(role => role.value === requestedRole)) {
    logger('warn', [`${user.principalName} does not have access to role: ${requestedRole}`])
    throw new Error('Du har ikke tilgang på den rollen')
  }
  logger('info', [`${user.principalName} has access to role ${requestedRole}, changing role for user`])
  if (env.MOCK_API === 'true') {
    const mockDb = getMockDb()
    mockDb.set('activeRole', requestedRole)
    logger('info', ['MOCK-API is enabled', `${user.principalName} succesfully changed role to ${requestedRole} in mock db`])
    return
  }
  try {
    const mongoClient = await getMongoClient()
    const collection = mongoClient.db(env.MONGODB_DB_NAME).collection(env.MONGODB_USER_SETTINGS_COLLECTION)
    await collection.findOneAndUpdate({ principalId: user.principalId }, { $set: { principalId: user.principalId, principalName: user.principalName, activeRole: requestedRole, changedTimestamp: new Date().toISOString() } }, { upsert: true })
    logger('info', [`${user.principalName} succesfully changed role to ${requestedRole} in db`])
  } catch (error) {
    if (error.toString().startsWith('MongoTopologyClosedError')) {
      logger('warn', 'Oh no, topology is closed! Closing client')
      closeMongoClient()
    }
    throw error
  }
}
