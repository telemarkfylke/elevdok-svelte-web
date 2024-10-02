import { logger } from "@vtfk/logger"
import { getUserData } from "./get-user-data"
import { getMockDocuments } from "$lib/call-archive/mock-data"
import { getAzfArchiveDocuments } from "$lib/call-archive/azf-archive"
import { hasFileAccessForStudent } from "$lib/permissions"
import { createUserLogEntry } from "./user-logs"
import { env } from "$env/dynamic/private"

/**
 * 
 * @param {import("$lib/authentication").User} user 
 * @param {string} studentFeidenavn
 * @returns
 */
export const getStudentDocuments = async (user, studentFeidenavn) => {
  const loggerPrefix = `getStudentDocuments - user: ${user.principalName} - student: ${studentFeidenavn}`
  logger('info', [loggerPrefix, 'New request'])

  // Validate parameteres
  if (!studentFeidenavn) {
    logger('error', [loggerPrefix, 'Missing required parameter "studentFeidenavn'])
    throw new Error('Missing required parameter "studentFeidenavn"')
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

  const result = {
    documents: [],
    errors: []
  }

  if (env.MOCK_API === 'true') {
    logger('info', [loggerPrefix, 'MOCK_API is true', 'Returning mock documents'])
    const documents = getMockDocuments(teacherStudent, loggerPrefix, 300)
    result.documents.push(...documents)
    result.errors.push('Bare en mocke-feil for å se hvordan det ser ut')
  } else {
    // XFYLKE (mainArchive)
    try {
      logger('info', [loggerPrefix, 'Fetching student documents from main archive'])
      const { documents, errors } = await getAzfArchiveDocuments(teacherStudent.fodselsnummer, studentFeidenavn, loggerPrefix)
      logger('info', [loggerPrefix, `Got ${documents.length} student documents from main archive`])
      result.documents.push(...documents)
      result.errors.push(...errors)
    } catch (error) {
      logger('error', [loggerPrefix, 'Failed when fetching documents from main archive', error.response?.data || error.stack || error.toString()])
    }
    // VTFK
    // To be implemented
  }

  logger('info', [loggerPrefix, `Adding viewFiles permission to all ${result.documents.length} documents' files, for easier frontend handling`])
  const { access, type } = hasFileAccessForStudent(teacherStudent, loggerPrefix)
  result.documents = result.documents.map(doc => {
    return {
      ...doc,
      files: doc.files.map(file => {
        return {
          ...file,
          canView: access
        }
      })
    }
  })

  // Sort documents - newest first
  result.documents = result.documents.sort((a, b) => { return new Date(b.documentDate) - new Date(a.documentDate) })

  // Create log element
  logger('info', [loggerPrefix, `Got ${result.documents.length} - creating logEntry`])
  const logData = {
    user,
    teacherStudent,
    accessType: type,
    action: 'Åpnet oversikten over elevens dokumenter'
  }
  const logEntryId = await createUserLogEntry(logData, loggerPrefix)
  logger('info', [loggerPrefix, `LogEntry with id ${logEntryId.insertedId} successfully created, returning file`])

  return result
}