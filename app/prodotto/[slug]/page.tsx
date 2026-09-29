import type {
  ReactNode,
} from "react";

import Link from "next/link";

import {
  notFound,
} from "next/navigation";

import {
  AddToRentalButton,
} from "@/components/AddToRentalButton";

import {
  getCatalogProduct,
} from "@/lib/catalog-server";


export const dynamic =
  "force-dynamic";


export default async function ProductPage({
  params,
}: {
  params: Promise<{
    slug: string;
  }>;
}) {
  const {
    slug,
  } =
    await params;

  const product =
    await getCatalogProduct(
      slug
    );

  if (!product) {
    notFound();
  }


  /* =========================================================
     DATA
     ========================================================= */

  const price =
    Number(
      product.priceDay ??
        0
    );

  const attributes =
    Object.entries(
      product.attributes ??
        {}
    ).filter(
      ([, value]) =>
        value !== null &&
        value !==
          undefined &&
        value !== ""
    );

  const specs =
    product.specs ??
    [];

  const included =
    product.includes ??
    [];


  return (
    <main className="min-h-screen bg-[#ebeae4] text-[#111111]">

      {/* =====================================================
          BREADCRUMB
          ===================================================== */}

      <div className="px-5 pt-6 sm:px-8 lg:px-10 xl:px-14">
        <div className="mx-auto flex max-w-[1680px] items-center gap-2 overflow-hidden text-[13px] font-semibold text-black/40">
          <Link
            href="/catalogo"
            className="shrink-0 transition hover:text-[#ff5a1f]"
          >
            Catalogo
          </Link>

          <span>
            /
          </span>

          <Link
            href={`/catalogo?categoria=${product.category}`}
            className="shrink-0 transition hover:text-[#ff5a1f]"
          >
            {
              product.categoryLabel
            }
          </Link>

          <span>
            /
          </span>

          <span className="truncate text-black/60">
            {
              product.name
            }
          </span>
        </div>
      </div>


      {/* =====================================================
          PRODUCT HERO
          ===================================================== */}

      <section className="px-5 pb-8 pt-5 sm:px-8 lg:px-10 lg:pb-10 xl:px-14">
        <div className="mx-auto max-w-[1680px] overflow-hidden rounded-[32px] border border-black/10 bg-white shadow-[0_20px_70px_rgba(0,0,0,0.07)]">

          <div className="grid xl:grid-cols-[1.08fr_.92fr]">

            {/* =================================================
                IMAGE
                ================================================= */}

            <div className="relative flex min-h-[480px] items-center justify-center overflow-hidden bg-[#f1f0ea] p-8 sm:min-h-[600px] sm:p-12 xl:min-h-[720px]">

              <div className="pointer-events-none absolute -left-32 -top-32 h-[360px] w-[360px] rounded-full bg-[#ff5a1f]/[0.07]" />

              {/* CATEGORY + BRAND */}

              <div className="absolute left-6 top-6 z-10 flex flex-wrap gap-2 sm:left-8 sm:top-8">

                <Link
                  href={`/catalogo?categoria=${product.category}`}
                  className="rounded-full border border-black/10 bg-white px-4 py-2 text-[12px] font-bold uppercase tracking-[0.08em] text-black/55 shadow-sm transition hover:border-[#ff5a1f]/30 hover:text-[#ff5a1f]"
                >
                  {
                    product.categoryLabel
                  }
                </Link>

                {product.brand && (
                  <div className="rounded-full bg-[#181818] px-4 py-2 text-[12px] font-bold uppercase tracking-[0.08em] text-white">
                    {
                      product.brand
                    }
                  </div>
                )}
              </div>


              {/* PRODUCT IMAGE */}

              {product.image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={
                    product.image
                  }
                  alt={
                    product.name
                  }
                  className="relative z-[1] max-h-[520px] w-full max-w-[820px] object-contain xl:max-h-[610px]"
                />
              ) : (
                <div className="relative z-[1] text-center">
                  <div className="text-[15px] font-black uppercase tracking-[0.15em] text-black/20">
                    LAP GEAR
                  </div>

                  <div className="mt-3 text-[15px] text-black/30">
                    Immagine non disponibile
                  </div>
                </div>
              )}


              {/* EQUIPMENT ID */}

              <div className="absolute bottom-6 left-6 rounded-full border border-black/10 bg-white/90 px-4 py-2.5 text-[12px] font-semibold text-black/45 backdrop-blur sm:bottom-8 sm:left-8">
                Equipment ID · #
                {
                  product.id
                }
              </div>
            </div>


            {/* =================================================
                DETAILS
                ================================================= */}

            <div className="flex flex-col p-7 sm:p-10 lg:p-12 xl:p-14">

              {/* TITLE */}

              <div>
                {product.brand && (
                  <div className="text-[13px] font-bold uppercase tracking-[0.13em] text-[#ff5a1f]">
                    {
                      product.brand
                    }
                  </div>
                )}

                <h1 className="mt-3 text-[53px] font-semibold leading-[0.91] tracking-[-0.062em] sm:text-[66px] xl:text-[72px]">
                  {
                    product.name
                  }
                </h1>

                {product.shortDescription && (
                  <p className="mt-6 max-w-[650px] text-[19px] leading-8 text-black/58">
                    {
                      product.shortDescription
                    }
                  </p>
                )}

                {product.description &&
                  product.description !==
                    product.shortDescription && (
                    <p className="mt-4 max-w-[650px] text-[16px] leading-7 text-black/45">
                      {
                        product.description
                      }
                    </p>
                  )}
              </div>


              {/* =============================================
                  PRICE + AVAILABILITY
                  ============================================= */}

              <div className="mt-9 grid gap-3 sm:grid-cols-2">

                {/* TARIFFA */}

                <div className="rounded-[20px] bg-[#181818] p-5 text-white sm:p-6">
                  <div className="text-[12px] font-bold uppercase tracking-[0.11em] text-[#ff7b4a]">
                    Tariffa
                  </div>

                  <div className="mt-4 flex items-end gap-2">
                    <div className="text-[44px] font-semibold leading-none tracking-[-0.055em]">
                      €
                      {
                        price.toFixed(
                          0
                        )
                      }
                    </div>

                    <div className="pb-1 text-[14px] font-medium text-white/40">
                      / giorno
                    </div>
                  </div>
                </div>


                {/* DISPONIBILITÀ */}

                <div className="rounded-[20px] border border-black/10 bg-[#f3f2ed] p-5 sm:p-6">
                  <div className="text-[12px] font-bold uppercase tracking-[0.11em] text-black/40">
                    Disponibilità
                  </div>

                  <div className="mt-4 flex items-start gap-3">
                    <span className="mt-1.5 h-3 w-3 shrink-0 rounded-full bg-[#168a50]" />

                    <div>
                      <div className="text-[19px] font-semibold tracking-[-0.025em]">
                        Su richiesta
                      </div>

                      <p className="mt-1.5 text-[14px] leading-6 text-black/48">
                        Verificata sulle date e quantità indicate nel kit.
                      </p>
                    </div>
                  </div>
                </div>
              </div>


              {/* =============================================
                  CTA
                  ============================================= */}

              <div className="mt-7">

                <AddToRentalButton
                  product={
                    product
                  }
                />

                <Link
                  href="/noleggio"
                  className="mt-3 flex h-[58px] w-full items-center justify-center rounded-[17px] border border-black/10 bg-[#f1f0ea] px-6 text-[15px] font-semibold text-black/65 transition hover:border-black/25 hover:bg-white hover:text-black"
                >
                  Apri il tuo kit →
                </Link>

                <p className="mt-5 text-[13px] leading-6 text-black/45">
                  Il noleggio viene confermato
                  dopo la verifica della
                  richiesta. Eventuali garanzie
                  o cauzioni vengono comunicate
                  prima della conferma.{" "}

                  <Link
                    href="/termini-noleggio"
                    className="font-semibold text-[#ff5a1f] underline underline-offset-4"
                  >
                    Termini di noleggio
                  </Link>
                </p>
              </div>


              {/* =============================================
                  PROCESS
                  ============================================= */}

              <div className="mt-auto pt-9">
                <div className="grid grid-cols-2 gap-5 border-t border-black/10 pt-6 sm:grid-cols-4">

                  <MiniInfo
                    number="01"
                    title="Aggiungi"
                    text="al kit"
                  />

                  <MiniInfo
                    number="02"
                    title="Scegli"
                    text="le date"
                  />

                  <MiniInfo
                    number="03"
                    title="Verifica"
                    text="disponibilità"
                  />

                  <MiniInfo
                    number="04"
                    title="Conferma"
                    text="della richiesta"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>


      {/* =====================================================
          TECHNICAL DATA
          ===================================================== */}

      <section className="px-5 py-8 sm:px-8 lg:px-10 lg:py-12 xl:px-14">
        <div className="mx-auto max-w-[1680px]">

          <div className="mb-8">
            <div className="text-[13px] font-bold uppercase tracking-[0.13em] text-[#ff5a1f]">
              Equipment details
            </div>

            <h2 className="mt-2 text-[43px] font-semibold tracking-[-0.055em] sm:text-[56px]">
              Scheda tecnica.
            </h2>
          </div>


          <div className="grid gap-5 xl:grid-cols-3">

            {/* =============================================
                STRUCTURED ATTRIBUTES
                ============================================= */}

            <TechnicalPanel
              number="01"
              title="Specifiche"
              dark
            >
              {attributes.length >
              0 ? (
                <div className="divide-y divide-white/10">

                  {attributes.map(
                    ([
                      key,
                      value,
                    ]) => (
                      <div
                        key={
                          key
                        }
                        className="grid grid-cols-[1fr_auto] gap-5 py-4 first:pt-0 last:pb-0"
                      >
                        <div className="text-[14px] font-medium text-white/40">
                          {
                            formatAttributeKey(
                              key
                            )
                          }
                        </div>

                        <div className="max-w-[220px] text-right text-[15px] font-semibold text-white">
                          {
                            formatAttributeValue(
                              value
                            )
                          }
                        </div>
                      </div>
                    )
                  )}
                </div>
              ) : (
                <EmptyTechnical
                  dark
                >
                  Specifiche strutturate
                  non ancora inserite.
                </EmptyTechnical>
              )}
            </TechnicalPanel>


            {/* =============================================
                SPECS
                ============================================= */}

            <TechnicalPanel
              number="02"
              title="Dettagli tecnici"
            >
              {specs.length >
              0 ? (
                <div className="space-y-3">

                  {specs.map(
                    (
                      spec,
                      index
                    ) => (
                      <FeatureRow
                        key={`${spec}-${index}`}
                      >
                        {
                          spec
                        }
                      </FeatureRow>
                    )
                  )}
                </div>
              ) : (
                <EmptyTechnical>
                  Nessun dettaglio
                  tecnico aggiuntivo.
                </EmptyTechnical>
              )}
            </TechnicalPanel>


            {/* =============================================
                INCLUDED
                ============================================= */}

            <TechnicalPanel
              number="03"
              title="Nel kit"
            >
              {included.length >
              0 ? (
                <div className="space-y-3">

                  {included.map(
                    (
                      item,
                      index
                    ) => (
                      <FeatureRow
                        key={`${item}-${index}`}
                        check
                      >
                        {
                          item
                        }
                      </FeatureRow>
                    )
                  )}
                </div>
              ) : (
                <EmptyTechnical>
                  Contenuto del kit da
                  verificare.
                </EmptyTechnical>
              )}
            </TechnicalPanel>
          </div>
        </div>
      </section>


      {/* =====================================================
          RENTAL WORKFLOW
          ===================================================== */}

      <section className="px-5 py-8 sm:px-8 lg:px-10 lg:py-12 xl:px-14">
        <div className="mx-auto max-w-[1680px] overflow-hidden rounded-[30px] border border-black/10 bg-white">

          <div className="grid xl:grid-cols-[420px_1fr]">

            {/* LEFT */}

            <div className="relative overflow-hidden border-b border-black/10 bg-[#f3f2ed] p-8 sm:p-10 xl:border-b-0 xl:border-r">

              <div className="pointer-events-none absolute -bottom-24 -left-24 h-[260px] w-[260px] rounded-full bg-[#ff5a1f]/10" />

              <div className="relative">
                <div className="text-[13px] font-bold uppercase tracking-[0.13em] text-[#ff5a1f]">
                  Rental workflow
                </div>

                <h2 className="mt-4 text-[41px] font-semibold leading-[0.96] tracking-[-0.055em]">
                  Dal kit
                  <br />
                  alla conferma.
                </h2>

                <p className="mt-6 max-w-[320px] text-[15px] leading-7 text-black/48">
                  La disponibilità mostrata
                  sul sito non costituisce
                  una prenotazione definitiva.
                </p>
              </div>
            </div>


            {/* RIGHT */}

            <div className="grid sm:grid-cols-3">

              <RentalInfo
                number="01"
                title="Richiesta"
                text="Aggiungi il materiale al kit e indica ritiro e riconsegna."
              />

              <RentalInfo
                number="02"
                title="Verifica"
                text="Controlliamo la disponibilità per le date e le quantità richieste."
              />

              <RentalInfo
                number="03"
                title="Conferma"
                text="Ricevi la conferma del materiale e delle condizioni del noleggio."
              />
            </div>
          </div>
        </div>
      </section>


      {/* =====================================================
          TERMS CTA
          ===================================================== */}

      <section className="px-5 py-8 sm:px-8 lg:px-10 lg:py-12 xl:px-14">
        <div className="mx-auto max-w-[1680px] overflow-hidden rounded-[28px] border border-black/10 bg-white">

          <div className="grid lg:grid-cols-[1fr_auto] lg:items-center">

            <div className="p-8 sm:p-10">
              <div className="text-[13px] font-bold uppercase tracking-[0.13em] text-[#ff5a1f]">
                Prima del noleggio
              </div>

              <h2 className="mt-3 text-[37px] font-semibold leading-[0.98] tracking-[-0.05em] sm:text-[46px]">
                Leggi i termini
                e le condizioni.
              </h2>

              <p className="mt-4 max-w-[720px] text-[16px] leading-7 text-black/50">
                Ritiro, riconsegna,
                garanzie, utilizzo del
                materiale e condizioni
                della richiesta.
              </p>
            </div>

            <div className="border-t border-black/10 p-8 lg:border-l lg:border-t-0 lg:p-10">

              <Link
                href="/termini-noleggio"
                className="flex h-[58px] min-w-[240px] items-center justify-center rounded-[16px] bg-[#f1f0ea] px-6 text-[15px] font-semibold text-black/65 transition hover:bg-[#181818] hover:text-white"
              >
                Termini di noleggio →
              </Link>
            </div>
          </div>
        </div>
      </section>


      {/* =====================================================
          FINAL CTA
          ===================================================== */}

      <section className="px-5 pb-16 pt-8 sm:px-8 lg:px-10 lg:pb-20 xl:px-14">
        <div className="mx-auto max-w-[1680px] overflow-hidden rounded-[30px] bg-[#181818] text-white">

          <div className="grid lg:grid-cols-[1fr_auto] lg:items-center">

            {/* TEXT */}

            <div className="relative overflow-hidden p-8 sm:p-10 lg:p-12">

              <div className="pointer-events-none absolute -bottom-32 -left-24 h-[280px] w-[280px] rounded-full bg-[#ff5a1f]/20" />

              <div className="relative">

                <div className="text-[13px] font-bold uppercase tracking-[0.13em] text-[#ff7b4a]">
                  LAP GEAR
                </div>

                <h2 className="mt-3 max-w-[850px] text-[42px] font-semibold leading-[0.96] tracking-[-0.055em] sm:text-[54px]">
                  Continua a costruire
                  il tuo kit.
                </h2>

                <p className="mt-5 max-w-[620px] text-[16px] leading-7 text-white/50">
                  Torna al catalogo per
                  aggiungere altro materiale
                  oppure apri il kit per
                  scegliere le date.
                </p>
              </div>
            </div>


            {/* ACTIONS */}

            <div className="flex flex-col gap-3 border-t border-white/10 p-8 sm:flex-row lg:w-[330px] lg:flex-col lg:border-l lg:border-t-0 lg:p-10">

              <Link
                href={`/catalogo?categoria=${product.category}`}
                className="flex h-[58px] items-center justify-center rounded-[16px] border border-white/10 bg-white/[0.07] px-6 text-[15px] font-semibold text-white transition hover:bg-white hover:text-[#181818]"
              >
                Altri{" "}
                {
                  product.categoryLabel
                }
              </Link>

              <Link
                href="/noleggio"
                className="flex h-[58px] items-center justify-center rounded-[16px] bg-[#ff5a1f] px-6 text-[15px] font-semibold text-white transition hover:bg-white hover:text-[#181818]"
              >
                Il tuo kit →
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}


