import { env } from '$env/dynamic/private'
import { logger } from '@vtfk/logger'
import { getMsalToken } from './msal-token'
import axios from 'axios'
import vtfkSchoolsInfo from 'vtfk-schools-info'
import { getInternalCache } from './internal-cache'

/**
   * @typedef {Object} AppRole
   * @property {string} id
   * @property {string[]} allowedMemberTypes
   * @property {string} description
   * @property {string} displayName
   * @property {boolean} isEnabled
   * @property {string} value
   * @property {string} origin
   *
   */

/**
   * @typedef {Object} Application
   * @property {string} appId
   * @property {string} displayName
   * @property {AppRole[]} appRoles
   */

const graphScope = env.GRAPH_API_SCOPE || 'https://graph.microsoft.com/.default'
const graphUrl = env.GRAPH_API_URL || 'https://graph.microsoft.com/v1.0'

/**
 *
 * @param {string} appId
 * @returns {Promise<Application>}
 */
const getApplicationRoles = async (appId) => {
  const accessToken = await getMsalToken({ scope: graphScope })
  const applicationUrl = `${graphUrl}/applications(appId='${appId}')?$select=appId,displayName,appRoles`
  const { data } = await axios.get(applicationUrl, { headers: { Authorization: `Bearer ${accessToken}` } })
  return data
}

/**
 * @typedef {Object} GroupMember
 * @property {string} id
 * @property {string} displayName
 * @property {string} userPrincipalName
 *
 */

/**
 *
 * @param {string} groupId
 * @returns {Promise<GroupMember[]>}
 */
const getGroupMembers = async (groupId) => {
  // OBS OBS trenger groupMember.read.all
  const accessToken = await getMsalToken({ scope: graphScope })
  let groupMembersUrl = `${graphUrl}/groups/${groupId}/members?$select=id,displayName,userPrincipalName&$top=999&$count=true`
  const members = []
  let finished = false
  while (!finished) {
    const { data } = await axios.get(groupMembersUrl, { headers: { Authorization: `Bearer ${accessToken}`, ConsistencyLevel: 'eventual' } })
    members.push(...data.value)
    if (data['@odata.nextLink']) {
      groupMembersUrl = data['@odata.nextLink']
    } else {
      finished = true
    }
  }

  return members
}

/**
 * @typedef {Object} AppRoleAssignment
 * @property {string} id
 * @property {string} appRoleId
 * @property {string} principalDisplayName
 * @property {string} principalId
 * @property {string} principalType
 *
 */

/**
 *
 * @param {string} appId
 * @returns {Promise<AppRoleAssignment[]>}
 */
const getAppRoleAssignments = async (appId) => {
  const accessToken = await getMsalToken({ scope: graphScope })

  /** @type {AppRoleAssignment[]} */
  const appRoleAssignments = []

  let finished = false
  let appRoleAssignedToUrl = `${graphUrl}/servicePrincipals(appId='${appId}')/appRoleAssignedTo?$select=id,appRoleId,principalDisplayName,principalId,principalType&$top=999&$count=true`
  while (!finished) {
    const { data } = await axios.get(appRoleAssignedToUrl, { headers: { Authorization: `Bearer ${accessToken}`, ConsistencyLevel: 'eventual' } })
    appRoleAssignments.push(...data.value)
    if (data['@odata.nextLink']) {
      appRoleAssignedToUrl = data['@odata.nextLink']
    } else {
      finished = true
    }
  }
  return appRoleAssignments
}

/**
 * @typedef {Object} ApplicationUserProps
 * @property {string} appRoleValue
 */

/**
 * @typedef {AppRoleAssignment & ApplicationUserProps} ApplicationUser
 */

/**
 *
 * @param {string} appId
 * @returns {Promise<ApplicationUser[]>}
 */
