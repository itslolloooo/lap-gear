import type {
  Metadata,
} from "next";

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

export const metadata: Metadata = {
  title: "Catalogo noleggio attrezzatura video",
  description:
    "Catalogo LAP GEAR: videocamere, ottiche, audio, luci, monitor e attrezzatura per live e streaming a noleggio a Palestrina, Roma Est e Roma.",
  alternates: {
    canonical: "https://lapgear.it/catalogo",
  },
};

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

      <section className="px-5 pb-5 pt-5 sm:px-8 lg:px-10 lg:pt-8 xl:px-14">
        <div className="mx-auto flex max-w-[1680px] flex-col gap-5 rounded-[24px] border border-black/10 bg-white p-6 sm:p-8 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="text-[11px] font-bold uppercase tracking-[0.12em] text-[#ff5a1f]">
              Equipment Library
            </div>

            <h1 className="mt-2 text-[40px] font-semibold leading-[0.95] tracking-[-0.055em] sm:text-[52px]">
              Catalogo LAP GEAR.
            </h1>

            <p className="mt-3 max-w-[720px] text-[14px] leading-6 text-black/48">
              Cerca il materiale, filtra solo quando serve e aggiungilo direttamente al kit.
            </p>
          </div>

          <div className="flex gap-2">
            <HeroInfo
              value={products.length}
              label="Prodotti"
            />

            <HeroInfo
              value={categories.length}
              label="Reparti"
            />
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
    <div className="min-w-[92px] rounded-[14px] bg-[#181818] p-3 text-white">
      <div className="text-[22px] font-semibold tracking-[-0.04em]">
        {value}
      </div>

      <div className="mt-1 text-[10px] font-semibold uppercase tracking-[0.08em] text-white/40">
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

      <div className="mt-7 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[1, 2, 3].map(
          (item) => (
            <div
              key={item}
              className="h-[360px] animate-pulse rounded-[22px] bg-[#efeee8]"
            />
          )
        )}
      </div>
    </div>
  );
}