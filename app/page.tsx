import Link from "next/link";

import {
  ProductCard,
} from "@/components/ProductCard";

import {
  getCatalogCategories,
  getCatalogProducts,
} from "@/lib/catalog-server";

export const dynamic =
  "force-dynamic";

export default async function HomePage() {
  const [
    categories,
    products,
  ] =
    await Promise.all([
      getCatalogCategories(),
      getCatalogProducts(),
    ]);

  const featured =
    products.filter(
      (product) =>
        product.featured
    );

  const showcaseProducts =
    (
      featured.length > 0
        ? featured
        : products
    ).slice(0, 6);

  const heroProducts =
    products
      .filter(
        (product) =>
          Boolean(
            product.image
          )
      )
      .slice(0, 3);

  return (
    <main className="bg-[#ebeae4] text-[#111111]">

      {/* =====================================================
          HERO
          ===================================================== */}

      <section className="px-5 pb-8 pt-5 sm:px-8 lg:px-10 lg:pb-10 lg:pt-8 xl:px-14">
        <div className="mx-auto max-w-[1680px] overflow-hidden rounded-[32px] border border-black/10 bg-white shadow-[0_20px_70px_rgba(0,0,0,0.07)]">
          <div className="grid min-h-[680px] xl:grid-cols-[1.08fr_.92fr]">

            {/* LEFT */}

            <div className="relative flex flex-col justify-between overflow-hidden p-7 sm:p-10 lg:p-14 xl:p-16">
              <div className="pointer-events-none absolute -right-36 -top-40 h-[430px] w-[430px] rounded-full bg-[#ff5a1f]/[0.075]" />

              <div className="relative">
                <div className="inline-flex items-center gap-2.5 rounded-full bg-[#fff0e9] px-4 py-2 text-[13px] font-bold uppercase tracking-[0.12em] text-[#e94b12]">
                  <span className="h-2 w-2 rounded-full bg-[#ff5a1f]" />

                  Professional Video Rental
                </div>

                <h1 className="mt-8 max-w-[850px] text-[55px] font-semibold leading-[0.87] tracking-[-0.067em] sm:text-[72px] lg:text-[88px] 2xl:text-[102px]">
                  Il gear che
                  <br />
                  ti serve.

                  <span className="block text-[#ff5a1f]">
                    Pronto per il set.
                  </span>
                </h1>

                <p className="mt-8 max-w-[680px] text-[18px] leading-8 text-black/60 lg:text-[19px]">
                  Attrezzatura foto,
                  video e live selezionata
                  per produzioni reali.
                  Componi il tuo kit e
                  inviaci le date: la
                  disponibilità viene
                  verificata prima della
                  conferma.
                </p>

                <div className="mt-9 flex flex-col gap-3 sm:flex-row">
                  <Link
                    href="/catalogo"
                    className="inline-flex h-[60px] items-center justify-center gap-4 rounded-[17px] bg-[#181818] px-7 text-[16px] font-semibold text-white transition hover:bg-[#ff5a1f]"
                  >
                    Esplora il catalogo

                    <span className="text-[20px]">
                      →
                    </span>
                  </Link>

                  <Link
                    href="/#come-funziona"
                    className="inline-flex h-[60px] items-center justify-center rounded-[17px] border border-black/10 bg-[#f1f0ea] px-7 text-[16px] font-semibold transition hover:border-black/25 hover:bg-white"
                  >
                    Come funziona
                  </Link>
                </div>
              </div>

              {/* PROCESS BAR */}

              <div className="relative mt-14 overflow-hidden rounded-[20px] border border-black/10 bg-[#f3f2ed]">
                <div className="grid sm:grid-cols-3">
                  <HeroStat
                    number="01"
                    label="Scegli il gear"
                    text="Componi il kit"
                  />

                  <HeroStat
                    number="02"
                    label="Indica le date"
                    text="Ritiro e riconsegna"
                  />

                  <HeroStat
                    number="03"
                    label="Confermiamo"
                    text="Verifica disponibilità"
                  />
                </div>
              </div>
            </div>

            {/* RIGHT */}

            <div className="relative min-h-[560px] overflow-hidden bg-[#181818] p-6 sm:p-8 lg:p-10 xl:min-h-full">
              <div className="pointer-events-none absolute -right-32 -top-28 h-[340px] w-[340px] rounded-full bg-[#ff5a1f]/20" />

              <div className="pointer-events-none absolute -bottom-40 -left-28 h-[360px] w-[360px] rounded-full border-[80px] border-white/[0.035]" />

              <div className="relative flex h-full flex-col">

                <div className="flex items-center justify-between gap-5">
                  <div>
                    <div className="text-[12px] font-bold uppercase tracking-[0.14em] text-[#ff7b4a]">
                      Equipment Library
                    </div>

                    <div className="mt-2 text-[20px] font-semibold text-white">
                      Gear da produzione.
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-[12px] font-bold uppercase tracking-[0.1em] text-white/45">
                    <span className="h-2.5 w-2.5 rounded-full bg-[#1ab36b]" />

                    Operativo
                  </div>
                </div>

                <div className="my-auto grid gap-3 py-10 sm:grid-cols-2">
                  {heroProducts.map(
                    (
                      product,
                      index
                    ) => (
                      <Link
                        key={
                          product.id
                        }
                        href={`/prodotto/${product.slug}`}
                        className={`
                          group
                          relative
                          overflow-hidden
                          rounded-[24px]
                          border
                          border-white/10
                          bg-white/[0.07]
                          p-5
                          transition
                          duration-300
                          hover:-translate-y-1
                          hover:border-[#ff5a1f]/50
                          hover:bg-white/[0.095]

                          ${
                            index === 0
                              ? "sm:col-span-2"
                              : ""
                          }
                        `}
                      >
                        <div
                          className={`
                            flex
                            items-center
                            justify-center
                            overflow-hidden
                            rounded-[18px]
                            bg-[#f0efe9]

                            ${
                              index === 0
                                ? "h-[220px] sm:h-[260px]"
                                : "h-[180px]"
                            }
                          `}
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={
                              product.image
                            }
                            alt={
                              product.name
                            }
                            className="h-full w-full object-contain p-5 transition duration-500 group-hover:scale-[1.04]"
                          />
                        </div>

                        <div className="mt-4 flex items-end justify-between gap-4">
                          <div>
                            {product.brand && (
                              <div className="text-[11px] font-bold uppercase tracking-[0.11em] text-[#ff7b4a]">
                                {
                                  product.brand
                                }
                              </div>
                            )}

                            <div className="mt-1 text-[18px] font-semibold tracking-[-0.025em] text-white">
                              {
                                product.name
                              }
                            </div>
                          </div>

                          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white text-[17px] text-[#181818] transition group-hover:bg-[#ff5a1f] group-hover:text-white">
                            ↗
                          </span>
                        </div>
                      </Link>
                    )
                  )}

                  {heroProducts.length ===
                    0 && (
                    <div className="col-span-full flex min-h-[380px] items-center justify-center rounded-[24px] border border-white/10 bg-white/[0.05] text-center">
                      <div>
                        <div className="text-[15px] font-semibold text-white">
                          LAP GEAR
                        </div>

                        <div className="mt-2 text-[14px] text-white/40">
                          Equipment Library
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between border-t border-white/10 pt-5">
                  <div className="text-[13px] font-medium text-white/40">
                    Foto · Video · Live
                  </div>

                  <Link
                    href="/catalogo"
                    className="text-[13px] font-semibold text-[#ff7b4a]"
                  >
                    Tutto il gear →
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================
          CATEGORIES
          ===================================================== */}

      <section className="px-5 py-12 sm:px-8 lg:px-10 lg:py-16 xl:px-14">
        <div className="mx-auto max-w-[1680px]">
          <div className="mb-8 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <div className="text-[13px] font-bold uppercase tracking-[0.13em] text-[#ff5a1f]">
                Equipment Library
              </div>

              <h2 className="mt-3 text-[44px] font-semibold leading-[0.95] tracking-[-0.055em] sm:text-[58px] lg:text-[66px]">
                Trova il gear
                <br />
                per reparto.
              </h2>
            </div>

            <p className="max-w-[510px] text-[17px] leading-8 text-black/55">
              Naviga il catalogo per
              categoria e costruisci
              soltanto il kit che ti
              serve davvero.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {categories.map(
              (
                category,
                index
              ) => {
                const categoryProducts =
                  products.filter(
                    (product) =>
                      product.category ===
                      category.slug
                  );

                const preview =
                  categoryProducts.find(
                    (product) =>
                      Boolean(
                        product.image
                      )
                  );

                return (
                  <Link
                    key={
                      category.id
                    }
                    href={`/catalogo?categoria=${category.slug}`}
                    className="group relative min-h-[330px] overflow-hidden rounded-[26px] border border-black/10 bg-white transition duration-300 hover:-translate-y-1 hover:border-[#ff5a1f]/30 hover:shadow-[0_20px_55px_rgba(0,0,0,0.07)]"
                  >
                    <div className="absolute inset-x-0 top-0 h-[5px] bg-[#181818] transition group-hover:bg-[#ff5a1f]" />

                    <div className="flex h-full flex-col">
                      <div className="relative flex h-[205px] items-center justify-center overflow-hidden bg-[#f2f1eb]">
                        {preview?.image ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={
                              preview.image
                            }
                            alt=""
                            className="h-full w-full object-contain p-6 transition duration-500 group-hover:scale-[1.05]"
                          />
                        ) : (
                          <div className="text-[12px] font-bold uppercase tracking-[0.1em] text-black/20">
                            LAP GEAR
                          </div>
                        )}

                        <div className="absolute left-5 top-5 flex h-9 min-w-9 items-center justify-center rounded-full bg-white px-3 text-[11px] font-bold text-black/45 shadow-sm">
                          {String(
                            index + 1
                          ).padStart(
                            2,
                            "0"
                          )}
                        </div>
                      </div>

                      <div className="flex flex-1 items-end justify-between gap-4 p-6">
                        <div>
                          <div className="text-[13px] font-bold uppercase tracking-[0.1em] text-[#ff5a1f]">
                            {
                              categoryProducts.length
                            }{" "}
                            {categoryProducts.length ===
                            1
                              ? "ARTICOLO"
                              : "ARTICOLI"}
                          </div>

                          <h3 className="mt-2 text-[29px] font-semibold tracking-[-0.045em]">
                            {
                              category.name
                            }
                          </h3>
                        </div>

                        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#efeee8] text-[19px] transition group-hover:bg-[#ff5a1f] group-hover:text-white">
                          →
                        </span>
                      </div>
                    </div>
                  </Link>
                );
              }
            )}
          </div>
        </div>
      </section>

      {/* =====================================================
          FEATURED
          ===================================================== */}

      <section className="border-y border-black/10 bg-white px-5 py-14 sm:px-8 lg:px-10 lg:py-18 xl:px-14">
        <div className="mx-auto max-w-[1680px]">
          <div className="mb-9 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <div className="text-[13px] font-bold uppercase tracking-[0.13em] text-[#ff5a1f]">
                Selezione LAP GEAR
              </div>

              <h2 className="mt-2 text-[43px] font-semibold tracking-[-0.055em] sm:text-[56px]">
                Gear in evidenza.
              </h2>
            </div>

            <Link
              href="/catalogo"
              className="inline-flex h-14 items-center gap-4 self-start rounded-[16px] bg-[#181818] px-6 text-[15px] font-semibold text-white transition hover:bg-[#ff5a1f] lg:self-auto"
            >
              Vedi tutto

              <span>
                →
              </span>
            </Link>
          </div>

          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {showcaseProducts.map(
              (
                product
              ) => (
                <ProductCard
                  key={
                    product.id
                  }
                  product={
                    product
                  }
                />
              )
            )}
          </div>
        </div>
      </section>

      {/* =====================================================
          HOW IT WORKS
          ===================================================== */}

      <section
        id="come-funziona"
        className="px-5 py-14 sm:px-8 lg:px-10 lg:py-20 xl:px-14"
      >
        <div className="mx-auto max-w-[1680px] overflow-hidden rounded-[30px] bg-[#181818] text-white">
          <div className="grid xl:grid-cols-[420px_1fr]">

            <div className="relative overflow-hidden border-b border-white/10 p-8 sm:p-10 xl:border-b-0 xl:border-r">
              <div className="pointer-events-none absolute -bottom-24 -left-24 h-[250px] w-[250px] rounded-full bg-[#ff5a1f]/20" />

              <div className="relative">
                <div className="text-[13px] font-bold uppercase tracking-[0.13em] text-[#ff7b4a]">
                  Come funziona
                </div>

                <h2 className="mt-4 text-[42px] font-semibold leading-[0.95] tracking-[-0.055em] sm:text-[52px]">
                  Tu costruisci
                  <br />
                  il kit.
                  <br />
                  Noi verifichiamo.
                </h2>

                <p className="mt-6 max-w-[310px] text-[15px] leading-7 text-white/50">
                  Nessun checkout
                  automatico: ogni
                  richiesta viene
                  controllata prima
                  della conferma.
                </p>
              </div>
            </div>

            <div className="grid sm:grid-cols-2">
              <ProcessStep
                number="01"
                title="Scegli"
                text="Esplora il catalogo e aggiungi al kit soltanto ciò che serve alla produzione."
              />

              <ProcessStep
                number="02"
                title="Componi"
                text="Controlla quantità, tariffe e materiale prima di inviare la richiesta."
              />

              <ProcessStep
                number="03"
                title="Date"
                text="Indica ritiro e riconsegna. Verifichiamo la disponibilità effettiva."
              />

              <ProcessStep
                number="04"
                title="Conferma"
                text="Dopo la verifica ricevi la conferma del materiale disponibile per il set."
              />
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================
          CONTACT
          ===================================================== */}

      <section
        id="contatti"
        className="px-5 pb-14 sm:px-8 lg:px-10 lg:pb-20 xl:px-14"
      >
        <div className="mx-auto max-w-[1680px] overflow-hidden rounded-[30px] border border-black/10 bg-white">
          <div className="grid lg:grid-cols-[1fr_auto] lg:items-center">
            <div className="p-8 sm:p-10 lg:p-12">
              <div className="text-[13px] font-bold uppercase tracking-[0.13em] text-[#ff5a1f]">
                Hai un progetto?
              </div>

              <h2 className="mt-3 max-w-[900px] text-[42px] font-semibold leading-[0.97] tracking-[-0.055em] sm:text-[56px]">
                Costruiamo il kit
                giusto per il tuo set.
              </h2>

              <p className="mt-5 max-w-[720px] text-[17px] leading-8 text-black/55">
                Se hai esigenze
                particolari o non sai
                esattamente quale
                configurazione scegliere,
                scrivici.
              </p>
            </div>

            <div className="border-t border-black/10 p-8 lg:border-l lg:border-t-0 lg:p-12">
              <a
                href="mailto:info@lapequipment.it"
                className="group flex min-w-[260px] items-center justify-between gap-8 rounded-[20px] bg-[#ff5a1f] px-6 py-5 text-white transition hover:bg-[#181818]"
              >
                <div>
                  <div className="text-[12px] font-bold uppercase tracking-[0.1em] text-white/65">
                    Email
                  </div>

                  <div className="mt-1 text-[16px] font-semibold">
                    info@lapequipment.it
                  </div>
                </div>

                <span className="text-[22px] transition group-hover:translate-x-1">
                  →
                </span>
              </a>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}


/* =========================================================
   HERO STAT
   ========================================================= */

function HeroStat({
  number,
  label,
  text,
}: {
  number: string;
  label: string;
  text: string;
}) {
  return (
    <div className="relative border-b border-black/10 p-5 last:border-b-0 sm:border-b-0 sm:border-r sm:last:border-r-0">
      <div className="flex items-start gap-4">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#ff5a1f] text-[12px] font-bold text-white">
          {number}
        </div>

        <div>
          <div className="text-[15px] font-semibold text-[#181818]">
            {label}
          </div>

          <div className="mt-1 text-[13px] text-black/45">
            {text}
          </div>
        </div>
      </div>
    </div>
  );
}


/* =========================================================
   PROCESS STEP
   ========================================================= */

function ProcessStep({
  number,
  title,
  text,
}: {
  number: string;
  title: string;
  text: string;
}) {
  return (
    <div className="border-b border-white/10 p-7 last:border-b-0 sm:p-8 sm:[&:nth-child(odd)]:border-r">
      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#ff5a1f]/15 text-[12px] font-bold text-[#ff7b4a]">
        {number}
      </div>

      <h3 className="mt-7 text-[25px] font-semibold tracking-[-0.035em]">
        {title}
      </h3>

      <p className="mt-3 max-w-[400px] text-[15px] leading-7 text-white/50">
        {text}
      </p>
    </div>
  );
}