export const getApplicationUsers = async (appId) => {
  const loggerPrefix = `getApplicationUsers - ${appId}`

  if (env.MOCK_API === 'true') {
    logger('info', [loggerPrefix, 'MOCK_API is enabled, returning mock'])
    const mockUsers = [
      {
        appRoleValue: env.LEDER_ROLE,
        appRoleId: 'mockleder',
        id: 'mockId1',
        principalDisplayName: 'Mock Leder 1',
        principalId: 'mockPrincipalId1',
        principalType: 'User'
      },
      {
        appRoleValue: env.LEDER_ROLE,
        appRoleId: 'mockleder',
        id: 'mockId2',
        principalDisplayName: 'Mock Leder 2',
        principalId: 'mockPrincipalId2',
        principalType: 'User'
      },
      {
        appRoleValue: env.LEDER_ROLE,
        appRoleId: 'mockleder',
        id: 'mockId3',
        principalDisplayName: 'Mock Leder 3',
        principalId: 'mockPrincipalId3',
        principalType: 'User'
      },
      {
        appRoleValue: env.DEFAULT_ROLE,
        appRoleId: 'mocklarer',
        id: 'mockId4',
        principalDisplayName: 'Mock Lærer 1',
        principalId: 'mockPrincipalId4',
        principalType: 'User'
      }
    ]
    // Legg til MOCK auth sin bruker med de rollene den har satt i env
    if (env.MOCK_AUTH) {
      if (env.MOCK_AUTH_LARER_ROLE) {
        mockUsers.push({
          appRoleValue: env.DEFAULT_ROLE,
          appRoleId: 'mocklarer',
          id: 'mockId6',
          principalDisplayName: 'Demo Spøkelse',
          principalId: '12345-4378493-fjdiofjd',
          principalType: 'User'
        })
      }
      if (env.MOCK_AUTH_LEDER_ROLE) {
        mockUsers.push({
          appRoleValue: env.LEDER_ROLE,
          appRoleId: 'mockleder',
          id: 'mockId7',
          principalDisplayName: 'Demo Spøkelse',
          principalId: '12345-4378493-fjdiofjd',
          principalType: 'User'
        })
      }
    }

    return mockUsers
  }

  logger('info', [loggerPrefix, 'Getting all app roles for app', appId])
  const allAppRoles = await getApplicationRoles(appId)
  const relevantAppRoles = allAppRoles.appRoles.filter(appRole => appRole.isEnabled && appRole.allowedMemberTypes.includes('User'))
  logger('info', [loggerPrefix, `Got ${relevantAppRoles.length} relevant appRoles, total number of app roles: ${allAppRoles.appRoles.length}`])

  logger('info', [loggerPrefix, 'Getting all app role assignments for app', appId])
  const allAppRoleAssignments = await getAppRoleAssignments(appId)
  const relevantAppRoleAssignments = allAppRoleAssignments.filter(appRoleAssignment => relevantAppRoles.some(role => role.id === appRoleAssignment.appRoleId))
  logger('info', [loggerPrefix, `Got ${relevantAppRoleAssignments.length} relevant appRoleAssignments, total number of app role assignments (including groups): ${allAppRoleAssignments.length}`])

  const userAssignments = relevantAppRoleAssignments.filter(appRoleAssignment => appRoleAssignment.principalType === 'User')
  const groupAssignments = relevantAppRoleAssignments.filter(appRoleAssignment => appRoleAssignment.principalType === 'Group')
  logger('info', [loggerPrefix, `Got ${userAssignments.length} users and ${groupAssignments.length} groups from appRoleAssignments`])

  for (const groupAssignment of groupAssignments) {
    logger('info', [loggerPrefix, 'Getting members for group', groupAssignment.principalDisplayName])
    const groupMembers = await getGroupMembers(groupAssignment.principalId)
    logger('info', [loggerPrefix, `Got ${groupMembers.length} members for group`, groupAssignment.principalDisplayName, 'adding them to userAssignments if they are not already there'])
    for (const groupMember of groupMembers) {
      if (!userAssignments.some(user => user.principalId === groupMember.id && user.appRoleId === groupAssignment.appRoleId)) {
        userAssignments.push({
          appRoleId: groupAssignment.appRoleId,
          id: groupAssignment.id,
          principalDisplayName: groupMember.displayName,
          principalId: groupMember.id,
          principalType: 'User'
        })
      }
    }
  }

  logger('info', [loggerPrefix, `Got ${userAssignments.length} userAssignments after adding group members, adding role names and returning`])
  const users = userAssignments.map(userAssignment => { return { ...userAssignment, appRoleValue: relevantAppRoles.find(role => role.id === userAssignment.appRoleId).value } })

  // Legg til MOCK auth sin bruker med de rollene den har satt i env om vi har MOCK_AUTH lik true
  if (env.MOCK_AUTH && env.NODE_ENV !== 'production') {
    if (env.MOCK_AUTH_LARER_ROLE) {
      users.push({
        appRoleValue: env.DEFAULT_ROLE,
        appRoleId: 'mocklarer',
        id: 'mockId6',
        principalDisplayName: 'Demo Spøkelse',
        principalId: '12345-4378493-fjdiofjd',
        principalType: 'User'
      })
    }
    if (env.MOCK_AUTH_LEDER_ROLE) {
      users.push({
        appRoleValue: env.LEDER_ROLE,
        appRoleId: 'mockleder',
        id: 'mockId7',
        principalDisplayName: 'Demo Spøkelse',
        principalId: '12345-4378493-fjdiofjd',
        principalType: 'User'
      })
    }
  }

  return users
}

