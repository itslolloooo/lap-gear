import type { Metadata } from "next";
import Link from "next/link";

import { ProductCard } from "@/components/ProductCard";
import {
  getCatalogCategories,
  getCatalogProducts,
} from "@/lib/catalog-server";
import { getBusinessInfo } from "@/lib/business-info";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Noleggio attrezzatura video a Palestrina e Roma",
  description:
    "Noleggio camere, ottiche, audio, luci e attrezzatura video professionale a Palestrina, Roma Est e Roma.",
  alternates: {
    canonical: "https://lapgear.it",
  },
};

export default async function HomePage() {
  const business = getBusinessInfo();

  const [categories, products] = await Promise.all([
    getCatalogCategories(),
    getCatalogProducts(),
  ]);

  const showcaseProducts = [
    ...products.filter((product) => product.featured),
    ...products.filter((product) => !product.featured),
  ].slice(0, 8);

  const totalUnits = products.reduce(
    (sum, product) => sum + Number(product.quantity ?? 0),
    0
  );

  const localBusinessStructuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        "@id": "https://lapgear.it/#website",
        url: "https://lapgear.it",
        name: "LAP GEAR",
        inLanguage: "it-IT",
        publisher: {
          "@id": "https://lapgear.it/#business",
        },
      },
      {
        "@type": "LocalBusiness",
        "@id": "https://lapgear.it/#business",
        name: "LAP GEAR",
        legalName: business.legalName,
        url: "https://lapgear.it",
        logo: "https://lapgear.it/icon.svg",
        image: "https://lapgear.it/icon.svg",
        description:
          "Noleggio attrezzatura foto, video, audio e live a Palestrina, Roma Est e Roma.",
        email: business.email,
        address: {
          "@type": "PostalAddress",
          streetAddress: "Via Prenestina Nuova 291",
          postalCode: "00036",
          addressLocality: "Palestrina",
          addressRegion: "RM",
          addressCountry: "IT",
        },
        areaServed: [
          { "@type": "City", name: "Palestrina" },
          { "@type": "Place", name: "Roma Est" },
          { "@type": "City", name: "Roma" },
        ],
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(localBusinessStructuredData).replace(
            /</g,
            "\\u003c"
          ),
        }}
      />

      <main className="min-h-screen bg-[#ebeae4] text-[#111111]">
        <section className="px-5 pb-5 pt-5 sm:px-8 lg:px-10 lg:pt-8 xl:px-14">
          <div className="mx-auto max-w-[1680px] overflow-hidden rounded-[28px] border border-black/10 bg-white">
            <div className="grid lg:grid-cols-[1.15fr_.85fr]">
              <div className="p-7 sm:p-10 lg:p-12 xl:p-14">
                <div className="inline-flex items-center gap-2 rounded-full bg-[#fff0e9] px-3.5 py-2 text-[11px] font-bold uppercase tracking-[0.12em] text-[#e94b12]">
                  <span className="h-2 w-2 rounded-full bg-[#ff5a1f]" />
                  Noleggio video · Palestrina / Roma
                </div>

                <h1 className="mt-6 max-w-[900px] text-[48px] font-semibold leading-[0.92] tracking-[-0.06em] sm:text-[64px] lg:text-[72px] xl:text-[80px]">
                  Attrezzatura pronta.
                  <span className="block text-[#ff5a1f]">
                    Tu pensa al set.
                  </span>
                </h1>

                <p className="mt-6 max-w-[680px] text-[17px] leading-7 text-black/55">
                  Camere, ottiche, audio, luci e accessori professionali.
                  Scegli il materiale, indica le date e ricevi la conferma.
                </p>

                <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                  <Link
                    href="/catalogo"
                    className="inline-flex h-[56px] items-center justify-center gap-3 rounded-[15px] bg-[#181818] px-6 text-[15px] font-semibold text-white transition hover:bg-[#ff5a1f]"
                  >
                    Guarda il catalogo
                    <span>→</span>
                  </Link>

                  <Link
                    href="/kit"
                    className="inline-flex h-[56px] items-center justify-center rounded-[15px] border border-black/10 bg-[#f3f2ed] px-6 text-[15px] font-semibold transition hover:border-[#ff5a1f]/30 hover:bg-white"
                  >
                    Kit già pronti
                  </Link>
                </div>

                <div className="mt-8 grid grid-cols-3 gap-2">
                  <Stat value={products.length} label="Prodotti" />
                  <Stat value={categories.length} label="Categorie" />
                  <Stat value={totalUnits} label="Unità" />
                </div>
              </div>

              <div className="bg-[#181818] p-6 text-white sm:p-8 lg:p-10">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-[11px] font-bold uppercase tracking-[0.12em] text-[#ff7b4a]">
                      Vai subito al reparto
                    </div>
                    <div className="mt-2 text-[25px] font-semibold tracking-[-0.04em]">
                      Cosa ti serve?
                    </div>
                  </div>
                  <span className="h-2.5 w-2.5 rounded-full bg-[#19ad67]" />
                </div>

                <div className="mt-6 grid gap-2 sm:grid-cols-2">
                  {categories.slice(0, 8).map((category) => {
                    const count = products.filter(
                      (product) => product.category === category.slug
                    ).length;

                    return (
                      <Link
                        key={category.id}
                        href={`/catalogo?categoria=${category.slug}`}
                        className="group flex min-h-[86px] items-center justify-between gap-4 rounded-[17px] border border-white/10 bg-white/[0.055] px-4 py-4 transition hover:border-[#ff5a1f]/60 hover:bg-white/[0.09]"
                      >
                        <div>
                          <div className="text-[15px] font-semibold">
                            {category.name}
                          </div>
                          <div className="mt-1 text-[11px] text-white/35">
                            {count} {count === 1 ? "prodotto" : "prodotti"}
                          </div>
                        </div>
                        <span className="text-[#ff7b4a] transition group-hover:translate-x-1">
                          →
                        </span>
                      </Link>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="px-5 py-10 sm:px-8 lg:px-10 lg:py-12 xl:px-14">
          <div className="mx-auto max-w-[1680px]">
            <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <div className="text-[11px] font-bold uppercase tracking-[0.12em] text-[#ff5a1f]">
                  Disponibile a noleggio
                </div>
                <h2 className="mt-2 text-[38px] font-semibold tracking-[-0.05em] sm:text-[48px]">
                  Attrezzatura disponibile.
                </h2>
              </div>

              <Link
                href="/catalogo"
                className="text-[14px] font-semibold text-[#ff5a1f]"
              >
                Tutto il catalogo →
              </Link>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {showcaseProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  compact
                />
              ))}
            </div>
          </div>
        </section>

        <section className="px-5 pb-10 sm:px-8 lg:px-10 lg:pb-12 xl:px-14">
          <div className="mx-auto max-w-[1680px] overflow-hidden rounded-[26px] bg-[#181818] text-white">
            <div className="grid lg:grid-cols-[.8fr_1.2fr]">
              <div className="border-b border-white/10 p-7 sm:p-9 lg:border-b-0 lg:border-r lg:p-10">
                <div className="text-[11px] font-bold uppercase tracking-[0.12em] text-[#ff7b4a]">
                  Kit pronti
                </div>
                <h2 className="mt-3 text-[38px] font-semibold leading-[0.95] tracking-[-0.05em] sm:text-[48px]">
                  Parti da una configurazione già pensata.
                </h2>
                <p className="mt-5 max-w-[520px] text-[14px] leading-6 text-white/45">
                  Videomaker, interviste, podcast e live multicamera.
                  Aggiungi il kit e poi modificalo come vuoi.
                </p>
                <Link
                  href="/kit"
                  className="mt-7 inline-flex h-[52px] items-center rounded-[14px] bg-[#ff5a1f] px-5 text-[14px] font-semibold"
                >
                  Scopri i kit →
                </Link>
              </div>

              <div className="grid sm:grid-cols-2">
                <KitLine title="Videomaker" text="Camera, zoom, gimbal e cavalletto." />
                <KitLine title="Intervista" text="Camera, audio wireless, luce e modificatore." />
                <KitLine title="Podcast" text="Microfoni e interfaccia audio." />
                <KitLine title="Live multicamera" text="Due camere, ottiche, regia e supporti." />
              </div>
            </div>
          </div>
        </section>

        <section
          id="come-funziona"
          className="px-5 pb-10 sm:px-8 lg:px-10 lg:pb-12 xl:px-14"
        >
          <div className="mx-auto grid max-w-[1680px] gap-3 md:grid-cols-3">
            <Step number="01" title="Scegli" text="Aggiungi al kit solo il materiale che ti serve." />
            <Step number="02" title="Date" text="Indica ritiro e riconsegna per verificare la disponibilità." />
            <Step number="03" title="Conferma" text="Ricevi preventivo e conferma prima del noleggio." />
          </div>
        </section>

      </main>
    </>
  );
}

function Stat({
  value,
  label,
}: {
  value: number;
  label: string;
}) {
  return (
    <div className="rounded-[15px] border border-black/10 bg-[#f5f4ef] p-4">
      <div className="text-[24px] font-semibold tracking-[-0.04em]">
        {value}
      </div>
      <div className="mt-1 text-[10px] font-bold uppercase tracking-[0.08em] text-black/35">
        {label}
      </div>
    </div>
  );
}

function KitLine({
  title,
  text,
}: {
  title: string;
  text: string;
}) {
  return (
    <Link
      href="/kit"
      className="group border-b border-white/10 p-6 transition hover:bg-white/[0.05] sm:p-7 sm:[&:nth-child(odd)]:border-r"
    >
      <div className="text-[21px] font-semibold tracking-[-0.035em]">
        {title}
      </div>
      <p className="mt-2 text-[12px] leading-5 text-white/40">
        {text}
      </p>
      <div className="mt-5 text-[13px] font-semibold text-[#ff7b4a] transition group-hover:translate-x-1">
        Apri →
      </div>
    </Link>
  );
}

function Step({
  number,
  title,
  text,
}: {
  number: string;
  title: string;
  text: string;
}) {
  return (
    <div className="rounded-[22px] border border-black/10 bg-white p-6">
      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#181818] text-[11px] font-bold text-white">
        {number}
      </div>
      <div className="mt-5 text-[22px] font-semibold tracking-[-0.035em]">
        {title}
      </div>
      <p className="mt-2 text-[13px] leading-6 text-black/45">
        {text}
      </p>
    </div>
  );
}
