import type { Metadata } from "next";
import Link from "next/link";

const canonical = "https://lapgear.it/offerta-lancio";

export const metadata: Metadata = {
  title: "Offerta di lancio: 10% sul primo noleggio",
  description:
    "Offerta di lancio LAP GEAR: 10% di sconto sul primo noleggio per i primi 10 clienti, fino al 31 gennaio 2027. Prezzi IVA esclusa.",
  alternates: { canonical },
};

export default function LaunchOfferPage() {
  return (
    <main className="min-h-screen bg-[#ebeae4] text-[#111111]">
      <section className="px-5 pb-8 pt-5 sm:px-8 lg:px-10 lg:pt-8 xl:px-14">
        <div className="mx-auto max-w-[900px] rounded-[32px] border border-black/10 bg-white p-7 shadow-[0_20px_70px_rgba(0,0,0,0.07)] sm:p-10 lg:p-14">
          <div className="text-[12px] font-bold uppercase tracking-[0.12em] text-[#ff5a1f]">
            Offerta di lancio
          </div>
          <h1 className="mt-4 text-[40px] font-semibold leading-[0.98] tracking-[-0.055em] sm:text-[56px]">
            10% sul primo
            <span className="text-[#ff5a1f]"> noleggio.</span>
          </h1>
          <p className="mt-6 text-[16px] leading-7 text-black/60">
            Per i primi 10 clienti di LAP GEAR, sul primo noleggio, fino al 31
            gennaio 2027.
          </p>

          <h2 className="mt-9 text-[22px] font-semibold tracking-[-0.03em]">
            Come si ottiene
          </h2>
          <ol className="mt-3 list-decimal space-y-2 pl-5 text-[15px] leading-7 text-black/60">
            <li>
              Scegli il materiale nel{" "}
              <Link href="/catalogo" className="font-semibold text-[#ff5a1f]">
                catalogo
              </Link>{" "}
              o in un{" "}
              <Link href="/kit" className="font-semibold text-[#ff5a1f]">
                kit pronto
              </Link>
              .
            </li>
            <li>Invia la richiesta e scrivi il codice LANCIO10 nelle note.</li>
            <li>
              Ti rispondiamo con disponibilità e preventivo, con lo sconto già
              applicato.
            </li>
          </ol>

          <h2 className="mt-9 text-[22px] font-semibold tracking-[-0.03em]">
            Condizioni
          </h2>
          <ul className="mt-3 list-disc space-y-2 pl-5 text-[14px] leading-7 text-black/55">
            <li>Lo sconto è del 10% sul corrispettivo del primo noleggio, IVA esclusa.</li>
            <li>Vale per i primi 10 clienti, un solo noleggio per cliente, e non è cumulabile con altre offerte.</li>
            <li>Non si applica alla cauzione, che resta quella indicata nel preventivo.</li>
            <li>
              L&apos;offerta si applica ai noleggi confermati dopo l&apos;attivazione
              del servizio. Inviare una richiesta non conclude un contratto: vedi le{" "}
              <Link href="/termini-noleggio" className="font-semibold text-[#ff5a1f]">
                condizioni
              </Link>
              .
            </li>
          </ul>

          <Link
            href="/catalogo"
            className="mt-9 inline-flex h-[48px] items-center justify-center rounded-[14px] bg-[#181818] px-5 text-[13px] font-semibold text-white"
          >
            Vai al catalogo →
          </Link>
        </div>
      </section>
    </main>
  );
}
