import { env } from '$env/dynamic/private'
import { getMsalToken } from '$lib/msal-token'
import axios from 'axios'
import { logger } from '@vtfk/logger'

export const repackP360Document = (document, feidenavn, source, sourceName) => {
  if (!document || !feidenavn || !source || !sourceName) throw new Error('Missing required parameter "document" "feidenavn", "source", or "sourceName')

  const repacked = {
    title: document.Title,
    feidenavn,
    source,
    sourceName,
    documentNumber: document.DocumentNumber,
    documentDate: document.DocumentDate || document.JournalDate || 'Ukjent dato',
    responsibleEnterprise: document.ResponsibleEnterpriseName || 'Ukjent ansvarlig virksomhet',
    category: document.Category.Description || 'Ukjent kategori',
    documentArchive: document.DocumentArchive.Description || 'Ukjent dokumentarkiv',
    accessCode: document.AccessCodeDescription || 'Ukjent tilgangskode',
    contacts: document.Contacts.map(contact => {
      return {
        name: contact.SearchName || 'Ukjent',
        role: contact.Role
      }
    }),
    files: document.Files.map(file => {
      return {
        id: file.Recno,
        title: file.Title.endsWith(file.Format.toLowerCase) ? file.Title : `${file.Title}.${file.Format.toLowerCase()}`,
        relation: file.RelationTypeDescription,
        format: file.Format,
        isAvailable: file.Format.toLowerCase() === 'pdf'
      }
    })
  }

  return repacked
}

export const getAzfArchiveDocuments = async (ssn, feidenavn, loggerPrefix) => {
  if (!ssn || !feidenavn || !loggerPrefix) throw new Error('Missing required parameter "ssn" or "loggerPrefix"')
  // Hent først saksnr for elevmappe(r), deretter dokumentene i elevmappe(ne)
  const result = {
    documents: [],
    errors: []
  }

  const accessToken = await getMsalToken({ scope: env.AZF_ARCHIVE_SCOPE })
  const caseNumbers = []

  try {
    const elevmappePayload = {
      service: 'CaseService',
      method: 'GetCases',
      parameter: {
        Title: 'Elevmappe',
        CaseType: 'Elev',
        ContactReferenceNumber: ssn
      }
    }
    const { data } = await axios.post(`${env.AZF_ARCHIVE_URL}/Archive`, elevmappePayload, { headers: { Authorization: `Bearer ${accessToken}` } })

    const allowedCaseStatuses = ['Under behandling', 'Avsluttet']
    logger('info', [loggerPrefix, `Filtering ${data.length} cases to where Status is one of`, allowedCaseStatuses])
    const cases = data.filter(archiveCase => ['Under behandling', 'Avsluttet'].includes(archiveCase.Status))

    if (cases.length > 1) logger('info', [loggerPrefix, `Found several (${cases.length}) elevmapper`])
    if (cases.length === 0) {
      logger('warn', [loggerPrefix, `No elevmappe found for ${feidenavn}`])
      result.errors.push('Fant ingen elevmappe i Public 360')
      return result
    }
    if (cases.length === 1) logger('info', [loggerPrefix, `Found elevmappe. CaseNumber: ${cases[0].CaseNumber}`])
    for (const archiveCase of cases) {
      caseNumbers.push(archiveCase.CaseNumber)
    }
  } catch (error) {
    logger('info', [loggerPrefix, 'Failed when fetching elevmappe', error.response?.data || error.stack || error.toString()])
    result.errors.push(`Feilet ved henting av elevmappe: ${error.toString()}`)
  }
  const allowedDocumentStatuses = ['J', 'F', 'E', 'A']
  for (const caseNumber of caseNumbers) {
    try {
      const documentsPayload = {
        service: 'DocumentService',
        method: 'GetDocuments',
        parameter: {
          CaseNumber: caseNumber
        }
      }
      logger('info', [loggerPrefix, `Fetching documents from CaseNumber ${caseNumber}`])
      const { data } = await axios.post(`${env.AZF_ARCHIVE_URL}/Archive`, documentsPayload, { headers: { Authorization: `Bearer ${accessToken}` } })
      logger('info', [loggerPrefix, `Filtering ${data.length} documents to where StatusCode is one of`, allowedDocumentStatuses])
      const caseDocuments = data.filter(doc => allowedDocumentStatuses.includes(doc.StatusCode))
      logger('info', [loggerPrefix, `Adding ${caseDocuments.length} documents to result`])
      result.documents.push(...caseDocuments)
    } catch (error) {
      logger('info', [loggerPrefix, `Failed when documents for Case: ${caseNumber}`, error.response?.data || error.stack || error.toString()])
      result.errors.push(`Feilet ved henting dokumenter for sak ${caseNumber}. Feilmld: ${error.toString()}`)
    }
  }
  logger('info', [loggerPrefix, `Found ${result.documents.length} documents. Repacking result, and returning.`])
  result.documents = result.documents.map(doc => repackP360Document(doc, feidenavn, 'mainArchive', env.MAIN_SOURCE_NAME))
  return result
}

export const getAzfArchiveFile = async (fileId, loggerPrefix) => {
  if (!fileId || !loggerPrefix) throw new Error('Missing required parameter "fileId" or "loggerPrefix"')

  const accessToken = await getMsalToken({ scope: env.AZF_ARCHIVE_SCOPE })

  const filePayload = {
    service: 'FileService',
    method: 'GetFileWithMetadata',
    parameter: {
      Recno: fileId,
      IncludeFileData: true
    }
  }
  const { data } = await axios.post(`${env.AZF_ARCHIVE_URL}/Archive`, filePayload, { headers: { Authorization: `Bearer ${accessToken}` } })
  return {
    base64: data.Base64Data,
    metadata: {
      title: data.Title,
      documentNumber: data.DocumentNumber
    }
  }
}