/* =========================================================
   MINI INFO
   ========================================================= */

function MiniInfo({
  number,
  title,
  text,
}: {
  number: string;
  title: string;
  text: string;
}) {
  return (
    <div>
      <div className="text-[11px] font-bold text-[#ff5a1f]">
        {
          number
        }
      </div>

      <div className="mt-1.5 text-[14px] font-semibold">
        {
          title
        }
      </div>

      <div className="mt-0.5 text-[12px] text-black/40">
        {
          text
        }
      </div>
    </div>
  );
}


/* =========================================================
   TECHNICAL PANEL
   ========================================================= */

function TechnicalPanel({
  number,
  title,
  children,
  dark = false,
}: {
  number: string;
  title: string;
  children: ReactNode;
  dark?: boolean;
}) {
  return (
    <article
      className={`
        overflow-hidden
        rounded-[26px]
        border
        p-6
        sm:p-7

        ${
          dark
            ? "border-[#181818] bg-[#181818] text-white"
            : "border-black/10 bg-white"
        }
      `}
    >
      <div className="flex items-center gap-4">

        <div
          className={`
            flex
            h-9
            min-w-9
            items-center
            justify-center
            rounded-full
            px-2
            text-[11px]
            font-bold

            ${
              dark
                ? "bg-[#ff5a1f]/20 text-[#ff7b4a]"
                : "bg-[#fff0e9] text-[#ff5a1f]"
            }
          `}
        >
          {
            number
          }
        </div>

        <h3 className="text-[24px] font-semibold tracking-[-0.035em]">
          {
            title
          }
        </h3>
      </div>

      <div className="mt-7">
        {
          children
        }
      </div>
    </article>
  );
}


