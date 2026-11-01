import type { Metadata } from "next";
import Link from "next/link";

import { getBusinessInfo } from "@/lib/business-info";
import {
  RENTAL_TERMS_LAST_UPDATED,
  RENTAL_TERMS_VERSION,
} from "@/lib/rental-terms";

export const metadata: Metadata = {
  title: "Condizioni richiesta e noleggio",
  description:
    "Condizioni applicabili alle richieste di disponibilità e ai successivi noleggi LAP GEAR.",
  alternates: {
    canonical: "https://lapgear.it/termini-noleggio",
  },
};

export default function RentalTermsPage() {
  const business = getBusinessInfo();

  return (
    <main className="min-h-screen bg-[#ebeae4] px-5 pb-20 pt-8 text-[#111111] sm:px-8 lg:px-10 xl:px-14">
      <div className="mx-auto max-w-[1200px]">
        <section className="overflow-hidden rounded-[30px] border border-black/10 bg-white shadow-[0_18px_60px_rgba(0,0,0,0.05)]">
          <div className="grid lg:grid-cols-[1fr_340px]">
            <div className="p-7 sm:p-10 lg:p-12">
              <div className="text-[12px] font-bold uppercase tracking-[0.12em] text-[#ff5a1f]">
                LAP GEAR / Rental
              </div>

              <h1 className="mt-4 text-[48px] font-semibold leading-[0.94] tracking-[-0.055em] sm:text-[68px]">
                Condizioni della richiesta
                <br />
                <span className="text-[#ff5a1f]">e del noleggio.</span>
              </h1>

              <p className="mt-6 max-w-[760px] text-[16px] leading-7 text-black/50">
                Queste condizioni descrivono come funziona la richiesta di disponibilità
                sul sito e i principi applicabili al successivo noleggio. La richiesta
                inviata online non equivale da sola a una prenotazione confermata.
              </p>
            </div>

            <aside className="bg-[#181818] p-7 text-white sm:p-9">
              <div className="text-[11px] font-bold uppercase tracking-[0.1em] text-[#ff7b4a]">
                Titolare
              </div>

              <div className="mt-4 text-[20px] font-semibold">
                {business.legalName}
              </div>

              <div className="mt-3 text-[13px] leading-6 text-white/50">
                {business.address}
              </div>

              <div className="mt-2 text-[13px] text-white/50">
                P. IVA {business.vatId}
              </div>

              <a
                href={`mailto:${business.email}`}
                className="mt-4 block break-all text-[13px] font-semibold text-[#ff8b60]"
              >
                {business.email}
              </a>

              <div className="mt-6 border-t border-white/10 pt-5 text-[11px] leading-5 text-white/30">
                Ultimo aggiornamento: {RENTAL_TERMS_LAST_UPDATED}
                <br />
                Versione: {RENTAL_TERMS_VERSION}
              </div>
            </aside>
          </div>
        </section>

        <div className="mt-6 space-y-5">
          <Clause number="01" title="Richiesta di disponibilità">
            <p>
              L&apos;invio del modulo sul sito costituisce una richiesta di disponibilità
              e preventivo. Non blocca automaticamente il materiale e non perfeziona da
              solo un contratto di noleggio.
            </p>
          </Clause>

          <Clause number="02" title="Conferma del noleggio">
            <p>
              Il noleggio viene considerato confermato solo dopo una conferma espressa di
              LAP GEAR e l&apos;accettazione delle condizioni economiche e operative
              comunicate nel preventivo o nella conferma.
            </p>
            <p>
              Fino a quel momento disponibilità, date e importi mostrati nel sito devono
              essere considerati una stima soggetta a verifica.
            </p>
          </Clause>

          <Clause number="03" title="Prezzi, pagamento e cauzione">
            <p>
              Il prezzo definitivo, le modalità e le scadenze di pagamento e l&apos;eventuale
              cauzione vengono indicati prima della conferma del noleggio.
            </p>
            <p>
              Eventuali importi mostrati durante la composizione del kit sono calcolati
              sulle tariffe giornaliere del materiale selezionato e possono essere
              aggiornati nel preventivo finale.
            </p>
          </Clause>

          <Clause number="04" title="Ritiro e riconsegna">
            <p>
              Date, orari, luogo e modalità di ritiro e riconsegna vengono concordati
              nella conferma. Il materiale deve essere restituito completo degli accessori
              consegnati e nelle condizioni compatibili con il normale utilizzo.
            </p>
            <p>
              Se si prevede un ritardo nella riconsegna, il cliente deve avvisare LAP GEAR
              il prima possibile. Eventuali costi aggiuntivi devono risultare dalle condizioni
              comunicate e accettate per quello specifico noleggio.
            </p>
          </Clause>

          <Clause number="05" title="Custodia, danni e materiale mancante">
            <p>
              Dal momento della consegna fino alla riconsegna, il cliente è tenuto a
              custodire il materiale con diligenza e a utilizzarlo secondo la sua normale
              destinazione.
            </p>
            <p>
              Danni, perdita o mancanza di accessori vengono verificati al rientro. Eventuali
              addebiti vengono determinati sulla base del danno effettivamente riscontrato,
              dei costi di ripristino o sostituzione e delle condizioni concordate per il
              noleggio.
            </p>
          </Clause>

          <Clause number="06" title="Modifiche e cancellazione">
            <p>
              Prima della conferma, la richiesta può essere modificata o ritirata senza
              che ciò costituisca una prenotazione già perfezionata.
            </p>
            <p>
              Per richieste già confermate, eventuali condizioni di cancellazione,
              modifica delle date o riduzione del materiale vengono comunicate nel
              preventivo o nella conferma applicabile a quel noleggio.
            </p>
          </Clause>

          <Clause number="07" title="Disponibilità del materiale">
            <p>
              La disponibilità viene verificata sulle date richieste. In caso di indisponibilità,
              guasto, manutenzione o altro impedimento sopravvenuto, LAP GEAR può proporre
              materiale alternativo o una modifica della configurazione prima della conferma.
            </p>
          </Clause>

          <Clause number="08" title="Dati personali">
            <p>
              I dati forniti sono utilizzati per gestire la richiesta, il preventivo e il
              successivo rapporto di noleggio secondo quanto indicato nell&apos;informativa privacy.
            </p>

            <Link
              href="/privacy"
              className="font-semibold text-[#ff5a1f]"
            >
              Leggi l&apos;Informativa privacy →
            </Link>
          </Clause>

          <Clause number="09" title="Contatti">
            <p>
              Per chiarimenti sulle condizioni applicabili a una richiesta o a un noleggio
              è possibile contattare LAP GEAR all&apos;indirizzo indicato in questa pagina.
            </p>
          </Clause>
        </div>
      </div>
    </main>
  );
}

function Clause({
  number,
  title,
  children,
}: {
  number: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-[24px] border border-black/10 bg-white p-6 sm:p-8">
      <div className="flex gap-5">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#181818] text-[11px] font-bold text-white">
          {number}
        </div>

        <div>
          <h2 className="text-[23px] font-semibold tracking-[-0.035em]">
            {title}
          </h2>

          <div className="mt-3 space-y-3 text-[14px] leading-7 text-black/55">
            {children}
          </div>
        </div>
      </div>
    </section>
  );
}
