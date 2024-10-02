import { error } from '@sveltejs/kit'
import { env } from '$env/dynamic/private'
import { getMsalToken } from '$lib/msal-token'
import axios from 'axios'
import { sleep } from '$lib/helpers/sleep'

const mockTeacher = {
  feidenavn: `larer.laresen@${env.FEIDENAVN_SUFFIX}`,
  ansattnummer: '12345678',
  upn: `larer.laresen@${env.FEIDENAVN_SUFFIX}`,
  navn: 'Lærer Læresen',
  fornavn: 'Lærer',
  etternavn: 'Læresen',
  fodselsnummer: '12345678911',
  fodselsdato: '1978-01-26T00:00:00Z',
  alder: 45,
  kjonn: '1',
  larerEpostadresse: `larer.laresen@${env.FEIDENAVN_SUFFIX}`,
  larerMobiltelefonnummer: null,
  kontaktEpostadresse: `larer.laresen@${env.FEIDENAVN_SUFFIX}`,
  kontaktMobiltelefonnummer: null,
  privatEpostadresse: null,
  privatMobiltelefonnummer: '12345678',
  bostedsadresse: {
    adresselinje: 'Lærergata 19',
    postnummer: '1234',
    poststed: 'SKOLESTEDET'
  },
  azureOfficeLocation: 'Mordor vgs',
  hovedskole: {
    navn: 'Mordor videregående skole',
    skolenummer: '12345'
  },
  undervisningsforhold: [
    {
      systemId: '26017341--1--20230512',
      beskrivelse: 'Lærer',
      aktiv: true,
      arbeidsforhold: {
        arbeidsforholdstype: {
          kode: 'FA',
          navn: 'Fast ansatt'
        },
        gyldighetsperiode: {
          start: '2023-05-01T00:00:00Z',
          slutt: null,
          aktiv: true
        },
        arbeidsforholdsperiode: {
          start: '2019-08-01T00:00:00Z',
          slutt: null,
          aktiv: true
        },
        ansettelsesprosent: 6000,
        lonnsprosent: 6000
      },
      skole: {
        navn: 'Mordor videregående skole',
        kortnavn: 'OF-MRD',
        skolenummer: '12345',
        organisasjonsnummer: '974568023',
        organisasjonsId: '23',
        hovedskole: true
      },
      basisgrupper: [
        {
          navn: '2BU',
          systemId: '1472079',
          aktiv: true,
          trinn: 'VG2',
          skole: {
            navn: 'Mordor videregående skole',
            skolenummer: '12345',
            hovedskole: true
          },
          termin: [
            {
              kode: 'H1',
              gyldighetsperiode: {
                start: '2022-08-01T00:00:00Z',
                slutt: '2023-01-13T00:00:00Z',
                aktiv: false
              }
            },
            {
              kode: 'H2',
              gyldighetsperiode: {
                start: '2023-01-14T00:00:00Z',
                slutt: '2023-07-31T00:00:00Z',
                aktiv: true
              }
            }
          ],
          skolear: {
            kode: '20222023',
            gyldighetsperiode: {
              start: '2022-08-01T00:00:00Z',
              slutt: '2023-07-31T00:00:00Z',
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
              kontaktlarer: true,
              fodselsnummer: '12345678910'
            },
            {
              navn: 'Frodo Baggins',
              fornavn: 'Frodo',
              etternavn: 'Baggins',
              feidenavn: `fro12345@${env.FEIDENAVN_SUFFIX}`,
              elevnummer: '1234568',
              kontaktlarer: false,
              fodselsnummer: '12345678911'
            }
          ]
        }
      ],
      kontaktlarergrupper: [
        {
          navn: '2BU',
          systemId: '1472079_461323',
          aktiv: true,
          skole: {
            navn: 'Mordor videregående skole',
            skolenummer: '12345',
            hovedskole: true
          },
          termin: [
            {
              kode: 'H1',
              gyldighetsperiode: {
                start: '2022-08-01T00:00:00Z',
                slutt: '2023-01-13T00:00:00Z',
                aktiv: false
              }
            },
            {
              kode: 'H2',
              gyldighetsperiode: {
                start: '2023-01-14T00:00:00Z',
                slutt: '2023-07-31T00:00:00Z',
                aktiv: true
              }
            }
          ],
          skolear: {
            kode: '20222023',
            gyldighetsperiode: {
              start: '2022-08-01T00:00:00Z',
              slutt: '2023-07-31T00:00:00Z',
              aktiv: true
            }
          }
        }
      ],
      undervisningsgrupper: [
        {
          navn: '2PI/KRO1018',
          systemId: '12041923',
          aktiv: true,
          fag: [
            {
              systemId: {
                identifikatorverdi: 'KRO1018'
              },
              navn: 'Kroppsøving vg2',
              grepreferanse: [
                'https://psi.udir.no/kl06/KRO1018'
              ]
            }
          ],
          skole: {
            navn: 'Mordor videregående skole',
            skolenummer: '12345',
            hovedskole: true
          },
          termin: [
            {
              kode: 'H1',
              gyldighetsperiode: {
                start: '2022-08-01T00:00:00Z',
                slutt: '2023-01-13T00:00:00Z',
                aktiv: false
              }
            },
            {
              kode: 'H2',
              gyldighetsperiode: {
                start: '2023-01-14T00:00:00Z',
                slutt: '2023-07-31T00:00:00Z',
                aktiv: true
              }
            }
          ],
          skolear: {
            kode: '20222023',
            gyldighetsperiode: {
              start: '2022-08-01T00:00:00Z',
              slutt: '2023-07-31T00:00:00Z',
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
              kontaktlarer: true,
              fodselsnummer: '12345678910'
            },
            {
              navn: 'Frodo Baggins',
              fornavn: 'Frodo',
              etternavn: 'Baggins',
              feidenavn: `fro12345@${env.FEIDENAVN_SUFFIX}`,
              elevnummer: '1234568',
              kontaktlarer: false,
              fodselsnummer: '12345678911'
            }
          ]
        }
      ]
    },
    {
      systemId: '26017341--1--20230513',
      beskrivelse: 'Adjunkt',
      aktiv: true,
      arbeidsforhold: {
        arbeidsforholdstype: {
          kode: 'FA',
          navn: 'Fast ansatt'
        },
        gyldighetsperiode: {
          start: '2023-05-01T00:00:00Z',
          slutt: null,
          aktiv: true
        },
        arbeidsforholdsperiode: {
          start: '2019-08-01T00:00:00Z',
          slutt: null,
          aktiv: true
        },
        ansettelsesprosent: 6000,
        lonnsprosent: 6000
      },
      skole: {
        navn: 'Hobbittun videregående skole',
        kortnavn: 'OF-HOB',
        skolenummer: '12346',
        organisasjonsnummer: '974568024',
        organisasjonsId: '24',
        hovedskole: false
      },
      basisgrupper: [],
      kontaktlarergrupper: [],
      undervisningsgrupper: [
        {
          navn: '2STB/MAT1017',
          systemId: '120419232',
          aktiv: true,
          fag: [
            {
              systemId: {
                identifikatorverdi: 'MAT1017'
              },
              navn: 'Mat og hobbiter vg2',
              grepreferanse: [
                'https://psi.udir.no/kl06/MAT1017'
              ]
            }
          ],
          skole: {
            navn: 'Hobbittun videregående skole',
            skolenummer: '12346',
            hovedskole: false
          },
          termin: [
            {
              kode: 'H1',
              gyldighetsperiode: {
                start: '2022-08-01T00:00:00Z',
                slutt: '2023-01-13T00:00:00Z',
                aktiv: false
              }
            },
            {
              kode: 'H2',
              gyldighetsperiode: {
                start: '2023-01-14T00:00:00Z',
                slutt: '2023-07-31T00:00:00Z',
                aktiv: true
              }
            }
          ],
          skolear: {
            kode: '20222023',
            gyldighetsperiode: {
              start: '2022-08-01T00:00:00Z',
              slutt: '2023-07-31T00:00:00Z',
              aktiv: true
            }
          },
          elever: [
            {
              navn: 'Sarumann Sauronsen',
              fornavn: 'Sarumann',
              etternavn: 'Sauronsen',
              feidenavn: `sar0398@${env.FEIDENAVN_SUFFIX}`,
              elevnummer: '1234569',
              kontaktlarer: false,
              fodselsnummer: '12345678912'
            },
            {
              navn: 'Frodo Baggins',
              fornavn: 'Frodo',
              etternavn: 'Baggins',
              feidenavn: `fro12345@${env.FEIDENAVN_SUFFIX}`,
              elevnummer: '1234568',
              kontaktlarer: false,
              fodselsnummer: '12345678911'
            },
            {
              navn: 'Elev Elevesen',
              fornavn: 'Elev',
              etternavn: 'Elevesen',
              feidenavn: `ele0102@${env.FEIDENAVN_SUFFIX}`,
              elevnummer: '1234567',
              kontaktlarer: false,
              fodselsnummer: '12345678910'
            }
          ]
        },
        {
          navn: '1ALA/IOP4000/1',
          systemId: '120419277',
          aktiv: true,
          fag: [
            {
              systemId: {
                identifikatorverdi: 'IOP4000'
              },
              navn: 'Indiv. opplæringsplan 4. år',
              grepreferanse: [
                'https://psi.udir.no/kl06/IOP4000'
              ]
            }
          ],
          skole: {
            navn: 'Hobbittun videregående skole',
            skolenummer: '12346',
            hovedskole: false
          },
          termin: [
            {
              kode: 'H1',
              gyldighetsperiode: {
                start: '2022-08-01T00:00:00Z',
                slutt: '2023-01-13T00:00:00Z',
                aktiv: false
              }
            },
            {
              kode: 'H2',
              gyldighetsperiode: {
                start: '2023-01-14T00:00:00Z',
                slutt: '2023-07-31T00:00:00Z',
                aktiv: true
              }
            }
          ],
          skolear: {
            kode: '20222023',
            gyldighetsperiode: {
              start: '2022-08-01T00:00:00Z',
              slutt: '2023-07-31T00:00:00Z',
              aktiv: true
            }
          },
          elever: [
            {
              navn: 'Gollum Smeagol',
              fornavn: 'Gollum',
              etternavn: 'Smeagol',
              feidenavn: `gol1234@${env.FEIDENAVN_SUFFIX}`,
              elevnummer: '1234570',
              kontaktlarer: false,
              fodselsnummer: '12345678913'
            }
          ]
        }
      ]
    },
    {
      systemId: '26017341--1--20230516',
      beskrivelse: 'Renholder',
      aktiv: true,
      arbeidsforhold: {
        arbeidsforholdstype: {
          kode: 'FA',
          navn: 'Fast ansatt'
        },
        gyldighetsperiode: {
          start: '2023-05-01T00:00:00Z',
          slutt: null,
          aktiv: true
        },
        arbeidsforholdsperiode: {
          start: '2019-08-01T00:00:00Z',
          slutt: null,
          aktiv: true
        },
        ansettelsesprosent: 6000,
        lonnsprosent: 6000
      },
      skole: {
        navn: 'Hobbittun videregående skole',
        kortnavn: 'OF-HOB',
        skolenummer: '12346',
        organisasjonsnummer: '974568024',
        organisasjonsId: '24',
        hovedskole: false
      },
      basisgrupper: [],
      kontaktlarergrupper: [],
      undervisningsgrupper: [
        {
          navn: '2STB/MAT1017',
          systemId: '120419232',
          aktiv: true,
          fag: [
            {
              systemId: {
                identifikatorverdi: 'MAT1017'
              },
              navn: 'Mat og hobbiter vg2',
              grepreferanse: [
                'https://psi.udir.no/kl06/MAT1017'
              ]
            }
          ],
          skole: {
            navn: 'Hobbittun videregående skole',
            skolenummer: '12346',
            hovedskole: false
          },
          termin: [
            {
              kode: 'H1',
              gyldighetsperiode: {
                start: '2022-08-01T00:00:00Z',
                slutt: '2023-01-13T00:00:00Z',
                aktiv: false
              }
            },
            {
              kode: 'H2',
              gyldighetsperiode: {
                start: '2023-01-14T00:00:00Z',
                slutt: '2023-07-31T00:00:00Z',
                aktiv: true
              }
            }
          ],
          skolear: {
            kode: '20222023',
            gyldighetsperiode: {
              start: '2022-08-01T00:00:00Z',
              slutt: '2023-07-31T00:00:00Z',
              aktiv: true
            }
          },
          elever: [
            {
              navn: 'Sarumann Sauronsen',
              fornavn: 'Sarumann',
              etternavn: 'Sauronsen',
              feidenavn: `sar0398@${env.FEIDENAVN_SUFFIX}`,
              elevnummer: '1234569',
              kontaktlarer: false,
              fodselsnummer: '12345678912'
            },
            {
              navn: 'Frodo Baggins',
              fornavn: 'Frodo',
              etternavn: 'Baggins',
              feidenavn: `fro12345@${env.FEIDENAVN_SUFFIX}`,
              elevnummer: '1234568',
              kontaktlarer: false,
              fodselsnummer: '12345678911'
            },
            {
              navn: 'Elev Elevesen',
              fornavn: 'Elev',
              etternavn: 'Elevesen',
              feidenavn: `ele0102@${env.FEIDENAVN_SUFFIX}`,
              elevnummer: '1234567',
              kontaktlarer: false,
              fodselsnummer: '12345678910'
            }
          ]
        },
        {
          navn: '1ALA/IOP4000/1',
          systemId: '120419277',
          aktiv: true,
          fag: [
            {
              systemId: {
                identifikatorverdi: 'IOP4000'
              },
              navn: 'Indiv. opplæringsplan 4. år',
              grepreferanse: [
                'https://psi.udir.no/kl06/IOP4000'
              ]
            }
          ],
          skole: {
            navn: 'Hobbittun videregående skole',
            skolenummer: '12346',
            hovedskole: false
          },
          termin: [
            {
              kode: 'H1',
              gyldighetsperiode: {
                start: '2022-08-01T00:00:00Z',
                slutt: '2023-01-13T00:00:00Z',
                aktiv: false
              }
            },
            {
              kode: 'H2',
              gyldighetsperiode: {
                start: '2023-01-14T00:00:00Z',
                slutt: '2023-07-31T00:00:00Z',
                aktiv: true
              }
            }
          ],
          skolear: {
            kode: '20222023',
            gyldighetsperiode: {
              start: '2022-08-01T00:00:00Z',
              slutt: '2023-07-31T00:00:00Z',
              aktiv: true
            }
          },
          elever: [
            {
              navn: 'Gollum Smeagol',
              fornavn: 'Gollum',
              etternavn: 'Smeagol',
              feidenavn: `gol1234@${env.FEIDENAVN_SUFFIX}`,
              elevnummer: '1234570',
              kontaktlarer: false,
              fodselsnummer: '12345678913'
            }
          ]
        }
      ]
    }
  ]
}

