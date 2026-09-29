# LAP equipment — starter site

Prima versione funzionante del sito rental.

## Incluso
- Home premium responsive
- Catalogo con ricerca e filtri
- Pagina prodotto
- Carrello/richiesta noleggio in localStorage
- Scelta date
- Prezzo multi-giorno demo
- Form richiesta
- API disponibilità
- API richiesta prenotazione
- Schema Supabase con prodotti + unità fisiche separate
- Struttura pronta per back-office successivo

## Avvio
```bash
npm install
cp .env.example .env.local
npm run dev
```

Apri http://localhost:3000

## Supabase
Esegui `supabase/schema.sql` nel SQL Editor.
Poi compila `.env.local`:

```
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
```

`SUPABASE_SERVICE_ROLE_KEY` viene usata solo nelle route server e NON deve essere esposta nel browser.

Se le variabili Supabase non sono presenti, il sito resta navigabile in modalità demo e la richiesta restituisce un riferimento DEMO.

## Nota dati
I prodotti in `lib/catalog.ts` sono dati demo iniziali basati sul tipo di attrezzatura del progetto. Prima della pubblicazione vanno sostituiti con catalogo, prezzi, cauzioni e foto definitive.

## Prossimo step consigliato
Back-office `/admin` con:
- richieste da confermare
- calendario ritiri/restituzioni
- gestione prodotti e unità fisiche
- manutenzione
- assegnazione seriali alle prenotazioni
- stato richiesta → confermata → ritirata → restituita
