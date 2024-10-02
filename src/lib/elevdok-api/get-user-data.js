import { env } from '$env/dynamic/private'
import { fintTeacher } from '$lib/fintfolk-api/teacher'
import { logger } from '@vtfk/logger'

const allowedUndervisningsforholdDescription = ['Adjunkt', 'Adjunkt m/till utd', 'Adjunkt 1', 'Lærer', 'Lærer-', 'Lektor', 'Lektor m/till utd', 'Lektor 1']

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

/**
 * @typedef MiniSchool
 * @property {string} kortkortnavn shortName without UT- or OPT-
 * @property {string} skolenummer
 * @property {string} kortnavn
 * @property {string} navn
 * @property {true} kontaktlarer is current user contactTeacher for student at this school
 *
 */

/**
 *
 * @param {Object} school
 * @param {boolean} kontaktlarer
 * @returns {MiniSchool} repackedSchool
 */
export const repackMiniSchool = (school, kontaktlarer) => {
  const kortkortnavn = school.kortnavn.indexOf('-') ? school.kortnavn.substring(school.kortnavn.indexOf('-') + 1) : school.kortnavn
  return {
    kortkortnavn,
    skolenummer: school.skolenummer,
    kortnavn: school.kortnavn,
    navn: school.navn,
    kontaktlarer: kontaktlarer || false
  }
}

/**
 * 
 * @param {TeacherStudent} teacherStudent 
 * @returns {MiniSchool[]} IOPSchools
 */
const getIOPSchools = (teacherStudent) => {
  const IOPCourseIds = ['IOP1000', 'IOP2000', 'IOP3000', 'IOP4000', 'IOP5000']
  if (!teacherStudent) throw new Error('Missing required parameter "teacherStudent"')
  if (!Array.isArray(teacherStudent.skoler)) throw new Error('Missing "skoler" array from teacherStudent')
  if (!teacherStudent.skoler.every(school => Array.isArray(school.klasser) && school.klasser.every(group => Array.isArray(group.fag)))) throw new Error('Either missing "klasser" array from skole, or missing "fag" array from klasse')
  // Getting IOPSchools in case of future requirement where teachers can only see documents for specific schools
  const IOPSchools = teacherStudent.skoler.filter(school => school.klasser.some(group => group.fag.some(course => IOPCourseIds.includes(course.systemId?.identifikatorverdi))))
  return IOPSchools
}

/**
 * @typedef Fag
 * @property {string} systemId
 * @property {string} navn
 * @property {string[]} grepreferanse
 * 
 */

/** 
 * @typedef ElevKlasse
 * @property {string} navn
 * @property {string} navn
 * @property {"basisgruppe" | "undervisningsgruppe"} type
 * @property {Fag[]} fag
 * 
 */

/** 
 * @typedef ElevSkoleProps
 * @property {ElevKlasse[]} klasser
 * @property {boolean} iop om brukeren har tilgang via iop-klasse
 * 
 */

/** 
 * @typedef {MiniSchool & ElevSkoleProps} ElevSkole
 */

/**
 * @typedef TeacherStudent
 * @property {string} navn
 * @property {string} fornavn
 * @property {string} etternavn
 * @property {string} feidenavn
 * @property {string} elevnummer
 * @property {string} fodselsnummer
 * @property {ElevSkole[]} skoler
 * @property {string} feidenavnPrefix feidenavn without "@fylke.no"
 *
 */

/**
 * @typedef PersonData
 * @property {string} upn
 * @property {string} feidenavn
 * @property {string} ansattnummer
 * @property {string} name
 * @property {string} firstName
 * @property {string} lastName
 *
 */

/**
 * @typedef LarerKlasse
 * @property {string} navn
 * @property {string} type
 * @property {string} systemId
 * @property {string[]} fag
 * @property {string} skole school full name
 *
 */

/**
 * @typedef InvalidUndervisningsforhold
 * @property {string} beskrivelse
 * @property {string} systemId
 *
 */

