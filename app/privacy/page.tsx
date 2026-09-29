import type {
  Metadata,
} from "next";

import Link from "next/link";

import type {
  ReactNode,
} from "react";


export const metadata:
  Metadata = {
    title:
      "Privacy Policy | LAP GEAR",

    description:
      "Informativa sul trattamento dei dati personali per le richieste di noleggio LAP GEAR.",
  };


/*
 * =========================================================
 * COMPLETARE PRIMA DI ANDARE ONLINE
 * =========================================================
 */

const PRIVACY_OWNER: string =
  "Lorenzo Apolloni";

const PRIVACY_ADDRESS: string =
  "Palestrina (RM), Italia";

const PRIVACY_EMAIL: string =
  "apollonilorenzo12@gmail.com";

const LAST_UPDATED: string =
  "29 settembre 2026";


export default function PrivacyPage() {

  const incomplete =
    PRIVACY_OWNER ===
      "DA COMPLEARE" ||
    PRIVACY_ADDRESS ===
      "DA COMPLEARE" ||
    PRIVACY_EMAIL ===
      "DA COMPLEARE";
      


  return (
    <main className="min-h-screen bg-[#ebeae4] px-5 pb-20 pt-6 text-[#111111] sm:px-8 lg:px-10 xl:px-14">

      <div className="mx-auto max-w-[1500px]">

        {/* HERO */}

        <section className="overflow-hidden rounded-[30px] border border-black/10 bg-white shadow-[0_18px_60px_rgba(0,0,0,0.06)]">

          <div className="grid lg:grid-cols-[minmax(0,1fr)_360px]">

            <div className="relative overflow-hidden p-8 sm:p-10 lg:p-12">

              <div className="pointer-events-none absolute -right-28 -top-36 h-[360px] w-[360px] rounded-full bg-[#ff5a1f]/[0.07]" />

              <div className="relative">

                <div className="inline-flex items-center gap-2.5 rounded-full bg-[#fff0e9] px-4 py-2 text-[13px] font-bold uppercase tracking-[0.12em] text-[#e94b12]">

                  <span className="h-2 w-2 rounded-full bg-[#ff5a1f]" />

                  Privacy

                </div>


                <h1 className="mt-7 max-w-[900px] text-[52px] font-semibold leading-[0.9] tracking-[-0.062em] sm:text-[68px] lg:text-[78px]">

                  I tuoi dati.

                  <br />

                  <span className="text-[#ff5a1f]">
                    In modo trasparente.
                  </span>

                </h1>


                <p className="mt-7 max-w-[760px] text-[18px] leading-8 text-black/55">

                  Questa informativa descrive come vengono trattati
                  i dati personali raccolti attraverso LAP GEAR,
                  in particolare quando invii una richiesta di
                  noleggio o consulti lo stato di una richiesta.

                </p>

              </div>

            </div>


            <div className="bg-[#181818] p-8 text-white sm:p-10">

              <div className="text-[12px] font-bold uppercase tracking-[0.13em] text-[#ff7b4a]">
                Informativa privacy
              </div>


              <div className="mt-8 space-y-5">

                <InfoLine
                  label="Ultimo aggiornamento"
                  value={LAST_UPDATED}
                />

                <InfoLine
                  label="Ambito"
                  value="Richieste di noleggio e contatti"
                />

                <InfoLine
                  label="Decisioni automatiche"
                  value="Non previste"
                />

              </div>

            </div>

          </div>

        </section>


        {/* AVVISO CONFIGURAZIONE */}

        {incomplete && (

          <section className="mt-6 rounded-[22px] border border-[#ff5a1f]/20 bg-[#fff0e9] p-5 text-[14px] leading-6 text-[#8d3515]">

            <strong>
              Prima della pubblicazione:
            </strong>{" "}

            completa all&apos;inizio del file i dati del
            titolare del trattamento.

          </section>

        )}


        <div className="mt-7 grid gap-6 xl:grid-cols-[300px_minmax(0,1fr)]">

          {/* INDICE */}

          <aside className="xl:sticky xl:top-[112px] xl:self-start">

            <div className="rounded-[26px] border border-black/10 bg-[#181818] p-6 text-white">

              <div className="text-[12px] font-bold uppercase tracking-[0.12em] text-[#ff7b4a]">
                LAP GEAR
              </div>


              <div className="mt-3 text-[27px] font-semibold leading-tight tracking-[-0.035em]">
                Privacy Policy
              </div>


              <nav className="mt-7 space-y-1 text-[14px]">

                <NavItem
                  href="#titolare"
                  label="Titolare"
                />

                <NavItem
                  href="#dati"
                  label="Dati trattati"
                />

                <NavItem
                  href="#finalita"
                  label="Finalità"
                />

                <NavItem
                  href="#destinatari"
                  label="Fornitori"
                />

                <NavItem
                  href="#conservazione"
                  label="Conservazione"
                />

                <NavItem
                  href="#diritti"
                  label="I tuoi diritti"
                />

                <NavItem
                  href="#contatti"
                  label="Contatti"
                />

              </nav>

            </div>

          </aside>


          {/* CONTENUTO */}

          <article className="overflow-hidden rounded-[28px] border border-black/10 bg-white">

            <PolicySection
              number="01"
              title="Informazioni generali"
            >

              <p>
                La presente informativa è resa ai sensi del
                Regolamento (UE) 2016/679, noto come GDPR,
                e riguarda i dati personali trattati
                attraverso il sito LAP GEAR.
              </p>

              <p>
                Il trattamento dei dati avviene secondo
                principi di liceità, correttezza,
                trasparenza, minimizzazione, sicurezza e
                limitazione della conservazione.
              </p>

            </PolicySection>


            <PolicySection
              id="titolare"
              number="02"
              title="Titolare del trattamento"
            >

              <DataRow
                label="Titolare"
                value={PRIVACY_OWNER}
              />

              <DataRow
                label="Sede / indirizzo"
                value={PRIVACY_ADDRESS}
              />

              <DataRow
                label="Email privacy"
                value={PRIVACY_EMAIL}
              />

              <p>
                Il titolare determina le finalità e le
                modalità del trattamento dei dati personali
                raccolti attraverso il sito.
              </p>

            </PolicySection>


            <PolicySection
              id="dati"
              number="03"
              title="Quali dati trattiamo"
            >

              <p>
                Quando invii una richiesta di noleggio
                possiamo raccogliere nome e cognome,
                indirizzo email, numero di telefono, date
                richieste, prodotti e quantità inseriti
                nel kit ed eventuali note relative alla
                produzione o alle tue esigenze.
              </p>

              <p>
                Vengono inoltre trattate le informazioni
                tecniche strettamente necessarie al
                funzionamento, alla sicurezza e alla
                protezione del servizio.
              </p>

              <p>
                Quando consulti lo stato di una richiesta
                vengono utilizzati il riferimento della
                richiesta e l&apos;indirizzo email associato.
              </p>

              <p>
                Ti chiediamo di non inserire nelle note
                dati sensibili o altre informazioni
                personali non necessarie alla gestione
                del noleggio.
              </p>

            </PolicySection>


            <PolicySection
              id="finalita"
              number="04"
              title="Finalità e basi giuridiche"
            >

              <PurposeCard
                title="Gestione della richiesta"
                basis="Misure precontrattuali"
              >
                Ricevere e valutare la richiesta di
                noleggio, verificare disponibilità,
                materiale, quantità e periodo e comunicare
                con il cliente.
              </PurposeCard>


              <PurposeCard
                title="Gestione del noleggio"
                basis="Esecuzione del contratto"
              >
                In caso di conferma, organizzare il
                noleggio, la consegna, il ritiro, la
                restituzione e le attività amministrative
                collegate.
              </PurposeCard>


              <PurposeCard
                title="Obblighi amministrativi"
                basis="Obbligo legale"
              >
                Gestire eventuali obblighi civilistici,
                fiscali, contabili o richieste provenienti
                dalle autorità competenti.
              </PurposeCard>


              <PurposeCard
                title="Sicurezza del servizio"
                basis="Legittimo interesse"
              >
                Prevenire abusi, proteggere il sito,
                diagnosticare problemi tecnici e tutelare
                il servizio da utilizzi fraudolenti o non
                autorizzati.
              </PurposeCard>


              <p>
                I dati raccolti attraverso il modulo di
                noleggio non vengono utilizzati per
                comunicazioni pubblicitarie o marketing
                senza una separata e appropriata base
                giuridica.
              </p>

            </PolicySection>


            <PolicySection
              number="05"
              title="Natura del conferimento"
            >

              <p>
                I dati richiesti come obbligatori nel
                modulo sono necessari per poter gestire
                la richiesta di noleggio.
              </p>

              <p>
                La mancata comunicazione di tali dati può
                rendere impossibile elaborare o completare
                la richiesta.
              </p>

              <p>
                Le note sulla produzione sono invece
                facoltative.
              </p>

            </PolicySection>


            <PolicySection
              id="destinatari"
              number="06"
              title="Fornitori e destinatari"
            >

              <p>
                Per il funzionamento del servizio possono
                essere utilizzati fornitori tecnici che
                trattano dati nei limiti necessari alle
                rispettive attività.
              </p>


              <ProviderCard
                name="Supabase"
                description="Database, autenticazione e servizi backend"
                href="https://supabase.com/privacy"
              />


              <ProviderCard
                name="Resend"
                description="Invio delle email relative alle richieste di noleggio"
                href="https://resend.com/legal/privacy-policy"
              />


              <p>
                I dati possono inoltre essere comunicati
                a professionisti, consulenti o autorità
                quando ciò sia necessario per adempiere
                a obblighi di legge o tutelare diritti.
              </p>

              <p>
                I dati personali non vengono diffusi
                pubblicamente.
              </p>

            </PolicySection>


            <PolicySection
              number="07"
              title="Trasferimenti fuori dallo SEE"
            >

              <p>
                Alcuni fornitori tecnici utilizzati dal
                servizio possono comportare il trattamento
                di dati in Paesi esterni allo Spazio
                Economico Europeo.
              </p>

              <p>
                In questi casi i trasferimenti vengono
                gestiti secondo gli strumenti e le
                garanzie previste dalla normativa
                applicabile, come decisioni di
                adeguatezza o Clausole Contrattuali
                Standard.
              </p>

              <p>
                La localizzazione effettiva dei dati può
                inoltre dipendere dalla regione e dalla
                configurazione dei servizi utilizzati.
              </p>

            </PolicySection>


            <PolicySection
              id="conservazione"
              number="08"
              title="Conservazione dei dati"
            >

              <p>
                I dati relativi alle richieste non
                confermate vengono conservati per il
                periodo necessario alla gestione della
                richiesta, alle comunicazioni successive
                e ad eventuali esigenze di tutela.
              </p>

              <p>
                Quando la richiesta si trasforma in un
                rapporto di noleggio, i dati necessari
                agli adempimenti amministrativi e
                contrattuali possono essere conservati
                per i periodi previsti dalla normativa
                applicabile.
              </p>

              <p>
                I tempi tecnici relativi a log e copie di
                sicurezza possono dipendere dai fornitori
                utilizzati.
              </p>

            </PolicySection>


            <PolicySection
              number="09"
              title="Sicurezza"
            >

              <p>
                Vengono adottate misure tecniche e
                organizzative ragionevoli per proteggere
                i dati da accessi non autorizzati,
                perdita, alterazione o divulgazione
                indebita.
              </p>

              <p>
                Nessun sistema informatico può tuttavia
                garantire una sicurezza assoluta.
              </p>

            </PolicySection>


            <PolicySection
              number="10"
              title="Processi automatizzati"
            >

              <p>
                Il sito può effettuare verifiche tecniche
                automatiche, come il controllo della
                disponibilità del materiale per un
                determinato periodo.
              </p>

              <p>
                Non vengono tuttavia adottate decisioni
                basate esclusivamente su processi
                automatizzati che producano effetti
                giuridici o analogamente significativi
                sull&apos;utente.
              </p>

              <p>
                La richiesta di noleggio viene verificata
                prima della conferma.
              </p>

            </PolicySection>


            <PolicySection
              id="diritti"
              number="11"
              title="I tuoi diritti"
            >

              <p>
                Nei casi previsti dal GDPR puoi chiedere
                l&apos;accesso ai tuoi dati personali, la
                rettifica, la cancellazione, la
                limitazione del trattamento e la
                portabilità.
              </p>

              <p>
                Puoi inoltre opporti al trattamento quando
                ne ricorrono i presupposti.
              </p>

              <p>
                Hai anche il diritto di proporre reclamo
                al Garante per la protezione dei dati
                personali o all&apos;autorità di controllo
                competente.
              </p>


              <a
                href="https://www.garanteprivacy.it/"
                target="_blank"
                rel="noreferrer"
                className="inline-flex rounded-[14px] border border-black/10 bg-[#f3f2ed] px-5 py-3 text-[14px] font-semibold text-[#181818] transition hover:border-[#ff5a1f]/30 hover:text-[#ff5a1f]"
              >
                Garante Privacy →
              </a>

            </PolicySection>


            <PolicySection
              id="contatti"
              number="12"
              title="Contatti"
              last
            >

              <p>
                Per informazioni sul trattamento dei dati
                personali o per esercitare i tuoi diritti
                puoi utilizzare il seguente contatto.
              </p>


              <div className="rounded-[20px] bg-[#181818] p-6 text-white">

                <div className="text-[12px] font-bold uppercase tracking-[0.1em] text-[#ff7b4a]">
                  Contatto privacy
                </div>

                <div className="mt-3 text-[23px] font-semibold tracking-[-0.025em]">
                  {PRIVACY_EMAIL}
                </div>

              </div>


              <p>
                Questa informativa può essere aggiornata
                in caso di modifica dei servizi, dei
                fornitori utilizzati o della normativa
                applicabile.
              </p>


              <Link
                href="/termini-noleggio"
                className="inline-flex rounded-[14px] bg-[#ff5a1f] px-5 py-3 text-[14px] font-semibold text-white transition hover:bg-[#e94b12]"
              >
                Termini di noleggio →
              </Link>

            </PolicySection>

          </article>

        </div>

      </div>

    </main>
  );
}


