import type {
  Metadata,
} from "next";

import Link from "next/link";


export const metadata: Metadata = {
  title:
    "Termini di noleggio | LAP GEAR",

  description:
    "Condizioni generali per la richiesta e il noleggio di attrezzatura foto, video e live con LAP GEAR.",
};


/* =========================================================
   TERMS
   ========================================================= */

const terms = [
  {
    number:
      "01",

    title:
      "Richiesta e conferma",

    content: (
      <>
        <p>
          L&apos;invio di una richiesta
          tramite il sito non costituisce
          automaticamente una prenotazione
          o una conferma del noleggio.
        </p>

        <p>
          Dopo la ricezione della richiesta,
          LAP GEAR verifica materiale, quantità,
          periodo richiesto e condizioni del
          noleggio.
        </p>

        <p>
          Il noleggio si considera confermato
          solo dopo una conferma esplicita
          comunicata al cliente.
        </p>
      </>
    ),
  },

  {
    number:
      "02",

    title:
      "Disponibilità",

    content: (
      <>
        <p>
          La disponibilità dell&apos;attrezzatura
          viene verificata in relazione alle
          date e alle quantità indicate nella
          richiesta.
        </p>

        <p>
          L&apos;eventuale indicazione di
          disponibilità presente sul sito ha
          funzione informativa e deve essere
          confermata prima del noleggio.
        </p>

        <p>
          In caso di indisponibilità di uno o
          più articoli, possono essere proposte
          alternative equivalenti o una
          modifica del kit.
        </p>
      </>
    ),
  },

  {
    number:
      "03",

    title:
      "Tariffe e durata",

    content: (
      <>
        <p>
          Le tariffe mostrate sul sito sono
          normalmente espresse per giorno di
          noleggio, salvo diversa indicazione.
        </p>

        <p>
          La stima visualizzata durante la
          composizione del kit è indicativa.
          L&apos;importo definitivo viene
          comunicato prima della conferma
          della richiesta.
        </p>

        <p>
          Eventuali condizioni particolari,
          sconti per periodi prolungati,
          trasporto o servizi aggiuntivi
          vengono concordati separatamente.
        </p>
      </>
    ),
  },

  {
    number:
      "04",

    title:
      "Cauzione e garanzie",

    content: (
      <>
        <p>
          Per alcuni noleggi può essere
          richiesta una cauzione, una garanzia
          o altra forma di tutela prima della
          consegna dell&apos;attrezzatura.
        </p>

        <p>
          L&apos;eventuale importo e le relative
          modalità vengono comunicate al cliente
          prima della conferma definitiva.
        </p>

        <p>
          La cauzione non rappresenta un costo
          aggiuntivo del noleggio, salvo importi
          eventualmente trattenuti secondo le
          condizioni concordate in caso di danni,
          perdita o altre responsabilità.
        </p>
      </>
    ),
  },

  {
    number:
      "05",

    title:
      "Ritiro e riconsegna",

    content: (
      <>
        <p>
          Il ritiro e la riconsegna vengono
          concordati preventivamente con il
          cliente.
        </p>

        <p>
          Il ritiro del materiale avviene su
          appuntamento. Orari e luogo vengono
          comunicati durante la conferma del
          noleggio.
        </p>

        <p>
          L&apos;attrezzatura deve essere
          riconsegnata completa degli accessori
          forniti e nelle condizioni in cui è
          stata consegnata, salvo la normale
          usura derivante da un utilizzo corretto.
        </p>
      </>
    ),
  },

  {
    number:
      "06",

    title:
      "Utilizzo del materiale",

    content: (
      <>
        <p>
          Il cliente è responsabile
          dell&apos;attrezzatura per l&apos;intero
          periodo in cui questa rimane nella
          sua disponibilità.
        </p>

        <p>
          Il materiale deve essere utilizzato
          secondo la sua destinazione,
          rispettando le normali precauzioni
          previste per apparecchiature
          professionali foto, video, audio
          e live.
        </p>

        <p>
          Non devono essere effettuate
          modifiche, smontaggi o interventi
          tecnici non autorizzati.
        </p>
      </>
    ),
  },

  {
    number:
      "07",

    title:
      "Danni, perdita o furto",

    content: (
      <>
        <p>
          Eventuali danni, malfunzionamenti,
          perdita o furto devono essere
          comunicati tempestivamente.
        </p>

        <p>
          In caso di danno imputabile a uso
          improprio, negligenza o evento
          verificatosi durante il periodo di
          responsabilità del cliente, potranno
          essere richiesti i costi necessari
          alla riparazione o alla sostituzione
          del materiale interessato.
        </p>

        <p>
          Le modalità vengono valutate sulla
          base del singolo caso e della
          documentazione disponibile.
        </p>
      </>
    ),
  },

  {
    number:
      "08",

    title:
      "Ritardi e variazioni",

    content: (
      <>
        <p>
          Eventuali variazioni delle date di
          ritiro o riconsegna devono essere
          richieste quanto prima.
        </p>

        <p>
          La possibilità di prolungare un
          noleggio dipende dalla disponibilità
          successiva del materiale e deve
          essere approvata da LAP GEAR.
        </p>

        <p>
          Una riconsegna oltre il periodo
          concordato può comportare un
          adeguamento dell&apos;importo del
          noleggio.
        </p>
      </>
    ),
  },

  {
    number:
      "09",

    title:
      "Annullamento",

    content: (
      <>
        <p>
          Se il cliente non intende più
          procedere con una richiesta o con
          un noleggio già concordato, è
          invitato a comunicarlo il prima
          possibile.
        </p>

        <p>
          Eventuali condizioni specifiche
          relative ad anticipi, prenotazioni,
          servizi esterni o costi già sostenuti
          vengono indicate prima della conferma
          quando applicabili.
        </p>
      </>
    ),
  },

  {
    number:
      "10",

    title:
      "Contatti",

    content: (
      <>
        <p>
          Per dubbi sul materiale, sulle
          condizioni di noleggio o su una
          richiesta già inviata è possibile
          contattare LAP GEAR prima della
          conferma.
        </p>

        <p>
          Per richieste particolari o produzioni
          con esigenze specifiche, le condizioni
          possono essere definite direttamente
          in fase di preventivo.
        </p>
      </>
    ),
  },
];


