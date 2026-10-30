import Link from "next/link";

import {
  getBusinessInfo,
} from "@/lib/business-info";


export function LegalFooter() {

  const business =
    getBusinessInfo();


  return (
    <footer className="border-t border-black/10 bg-[#181818] px-5 py-10 text-white sm:px-8 lg:px-10 xl:px-14">

      <div className="mx-auto grid max-w-[1500px] gap-8 lg:grid-cols-[1.2fr_0.8fr] lg:items-end">

        <div>

          <div className="text-[13px] font-bold uppercase tracking-[0.13em] text-[#ff7b4a]">
            {business.brand}
          </div>

          <div className="mt-3 text-[22px] font-semibold tracking-[-0.035em]">
            Professional Video Rental
          </div>

          <p className="mt-3 max-w-[650px] text-[12px] leading-5 text-white/40">
            Il sito consente di comporre il kit e inviare una richiesta di disponibilità.
            Il noleggio viene confermato solo dopo la verifica del materiale e l&apos;accettazione
            delle condizioni economiche e operative comunicate da LAP GEAR.
          </p>

          <div className="mt-4 space-y-1 text-[13px] leading-6 text-white/50">
            <div>{business.legalName}</div>
            <div>{business.address}</div>

            {business.vatId && (
              <div>P. IVA {business.vatId}</div>
            )}

            <div>
              <a
                href={`mailto:${business.email}`}
                className="transition hover:text-white"
              >
                {business.email}
              </a>
            </div>
          </div>

        </div>

        <div className="flex flex-col gap-5 lg:items-end">
          <nav className="flex flex-wrap gap-x-5 gap-y-3 text-[13px] font-semibold text-white/55">
            <Link href="/privacy" className="transition hover:text-white">
              Privacy
            </Link>
            <Link href="/termini-noleggio" className="transition hover:text-white">
              Condizioni
            </Link>
            <Link href="/note-legali" className="transition hover:text-white">
              Note legali
            </Link>
          </nav>

          <div className="text-[11px] leading-5 text-white/30 lg:text-right">
            © {new Date().getFullYear()} {business.brand}. Tutti i diritti riservati.
          </div>
        </div>

      </div>
    </footer>
  );
}


export default LegalFooter;