function PolicySection({
  id,
  number,
  title,
  children,
  last = false,
}: {
  id?: string;
  number: string;
  title: string;
  children: ReactNode;
  last?: boolean;
}) {

  return (
    <section
      id={id}
      className={`scroll-mt-28 p-7 sm:p-9 lg:p-11 ${
        last
          ? ""
          : "border-b border-black/10"
      }`}
    >

      <div className="grid gap-6 lg:grid-cols-[100px_minmax(0,1fr)]">

        <div className="text-[13px] font-bold uppercase tracking-[0.12em] text-[#ff5a1f]">
          {number}
        </div>


        <div>

          <h2 className="text-[34px] font-semibold leading-[0.98] tracking-[-0.048em] sm:text-[42px]">
            {title}
          </h2>


          <div className="mt-6 space-y-5 text-[16px] leading-8 text-black/58">
            {children}
          </div>

        </div>

      </div>

    </section>
  );
}


function PurposeCard({
  title,
  basis,
  children,
}: {
  title: string;
  basis: string;
  children: ReactNode;
}) {

  return (
    <div className="rounded-[20px] border border-black/10 bg-[#f6f5f0] p-5 sm:p-6">

      <div className="flex flex-wrap items-center justify-between gap-3">

        <h3 className="text-[20px] font-semibold tracking-[-0.025em] text-[#181818]">
          {title}
        </h3>


        <span className="rounded-full bg-white px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.06em] text-black/45">
          {basis}
        </span>

      </div>


      <div className="mt-3 text-[15px] leading-7 text-black/55">
        {children}
      </div>

    </div>
  );
}


