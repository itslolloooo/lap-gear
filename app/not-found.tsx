import Link from "next/link";


export default function NotFound() {

  return (
    <main className="min-h-[75vh] bg-[#ebeae4] px-5 py-10 text-[#181818] sm:px-8 lg:px-10 xl:px-14">

      <section className="mx-auto grid min-h-[560px] max-w-[1500px] overflow-hidden rounded-[30px] border border-black/10 bg-white shadow-[0_18px_60px_rgba(0,0,0,0.05)] lg:grid-cols-[1fr_360px]">

        <div className="flex items-center p-8 sm:p-12 lg:p-14">

          <div className="max-w-[760px]">

            <div className="text-[13px] font-bold uppercase tracking-[0.13em] text-[#ff5a1f]">
              Errore 404
            </div>


            <h1 className="mt-4 text-[58px] font-semibold leading-[0.9] tracking-[-0.06em] sm:text-[78px] lg:text-[96px]">
              Questa pagina
              <br />

              <span className="text-[#ff5a1f]">
                non c&apos;è.
              </span>
            </h1>


            <p className="mt-7 max-w-[600px] text-[17px] leading-8 text-black/50">
              Il link potrebbe essere cambiato oppure la pagina non è più disponibile.
              Puoi tornare al catalogo e continuare da lì.
            </p>


            <div className="mt-8 flex flex-wrap gap-3">

              <Link
                href="/catalogo"
                className="inline-flex h-[56px] items-center justify-center rounded-[16px] bg-[#181818] px-6 text-[15px] font-semibold text-white transition hover:bg-[#ff5a1f]"
              >
                Vai al catalogo →
              </Link>


              <Link
                href="/"
                className="inline-flex h-[56px] items-center justify-center rounded-[16px] border border-black/10 bg-[#f3f2ed] px-6 text-[15px] font-semibold text-black/60 transition hover:border-black/20 hover:text-black"
              >
                Torna alla home
              </Link>

            </div>

          </div>

        </div>


        <div className="relative hidden overflow-hidden bg-[#181818] lg:block">

          <div className="absolute -right-20 -top-20 h-[260px] w-[260px] rounded-full bg-[#ff5a1f]/20" />


          <div className="absolute bottom-10 left-10 text-white">

            <div className="text-[12px] font-bold uppercase tracking-[0.13em] text-[#ff7b4a]">
              LAP GEAR
            </div>


            <div className="mt-2 text-[30px] font-semibold leading-tight">
              Video
              <br />
              Rental.
            </div>

          </div>

        </div>

      </section>

    </main>
  );
}
