# Fritidshus Finder

Et personligt beslutningsværktøj til at finde og vælge det rigtige fritidshus. Ikke endnu en browser-app — en beslutningsassistent.

## Kom i gang

### 1. Installer afhængigheder
```bash
npm install
```

### 2. Start udviklingsserveren
```bash
npm run dev
```
Åbn http://localhost:5173

### 3. (Valgfrit) Rejsetid via Google Maps
For automatisk beregning af køretid:

1. Opret en API-nøgle på [Google Cloud Console](https://console.cloud.google.com)
2. Aktivér: **Distance Matrix API** og **Maps JavaScript API**
3. Opret filen `.env.local` i projektmappen:
   ```
   VITE_GOOGLE_MAPS_API_KEY=din-api-nøgle-her
   ```
4. Begræns nøglen til din URL (HTTP referrers) af sikkerhedshensyn
5. Genstart serveren (`npm run dev`)

Uden API-nøgle kan du stadig bruge alle funktioner — køretid skal bare angives manuelt, eller du sætter feltet til 50 for at se en neutral score.

## Funktioner

| Feature | Beskrivelse |
|---|---|
| **Match Score** | Vægtet score 0–100 pr. bolig baseret på dine prioriteter (ro, afstand, stand, pris) |
| **Filtre** | Filtrer på køretid, pris, grundstørrelse, varmekilde, flexbolig, stand, kategori |
| **Kategorier** | Marker boliger som ⭐ Top pick, 🤔 Måske, ✗ Fravælg |
| **Noter** | Skriv noter pr. bolig – gemmes automatisk |
| **Sammenligning** | Sammenlign 2–3 boliger side om side med vinder-fremhævning |
| **Indstillinger** | Justér vægte, budget og hjemmeadresse |

## Tech stack

- **Frontend**: React + Vite
- **Styling**: Tailwind CSS
- **Data**: localStorage (kørende uden backend)
- **Rejsetid**: Google Maps JavaScript API (valgfrit)

## Data opbevares lokalt

Al data gemmes i din browsers `localStorage`. Intet sendes til nogen server (medmindre du tilføjer en Google Maps API-nøgle, der laver et kald til Google).

## Fremtidigt: migrér til Supabase

Hvis du vil have data på tværs af enheder, se `supabase/migrations/001_initial.sql` for databaseskema og byt lagerlaget i `src/lib/storage.js` ud med Supabase-klient-kald.

## Deploy til Vercel

```bash
npm run build
# Push til GitHub og deploy via vercel.com
```
Husk at sætte `VITE_GOOGLE_MAPS_API_KEY` som environment variable i Vercel-projektet.
