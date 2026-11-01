import type { Metadata } from "next";
import Link from "next/link";
import { getBusinessInfo } from "@/lib/business-info";

export const metadata: Metadata = {
  title: "Note legali",
  description: "Informazioni legali e dati del titolare di LAP GEAR.",
  alternates: {
    canonical: "https://lapgear.it/note-legali",
  },
};

export default function LegalNoticePage() {
  const business = getBusinessInfo();

  return (
    <main className="min-h-screen bg-[#ebeae4] px-5 pb-20 pt-8 text-[#111111] sm:px-8 lg:px-10 xl:px-14">
      <div className="mx-auto max-w-[1100px]">
        <section className="rounded-[30px] border border-black/10 bg-white p-7 shadow-[0_18px_60px_rgba(0,0,0,0.05)] sm:p-10 lg:p-12">
          <div className="text-[12px] font-bold uppercase tracking-[0.12em] text-[#ff5a1f]">Informazioni legali</div>
          <h1 className="mt-4 text-[48px] font-semibold leading-[0.94] tracking-[-0.055em] sm:text-[68px]">
            LAP GEAR.
            <br />
            <span className="text-[#ff5a1f]">Dati del titolare.</span>
          </h1>

          <div className="mt-10 grid gap-4 sm:grid-cols-2">
            <Info label="Titolare / denominazione" value={business.legalName} />
            <Info label="Marchio" value={business.brand} />
            <Info label="Sede / recapito" value={business.address} />
            <Info label="Partita IVA" value={business.vatId} />
            <Info label="Email" value={business.email} />
            <Info label="Attività dichiarata" value="74.20.19 · Altre attività di riprese fotografiche" />
          </div>

          <div className="mt-10 rounded-[20px] bg-[#181818] p-6 text-white">
            <div className="text-[11px] font-bold uppercase tracking-[0.1em] text-[#ff7b4a]">Stato del servizio</div>
            <p className="mt-3 text-[14px] leading-7 text-white/60">
              LAP GEAR è attualmente in fase di lancio e validazione della domanda. Le richieste inviate
              tramite il sito sono non vincolanti e non costituiscono prenotazioni o contratti di noleggio.
              In questa fase non vengono richiesti pagamenti o cauzioni tramite il sito.
            </p>
          </div>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/termini-noleggio" className="inline-flex h-[48px] items-center justify-center rounded-[14px] bg-[#ff5a1f] px-5 text-[13px] font-semibold text-white">
              Condizioni del servizio
            </Link>
            <Link href="/privacy" className="inline-flex h-[48px] items-center justify-center rounded-[14px] border border-black/10 bg-[#f3f2ed] px-5 text-[13px] font-semibold text-black/60">
              Privacy
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[18px] border border-black/10 bg-[#fbfaf7] p-5">
      <div className="text-[10px] font-bold uppercase tracking-[0.1em] text-black/30">{label}</div>
      <div className="mt-2 break-words text-[15px] font-semibold text-black/70">{value}</div>
    </div>
  );
}
