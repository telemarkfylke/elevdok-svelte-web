import { repackP360Document } from "./azf-archive"

const randomOfficialTitles = ['Kompetansebevis', 'Vitnemål', 'Lærekontrakt', 'IOP', 'Dokumentasjon på bestått fagprøve']
const randomNames = ['Elev Elevesen', 'Gunnar Greve', 'Max Mekker']
const categories = [
  {
    Recno: 60005,
    Code: 'Internt notat uten oppfølging',
    Description: 'Internt notat uten oppfølging'
  },
  {
    Recno: 60006,
    Code: 'Dokument inn',
    Description: 'Dokument inn'
  },
  {
    Recno: 60007,
    Code: 'Dokument ut',
    Description: 'Dokument ut'
  }
]
const statusCodes = ['J', 'F', 'E', 'A']
const caseStatuses = ['Under behandling', 'Avsluttet'] // reminder
const documentArchives = ['Elevdokument', 'Sensitivt elevdokument']
const fileFormats = ['PDF', 'pdf', 'xlsx', 'DOCX']

const randomValue = (list) => {
  const randomNumber = Math.floor(Math.random() * (list.length))
  return list[randomNumber]
}

export const getMockDocuments = (teacherStudent, loggerPrefix, numberOfDocuments = 10) => {
  const documents = []
  for (const number of Array.from(Array(numberOfDocuments).keys())) {
    const document = {
      Recno: 123456 + number,
      DocumentNumber: `24/12345-${number}`,
      CaseNumber: '24/12345',
      CaseExternalId: null,
      Title: `${randomValue(randomOfficialTitles)} - Elev Elevesen`,
      DocumentDate: '2024-08-14T00:00:00',
      JournalDate: null,
      Category: randomValue(categories),
      Type: randomValue(categories),
      StatusCode: randomValue(statusCodes),
      StatusDescription: 'Reservert eller journalført eller hva søren',
      AccessCodeDescription: 'Offl § 13 taushetsplikt',
      AccessCodeCode: '13',
      Paragraph: 'Offl. § 13 jf. fvl. § 13 (1) nr.1',
      ResponsibleEnterprise: {
        Email: '',
        Recno: 200015,
        ExternalId: '4400',
        Referencenumber: '',
        Name: 'Seksjon for noe',
        Url: null,
        Domain: null
      },
      ResponsibleEnterpriseName: 'Seksjon for noe',
      ResponsiblePerson: {
        Email: 'gubba.noa@vestfoldfylke.no',
        UserId: 'gubba.noa@vestfoldfylke.no',
        Recno: 200547,
        ExternalId: '',
        Referencenumber: null,
        Name: 'Gubba Noa',
        Url: null,
        Domain: null
      },
      ResponsiblePersonName: 'Gubba Noa',
      Contacts: [
        {
          ReferenceNumber: null,
          ExternalId: '',
          Role: 'Avsender',
          SearchName: 'Gubba Noa',
          ContactRecno: '200547',
          Address: '',
          ZipCode: '',
          ZipPlace: '',
          Country: '',
          Email: 'gubba.not@vestfoldfylke.no',
          ContactType: 'Kontaktperson',
          IsUnofficial: false
        },
        {
          ReferenceNumber: null,
          ExternalId: '',
          Role: 'Mottaker',
          SearchName: 'Elev Elevesen',
          ContactRecno: '200547',
          Address: '',
          ZipCode: '',
          ZipPlace: '',
          Country: '',
          Email: 'elev@gmail.no',
          ContactType: 'Privatperson',
          IsUnofficial: true
        }
      ],
      Files: [
        {
          Recno: 411732,
          Title: `${randomValue(randomOfficialTitles)} - Elev Elevesen`,
          Format: randomValue(fileFormats),
          Base64Data: null,
          URL: 'https://mordor.no',
          RelationTypeDescription: 'Hoveddokument',
          RelationTypeCode: 'H',
          VersionFormatDescription: null,
          VersionFormatCode: 'P',
          Type: 'Original',
          Note: '',
          ModifiedBy: 'Gubba Noa',
          CheckedOutBy: '',
          CategoryDescription: '',
          CategoryCode: '',
          StatusDescription: 'Behandles',
          StatusCode: 'B',
          AccessCodeDescription: 'Offl § 13 taushetsplikt',
          AccessCodeCode: '13',
          Paragraph: 'Offl. § 13 jf. fvl. § 13 (1) nr.1',
          DegradeDate: null,
          DegradeCode: '',
          DisposalDate: null,
          DisposalCode: 'B',
          FiledOnPaper: false,
          PaperLocation: '',
          SignDate: null,
          Version: 1,
          LastChangedDate: '2024-08-14T12:28:20',
          FileExternalId: null,
          AccessCodeRecno: '200008',
          AccessGroup: 'Eksamen',
          AccessGroupRecno: '200655'
        },
        {
          Recno: 411732,
          Title: `${randomValue(randomOfficialTitles)} - Elev Elevesen`,
          Format: randomValue(fileFormats),
          Base64Data: null,
          URL: 'https://mordor.no',
          RelationTypeDescription: 'Vedlegg',
          RelationTypeCode: 'V',
          VersionFormatDescription: null,
          VersionFormatCode: 'P',
          Type: 'Original',
          Note: '',
          ModifiedBy: 'Gubba Noa',
          CheckedOutBy: '',
          CategoryDescription: '',
          CategoryCode: '',
          StatusDescription: 'Behandles',
          StatusCode: 'B',
          AccessCodeDescription: 'Offl § 13 taushetsplikt',
          AccessCodeCode: '13',
          Paragraph: 'Offl. § 13 jf. fvl. § 13 (1) nr.1',
          DegradeDate: null,
          DegradeCode: '',
          DisposalDate: null,
          DisposalCode: 'B',
          FiledOnPaper: false,
          PaperLocation: '',
          SignDate: null,
          Version: 1,
          LastChangedDate: '2024-08-14T12:28:20',
          FileExternalId: null,
          AccessCodeRecno: '200008',
          AccessGroup: 'Eksamen',
          AccessGroupRecno: '200655'
        }
      ],
      Remarks: null,
      ReferringCases: null,
      ReferringDocuments: null,
      OfficialTitle: randomValue(randomOfficialTitles),
      CreatedDate: `2024-08-${randomValue(['01', '31', '12', '11', '17', '22'])}`,
      CaseRecno: '231691',
      LastChangedDate: '2024-08-14 12:11:29',
      CustomFields: null,
      DocumentRowPermissions: null,
      DocumentArchive: {
        Recno: 200005,
        Code: randomValue(documentArchives),
        Description: randomValue(documentArchives)
      },
      SubArchive: null,
      URL: 'blablabla',
      ArchiveCodes: [],
      Keywords: null,
      AccessCodeRecno: '200008',
      RecordType: null,
      AccessGroup: 'Eksamen',
      ExternalId: null,
      SendersReference: '',
      AccessGroupRecno: '200655',
      eArchiveXMLFragment: null,
      ImportedDocumentNumber: ''
    }
    documents.push(document)
  }

  // Repack before returning
  const repacked = documents.map(document => repackP360Document(document, teacherStudent.feidenavn, 'mock', 'MockeArkiv'))
  return repacked
}

