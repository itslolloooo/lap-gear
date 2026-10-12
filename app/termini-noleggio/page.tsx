import type { Metadata } from "next";
import Link from "next/link";
import { getBusinessInfo } from "@/lib/business-info";

export const metadata: Metadata = {
  title: "Condizioni del servizio | LAP GEAR",
  description: "Condizioni della fase di lancio e raccolta richieste di interesse LAP GEAR.",
};

const LAST_UPDATED = "12 ottobre 2026";

export default function RentalTermsPage() {
  const business = getBusinessInfo();

  return (
    <main className="min-h-screen bg-[#ebeae4] px-5 pb-20 pt-8 text-[#111111] sm:px-8 lg:px-10 xl:px-14">
      <div className="mx-auto max-w-[1200px]">
        <section className="overflow-hidden rounded-[30px] border border-black/10 bg-white shadow-[0_18px_60px_rgba(0,0,0,0.05)]">
          <div className="grid lg:grid-cols-[1fr_340px]">
            <div className="p-7 sm:p-10 lg:p-12">
              <div className="text-[12px] font-bold uppercase tracking-[0.12em] text-[#ff5a1f]">
                Fase di lancio
              </div>
              <h1 className="mt-4 text-[48px] font-semibold leading-[0.94] tracking-[-0.055em] sm:text-[68px]">
                Richieste di interesse.
                <br />
                <span className="text-[#ff5a1f]">Non ancora noleggi.</span>
              </h1>
              <p className="mt-6 max-w-[760px] text-[16px] leading-7 text-black/50">
                LAP GEAR è attualmente in fase di validazione del servizio. Il sito consente
                di inviare richieste di disponibilità e manifestazioni di interesse, ma in
                questa fase non conclude contratti di noleggio e non accetta pagamenti o
                cauzioni online.
              </p>
            </div>

            <aside className="bg-[#181818] p-7 text-white sm:p-9">
              <div className="text-[11px] font-bold uppercase tracking-[0.1em] text-[#ff7b4a]">Titolare</div>
              <div className="mt-4 text-[20px] font-semibold">{business.legalName}</div>
              <div className="mt-3 text-[13px] leading-6 text-white/50">{business.address}</div>
              <div className="mt-2 text-[13px] text-white/50">P. IVA {business.vatId}</div>
              <a href={`mailto:${business.email}`} className="mt-4 block break-all text-[13px] font-semibold text-[#ff8b60]">
                {business.email}
              </a>
              <div className="mt-6 border-t border-white/10 pt-5 text-[11px] text-white/30">
                Ultimo aggiornamento: {LAST_UPDATED}
              </div>
            </aside>
          </div>
        </section>

        <div className="mt-6 space-y-5">
          <Clause number="01" title="Natura della richiesta">
            <p>
              L'invio del modulo costituisce esclusivamente una richiesta di informazioni,
              disponibilità o interesse. Non crea una prenotazione, non blocca il materiale
              e non comporta alcun obbligo di acquisto o noleggio per l'utente o per LAP GEAR.
            </p>
          </Clause>

          <Clause number="02" title="Nessun pagamento online">
            <p>
              Durante la fase di lancio il sito non richiede né incassa corrispettivi, anticipi
              o cauzioni. Non inserire dati di carte di pagamento o altre informazioni finanziarie
              nei campi liberi del modulo.
            </p>
          </Clause>

          <Clause number="03" title="Disponibilità e prezzi">
            <p>
              Eventuali prezzi, disponibilità o stime mostrati sul sito hanno finalità informative
              e di validazione del servizio. Non costituiscono un'offerta vincolante al pubblico.
            </p>
          </Clause>

          <Clause number="04" title="Contatto successivo">
            <p>
              LAP GEAR può utilizzare i recapiti forniti per rispondere alla richiesta e raccogliere
              informazioni utili a valutare l'interesse per il futuro servizio. Nessun contratto nasce
              automaticamente da tali comunicazioni.
            </p>
          </Clause>

          <Clause number="05" title="Attivazione futura del noleggio">
            <p>
              Prima dell'avvio effettivo dei noleggi, le condizioni contrattuali complete relative a
              prezzi, cauzione, pagamento, consegna, responsabilità, danni, ritardi, recesso e ogni
              altra condizione applicabile saranno pubblicate e comunicate prima della conclusione
              di qualsiasi contratto.
            </p>
          </Clause>

          <Clause number="06" title="Privacy">
            <p>
              Il trattamento dei dati personali inviati tramite il sito è descritto nella Privacy Policy.
            </p>
            <Link href="/privacy" className="font-semibold text-[#ff5a1f]">Leggi la Privacy Policy →</Link>
          </Clause>
        </div>
      </div>
    </main>
  );
}

function Clause({ number, title, children }: { number: string; title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-[24px] border border-black/10 bg-white p-6 sm:p-8">
      <div className="flex gap-5">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#181818] text-[11px] font-bold text-white">{number}</div>
        <div>
          <h2 className="text-[23px] font-semibold tracking-[-0.035em]">{title}</h2>
          <div className="mt-3 space-y-3 text-[14px] leading-7 text-black/55">{children}</div>
        </div>
      </div>
    </section>
  );
}
