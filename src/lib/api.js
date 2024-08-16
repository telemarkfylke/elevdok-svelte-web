import { fintTeacher } from './fintfolk-api/teacher'
import { fintStudent } from './fintfolk-api/student'
import { closeMongoClient, getMongoClient } from './mongo-client'
import { env } from '$env/dynamic/private'
import { ObjectId } from 'mongodb'
import { getMockDb } from './mock-db'
import { logger } from '@vtfk/logger'
import { getInternalCache } from './internal-cache'
import axios from 'axios'
import { encryptContent } from '@vtfk/encryption'
import { getAzfArchiveDocuments, getAzfArchiveFile } from './call-archive/azf-archive'
import { getMockDocuments, mockFile } from './call-archive/mock-data'
import { hasFileAccessForStudent } from './permissions'

export const sleep = (ms) => {
  return new Promise((resolve) => {
    setTimeout(resolve, ms)
  })
}

const allowedUndervisningsforholdDescription = ['Adjunkt', 'Adjunkt m/till utd', 'Adjunkt 1', 'Lærer', 'Lektor', 'Lektor m/till utd', 'Lektor 1']

const getSchoolYearFromDate = (date, delimiter = '/') => {
  // Hvis vi er etter 15 juli inneværende år, så swapper vi til current/next. Ellers bruker vi previous/current
  const year = date.getFullYear()
  const previousYear = year - 1
  const nextYear = year + 1
  const midsommar = new Date(`${year}-07-15`)
  if (date > midsommar) return `${year}${delimiter}${nextYear}`
  return `${previousYear}${delimiter}${year}`
}

export const getCurrentSchoolYear = (delimiter = '/') => {
  return getSchoolYearFromDate(new Date(), delimiter)
}

const repackMiniSchool = (school, kontaktlarer) => {
  const kortkortnavn = school.kortnavn.indexOf('-') ? school.kortnavn.substring(school.kortnavn.indexOf('-') + 1) : school.kortnavn
  return {
    kortkortnavn,
    skolenummer: school.skolenummer,
    kortnavn: school.kortnavn,
    navn: school.navn,
    kontaktlarer
  }
}

const getIOPSchools = (teacherStudent) => {
  const IOPCourseIds = ['IOP1000', 'IOP2000', 'IOP3000', 'IOP4000', 'IOP5000']
  if (!teacherStudent) throw error('Missing required parameter "teacherStudent"')
  if (!Array.isArray(teacherStudent.skoler)) throw new Error('Missing "skoler" array from teacherStudent')
  if (!teacherStudent.skoler.every(school => Array.isArray(school.klasser) && school.klasser.every(group => Array.isArray(group.fag)))) throw new Error('Either missing "klasser" array from skole, or missing "fag" array from klasse')
  // Getting IOPSchools in case of future requirement where teachers can only see documents for specific schools
  const IOPSchools = teacherStudent.skoler.filter(school => school.klasser.some(group => group.fag.some(course => IOPCourseIds.includes(course.systemId?.identifikatorverdi))))
  return IOPSchools
}

/**
 *
 * @param {Object} user
 */