/**
 * @typedef {Object} LeaderUserProps
 * @property {string} appRoleValue
 * @property {string} principalName upn
 * @property {string} schoolNumber
 * @property {string} schoolName
 */

/**
 * @typedef {AppRoleAssignment & LeaderUserProps} LeaderUser
 */

/**
 *
 * @param {string} appId
 * @returns {Promise<LeaderUser[]>}
 */
export const getAllLeaderUsers = async (appId) => {
  /*
  Ledere kommer fra egne tilgangsgrupper per skole, der gruppen er satt til å få leder-rolle i enterprise-appen. Ny skole => ny gruppe med leder-rolle.
  Skolen hentes fra gruppas navn, og vi kan slenge på skolenummer og navn på skolen fra vtfk-schools info. Merk at gruppas navn må matche et eller annet i vtfk-schools - tipper kortnavn
  Vi kan expande appRoleAssignment med upn siden alle brukerne ligger i en gruppe, og vi må hente de fra gruppa
  */
  const loggerPrefix = `getAllLeaderUsers - ${appId}`

  const cacheKey = 'all-leader-users'
  const internalCache = getInternalCache()
  const cachedData = internalCache.get(cacheKey)
  if (cachedData) {
    logger('info', [loggerPrefix, 'Found leader users in cache - quick returning'])
    return cachedData
  }

  if (env.MOCK_API === 'true') {
    logger('info', [loggerPrefix, 'MOCK_API is enabled, returning mock'])
    const mockUsers = [
      {
        appRoleValue: env.LEDER_ROLE,
        appRoleId: 'mockleder',
        id: 'mockId1',
        principalDisplayName: 'Mock Leder 1',
        principalId: 'mockPrincipalId1',
        principalName: `mockPrincipal1@${env.FEIDENAVN_SUFFIX}`,
        principalType: 'User',
        schoolNumber: '12345',
        schoolName: 'Mock Skole 1',
        schoolShortName: 'MS1'
      },
      {
        appRoleValue: env.LEDER_ROLE,
        appRoleId: 'mockleder',
        id: 'mockId2',
        principalDisplayName: 'Mock Leder 2',
        principalId: 'mockPrincipalId2',
        principalName: `mockPrincipal2@${env.FEIDENAVN_SUFFIX}`,
        principalType: 'User',
        schoolNumber: '23456',
        schoolName: 'Mock Skole 2',
        schoolShortName: 'MS2'
      },
      {
        appRoleValue: env.LEDER_ROLE,
        appRoleId: 'mockleder',
        id: 'mockId3',
        principalDisplayName: 'Mock Leder 3',
        principalId: 'mockPrincipalId3',
        principalName: `mockPrincipal3@${env.FEIDENAVN_SUFFIX}`,
        principalType: 'User',
        schoolNumber: '34567',
        schoolName: 'Mock Skole 3',
        schoolShortName: 'MS3'
      }
    ]
    // Legg til MOCK auth sin bruker med de rollene den har satt i env
    if (env.MOCK_AUTH) {
      if (env.MOCK_AUTH_LEDER_ROLE) {
        mockUsers.push({
          appRoleValue: env.LEDER_ROLE,
          appRoleId: 'mockleder',
          id: 'mockId7',
          principalDisplayName: 'Demo Spøkelse',
          principalId: '12345-4378493-fjdiofjd',
          principalName: `demo.spokelse@${env.FEIDENAVN_SUFFIX}`,
          principalType: 'User',
          schoolNumber: '12345',
          schoolName: 'Mordor vidergående skole',
          schoolShortName: 'MRD'
        })
      }
    }

    internalCache.set(cacheKey, mockUsers)

    return mockUsers
  }

  logger('info', [loggerPrefix, 'Getting all app roles for app', appId])
  const allAppRoles = await getApplicationRoles(appId)
  const relevantAppRoles = allAppRoles.appRoles.filter(appRole => appRole.isEnabled && appRole.allowedMemberTypes.includes('User'))
  logger('info', [loggerPrefix, `Got ${relevantAppRoles.length} relevant appRoles, total number of app roles: ${allAppRoles.appRoles.length}`])

  logger('info', [loggerPrefix, 'Getting all app role assignments for app', appId])
  const allAppRoleAssignments = await getAppRoleAssignments(appId)

  const leaderAppRole = relevantAppRoles.find(role => role.value === env.LEDER_ROLE)

  const leaderGroupAssignments = allAppRoleAssignments.filter(appRoleAssignment => appRoleAssignment.principalType === 'Group' && appRoleAssignment.appRoleId === leaderAppRole.id)
  logger('info', [loggerPrefix, `Got ${leaderGroupAssignments.length} leader group appRoleAssignments, total number of app role assignments (including groups): ${allAppRoleAssignments.length}`])

  logger('info', [loggerPrefix, `Getting school data (vtfk-schools-info) for all ${leaderGroupAssignments.length} groups`])

  const leaderUsers = []

  for (const groupAssignment of leaderGroupAssignments) {
    const allSchools = vtfkSchoolsInfo().map(school => { return { schoolNumber: school.schoolNumber, fullname: school.fullName, shortName: school.shortName } })

    const groupNameParts = groupAssignment.principalDisplayName.split('-')
    const groupSchoolShortName = groupNameParts[groupNameParts.length - 1].trim()

    const school = allSchools.find(school => school.shortName === groupSchoolShortName)
    if (!school) {
      logger('warn', [loggerPrefix, 'Could not find school for group', groupAssignment.principalDisplayName, 'group does not have valid school short name at end - skipping group'])
      continue
    }

    logger('info', [loggerPrefix, 'Found school for group', groupAssignment.principalDisplayName, 'school', school.fullname, 'Fetching members for group'])

    const groupMembers = await getGroupMembers(groupAssignment.principalId)
    logger('info', [loggerPrefix, `Got ${groupMembers.length} members for group`, groupAssignment.principalDisplayName, 'adding them to userAssignments if they are not already there'])
    for (const groupMember of groupMembers) {
      if (!leaderUsers.some(user => user.principalId === groupMember.id && user.schoolNumber === school.schoolNumber)) {
        leaderUsers.push({
          appRoleId: groupAssignment.appRoleId,
          appRoleValue: relevantAppRoles.find(role => role.id === groupAssignment.appRoleId).value,
          id: groupAssignment.id,
          principalDisplayName: groupMember.displayName,
          principalId: groupMember.id,
          principalType: 'User',
          principalName: groupMember.userPrincipalName,
          schoolNumber: school.schoolNumber,
          schoolName: school.fullname,
          schoolShortName: school.shortName
        })
      }
    }
  }

  logger('info', [loggerPrefix, `Got a total of ${leaderUsers.length} leaderUsers after fetching all group members, setting in cache, and returning`])

  // Legg til MOCK auth sin bruker med de rollene den har satt i env om vi har MOCK_AUTH lik true
  if (env.MOCK_AUTH && env.NODE_ENV !== 'production') {
    if (env.MOCK_AUTH_LEDER_ROLE) {
      leaderUsers.push({
        appRoleValue: env.LEDER_ROLE,
        appRoleId: 'mockleder',
        id: 'mockId7',
        principalDisplayName: 'Demo Spøkelse',
        principalId: '12345-4378493-fjdiofjd',
        principalType: 'User',
        principalName: `demo.spokelse@${env.FEIDENAVN_SUFFIX}`,
        schoolNumber: '12345',
        schoolName: 'Mordor vidergående skole',
        schoolShortName: 'MRD'
      })
    }
  }

  internalCache.set(cacheKey, leaderUsers)

  return leaderUsers
}