/* =========================================================
   FEATURE ROW
   ========================================================= */

function FeatureRow({
  children,
  check = false,
}: {
  children: ReactNode;
  check?: boolean;
}) {
  return (
    <div className="flex items-start gap-3 rounded-[15px] bg-[#f3f2ed] px-4 py-3.5">

      <span
        className={`
          flex
          h-6
          w-6
          shrink-0
          items-center
          justify-center
          rounded-full
          text-[11px]
          font-bold

          ${
            check
              ? "bg-[#e7f5ec] text-[#168a50]"
              : "bg-white text-[#ff5a1f]"
          }
        `}
      >
        {check
          ? "✓"
          : "—"}
      </span>

      <div className="pt-0.5 text-[15px] font-medium leading-6 text-black/65">
        {
          children
        }
      </div>
    </div>
  );
}


/* =========================================================
   EMPTY TECHNICAL
   ========================================================= */

function EmptyTechnical({
  children,
  dark = false,
}: {
  children: ReactNode;
  dark?: boolean;
}) {
  return (
    <div
      className={`
        rounded-[16px]
        border
        border-dashed
        p-5
        text-[14px]
        leading-6

        ${
          dark
            ? "border-white/15 text-white/35"
            : "border-black/15 text-black/40"
        }
      `}
    >
      {
        children
      }
    </div>
  );
}