export const getUserData = async (user, maskSsn = true) => {
  let loggerPrefix = `getUserData - user: ${user.principalName}`
  logger('info', [loggerPrefix, 'New request'])
  const userData = {
    userData: null,
    invalidUndervisningsforhold: [],
    students: [],
    classes: []
  }

  // If regular teacher or administrator impersonating teacher
  if (user.activeRole === env.DEFAULT_ROLE || (user.hasAdminRole && user.impersonating?.type === 'larer')) {
    loggerPrefix += ' - role: Teacher'
    logger('info', [loggerPrefix, 'Fetching teacher data from FINT'])
    const teacherUpn = user.hasAdminRole && user.impersonating?.type === 'larer' ? user.impersonating.target : user.principalName
    const teacher = await fintTeacher(teacherUpn)
    if (!teacher) return userData

    userData.userData = {
      upn: teacher.upn,
      feidenavn: teacher.feidenavn,
      ansattnummer: teacher.ansattnummer,
      name: teacher.navn,
      firstName: teacher.fornavn,
      lastName: teacher.etternavn
    }

    logger('info', [loggerPrefix, 'Got data from FINT - validating undervsiningsforhold description'])
    const validUndervisningsforhold = teacher.undervisningsforhold.filter(forhold => forhold.aktiv && allowedUndervisningsforholdDescription.includes(forhold.beskrivelse))
    const invalidUndervisningsforhold = teacher.undervisningsforhold.filter(forhold => forhold.aktiv && !allowedUndervisningsforholdDescription.includes(forhold.beskrivelse))
    if (invalidUndervisningsforhold.length > 0) {
      for (const invalid of invalidUndervisningsforhold) { 
        logger('warn', [loggerPrefix, `Teacher has invalid undervisningforhold description: ${invalid.beskrivelse} (${invalid.systemId}) - no access to students in this undervisningsforhold`])
        userData.invalidUndervisningsforhold.push({ beskrivelse: invalid.beskrivelse, systemId: invalid.systemId })
      }
    }
    logger('info', [loggerPrefix, `Validating undervsiningsforhold description - ${validUndervisningsforhold.length} valid undervisningsforhold`])

    // Kontaktlærer flyttes fra rett på eleven til skolearrayet på eleven - sett om læreren er kontaktlærer for eleven på gitt skole
    let students = []
    for (const undervisningsforhold of validUndervisningsforhold) {
      for (const basisgruppe of undervisningsforhold.basisgrupper.filter(gruppe => gruppe.aktiv)) {
        for (const elev of basisgruppe.elever) {
          // I tilfelle eleven er med i flere basisgrupper
          const existingStudent = students.find(student => student.elevnummer === elev.elevnummer)
          if (existingStudent) {
            const existingSchoolOnStudent = existingStudent.skoler.find(school => school.skolenummer === undervisningsforhold.skole.skolenummer)
            if (!existingSchoolOnStudent) { // Ikke registrert lærerforholdet på eleven ved denne skolen enda, legger til i lista
              existingStudent.skoler.push({ ...repackMiniSchool(undervisningsforhold.skole, elev.kontaktlarer), klasser: [{ navn: basisgruppe.navn, type: 'basisgruppe', systemId: basisgruppe.systemId, fag: [] }] })
            } else { // Skolen allerede lagt inn, legger inn klassen på skolen (om den ikke er der allerede)
              if (!existingSchoolOnStudent.klasser.some(group => group.systemId === basisgruppe.systemId)) existingSchoolOnStudent.klasser.push({ navn: basisgruppe.navn, type: 'basisgruppe', systemId: basisgruppe.systemId, fag: [] })
            }
            if (existingSchoolOnStudent && !existingSchoolOnStudent.kontaktlarer && elev.kontaktlarer) { // Sjekker om er kontaktlærer på ekisterende skole (som ikke var funnet fra før av, for sikkerhets skyld)
              existingSchoolOnStudent.kontaktlarer = true
            }
          } else { // Ikke lagt inn eleven i students enda
            students.push({ ...elev, skoler: [{ ...repackMiniSchool(undervisningsforhold.skole, elev.kontaktlarer), klasser: [{ navn: basisgruppe.navn, type: 'basisgruppe', systemId: basisgruppe.systemId, fag: [] }] }] })
          }
        }
      }
      for (const undervisningsgruppe of undervisningsforhold.undervisningsgrupper.filter(gruppe => gruppe.aktiv)) {
        // Note to self - læreren kan ha flere undervisningsforhold med de samme undervisningsgruppene.. Lollert, lar det være inntil videre
        for (const elev of undervisningsgruppe.elever) {
          const existingStudent = students.find(student => student.elevnummer === elev.elevnummer)
          if (existingStudent) {
            const existingSchoolOnStudent = existingStudent.skoler.find(school => school.skolenummer === undervisningsforhold.skole.skolenummer)
            if (!existingSchoolOnStudent) { // Ikke registrert lærerforholdet på eleven ved denne skolen enda, legger til i lista
              existingStudent.skoler.push({ ...repackMiniSchool(undervisningsforhold.skole, elev.kontaktlarer), klasser: [{ navn: undervisningsgruppe.navn, type: 'undervisningsgruppe', systemId: undervisningsgruppe.systemId, fag: undervisningsgruppe.fag }] })
            } else { // Skolen allerede lagt inn, legger inn klassen på skolen (om den ikke er der allerede)
              if (!existingSchoolOnStudent.klasser.some(group => group.systemId === undervisningsgruppe.systemId)) existingSchoolOnStudent.klasser.push({ navn: undervisningsgruppe.navn, type: 'undervisningsgruppe', systemId: undervisningsgruppe.systemId, fag: undervisningsgruppe.fag })
            }
            if (existingSchoolOnStudent && !existingSchoolOnStudent.kontaktlarer && elev.kontaktlarer) { // Sjekker om er kontaktlærer på ekisterende skole (som ikke var funnet fra før av, for sikkerhets skyld)
              existingSchoolOnStudent.kontaktlarer = true
            }
          } else { // Ikke lagt inn eleven i students enda
            students.push({ ...elev, skoler: [{ ...repackMiniSchool(undervisningsforhold.skole, elev.kontaktlarer), klasser: [{ navn: undervisningsgruppe.navn, type: 'undervisningsgruppe', systemId: undervisningsgruppe.systemId, fag: undervisningsgruppe.fag }] }] })
          }
        }
      }
    }
    // Fjern kontaktlærer-property rett på eleven, og sleng på kort-feidenavn på alle elever, sleng på IOP-access rett på skole-info om det IOP er skrudd på i ENV
    students = students.map(stud => {
      if (maskSsn) stud.fodselsnummer = `${stud.fodselsnummer.substring(0, 6)}*****`
      delete stud.kontaktlarer
      // IOP special access
      if (env.IOP_FAGLARER_ACCESS_ENABLED === 'true') {
        const iopSchools = getIOPSchools(stud)
        stud.skoler = stud.skoler.map(school => {
          return {
            ...school,
            iop: iopSchools.some(IOPschool => IOPschool.skolenummer === school.skolenummer)
          }
        })
      }
      return {
        ...stud,
        feidenavnPrefix: stud.feidenavn.substring(0, stud.feidenavn.indexOf('@'))
      }
    })
    // Sorter elevene alfabetisk
    students.sort((a, b) => (a.navn > b.navn) ? 1 : (b.navn > a.navn) ? -1 : 0)

    userData.students = students
  }

  // TODO - finn ut av leder rådgiver
  if (user.activeRole === env.LEDER_ROLE) {
    console.log('En leder rådgiver aiaiai')
  }

  return userData
}

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

  if (env.MOCK_API === 'true') {
    logger('info', [loggerPrefix, 'MOCK_API is true', 'Returning mock documents'])
    const documents = await getMockDocuments(10)
    documents.forEach(doc => {
      doc.feidenavn = studentFeidenavn
      doc.source = 'mock'
      doc.Files.forEach(file => file.id = 1)
    })
    return { errors: [], documents }
  }
  const result = {
    documents: [],
    errors: []
  }
  // XFYLKE (mainArchive)
  try {
    logger('info', [loggerPrefix, 'Fetching student documents from main archive'])
    const { documents, errors} = await getAzfArchiveDocuments(teacherStudent.fodselsnummer, studentFeidenavn, loggerPrefix)
    logger('info', [loggerPrefix, `Got ${documents.length} student documents from main archive`])
    result.documents.push(...documents)
    result.errors.push(...errors)
  } catch (error) {
    logger('error', [loggerPrefix, 'Failed when fetching documents from main archive', error.response?.data || error.stack || error.toString()])
  }
  // VTFK
  // To be implemented

  logger('info', [loggerPrefix, `Adding viewFiles permission to all ${result.documents.length} documents' files, for easier frontend handling`])
  const hasFileAccess = hasFileAccessForStudent(teacherStudent, loggerPrefix)
  result.documents = result.documents.map(doc => {
    return {
      ...doc,
      files: doc.files.map(file => {
        return {
          ...file,
          canView: hasFileAccess
        }
      })
    }
  })

  return result
}

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
  const hasFileAccess = hasFileAccessForStudent(teacherStudent, loggerPrefix)

  if (!hasFileAccess) {
    logger('warn', [loggerPrefix, 'Teacher does NOT have access to files for student'])
    throw error(401, 'Du har ikke tilgang på å se dette dokumentet')
  } else {
    logger('info', [loggerPrefix, 'Validated access to files for student'])
  }

  if (env.MOCK_API === 'true') {
    logger('info', [loggerPrefix, 'MOCK_API is true', 'Returning mock file'])
    const { base64 } = mockFile
    return base64
  }

  logger('info', [loggerPrefix, `Fetching file from source ${sourceId}`])
  if (sourceId === 'mainArchive') {
    try {
      const { base64 } = await getAzfArchiveFile(fileId, loggerPrefix)
      return base64
    } catch (error) {
      logger('error', [loggerPrefix, `Failed when fetching file (${fileId}) from mainArchive`, error.response?.data || error.stack || error.toString()])
      throw new Error('No access to student, or student is not registered')
    }
  }
  if (sourceId = 'vtfk') {
    // IMPLEMENT
  }
}

