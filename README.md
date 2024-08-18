# Elevok-svelte-web WEB
SvelteKit Web app

Deploy som Azure Web App, med authentication enabled via microsoft authentication

SJEKK, nå skal jeg bygge detta på en uke 🤡

## Frontend
### Hovedsiden (/)
- Henter elevene dine (samma hvilken skole) (Hvilken info trenger vi om eleven? Har navn feidenavn, trenger kanskje ikke mer?)
- Kan klikke inn på en elev for å hente dokumenter for eleven (fra elevmappa P360-VTFK og P360-XFYLKE)
- students: [
  {
    feidenavn,
    blabla,
    skoler: [
      {
        navn,
        blablabla,
        kontaktlarer: true / false // Om læreren er kontaktlærer for eleven ved denne skolen
      }
    ]
  }
]
I første omgang trenger vi da bare sjekke om hen er kontaktlærer for eleven ved en eller annen skole

### /elever/{feidenavnPrefix}
- Henter dokumentene for eleven (load function tenker jeg)
- Viser metadata per dokument, omtrent som i dag.
- Faglærer skal bare se metadata, kontaktlærer kan åpne dokumenter
- Kan klikke på et dokument - så slenger vi opp en pdf-modal med dokumentet (lignende pdf-preview, så slipper vi å gjøre så mye - se om vi kan få fjerna last ned knappen og sånt)
Obs obs alt skal logges til mongodb

### /admin
- Mulighet for å mocke brukere, samt se litt logger

### Roller
- Lærer
- Leder / Rådgiver
- Admin (samma som MinElev for å kunne mocke enkelt og greit - bare husk å logge til mongodb)


# create-svelte

Everything you need to build a Svelte project, powered by [`create-svelte`](https://github.com/sveltejs/kit/tree/main/packages/create-svelte).

## Creating a project

If you're seeing this, you've probably already done this step. Congrats!

```bash
# create a new project in the current directory
npm create svelte@latest

# create a new project in my-app
npm create svelte@latest my-app
```

## Developing

Once you've created a project and installed dependencies with `npm install` (or `pnpm install` or `yarn`), start a development server:

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
