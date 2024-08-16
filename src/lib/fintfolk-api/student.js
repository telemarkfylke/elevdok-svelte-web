import { error } from '@sveltejs/kit'
import { env } from '$env/dynamic/private'
import { getMsalToken } from '$lib/msal-token'
import { sleep } from '$lib/api'
import axios from 'axios'

const mockStudents = [
  {
    feidenavn: `ele0102@${env.FEIDENAVN_SUFFIX}`,
    elevnummer: '12345678',
    upn: `ele0102@skole.${env.FEIDENAVN_SUFFIX}`,
    navn: 'Elev Elevesen',
    fornavn: 'Elev',
    etternavn: 'Elevesen',
    fodselsnummer: '12345678910',
    fodselsdato: '2005-07-09T00:00:00Z',
    alder: 17,
    kjonn: '1',
    kontaktEpostadresse: 'elev.elevesen@gmail.com',
    kontaktMobiltelefonnummer: '12345678',
    privatEpostadresse: 'elev.elevesen@gmail.com',
    privatMobiltelefonnummer: '12345678',
    bostedsadresse: {
      adresselinje: 'Tower of Sauron 6',
      postnummer: '6666',
      poststed: 'Mordor'
    },
    hybeladresse: {
      adresselinje: null,
      postnummer: null,
      poststed: null
    },
    hovedskole: {
      navn: 'Mordor videregående skole',
      skolenummer: '123455'
    },
    kontaktlarere: [
      {
        feidenavn: `sauron@${env.FEIDENAVN_SUFFIX}`,
        ansattnummer: '1111111',
        navn: 'Sauron Hanson',
        fornavn: 'Sauron',
        etternavn: 'Hanson',
        kontaktlarer: true,
        gruppe: '2TMA',
        skole: {
          navn: 'Mordor videregående skole',
          skolenummer: '12345',
          hovedskole: true
        }
      }
    ],
    elevforhold: [
      {
        systemId: '9144823',
        aktiv: true,
        beskrivelse: null,
        avbruddsdato: null,
        gyldighetsperiode: {
          start: '2022-08-17T00:00:00Z',
          slutt: '2023-07-31T00:00:00Z',
          aktiv: true
        },
        skole: {
          navn: 'Mordor videregående skole',
          kortnavn: 'OF-MRD',
          skolenummer: '12345',
          organisasjonsnummer: '12345678',
          organisasjonsId: '87',
          hovedskole: true
        },
        kategori: {
          kode: '2',
          navn: 'heltid'
        },
        programomrademedlemskap: [
          {
            medlemskapgyldighetsperiode: {
              start: '2023-08-21T00:00:00Z',
              slutt: '9999-12-31T00:00:00Z',
              aktiv: true
            },
            aktiv: true,
            navn: 'Tømrer',
            systemId: 'BATMF2----',
            utdanningsprogram: [
              {
                systemId: {
                  identifikatorverdi: 'BA'
                },
                navn: 'Bygg- og anleggsteknikk',
                grepreferanse: [
                  'https://psi.udir.no/kl06/BA'
                ]
              }
            ]
          }
        ],
        basisgruppemedlemskap: [
          {
            medlemskapgyldighetsperiode: {
              start: '2023-08-21T00:00:00Z',
              slutt: '9999-12-31T00:00:00Z',
              aktiv: true
            },
            navn: '2TMA',
            systemId: '1476223',
            aktiv: true, // Om både medlemskap og basisgruppen er aktiv
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
            undervisningsforhold: [
              {
                feidenavn: `sauron@${env.FEIDENAVN_SUFFIX}`,
                ansattnummer: '1111111',
                navn: 'Sauron Hanson',
                fornavn: 'Sauron',
                etternavn: 'Hanson',
                kontaktlarer: true
              }
            ]
          }
        ],
        undervisningsgruppemedlemskap: [
          {
            medlemskapgyldighetsperiode: {
              start: '2023-08-21T00:00:00Z',
              slutt: '9999-12-31T00:00:00Z',
              aktiv: true
            },
            navn: '2TMA/KRO1018',
            systemId: '12029734',
            aktiv: true, // Om både medlemskap og undervisningsgruppen er aktiv
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
            undervisningsforhold: [
              {
                feidenavn: `nasgul@${env.FEIDENAVN_SUFFIX}`,
                ansattnummer: '1234566',
                navn: 'Nasgul Gulesen',
                fornavn: 'Nasgul',
                etternavn: 'Gulesen',
                kontaktlarer: false
              }
            ]
          }
        ],
        faggruppemedlemskap: [
          {
            medlemskapgyldighetsperiode: {
              start: '2023-08-21T00:00:00Z',
              slutt: '9999-12-31T00:00:00Z',
              aktiv: true
            },
            aktiv: true, // Om både medlemskapet er aktivt
            navn: 'B6/REA3036',
            systemId: '48889',
            fag: {
              systemId: {
                identifikatorverdi: 'REA3036'
              },
              navn: 'Biologi 2',
              grepreferanse: [
                'https://psi.udir.no/kl06/REA3036'
              ]
            }
          },
          {
            navn: '3STK/NOR1267',
            systemId: '34451',
            fag: {
              systemId: {
                identifikatorverdi: 'NOR1267'
              },
              navn: 'Norsk hovedmål, skriftlig',
              grepreferanse: [
                'https://psi.udir.no/kl06/NOR1267'
              ]
            }
          }
        ],
        kontaktlarergruppemedlemskap: [
          {
            medlemskapgyldighetsperiode: {
              start: '2023-08-21T00:00:00Z',
              slutt: '9999-12-31T00:00:00Z',
              aktiv: true
            },
            navn: '2TMA',
            systemId: '1476214_528823',
            aktiv: true, // Om både medlemskap og kontaktlærergruppen er aktiv
            skole: {
              navn: 'Mordor videregående skole',
              skolenummer: '123456',
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
            undervisningsforhold: [
              {
                feidenavn: `sauron@${env.FEIDENAVN_SUFFIX}`,
                ansattnummer: '11111111',
                navn: 'Sauron Hanson',
                fornavn: 'Sauron',
                etternavn: 'Hanson',
                kontaktlarer: true
              }
            ]
          }
        ]
      }
    ]
  },
  {
    feidenavn: `sar0398@${env.FEIDENAVN_SUFFIX}`,
    elevnummer: '1234569',
    upn: `sar0398@skole.${env.FEIDENAVN_SUFFIX}`,
    navn: 'Sarumann Sauronsen',
    fornavn: 'Sarumann',
    etternavn: 'Sauronsen',
    fodselsnummer: '12345678910',
    fodselsdato: '2005-07-09T00:00:00Z',
    alder: 17,
    kjonn: '1',
    kontaktEpostadresse: 'elev.elevesen@gmail.com',
    kontaktMobiltelefonnummer: '12345678',
    privatEpostadresse: 'elev.elevesen@gmail.com',
    privatMobiltelefonnummer: '12345678',
    bostedsadresse: {
      adresselinje: 'Tower of Sauron 6',
      postnummer: '6666',
      poststed: 'Mordor'
    },
    hybeladresse: {
      adresselinje: null,
      postnummer: null,
      poststed: null
    },
    hovedskole: {
      navn: 'Hobbitun videregående skole',
      skolenummer: '12346'
    },
    kontaktlarere: [
      {
        feidenavn: `sauron@${env.FEIDENAVN_SUFFIX}`,
        ansattnummer: '1111111',
        navn: 'Sauron Hanson',
        fornavn: 'Sauron',
        etternavn: 'Hanson',
        kontaktlarer: true,
        gruppe: '2TMA',
        skole: {
          navn: 'Hobbitun videregående skole',
          skolenummer: '12346',
          hovedskole: true
        }
      }
    ],
    elevforhold: [
      {
        systemId: '9144823',
        aktiv: true,
        beskrivelse: null,
        avbruddsdato: null,
        gyldighetsperiode: {
          start: '2022-08-17T00:00:00Z',
          slutt: '2023-07-31T00:00:00Z',
          aktiv: true
        },
        skole: {
          navn: 'Hobbitun videregående skole',
          kortnavn: 'OF-HOB',
          skolenummer: '12346',
          organisasjonsnummer: '12345678',
          organisasjonsId: '87',
          hovedskole: true
        },
        kategori: {
          kode: '2',
          navn: 'heltid'
        },
        programomrademedlemskap: [
          {
            medlemskapgyldighetsperiode: {
              start: '2023-08-21T00:00:00Z',
              slutt: '9999-12-31T00:00:00Z',
              aktiv: true
            },
            aktiv: true,
            navn: 'Tømrer',
            systemId: 'BATMF2----',
            utdanningsprogram: [
              {
                systemId: {
                  identifikatorverdi: 'BA'
                },
                navn: 'Bygg- og anleggsteknikk',
                grepreferanse: [
                  'https://psi.udir.no/kl06/BA'
                ]
              }
            ]
          }
        ],
        basisgruppemedlemskap: [
          {
            medlemskapgyldighetsperiode: {
              start: '2023-08-21T00:00:00Z',
              slutt: '9999-12-31T00:00:00Z',
              aktiv: true
            },
            navn: '2TMA',
            systemId: '1476223',
            aktiv: true, // Om både medlemskap og basisgruppen er aktiv
            trinn: 'VG2',
            skole: {
              navn: 'Hobbitun videregående skole',
              skolenummer: '12346',
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
            undervisningsforhold: [
              {
                feidenavn: `sauron@${env.FEIDENAVN_SUFFIX}`,
                ansattnummer: '1111111',
                navn: 'Sauron Hanson',
                fornavn: 'Sauron',
                etternavn: 'Hanson',
                kontaktlarer: true
              }
            ]
          }
        ],
        undervisningsgruppemedlemskap: [
          {
            medlemskapgyldighetsperiode: {
              start: '2023-08-21T00:00:00Z',
              slutt: '9999-12-31T00:00:00Z',
              aktiv: true
            },
            navn: '2TMA/KRO1018',
            systemId: '12029734',
            aktiv: true, // Om både medlemskap og undervisningsgruppen er aktiv
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
            undervisningsforhold: [
              {
                feidenavn: `nasgul@${env.FEIDENAVN_SUFFIX}`,
                ansattnummer: '1234566',
                navn: 'Nasgul Gulesen',
                fornavn: 'Nasgul',
                etternavn: 'Gulesen',
                kontaktlarer: false
              }
            ]
          },
          {
            medlemskapgyldighetsperiode: {
              start: '2023-08-21T00:00:00Z',
              slutt: '9999-12-31T00:00:00Z',
              aktiv: true
            },
            navn: '2STB/MAT1017',
            systemId: '120419232',
            aktiv: true, // Om både medlemskap og undervisningsgruppen er aktiv
            fag: [
              {
                systemId: {
                  identifikatorverdi: 'MAT1017'
                },
                navn: 'Mat og hobbiter vg2',
                grepreferanse: [
                  'https://psi.udir.no/kl06//MAT1017'
                ]
              }
            ],
            skole: {
              navn: 'Hobbitun videregående skole',
              skolenummer: '12346',
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
            undervisningsforhold: [
              {
                feidenavn: `larer.laresen@${env.FEIDENAVN_SUFFIX}`,
                ansattnummer: '12345678',
                navn: 'Lærer Læresen',
                fornavn: 'Lærer',
                etternavn: 'Læresen',
                kontaktlarer: false
              }
            ]
          }
        ],
        faggruppemedlemskap: [
          {
            medlemskapgyldighetsperiode: {
              start: '2023-08-21T00:00:00Z',
              slutt: '9999-12-31T00:00:00Z',
              aktiv: true
            },
            aktiv: true, // Om både medlemskapet er aktivt
            navn: 'B6/REA3036',
            systemId: '48889',
            fag: {
              systemId: {
                identifikatorverdi: 'REA3036'
              },
              navn: 'Biologi 2',
              grepreferanse: [
                'https://psi.udir.no/kl06/REA3036'
              ]
            }
          },
          {
            medlemskapgyldighetsperiode: {
              start: '2023-08-21T00:00:00Z',
              slutt: '9999-12-31T00:00:00Z',
              aktiv: true
            },
            aktiv: true, // Om både medlemskapet er aktivt
            navn: '2STB/MAT234 (a)',
            systemId: '34451',
            fag: {
              systemId: {
                identifikatorverdi: 'MAT1017'
              },
              navn: 'Mat og hobbiter (vg2)',
              grepreferanse: [
                'https://psi.udir.no/kl06/MAT1017'
              ]
            }
          }
        ],
        kontaktlarergruppemedlemskap: [
          {
            medlemskapgyldighetsperiode: {
              start: '2023-08-21T00:00:00Z',
              slutt: '9999-12-31T00:00:00Z',
              aktiv: true
            },
            navn: '2TMA',
            systemId: '1476214_528823',
            aktiv: true, // Om både medlemskap og kontaktlærergruppen er aktiv
            skole: {
              navn: 'Mordor videregående skole',
              skolenummer: '123456',
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
            undervisningsforhold: [
              {
                feidenavn: `sauron@${env.FEIDENAVN_SUFFIX}`,
                ansattnummer: '11111111',
                navn: 'Sauron Hanson',
                fornavn: 'Sauron',
                etternavn: 'Hanson',
                kontaktlarer: true
              }
            ]
          }
        ]
      }
    ]
  }
]

/**
 *
 * @param {Object} user
 */
export const fintStudent = async (feidenavn) => {
  if (!feidenavn) throw error(400, 'Missing required parameter "feidenavn"')
  if (env.MOCK_API === 'true' && env.NODE_ENV !== 'production') {
    await sleep(1000)
    const mockStudent = mockStudents.find(student => student.feidenavn === feidenavn)
    if (!mockStudent) throw error(404, `Could not find student with feidenavn ${feidenavn}`)
    return mockStudent
  }
  const accessToken = await getMsalToken({ scope: env.FINTFOLK_API_SCOPE })
  try {
    const { data } = await axios.get(`${env.FINTFOLK_API_URL}/student/feidenavn/${feidenavn}`, { headers: { Authorization: `Bearer ${accessToken}` } })
    return data
  } catch (error) {
    if (error.response?.status === 404) {
      return null
    }
    throw error
  }
}