/**
 * @typedef UserData
 * @property {import('$lib/system-info').SystemInfo} systemInfo
 * @property {PersonData} personData
 * @property {TeacherStudent[]} students
 * @property {LarerKlasse[]} classes
 * @property {InvalidUndervisningsforhold[]} invalidUndervisningsforhold
 *
 */


/**
 *
 * @param {import('$lib/authentication').User} user
 * @param {boolean} maskSsn defaults to true
 * @returns {UserData} users data
 * 
 */
export const getUserData = async (user, maskSsn = true) => {
  let loggerPrefix = `getUserData - user: ${user.principalName}`
  logger('info', [loggerPrefix, 'New request'])
  const userData = {
    personData: null,
    invalidUndervisningsforhold: [],
    students: [],
    classes: []
  }

  // If regular teacher or administrator impersonating teacher
  if (user.activeRole === env.DEFAULT_ROLE || (user.hasAdminRole && user.impersonating?.type === 'larer')) {
    loggerPrefix += ' - role: Teacher'
    logger('info', [loggerPrefix, 'Fetching teacher data from FINT'])
    if (user.impersonating?.type === 'larer') loggerPrefix += ` - impersonating: ${user.impersonating.target}`
    const teacherUpn = user.hasAdminRole && user.impersonating?.type === 'larer' ? user.impersonating.target : user.principalName
    logger('info', [loggerPrefix, 'Fetching teacher data from FINT with teacher id', teacherUpn])
    const teacher = await fintTeacher(teacherUpn)
    if (!teacher) return userData

    userData.personData = {
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
        let hasElever = false
        if (invalid.basisgrupper.some(gruppe => Array.isArray(gruppe.elever) && gruppe.elever.length > 0)) hasElever = true
        if (invalid.kontaktlarergrupper.some(gruppe => Array.isArray(gruppe.elever) && gruppe.elever.length > 0)) hasElever = true
        if (invalid.undervisningsgrupper.some(gruppe => Array.isArray(gruppe.elever) && gruppe.elever.length > 0)) hasElever = true
        if (hasElever) {
          logger('warn', [loggerPrefix, `Teacher has invalid undervisningforhold description: ${invalid.beskrivelse} (${invalid.systemId}) with elevforhold in undervisningsforhold - no access to students in this undervisningsforhold`])
          userData.invalidUndervisningsforhold.push({ beskrivelse: invalid.beskrivelse, systemId: invalid.systemId })
        }
      }
    }
    logger('info', [loggerPrefix, `Validated undervsiningsforhold description - ${validUndervisningsforhold.length} valid undervisningsforhold`])

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
    // Filtrer vekk elever uten feidenavn - fåkke brukt de (enda hvertfall)
    const studentsWithoutFeidenavn = students.filter(stud => !stud.feidenavn)
    if (studentsWithoutFeidenavn.length > 0) {
      logger('warn', [loggerPrefix, `Fount ${studentsWithoutFeidenavn.length} students without feidenavn, filtering them away... Elevnummers: ${studentsWithoutFeidenavn.map(stud => stud.elevnummer).join(', ')}`])
      students = students.filter(stud => stud.feidenavn)
    }

    // Fjern kontaktlærer-property rett på eleven (den ligger på skoler i stedet), og sleng på kort-feidenavn på alle elever, sleng på IOP-access rett på skole-info om det IOP er skrudd på i ENV
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
  // If leder / rådgiver or administrator impersonating teacher
  if (user.activeRole === env.LEDER_ROLE || (user.hasAdminRole && user.impersonating?.type === 'leder')) {
    loggerPrefix += ' - role: Leder'
    if (user.impersonating?.type === 'leder') loggerPrefix += ` - impersonating: ${user.impersonating.target}`
    logger('info', [loggerPrefix, 'Checking school access'])

    // TODO resten her
    // Kanskje hente skoletilganger basert på gruppor i stedet.... Da trenger man bare legge til et sted, tror det er bedre etter at jeg nå har prøvd den andre driten. Implementere det i Minelev også da. hvis det fungerer greit.

  }

  return userData
}
