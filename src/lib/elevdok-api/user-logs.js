import { env } from "$env/dynamic/private"
import { getMockDb } from "$lib/mock-db"
import { closeMongoClient, getMongoClient } from "$lib/mongo-client"
import { logger } from "@vtfk/logger"
import { ObjectId } from "mongodb"
import { getCurrentSchoolYear } from "./get-user-data"

export const createUserLogEntry = async (logData, loggerPrefix) => {
  const { user, teacherStudent, accessType, action, file } = logData
  if (!action) throw new Error('Missing required parameter "action"')
  if (!user) throw new Error('Missing required parameter "user"')
  if (!teacherStudent) throw new Error('Missing required parameter "teacherStudent"')
  if (!accessType) throw new Error('Missing required parameter "accessType"')
  if (!loggerPrefix) throw new Error('Missing required parameter "loggerPrefix"')

  if (file) {
    if (!file.id) throw new Error('Missing required parameter "file.id"')
    if (!file.title) throw new Error('Missing required parameter "file.title"')
    if (!file.documentNumber) throw new Error('Missing required parameter "file.documentNumber"')
    if (!file.sourceId) throw new Error('Missing required parameter "file.sourceId"')
  }

  logger('info', [loggerPrefix, 'Creating logEntry'])
  const logEntry = {
    timestamp: new Date().toISOString(),
    user: {
      principalName: user.principalName,
      principalId: user.principalId,
      name: user.name,
      role: user.activeRole,
      hasAdminRole: user.hasAdminRole,
      impersonating: user.impersonating || null
    },
    student: {
      name: teacherStudent.navn,
      feidenavn: teacherStudent.feidenavn,
      elevnummer: teacherStudent.elevnummer
    },
    accessType,
    action,
    file: file || null
  }
  if (env.MOCK_API === 'true') {
    logger('info', [loggerPrefix, 'MOCK_API is true, adding logEntry to mockDb'])
    const mockDb = getMockDb()
    logEntry.type = 'logElement'
    const randomId = new ObjectId().toString()
    logEntry._id = randomId
    mockDb.set(randomId, logEntry)
    logger('info', [loggerPrefix, `MOCK_API is true, document successfully added to mockDb with id: ${randomId}`])
    return { insertedId: randomId }
  }
  logger('info', [loggerPrefix, 'Inserting logEntry in db'])
  try {
    const mongoClient = await getMongoClient()
    const collection = mongoClient.db(env.MONGODB_DB_NAME).collection(`${env.MONGODB_LOGS_COLLECTION}-${getCurrentSchoolYear('-')}`)
    const insertLogResult = await collection.insertOne(logEntry)
    logger('info', [loggerPrefix, `LogEntry successfully inserted: ${insertLogResult.insertedId}`])
    return insertLogResult
  } catch (error) {
    if (error.toString().startsWith('MongoTopologyClosedError')) {
      logger('warn', 'Oh no, topology is closed! Closing client')
      closeMongoClient()
    }
    throw error
  }
}

export const getUserLogs = async (user, searchValue = '') => {
  const loggerPrefix = `getUserLogs - user: ${user.principalName} - searchValue: ${searchValue}`
  if (!user.hasAdminRole) {
    logger('warn', [loggerPrefix, 'Missing required admin access to get user logs'])
    throw new Error('You do not have permission to do this')
  }
  logger('info', [loggerPrefix, 'Getting user logs from db'])
  if (env.MOCK_API === 'true') {
    logger('info', [loggerPrefix, 'MOCK_API is true, getting logs from mockDb'])
    const userLogs = []
    const mockDb = getMockDb()
    const dbKeys = mockDb.keys()
    for (const key of dbKeys) {
      const logElement = mockDb.get(key)
      if (logElement.type !== 'logElement') continue
      // If searchValue, check for matches
      if (searchValue) {
        console.log(typeof searchValue)
        logger('info', [loggerPrefix, `searchValue: ${searchValue}`, 'checking for matches'])
        if (logElement.user.name.toLowerCase() === searchValue.toLowerCase()) {
          userLogs.push(logElement)
          continue
        }
        if (logElement.user.principalName.toLowerCase() === searchValue.toLowerCase()) {
          userLogs.push(logElement)
          continue
        }
        if (logElement.user.principalId === searchValue) {
          userLogs.push(logElement)
          continue
        }
        if (logElement.user.impersonating && logElement.user.impersonating.target.toLowerCase() === searchValue.toLowerCase()) {
          userLogs.push(logElement)
          continue
        }
        if (logElement.student.name.toLowerCase() === searchValue.toLowerCase()) {
          userLogs.push(logElement)
          continue
        }
        if (logElement.student.feidenavn.toLowerCase() === searchValue.toLowerCase()) {
          userLogs.push(logElement)
          continue
        }
        if (logElement.file && logElement.file.documentNumber.toLowerCase() === searchValue.toLowerCase()) {
          userLogs.push(logElement)
          continue
        }
        if (logElement.file && logElement.file.title.toLowerCase() === searchValue.toLowerCase()) {
          userLogs.push(logElement)
          continue
        }
        if (logElement.file && logElement.file.id.toLowerCase() === searchValue.toLowerCase()) {
          userLogs.push(logElement)
          continue
        }
      } else {
        // If not searchValue, return all top 30 or something
        userLogs.push(logElement)
      }
    }
    logger('info', [loggerPrefix, 'MOCK_API is true', `Found ${userLogs.length} log entries in mockdb - returning`])
    return userLogs.sort((a, b) => { return new Date(b.timestamp) - new Date(a.timestamp) })
  }
  // Get top 50 logs from mongodb
  try {
    const mongoClient = await getMongoClient()
    const collection = mongoClient.db(env.MONGODB_DB_NAME).collection(`${env.MONGODB_LOGS_COLLECTION}-${getCurrentSchoolYear('-')}`)
    // IMPLEMENT SEARCH FUNCTION AS WELL
    const top50 = await collection.find().sort({ _id: -1 }).limit(50).toArray() // sort({_id:-1}) returns newest first
    logger('info', [loggerPrefix, `Found ${top50.length} recent log entries - returning`])
    return top50
  } catch (error) {
    if (error.toString().startsWith('MongoTopologyClosedError')) {
      logger('warn', 'Oh no, topology is closed! Closing client')
      closeMongoClient()
    }
    throw error
  }
}