/* =========================================================
   RENTAL INFO
   ========================================================= */

function RentalInfo({
  number,
  title,
  text,
}: {
  number: string;
  title: string;
  text: string;
}) {
  return (
    <div className="border-b border-black/10 p-7 last:border-b-0 sm:border-b-0 sm:border-r sm:p-8 sm:last:border-r-0">

      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#fff0e9] text-[12px] font-bold text-[#ff5a1f]">
        {
          number
        }
      </div>

      <h3 className="mt-7 text-[24px] font-semibold tracking-[-0.035em]">
        {
          title
        }
      </h3>

      <p className="mt-3 text-[15px] leading-7 text-black/50">
        {
          text
        }
      </p>
    </div>
  );
}


/* =========================================================
   ATTRIBUTE LABELS
   ========================================================= */

function formatAttributeKey(
  key: string
) {
  const labels:
    Record<
      string,
      string
    > = {
    camera_type:
      "Tipo camera",

    sensor:
      "Sensore",

    mount:
      "Attacco",

    resolution:
      "Risoluzione",

    max_resolution:
      "Risoluzione max",

    max_fps:
      "Frame rate max",

    lens_type:
      "Tipo ottica",

    coverage:
      "Copertura",

    focal_min:
      "Focale minima",

    focal_max:
      "Focale massima",

    aperture:
      "Apertura",

    audio_type:
      "Tipologia",

    microphone_type:
      "Tipo microfono",

    channels:
      "Canali",

    connection:
      "Connessione",

    light_type:
      "Tipo luce",

    color_mode:
      "Modalità colore",

    power:
      "Potenza",

    video_type:
      "Tipologia video",

    inputs:
      "Ingressi",

    outputs:
      "Uscite",

    live_type:
      "Tipologia live",

    accessory_type:
      "Tipo accessorio",

    compatibility:
      "Compatibilità",
  };

  return (
    labels[key] ??
    key
      .replace(
        /_/g,
        " "
      )
      .replace(
        /\b\w/g,
        (letter) =>
          letter.toUpperCase()
      )
  );
}


