import {
  Suspense,
} from "react";

import {
  CatalogClient,
} from "./CatalogClient";

import {
  getCatalogCategories,
  getCatalogProducts,
} from "@/lib/catalog-server";

export const dynamic =
  "force-dynamic";

export default async function CatalogPage() {
  const [
    products,
    categories,
  ] =
    await Promise.all([
      getCatalogProducts(),
      getCatalogCategories(),
    ]);

  return (
    <main className="min-h-screen bg-[#ebeae4] text-[#111111]">

      {/* =====================================================
          HERO
          ===================================================== */}

      <section className="px-5 pb-7 pt-5 sm:px-8 lg:px-10 lg:pb-9 lg:pt-8 xl:px-14">
        <div className="mx-auto max-w-[1680px] overflow-hidden rounded-[30px] border border-black/10 bg-white shadow-[0_18px_60px_rgba(0,0,0,0.06)]">
          <div className="grid xl:grid-cols-[1fr_390px]">

            {/* LEFT */}

            <div className="relative overflow-hidden p-7 sm:p-10 lg:p-12 xl:p-14">
              <div className="pointer-events-none absolute -right-36 -top-40 h-[420px] w-[420px] rounded-full bg-[#ff5a1f]/[0.07]" />

              <div className="relative">
                <div className="inline-flex items-center gap-2.5 rounded-full bg-[#fff0e9] px-4 py-2 text-[13px] font-bold uppercase tracking-[0.12em] text-[#e94b12]">
                  <span className="h-2 w-2 rounded-full bg-[#ff5a1f]" />

                  Equipment Library
                </div>

                <h1 className="mt-7 max-w-[900px] text-[55px] font-semibold leading-[0.89] tracking-[-0.065em] sm:text-[72px] lg:text-[84px]">
                  Tutto il gear.
                  <br />

                  <span className="text-[#ff5a1f]">
                    Un solo kit.
                  </span>
                </h1>

                <p className="mt-7 max-w-[700px] text-[18px] leading-8 text-black/58">
                  Camere, ottiche,
                  audio, luci e
                  attrezzatura video
                  selezionata per
                  produzioni reali.
                  Cerca, filtra e
                  aggiungi al tuo kit.
                </p>
              </div>
            </div>

            {/* RIGHT */}

            <div className="relative flex min-h-[300px] flex-col justify-between overflow-hidden bg-[#181818] p-8 text-white sm:p-10">
              <div className="pointer-events-none absolute -right-24 -top-24 h-[260px] w-[260px] rounded-full bg-[#ff5a1f]/20" />

              <div className="relative">
                <div className="text-[12px] font-bold uppercase tracking-[0.13em] text-[#ff7b4a]">
                  LAP GEAR
                </div>

                <div className="mt-4 text-[36px] font-semibold leading-[0.96] tracking-[-0.05em]">
                  Equipment
                  <br />
                  Library.
                </div>
              </div>

              <div className="relative mt-12 grid grid-cols-2 gap-3">
                <HeroInfo
                  value={
                    products.length
                  }
                  label="Prodotti"
                />

                <HeroInfo
                  value={
                    categories.length
                  }
                  label="Reparti"
                />
              </div>

              <div className="relative mt-4 flex items-center gap-2 text-[12px] font-semibold text-white/45">
                <span className="h-2.5 w-2.5 rounded-full bg-[#19ad67]" />

                Disponibilità verificata sulle date richieste
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================
          CATALOG
          ===================================================== */}

      <section className="px-5 pb-16 sm:px-8 lg:px-10 lg:pb-20 xl:px-14">
        <div className="mx-auto max-w-[1680px]">
          <Suspense
            fallback={
              <CatalogLoading />
            }
          >
            <CatalogClient
              products={
                products
              }
              categories={
                categories
              }
            />
          </Suspense>
        </div>
      </section>
    </main>
  );
}


function HeroInfo({
  value,
  label,
}: {
  value: number;
  label: string;
}) {
  return (
    <div className="rounded-[17px] border border-white/10 bg-white/[0.06] p-4">
      <div className="text-[27px] font-semibold tracking-[-0.045em]">
        {value}
      </div>

      <div className="mt-1 text-[12px] font-semibold uppercase tracking-[0.08em] text-white/40">
        {label}
      </div>
    </div>
  );
}


function CatalogLoading() {
  return (
    <div className="overflow-hidden rounded-[28px] border border-black/10 bg-white p-7 sm:p-9">
      <div className="h-[64px] animate-pulse rounded-[18px] bg-[#efeee8]" />

      <div className="mt-5 flex gap-3 overflow-hidden">
        {[1, 2, 3, 4].map(
          (item) => (
            <div
              key={item}
              className="h-[48px] w-[130px] shrink-0 animate-pulse rounded-full bg-[#efeee8]"
            />
          )
        )}
      </div>

      <div className="mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {[1, 2, 3].map(
          (item) => (
            <div
              key={item}
              className="h-[480px] animate-pulse rounded-[27px] bg-[#efeee8]"
            />
          )
        )}
      </div>
    </div>
  );
}