function ProviderCard({
  name,
  description,
  href,
}: {
  name: string;
  description: string;
  href: string;
}) {

  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="group flex items-center justify-between gap-5 rounded-[18px] border border-black/10 bg-[#f6f5f0] p-5 transition hover:border-[#ff5a1f]/25 hover:bg-[#fff8f4]"
    >

      <div>

        <div className="text-[18px] font-semibold tracking-[-0.02em] text-[#181818]">
          {name}
        </div>

        <div className="mt-1 text-[14px] text-black/45">
          {description}
        </div>

      </div>


      <span className="text-[20px] text-black/25 transition group-hover:text-[#ff5a1f]">
        ↗
      </span>

    </a>
  );
}


function DataRow({
  label,
  value,
}: {
  label: string;
  value: string;
}) {

  return (
    <div className="grid gap-2 rounded-[18px] border border-black/10 bg-[#f6f5f0] p-5 sm:grid-cols-[180px_1fr]">

      <div className="text-[12px] font-bold uppercase tracking-[0.08em] text-black/35">
        {label}
      </div>


      <div
        className={`text-[15px] font-semibold ${
          value ===
          "DA COMPLETARE"
            ? "text-[#ff5a1f]"
            : "text-[#181818]"
        }`}
      >
        {value}
      </div>

    </div>
  );
}


function InfoLine({
  label,
  value,
}: {
  label: string;
  value: string;
}) {

  return (
    <div className="border-b border-white/10 pb-5 last:border-b-0 last:pb-0">

      <div className="text-[11px] font-bold uppercase tracking-[0.1em] text-white/35">
        {label}
      </div>

      <div className="mt-2 text-[16px] font-semibold leading-6">
        {value}
      </div>

    </div>
  );
}


function NavItem({
  href,
  label,
}: {
  href: string;
  label: string;
}) {

  return (
    <a
      href={href}
      className="block rounded-[12px] px-3 py-2.5 text-white/55 transition hover:bg-white/[0.06] hover:text-white"
    >
      {label}
    </a>
  );
}