/* =========================================================
   ATTRIBUTE VALUES
   ========================================================= */

function formatAttributeValue(
  value: unknown
) {
  if (
    Array.isArray(
      value
    )
  ) {
    return value
      .map(
        formatSingleValue
      )
      .join(", ");
  }

  return formatSingleValue(
    value
  );
}


function formatSingleValue(
  value: unknown
) {
  if (
    value === null ||
    value ===
      undefined
  ) {
    return "—";
  }

  const raw =
    String(
      value
    );

  const labels:
    Record<
      string,
      string
    > = {
    mirrorless:
      "Mirrorless",

    cinema:
      "Cinema",

    camcorder:
      "Camcorder",

    "full-frame":
      "Full Frame",

    super35:
      "Super 35",

    mft:
      "Micro 4/3",

    "sony-e":
      "Sony E",

    "canon-ef":
      "Canon EF",

    "canon-rf":
      "Canon RF",

    pl:
      "PL",

    "4k":
      "4K",

    "4k60":
      "4K 60p",

    mixer:
      "Mixer",

    "audio-interface":
      "Interfaccia audio",

    "wireless-video":
      "Wireless Video",

    switching:
      "Regia / Switching",

    hdmi:
      "HDMI",

    sdi:
      "SDI",

    usb:
      "USB",
  };

  return (
    labels[
      raw.toLowerCase()
    ] ??
    raw
      .replace(
        /[_-]+/g,
        " "
      )
      .replace(
        /\b\w/g,
        (letter) =>
          letter.toUpperCase()
      )
  );
}