/*
function makeid (length) {
  let result = ''
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'
  const charactersLength = characters.length
  let counter = 0
  while (counter < length) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength))
    counter += 1
  }
  return result
}

for (let i = 0; i < 2000; i++) {
  mockTeacher.undervisningsforhold[0].undervisningsgrupper[0].elever.push(
    {
      navn: makeid(5),
      fornavn: 'Frodo',
      etternavn: 'Baggins',
      feidenavn: 'fro12345@domene.no',
      elevnummer: makeid(5),
      fodselsnummer: '12345*****',
      kontaktlarer: false
    }
  )
}
*/

/**
 *
 * @param {Object} user
 */
export const fintTeacher = async (userPrincipalName) => {
  const identifier = userPrincipalName
  if (!identifier) throw error(400, 'Missing required parameter "userPrincipalName"')
  if (env.MOCK_API === 'true' && env.NODE_ENV !== 'production') {
    await sleep(1000)
    return mockTeacher
  }
  const accessToken = await getMsalToken({ scope: env.FINTFOLK_API_SCOPE })
  try {
    const { data } = await axios.get(`${env.FINTFOLK_API_URL}/teacher/upn/${identifier}?includeStudentSsn=true`, { headers: { Authorization: `Bearer ${accessToken}` } })
    return data
  } catch (error) {
    if (error.response?.status === 404) {
      return null
    }
    throw error
  }
}
