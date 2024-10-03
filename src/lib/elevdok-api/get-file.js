import { logger } from '@vtfk/logger'
import { getUserData } from './get-user-data'
import { hasFileAccessForStudent } from '$lib/permissions'
import { getAzfArchiveFile } from '$lib/call-archive/azf-archive'
import { mockFile } from '$lib/call-archive/mock-data'
import { createUserLogEntry } from './user-logs'
import { env } from '$env/dynamic/private'

/**
 *
 * @param {import("$lib/authentication").User} user
 * @param {string} studentFeidenavn
 * @param {string} sourceId
 * @param {string} fileId
 * @returns {string} file as base64
 */
export const getFile = async (user, studentFeidenavn, sourceId, fileId) => {
  const loggerPrefix = `getFile - user: ${user.principalName} - student: ${studentFeidenavn} - sourceId: ${sourceId} - fileId: ${fileId}`
  logger('info', [loggerPrefix, 'New request'])

  // Validate parameteres
  if (!studentFeidenavn) {
    logger('error', [loggerPrefix, 'Missing required parameter "studentFeidenavn'])
    throw new Error('Missing required parameter "studentFeidenavn"')
  }
  if (!sourceId) {
    logger('error', [loggerPrefix, 'Missing required parameter "sourceId'])
    throw new Error('Missing required parameter "sourceId"')
  }
  if (!fileId) {
    logger('error', [loggerPrefix, 'Missing required parameter "fileId'])
    throw new Error('Missing required parameter "fileId"')
  }

  // Check if regular teacher or administrator impersonating teacher or leder
  const canViewDocuments = user.activeRole === env.DEFAULT_ROLE || user.activeRole === env.LEDER_ROLE || (user.hasAdminRole && user.impersonating?.type === 'larer') || (user.hasAdminRole && user.impersonating?.type === 'leder')
  if (!canViewDocuments) {
    logger('warn', [loggerPrefix, 'Not allowed to view documents with current role'])
    throw new Error('Not allowed to view documents with current role')
  }

  // Then validate access to student
  const userData = await getUserData(user, false)
  const availableStudents = userData.students
  logger('info', [loggerPrefix, 'Validating access to student'])
  const allowedToView = availableStudents.some(stud => stud.feidenavn === studentFeidenavn)
  if (!allowedToView) {
    logger('warn', [loggerPrefix, 'No access to student, or student does not exist'])
    throw new Error('No access to student, or student is not registered')
  }

  const teacherStudent = availableStudents.find(stud => stud.feidenavn === studentFeidenavn)
  logger('info', [loggerPrefix, 'Access to student validated'])

  // Sjekk også at bruker har tilgang til å faktisk åpne filen!! Basert på ENV-variabler
  logger('info', [loggerPrefix, 'Validating access to files for student'])
  const { access, type } = hasFileAccessForStudent(user, teacherStudent, loggerPrefix)

  if (!access) {
    logger('warn', [loggerPrefix, 'Teacher does NOT have access to files for student'])
    throw new Error('Du har ikke tilgang på å se dette dokumentet')
  } else {
    logger('info', [loggerPrefix, `Validated access to files for student - accessType: ${type}`])
  }

  const result = {
    base64: null,
    metadata: null
  }
  logger('info', [loggerPrefix, `Fetching file from source ${sourceId}`])

  if (env.MOCK_API === 'true') {
    logger('info', [loggerPrefix, 'MOCK_API is true', 'Returning mock file'])
    const { base64 } = mockFile
    result.base64 = base64
    result.metadata = {
      title: 'Mocke-fil',
      documentNumber: '24/mock1234'
    }
  } else if (sourceId === 'mainArchive') {
    try {
      const { base64, metadata } = await getAzfArchiveFile(fileId, loggerPrefix)
      result.base64 = base64
      result.metadata = metadata
    } catch (error) {
      logger('error', [loggerPrefix, `Failed when fetching file (${fileId}) from mainArchive`, error.response?.data || error.stack || error.toString()])
      throw new Error('No access to student, or student is not registered')
    }
  } else if (env.VTFK_ARCHIVE_ENABLED === 'true' && sourceId === 'vtfk') {
    // implement
  }
  logger('info', [loggerPrefix, 'Got base64file - creating logEntry'])
  const logData = {
    user,
    teacherStudent,
    accessType: type,
    action: `Åpnet filen ${result.metadata.title} i dokument ${result.metadata.documentNumber}`,
    file: {
      ...result.metadata,
      sourceId,
      id: fileId
    }
  }
  const logEntryId = await createUserLogEntry(logData, loggerPrefix)
  logger('info', [loggerPrefix, `LogEntry with id ${logEntryId.insertedId} successfully created, returning file`])

  return result.base64
}