export const getTeacherDocuments = async (user, studentFeidenavn) => {
  if (env.MOCK_API === 'true') return 'en liste med tulledokumenter'
  try {
    const mongoClient = await getMongoClient()
    const collection = mongoClient.db(env.MONGODB_DB_NAME).collection(`${env.MONGODB_DOCUMENTS_COLLECTION}-${getCurrentSchoolYear('-')}`)
    // Her må vi lage en spørring som henter dokumenter som matcher alle elevene til læreren, men vi tar vel kanskje panskje med en top-parameter for å være flinke?
  } catch (error) {
    if (error.toString().startsWith('MongoTopologyClosedError')) {
      logger('warn', 'Oh no, topology is closed! Closing client')
      closeMongoClient()
    }
    throw error
  }
}

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
    const setUserSetting = await collection.findOneAndUpdate({ principalId: user.principalId }, { $set: { principalId: user.principalId, principalName: user.principalName, activeRole: requestedRole, changedTimestamp: new Date().toISOString() } }, { upsert: true })
    logger('info', [`${user.principalName} succesfully changed role to ${requestedRole} in db`])
  } catch (error) {
    if (error.toString().startsWith('MongoTopologyClosedError')) {
      logger('warn', 'Oh no, topology is closed! Closing client')
      closeMongoClient()
    }
    throw error
  }
}

export const getAdminImpersonation = (user) => {
  if (!user.hasAdminRole) throw new Error('You do not have permission to do this')
  const internalCache = getInternalCache()
  const impersonation = internalCache.get(`${user.principalId}-impersonation`)
  return impersonation || null
}

export const setAdminImpersonation = async (user, target, type) => {
  if (!user.hasAdminRole) throw new Error('You do not have permission to do this')
  if (typeof target !== 'string') throw new Error('target må værra string')
  if (!target.endsWith(`@${env.FEIDENAVN_SUFFIX}`)) throw new Error(`Target må ende på @${env.FEIDENAVN_SUFFIX}`)
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

export const deleteAdminImpersonation = (user) => {
  if (!user.hasAdminRole) throw new Error('You do not have permission to do this')
  const internalCache = getInternalCache()
  internalCache.del(`${user.principalId}-impersonation`)
}
