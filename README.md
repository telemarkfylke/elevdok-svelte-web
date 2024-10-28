# Elevdok WEB
SvelteKit Web app


## Generell beskrivelse
Web app der lærere kan logge på, velge en elev de har tilgang på, for så å se arkiv-dokumenter og filer som ligger i elevens arkiv-elevmappe.

Ledere kan se alle dokumenter for alle elever på hele skolen de har tilgang til.


## Avhengigheter
- MongoDb database (for logging av oppslag)
- Azure app registration som representerer backend - for server-side kall
- [Azure web app med Entra ID built-in authenticaton](https://learn.microsoft.com/en-us/azure/app-service/overview-authentication-authorization)
- [FINT-FOLK-API](https://github.com/vtfk/azf-fint-folk-api)

## Arkitektur
Et SvelteKit prosjekt som kjøres på en Azure app service / Azure web app på nodejs runtime

### Built-in authentication (Entra ID)
- Alle kall mot web-appen går gjennom Azure built in authentication. Bruker-info injectes i header før requestene til slutt når web-appen.
- Videre api-kall mot FINT osv skjer server-side.

### Authorization
#### Lærer
- Kun tilgang på elever de har tilgang på i VIS. Tilgang basert på om de er faglærer, kontaktlærer, eller IOP-lærer for en elev.
- Dersom FAGLARER_ACCESS_ENABLED er satt til true, har ALLE lærere tilgang til å se filer i arkivdokumenter.
- Dersom IOP_FAGLARER_ACCESS_ENABLED er satt til true, har en lærer som har en elev i et IOP-fag tilgang til å åpne filer i arkivdokumenter for eleven.
- Kontaktlærere har tilgang på dokumenter og filer for elever de er kontaktlærer for.

#### Leder
- Tilgang på alle elever og tilhørende dokumenter, og filer, ved en skole de har tilgang på.
- Tilgang styres basert på Entra ID tilgangsgrupper. En per skole.
- Legg til en bruker i skolens tilgangsgruppe for å gi brukeren tilgang på alle dokumenter for skolen
- Gruppenavn: A-TILGANG-ELEVDOK-LEDER-{SKOLEKORTNAVN}
- Gruppebeskrivelse: Gruppe for å gi leder / rådgiver tilgang til {Skolenavn} i Elevdok
- Gruppen må også legges til på enterprise appen, med rollen "Leder"

#### Admin
- Tilgang til å se hvilke brukere som har leder-tilgang
- Tilgang til å se og søke i logger

## Deployment
Deploy som Azure Web App, med authentication enabled via entra-id authentication. 
Startup command: `node /home/site/wwwroot/build/` (evt `ORIGIN=https://{elevdok}.no node /home/site/wwwroot/build/` dersom du deployer bak app gateway / load balancer ellerno)

## Løsningsbeskrivelse
På rot (+layout.sever.js) hentes data for brukeren
- Hvilken bruker det er
- Hvilke elever brukeren har tilgang på, og per elev:
- Hvilke klasser brukeren har tilgang på, og hvilke elever som er i disse klassene
- Om brukeren har IOP-tilgang, faglærer-tilgang, eller kontaktlærertilgang, eller leder-tilgang på eleven

Brukeren kan se en oversikt over disse elevene i /elever, og klikke seg videre inn på /elever/[feidenavnPrefix]

På /elever/[feidenavnPrefix] hentes også dokumentene i elevmappa til eleven og de listes opp. Brukeren kan klikke seg inn på en fil i dokumentet for å åpne filen i en modal.

### Data-henting
- Gjør all data-henting server-side. Pass på hva du returnere til frontend / sluttbruker

## IOP-lærer-tilgang
- Sjekk [getIOPSchools](src/lib/elevdok-api/get-user-data.js)


## Developing
Opprett en .env fil med følgende verdier (bytt ut med reelle verdier da)
```bash
MOCK_AUTH="true | false" # Om lokal utvikling, sett til true
MOCK_API="true | false" # Om du bare knoter med frontend, så kan den settes til true
MOCK_AUTH_LARER_ROLE="true | false" # Om mock-auth er true, har du default-rollen?
MOCK_AUTH_LEDER_ROLE="true | false" # Om mock-auth er true, har du leder-rollen?
MOCK_AUTH_ADMIN_ROLE="true | false" # Om mock-auth er true, har du admin-rollen?
DEFAULT_ROLE="Elevdok.Larer" # Sett til samme som i enterprise appen din
LEDER_ROLE="Elevdok.Leder" # Sett til samme som i enterprise appen din
ADMIN_ROLE="Elevdok.Admin" # Sett til samme som i enterprise appen din
APPREG_CLIENT_ID="dev backend appreg client id"
APPREG_CLIENT_SECRET="dev backend appreg client secret"
APPREG_TENANT_ID="dev backend appreg tenant id"
FEIDENAVN_SUFFIX="fylke.no"
MONGODB_CONNECTION_STRING="mongodb+srv://{user}:{pwd}@{cluster}.mongodb.net/?retryWrites=true&w=majority"
MONGODB_DB_NAME="elevdok-test"
MONGODB_LOGS_COLLECTION="logs"
MONGODB_USER_SETTINGS_COLLECTION="user-settings"
MONGODB_USER_IMPERSONATION_COLLECTION="user-impersonation-log"
FINTFOLK_API_URL="https://fintfolk.api.fylke.no/api"
FINTFOLK_API_SCOPE="https://fintfolk-{env}.api.fylke.no/.default"
AZF_ARCHIVE_URL="https://archive.api.fylke.no/api"
AZF_ARCHIVE_SCOPE="https://archive-{env}.api.fylke.no/.default"
FAGLARER_ACCESS_ENABLED="false | true"
IOP_FAGLARER_ACCESS_ENABLED="true | false"
MAINTENANCE_MODE="false | false"
MAIN_SOURCE_NAME="Fis fylkeskommune" # Navnet på "hovedarkivet" ditt 
VTFK_ARCHIVE_ENABLED="false" # Får skru på etterhvert vel
FRONTEND_APP_ID="guid" # Client id til entra app registration for pålogging, brukes til å hente ledertilganger
```

Once you've installed dependencies with `npm install` (or `pnpm install` or `yarn`), start a development server:

```bash
npm run dev

# or start the server and open the app in a new browser tab
npm run dev -- --open
```

## Building

To create a production version of your app:

```bash
npm run build
```

You can preview the production build with `npm run preview`.

> To deploy your app, you may need to install an [adapter](https://kit.svelte.dev/docs/adapters) for your target environment.