export const mockFile = { base64: 'JVBERi0xLjcKCjEgMCBvYmogICUgZW50cnkgcG9pbnQKPDwKICAvVHlwZSAvQ2F0YWxvZwogIC9QYWdlcyAyIDAgUgo+PgplbmRvYmoKCjIgMCBvYmoKPDwKICAvVHlwZSAvUGFnZXMKICAvTWVkaWFCb3ggWyAwIDAgMjAwIDIwMCBdCiAgL0NvdW50IDEKICAvS2lkcyBbIDMgMCBSIF0KPj4KZW5kb2JqCgozIDAgb2JqCjw8CiAgL1R5cGUgL1BhZ2UKICAvUGFyZW50IDIgMCBSCiAgL1Jlc291cmNlcyA8PAogICAgL0ZvbnQgPDwKICAgICAgL0YxIDQgMCBSIAogICAgPj4KICA+PgogIC9Db250ZW50cyA1IDAgUgo+PgplbmRvYmoKCjQgMCBvYmoKPDwKICAvVHlwZSAvRm9udAogIC9TdWJ0eXBlIC9UeXBlMQogIC9CYXNlRm9udCAvVGltZXMtUm9tYW4KPj4KZW5kb2JqCgo1IDAgb2JqICAlIHBhZ2UgY29udGVudAo8PAogIC9MZW5ndGggNDQKPj4Kc3RyZWFtCkJUCjcwIDUwIFRECi9GMSAxMiBUZgooSGVsbG8sIHdvcmxkISkgVGoKRVQKZW5kc3RyZWFtCmVuZG9iagoKeHJlZgowIDYKMDAwMDAwMDAwMCA2NTUzNSBmIAowMDAwMDAwMDEwIDAwMDAwIG4gCjAwMDAwMDAwNzkgMDAwMDAgbiAKMDAwMDAwMDE3MyAwMDAwMCBuIAowMDAwMDAwMzAxIDAwMDAwIG4gCjAwMDAwMDAzODAgMDAwMDAgbiAKdHJhaWxlcgo8PAogIC9TaXplIDYKICAvUm9vdCAxIDAgUgo+PgpzdGFydHhyZWYKNDkyCiUlRU9G' }
