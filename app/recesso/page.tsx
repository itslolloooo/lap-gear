import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Recesso | LAP GEAR",
  description: "Informazioni sul recesso durante la fase di lancio di LAP GEAR.",
  alternates: {
    canonical: "https://lapgear.it/recesso",
  },
};

export default function WithdrawalPage() {
  return (
    <main className="min-h-screen bg-[#ebeae4] px-5 pb-20 pt-8 text-[#111111] sm:px-8 lg:px-10 xl:px-14">
      <div className="mx-auto max-w-[1000px]">
        <section className="rounded-[30px] border border-black/10 bg-white p-7 shadow-[0_18px_60px_rgba(0,0,0,0.05)] sm:p-10 lg:p-12">
          <div className="text-[12px] font-bold uppercase tracking-[0.12em] text-[#ff5a1f]">Fase di lancio</div>
          <h1 className="mt-4 text-[48px] font-semibold leading-[0.94] tracking-[-0.055em] sm:text-[68px]">
            Nessun contratto
            <br />
            <span className="text-[#ff5a1f]">concluso online.</span>
          </h1>
          <div className="mt-8 space-y-4 text-[15px] leading-7 text-black/55">
            <p>
              Durante l'attuale fase di lancio, l'invio di una richiesta sul sito non conclude un
              contratto di noleggio e non comporta pagamenti. Di conseguenza non c'è, in questa fase,
              un contratto online da cui recedere.
            </p>
            <p>
              Prima dell'attivazione effettiva dei noleggi, LAP GEAR aggiornerà le condizioni e le
              informazioni sui diritti dei consumatori applicabili ai contratti eventualmente conclusi
              a distanza.
            </p>
          </div>
          <Link href="/termini-noleggio" className="mt-8 inline-flex h-[48px] items-center justify-center rounded-[14px] bg-[#181818] px-5 text-[13px] font-semibold text-white">
            Condizioni attuali
          </Link>
        </section>
      </div>
    </main>
  );
}