/* =========================================================
   PAGE
   ========================================================= */

export default function RentalTermsPage() {
  return (
    <main className="min-h-screen bg-[#ebeae4] text-[#111111]">

      {/* =====================================================
          HERO
          ===================================================== */}

      <section className="px-5 pb-8 pt-6 sm:px-8 lg:px-10 lg:pb-10 xl:px-14">

        <div className="mx-auto max-w-[1680px] overflow-hidden rounded-[32px] border border-black/10 bg-white shadow-[0_18px_60px_rgba(0,0,0,0.06)]">

          <div className="grid xl:grid-cols-[1fr_430px]">

            {/* LEFT */}

            <div className="relative overflow-hidden p-8 sm:p-10 lg:p-12 xl:p-14">

              <div className="pointer-events-none absolute -right-36 -top-40 h-[420px] w-[420px] rounded-full bg-[#ff5a1f]/[0.07]" />


              <div className="relative">

                <div className="inline-flex items-center gap-2.5 rounded-full bg-[#fff0e9] px-4 py-2 text-[13px] font-bold uppercase tracking-[0.12em] text-[#e94b12]">

                  <span className="h-2 w-2 rounded-full bg-[#ff5a1f]" />

                  LAP GEAR / Rental
                </div>


                <h1 className="mt-7 text-[52px] font-semibold leading-[0.9] tracking-[-0.062em] sm:text-[70px] lg:text-[84px]">

                  Termini
                  <br />

                  <span className="text-[#ff5a1f]">
                    di noleggio.
                  </span>
                </h1>


                <p className="mt-7 max-w-[760px] text-[18px] leading-8 text-black/55">
                  Le informazioni principali
                  sul funzionamento delle
                  richieste, sulla consegna
                  dell&apos;attrezzatura e sulle
                  responsabilità durante il
                  noleggio.
                </p>


                <div className="mt-8 flex flex-col gap-3 sm:flex-row">

                  <Link
                    href="/catalogo"
                    className="flex h-[58px] items-center justify-center rounded-[16px] bg-[#181818] px-6 text-[15px] font-semibold text-white transition hover:bg-[#ff5a1f]"
                  >
                    Vai al catalogo
                  </Link>


                  <Link
                    href="/noleggio"
                    className="flex h-[58px] items-center justify-center rounded-[16px] border border-black/10 bg-[#f1f0ea] px-6 text-[15px] font-semibold text-black/60 transition hover:border-black/25 hover:bg-white hover:text-black"
                  >
                    Apri il tuo kit →
                  </Link>

                </div>

              </div>
            </div>


            {/* RIGHT */}

            <div className="relative overflow-hidden bg-[#181818] p-8 text-white sm:p-10 xl:p-11">

              <div className="pointer-events-none absolute -right-24 -top-24 h-[260px] w-[260px] rounded-full bg-[#ff5a1f]/20" />


              <div className="relative">

                <div className="text-[12px] font-bold uppercase tracking-[0.13em] text-[#ff7b4a]">
                  Rental policy
                </div>

                <div className="mt-3 text-[32px] font-semibold leading-tight tracking-[-0.045em]">
                  Richiedi.
                  <br />
                  Verifichiamo.
                  <br />
                  Confermiamo.
                </div>


                <div className="mt-9 space-y-3">

                  <HeroPoint
                    number="01"
                    text="La richiesta non è una prenotazione automatica."
                  />

                  <HeroPoint
                    number="02"
                    text="Disponibilità verificata sulle date e quantità richieste."
                  />

                  <HeroPoint
                    number="03"
                    text="Condizioni e garanzie comunicate prima della conferma."
                  />

                </div>

              </div>
            </div>

          </div>
        </div>
      </section>


      {/* =====================================================
          INTRO
          ===================================================== */}

      <section className="px-5 py-8 sm:px-8 lg:px-10 lg:py-10 xl:px-14">

        <div className="mx-auto grid max-w-[1680px] gap-6 lg:grid-cols-[320px_1fr]">

          {/* INDEX */}

          <aside className="h-fit rounded-[26px] border border-black/10 bg-white p-6 lg:sticky lg:top-[110px]">

            <div className="text-[11px] font-bold uppercase tracking-[0.12em] text-[#ff5a1f]">
              Indice
            </div>

            <div className="mt-5 grid gap-1">

              {terms.map(
                (
                  term
                ) => (
                  <a
                    key={
                      term.number
                    }
                    href={`#term-${term.number}`}
                    className="group flex items-center gap-3 border-b border-black/10 py-3.5 text-[13px] font-semibold text-black/50 transition last:border-b-0 hover:text-[#ff5a1f]"
                  >
                    <span className="font-mono text-[10px] font-bold text-black/25 transition group-hover:text-[#ff5a1f]">
                      {
                        term.number
                      }
                    </span>

                    <span>
                      {
                        term.title
                      }
                    </span>
                  </a>
                )
              )}

            </div>

          </aside>


          {/* CONTENT */}

          <div>

            {/* OPERATIONAL NOTE */}

            <div className="mb-6 overflow-hidden rounded-[25px] border border-[#ff5a1f]/15 bg-[#fff7f3]">

              <div className="grid sm:grid-cols-[auto_1fr]">

                <div className="flex items-center justify-center bg-[#ff5a1f] px-6 py-5 text-[22px] font-semibold text-white">
                  i
                </div>


                <div className="p-6">

                  <div className="text-[12px] font-bold uppercase tracking-[0.1em] text-[#e94b12]">
                    Come funziona
                  </div>

                  <p className="mt-2 max-w-[900px] text-[15px] leading-7 text-black/55">
                    Il sito permette di
                    comporre il kit e inviare
                    una richiesta. Prima della
                    conferma vengono verificati
                    disponibilità, periodo,
                    materiale e condizioni
                    applicabili al singolo
                    noleggio.
                  </p>

                </div>

              </div>
            </div>


            {/* TERMS */}

            <div className="space-y-4">

              {terms.map(
                (
                  term
                ) => (
                  <article
                    key={
                      term.number
                    }
                    id={`term-${term.number}`}
                    className="scroll-mt-[120px] overflow-hidden rounded-[26px] border border-black/10 bg-white"
                  >

                    <div className="grid sm:grid-cols-[110px_1fr]">

                      {/* NUMBER */}

                      <div className="border-b border-black/10 bg-[#f3f2ed] p-6 sm:border-b-0 sm:border-r">

                        <div className="font-mono text-[13px] font-bold text-[#ff5a1f]">
                          {
                            term.number
                          }
                        </div>

                      </div>


                      {/* CONTENT */}

                      <div className="p-6 sm:p-8">

                        <h2 className="text-[28px] font-semibold tracking-[-0.045em] sm:text-[32px]">
                          {
                            term.title
                          }
                        </h2>


                        <div className="mt-5 space-y-4 text-[15px] leading-7 text-black/55 [&_strong]:font-semibold [&_strong]:text-black/75">
                          {
                            term.content
                          }
                        </div>

                      </div>

                    </div>

                  </article>
                )
              )}

            </div>

          </div>

        </div>
      </section>


      {/* =====================================================
          SUMMARY
          ===================================================== */}

      <section className="px-5 py-8 sm:px-8 lg:px-10 lg:py-12 xl:px-14">

        <div className="mx-auto max-w-[1680px] overflow-hidden rounded-[30px] bg-[#181818] text-white">

          <div className="grid lg:grid-cols-[1fr_390px]">

            {/* LEFT */}

            <div className="relative overflow-hidden p-8 sm:p-10 lg:p-12">

              <div className="pointer-events-none absolute -bottom-32 -left-24 h-[280px] w-[280px] rounded-full bg-[#ff5a1f]/20" />


              <div className="relative">

                <div className="text-[12px] font-bold uppercase tracking-[0.12em] text-[#ff7b4a]">
                  In sintesi
                </div>

                <h2 className="mt-3 max-w-[780px] text-[42px] font-semibold leading-[0.96] tracking-[-0.055em] sm:text-[54px]">
                  Prima confermiamo.
                  <br />
                  Poi prepariamo il gear.
                </h2>


                <p className="mt-6 max-w-[700px] text-[15px] leading-7 text-white/45">
                  Nessuna richiesta inviata
                  dal sito impegna automaticamente
                  il materiale. La conferma
                  definitiva arriva dopo la
                  verifica del kit e delle date.
                </p>

              </div>
            </div>


            {/* RIGHT */}

            <div className="border-t border-white/10 p-8 lg:border-l lg:border-t-0 lg:p-10">

              <div className="text-[11px] font-bold uppercase tracking-[0.11em] text-white/35">
                Hai un dubbio?
              </div>

              <div className="mt-3 text-[22px] font-semibold tracking-[-0.035em]">
                Scrivici prima
                del noleggio.
              </div>


              <a
                href="mailto:info@lapequipment.it"
                className="mt-7 flex h-[58px] items-center justify-between rounded-[16px] bg-[#ff5a1f] px-5 text-[14px] font-semibold text-white transition hover:bg-white hover:text-[#181818]"
              >
                info@lapequipment.it

                <span>
                  →
                </span>
              </a>


              <Link
                href="/catalogo"
                className="mt-3 flex h-[54px] items-center justify-center rounded-[15px] border border-white/10 bg-white/[0.06] px-5 text-[14px] font-semibold text-white/65 transition hover:bg-white/10 hover:text-white"
              >
                Torna al catalogo
              </Link>

            </div>

          </div>
        </div>
      </section>


      {/* =====================================================
          LEGAL NOTE
          ===================================================== */}

      <section className="px-5 pb-16 sm:px-8 lg:px-10 lg:pb-20 xl:px-14">

        <div className="mx-auto max-w-[1680px]">

          <div className="rounded-[20px] border border-black/10 bg-[#dfded8] px-6 py-5">

            <p className="text-[12px] leading-6 text-black/40">
              Questo testo descrive le
              condizioni operative generali
              del servizio. Eventuali condizioni
              specifiche applicabili a un singolo
              noleggio vengono comunicate prima
              della relativa conferma.
            </p>

          </div>

        </div>
      </section>

    </main>
  );
}


/* =========================================================
   HERO POINT
   ========================================================= */

function HeroPoint({
  number,
  text,
}: {
  number: string;
  text: string;
}) {
  return (
    <div className="flex gap-4 rounded-[16px] border border-white/10 bg-white/[0.05] p-4">

      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#ff5a1f]/15 font-mono text-[10px] font-bold text-[#ff7b4a]">
        {
          number
        }
      </div>

      <p className="pt-1 text-[13px] leading-5 text-white/55">
        {
          text
        }
      </p>

    </div>
  );
}