import type { Metadata } from "next";
import type { ReactNode } from "react";
import { getBusinessInfo } from "@/lib/business-info";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "Informativa sul trattamento dei dati personali raccolti da LAP GEAR per richieste, preventivi e noleggi.",
  alternates: {
    canonical: "https://lapgear.it/privacy",
  },
};

const LAST_UPDATED = "1 novembre 2026";

export default function PrivacyPage() {
  const business = getBusinessInfo();

  return (
    <main className="min-h-screen bg-[#ebeae4] px-5 pb-20 pt-8 text-[#111111] sm:px-8 lg:px-10 xl:px-14">
      <div className="mx-auto max-w-[1200px]">
        <section className="overflow-hidden rounded-[30px] border border-black/10 bg-white shadow-[0_18px_60px_rgba(0,0,0,0.05)]">
          <div className="grid lg:grid-cols-[1fr_330px]">
            <div className="p-7 sm:p-10 lg:p-12">
              <div className="text-[12px] font-bold uppercase tracking-[0.12em] text-[#ff5a1f]">Privacy</div>
              <h1 className="mt-4 text-[48px] font-semibold leading-[0.94] tracking-[-0.055em] sm:text-[68px]">
                I tuoi dati.
                <br />
                <span className="text-[#ff5a1f]">In modo trasparente.</span>
              </h1>
              <p className="mt-6 max-w-[760px] text-[16px] leading-7 text-black/50">
                Questa informativa descrive i trattamenti svolti da LAP GEAR quando richiedi
                un preventivo o noleggi attrezzatura attraverso questo sito.
              </p>
            </div>

            <aside className="bg-[#181818] p-7 text-white sm:p-9">
              <div className="text-[11px] font-bold uppercase tracking-[0.1em] text-[#ff7b4a]">Titolare del trattamento</div>
              <div className="mt-4 text-[20px] font-semibold">{business.legalName}</div>
              <div className="mt-3 text-[13px] leading-6 text-white/50">{business.address}</div>
              <div className="mt-2 text-[13px] text-white/50">P. IVA {business.vatId}</div>
              <a href={`mailto:${business.email}`} className="mt-4 block break-all text-[13px] font-semibold text-[#ff8b60]">
                {business.email}
              </a>
              <div className="mt-6 border-t border-white/10 pt-5 text-[11px] text-white/30">Aggiornata il {LAST_UPDATED}</div>
            </aside>
          </div>
        </section>

        <div className="mt-6 space-y-5">
          <Section number="01" title="Quali dati raccogliamo">
            <p>
              Quando invii una richiesta possiamo raccogliere nome e cognome, email, telefono,
              date di noleggio, attrezzatura richiesta, quantità, note e contenuto delle comunicazioni.
              Se la richiesta prosegue, trattiamo anche i dati relativi a preventivo, accettazione dei
              termini di noleggio (con data e versione accettata), pagamenti e cauzione, ritiro e
              restituzione dell'attrezzatura e relativi controlli. Il sito può inoltre generare log e dati
              tecnici necessari a sicurezza, funzionamento e prevenzione degli abusi.
            </p>
          </Section>

          <Section number="02" title="Perché li utilizziamo">
            <p>
              Utilizziamo i dati per ricevere e gestire la tua richiesta, verificare la disponibilità
              dell'attrezzatura, prepararti un preventivo, gestire prenotazione, pagamento, ritiro e
              restituzione, risponderti e proteggere il sito da errori o abusi.
            </p>
            <p>
              Le basi giuridiche sono l'esecuzione di un contratto o di misure precontrattuali richieste
              da te, gli obblighi di legge (ad esempio contabili e fiscali) e il legittimo interesse del
              titolare a mantenere sicuri i propri sistemi e a tutelare i propri diritti.
            </p>
          </Section>

          <Section number="03" title="Fornitori tecnici">
            <p>
              Per il funzionamento del sito possono essere utilizzati fornitori di hosting, database,
              autenticazione e invio email. Nel progetto LAP GEAR sono attualmente utilizzati Vercel,
              Supabase e Resend. I dati non vengono venduti.
            </p>
          </Section>

          <Section number="04" title="Trasferimenti e garanzie">
            <p>
              Alcuni fornitori possono comportare trattamenti di dati al di fuori dello Spazio Economico
              Europeo. Quando applicabile, tali trattamenti devono avvenire sulla base delle garanzie
              previste dalla normativa europea e degli accordi del relativo fornitore.
            </p>
          </Section>

          <Section number="05" title="Conservazione">
            <p>
              Le richieste vengono conservate per il tempo ragionevolmente necessario a gestire la
              comunicazione e valutare l'interesse per il servizio, salvo necessità di conservazione più
              lunga per tutela di diritti, sicurezza o obblighi di legge. I documenti contabili e fiscali
              relativi ai noleggi conclusi sono conservati per il periodo previsto dalla legge. I dati non
              più necessari vengono eliminati o anonimizzati secondo le procedure adottate dal titolare.
            </p>
          </Section>

          <Section number="06" title="Diritti dell'interessato">
            <p>
              Puoi chiedere accesso, rettifica, cancellazione, limitazione o opposizione nei casi previsti
              dal GDPR e, quando applicabile, la portabilità dei dati. Puoi inoltre proporre reclamo al
              Garante per la protezione dei dati personali.
            </p>
            <p>Per esercitare i tuoi diritti puoi scrivere a <a href={`mailto:${business.email}`} className="font-semibold text-[#ff5a1f]">{business.email}</a>.</p>
          </Section>

          <Section number="07" title="Cookie e strumenti di tracciamento">
            <p>
              LAP GEAR utilizza Google Analytics 4 per misurare in forma aggregata l'utilizzo del sito,
              ad esempio visualizzazioni di pagina, consultazione dei prodotti, aggiunte al kit e invio
              delle richieste. Google Analytics viene caricato soltanto dopo che l'utente ha espresso
              il consenso tramite il banner dedicato.
            </p>
            <p>
              Se il consenso viene rifiutato, il tag Analytics non viene utilizzato per la misurazione.
              La scelta viene memorizzata localmente nel browser per evitare di richiederla a ogni pagina.
              Restano possibili tecnologie strettamente necessarie al funzionamento e alla sicurezza del sito.
            </p>
          </Section>

          <Section number="08" title="Aggiornamenti">
            <p>
              Questa informativa potrà essere aggiornata quando cambieranno le funzionalità del sito,
              i fornitori o l'effettiva operatività del servizio di noleggio.
            </p>
          </Section>
        </div>
      </div>
    </main>
  );
}

function Section({ number, title, children }: { number: string; title: string; children: ReactNode }) {
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
