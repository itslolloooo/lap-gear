import type {
  Metadata,
} from "next";

import {
  PreparedKits,
  type PreparedKit,
} from "@/components/PreparedKits";

import {
  getCatalogProducts,
} from "@/lib/catalog-server";

export const dynamic =
  "force-dynamic";

export const metadata: Metadata = {
  title:
    "Kit noleggio video già pronti",
  description:
    "Kit LAP GEAR già configurati per videomaker, interviste, podcast e live streaming. Aggiungi tutto il materiale al carrello con un click.",
  alternates: {
    canonical:
      "https://lapgear.it/kit",
  },
};

const kitDefinitions = [
  {
    slug:
      "videomaker-full-frame",
    name:
      "Videomaker Full Frame",
    eyebrow:
      "Video / Run & Gun",
    description:
      "Un setup completo e versatile per shooting, eventi, reel, contenuti corporate e produzioni leggere con stabilizzazione e supporto.",
    idealFor: [
      "Videomaker",
      "Eventi",
      "Reel",
      "Corporate",
    ],
    items: [
      {
        id: 1,
        quantity: 1,
      },
      {
        id: 7,
        quantity: 1,
      },
      {
        id: 15,
        quantity: 1,
      },
      {
        id: 16,
        quantity: 1,
      },
    ],
  },
  {
    slug:
      "intervista-corporate",
    name:
      "Intervista / Corporate",
    eyebrow:
      "Video / Interview",
    description:
      "Camera full frame, ottica luminosa, audio wireless e luce morbida: il necessario per interviste, testimonial e contenuti aziendali.",
    idealFor: [
      "Interviste",
      "Testimonial",
      "Corporate",
      "YouTube",
    ],
    items: [
      {
        id: 1,
        quantity: 1,
      },
      {
        id: 7,
        quantity: 1,
      },
      {
        id: 17,
        quantity: 1,
      },
      {
        id: 9,
        quantity: 1,
      },
      {
        id: 10,
        quantity: 1,
      },
      {
        id: 16,
        quantity: 1,
      },
    ],
  },
  {
    slug:
      "podcast-2-persone",
    name:
      "Podcast 2 persone",
    eyebrow:
      "Audio / Podcast",
    description:
      "Configurazione essenziale per registrare due voci con microfoni broadcast e interfaccia audio USB-C.",
    idealFor: [
      "Podcast",
      "Voice over",
      "Streaming",
      "Interviste audio",
    ],
    items: [
      {
        id: 4,
        quantity: 2,
      },
      {
        id: 6,
        quantity: 1,
      },
    ],
  },
  {
    slug:
      "live-multicamera",
    name:
      "Live Multicamera",
    eyebrow:
      "Live / Streaming",
    description:
      "Due camere full frame con ottiche dedicate, due cavalletti e regia ATEM per dirette, eventi e produzioni multicamera.",
    idealFor: [
      "Streaming",
      "Eventi",
      "Conferenze",
      "Multicamera",
    ],
    items: [
      {
        id: 1,
        quantity: 2,
      },
      {
        id: 7,
        quantity: 1,
      },
      {
        id: 8,
        quantity: 1,
      },
      {
        id: 16,
        quantity: 2,
      },
      {
        id: 3,
        quantity: 1,
      },
    ],
  },
] as const;

export default async function KitsPage() {
  const products =
    await getCatalogProducts();

  const productMap =
    new Map(
      products.map(
        (
          product
        ) => [
          product.id,
          product,
        ]
      )
    );

  const kits:
    PreparedKit[] =
    kitDefinitions
      .map(
        (
          definition
        ) => ({
          slug:
            definition.slug,
          name:
            definition.name,
          eyebrow:
            definition.eyebrow,
          description:
            definition.description,
          idealFor:
            [...definition.idealFor],
          products:
            definition.items
              .map(
                (
                  item
                ) => {
                  const product =
                    productMap.get(
                      item.id
                    );

                  return product
                    ? {
                        product,
                        quantity:
                          item.quantity,
                      }
                    : null;
                }
              )
              .filter(
                (
                  item
                ): item is NonNullable<
                  typeof item
                > =>
                  Boolean(
                    item
                  )
              ),
        })
      )
      .filter(
        (
          kit
        ) =>
          kit.products.length >
          0
      );

  return (
    <main className="min-h-screen bg-[#ebeae4] px-5 pb-16 pt-6 text-[#111111] sm:px-8 lg:px-10 lg:pb-20 xl:px-14">
      <div className="mx-auto max-w-[1680px]">
        <section className="overflow-hidden rounded-[30px] border border-black/10 bg-white shadow-[0_18px_60px_rgba(0,0,0,0.055)]">
          <div className="grid xl:grid-cols-[1fr_400px]">
            <div className="relative overflow-hidden p-8 sm:p-10 lg:p-12">
              <div className="pointer-events-none absolute -right-32 -top-36 h-[380px] w-[380px] rounded-full bg-[#ff5a1f]/[0.07]" />

              <div className="relative">
                <div className="inline-flex items-center gap-2.5 rounded-full bg-[#fff0e9] px-4 py-2 text-[12px] font-bold uppercase tracking-[0.12em] text-[#e94b12]">
                  <span className="h-2 w-2 rounded-full bg-[#ff5a1f]" />
                  Kit pronti
                </div>

                <h1 className="mt-6 max-w-[900px] text-[50px] font-semibold leading-[0.92] tracking-[-0.06em] sm:text-[66px] lg:text-[76px]">
                  Parti già
                  <br />
                  <span className="text-[#ff5a1f]">
                    con il kit giusto.
                  </span>
                </h1>

                <p className="mt-6 max-w-[720px] text-[17px] leading-8 text-black/55">
                  Configurazioni già pensate per produzioni reali. Scegli il tipo di lavoro, aggiungi tutto con un click e poi indica le date.
                </p>
              </div>
            </div>

            <div className="flex flex-col justify-between bg-[#181818] p-8 text-white sm:p-9">
              <div>
                <div className="text-[11px] font-bold uppercase tracking-[0.11em] text-[#ff7b4a]">
                  LAP GEAR
                </div>

                <div className="mt-3 text-[34px] font-semibold leading-[0.98] tracking-[-0.05em]">
                  Meno scelta.
                  <br />
                  Più produzione.
                </div>
              </div>

              <div className="mt-10 space-y-3 text-[12px] leading-5 text-white/45">
                <p>• Materiale realmente presente a catalogo.</p>
                <p>• Quantità controllate sull&apos;inventario.</p>
                <p>• Nessuno sconto automatico nascosto.</p>
                <p>• Puoi modificare il kit prima di inviare la richiesta.</p>
              </div>
            </div>
          </div>
        </section>

        <section className="mt-7">
          <PreparedKits
            kits={
              kits
            }
          />
        </section>
      </div>
    </main>
  );
}
