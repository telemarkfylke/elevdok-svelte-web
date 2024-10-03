import { error } from '@sveltejs/kit'
import { env } from '$env/dynamic/private'
import { getMsalToken } from '$lib/msal-token'
import axios from 'axios'
import { sleep } from '$lib/helpers/sleep'

const mockSchool = {
  skolenummer: '12345',
  navn: 'Mordor videregående skole',
  organisasjonsnummer: '123456789',
  postadresse: {
    adresselinje: 'Saurongata 14',
    postnummer: '6666',
    poststed: 'Mordor'
  },
  forretningsadresse: {
    adresselinje: null,
    postnummer: null,
    poststed: null
  },
  organisasjon: {
    navn: 'Mordor videregående skole',
    kortnavn: 'OPT-MRD',
    organisasjonsId: '23',
    organisasjonsKode: '1234',
    leder: {
      ansattnummer: '12345678',
      navn: {
        fulltnavn: 'Sauron Ond',
        fornavn: 'Sauron',
        etternavn: 'Ond'
      }
    }
  },
  elever: [
    {
      navn: 'Elev Elevesen',
      fornavn: 'Elev',
      etternavn: 'Elevesen',
      feidenavn: `ele0102@${env.FEIDENAVN_SUFFIX}`,
      elevnummer: '1234567',
      elevforholdId: '9145581',
      fodselsnummer: '12345678910'
    },
    {
      navn: 'Frodo Baggins',
      fornavn: 'Frodo',
      etternavn: 'Baggins',
      feidenavn: `fro12345@${env.FEIDENAVN_SUFFIX}`,
      elevnummer: '1234568',
      elevforholdId: '9030845',
      fodselsnummer: '12345678911'

    }
  ],
  basisgrupper: [
    {
      navn: '2BU',
      systemId: '1472079',
      aktiv: true,
      trinn: 'VG2',
      termin: [
        {
          kode: 'H1',
          gyldighetsperiode: {
            start: '2024-08-01T00:00:00Z',
            slutt: '2025-01-10T00:00:00Z',
            aktiv: true
          }
        },
        {
          kode: 'H2',
          gyldighetsperiode: {
            start: '2025-01-11T00:00:00Z',
            slutt: '2025-07-31T00:00:00Z',
            aktiv: false
          }
        }
      ],
      skolear: {
        kode: '20242025',
        gyldighetsperiode: {
          start: '2024-08-01T00:00:00Z',
          slutt: '2025-07-31T00:00:00Z',
          aktiv: true
        }
      },
      elever: [
        {
          navn: 'Elev Elevesen',
          fornavn: 'Elev',
          etternavn: 'Elevesen',
          feidenavn: `ele0102@${env.FEIDENAVN_SUFFIX}`,
          elevnummer: '1234567',
          elevforholdId: '9145581',
          fodselsnummer: '12345678910'
        },
        {
          navn: 'Frodo Baggins',
          fornavn: 'Frodo',
          etternavn: 'Baggins',
          feidenavn: `fro12345@${env.FEIDENAVN_SUFFIX}`,
          elevnummer: '1234568',
          elevforholdId: '9030845',
          fodselsnummer: '12345678911'
        }
      ]
    }
  ]
}

/**
 *
 * @param {Object} user
 */
export const fintSchool = async (schoolNumber) => {
  const identifier = schoolNumber
  if (!identifier) throw error(400, 'Missing required parameter "schoolNumber"')
  if (env.MOCK_API === 'true' && env.NODE_ENV !== 'production') {
    await sleep(1000)
    return mockSchool
  }
  const accessToken = await getMsalToken({ scope: env.FINTFOLK_API_SCOPE })
  try {
    const { data } = await axios.get(`${env.FINTFOLK_API_URL}/school/skolenummer/${identifier}?includeStudentSsn=true`, { headers: { Authorization: `Bearer ${accessToken}` } })
    return data
  } catch (error) {
    if (error.response?.status === 404) {
      return null
    }
    throw error
  }
}
