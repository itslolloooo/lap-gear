"use client";

import Link from "next/link";

import {
  useMemo,
  useState,
} from "react";


/* =========================================================
   TYPES
   ========================================================= */

export type ProductFormCategory = {
  id: number;
  name: string;
  slug: string;
};


export type ProductFormProduct = {
  id?: number;

  name: string;

  slug: string;

  category_id:
    | number
    | null;

  brand:
    | string
    | null;

  short_description:
    | string
    | null;

  description:
    | string
    | null;

  price_day:
    | number
    | string;

  deposit:
    | number
    | string;

  image_url:
    | string
    | null;

  active: boolean;

  featured: boolean;

  specs:
    | string[]
    | null;

  includes:
    | string[]
    | null;

  attributes:
    | Record<
        string,
        unknown
      >
    | null;
};


type ProductFormProps = {
  categories:
    ProductFormCategory[];

  action: string;

  submitLabel: string;

  product?:
    ProductFormProduct;

  mode?:
    | "create"
    | "edit";
};


type AttributeField = {
  key: string;
  label: string;
  placeholder?: string;
  multiple?: boolean;
};


/* =========================================================
   STRUCTURED ATTRIBUTES
   ========================================================= */

const CATEGORY_FIELDS:
  Record<
    string,
    AttributeField[]
  > = {
  camere: [
    {
      key:
        "camera_type",
      label:
        "Tipo camera",
      placeholder:
        "Es. Mirrorless",
    },
    {
      key:
        "sensor",
      label:
        "Sensore",
      placeholder:
        "Es. Full Frame",
    },
    {
      key:
        "mount",
      label:
        "Attacco",
      placeholder:
        "Es. Sony E",
    },
    {
      key:
        "resolution",
      label:
        "Risoluzione",
      placeholder:
        "Es. 4K",
    },
    {
      key:
        "max_fps",
      label:
        "Frame rate max",
      placeholder:
        "Es. 120 fps",
    },
  ],

  ottiche: [
    {
      key:
        "lens_type",
      label:
        "Tipo ottica",
      placeholder:
        "Es. Zoom",
    },
    {
      key:
        "mount",
      label:
        "Attacco",
      placeholder:
        "Es. Sony E",
    },
    {
      key:
        "coverage",
      label:
        "Copertura",
      placeholder:
        "Es. Full Frame",
    },
    {
      key:
        "focal_min",
      label:
        "Focale minima",
      placeholder:
        "Es. 24 mm",
    },
    {
      key:
        "focal_max",
      label:
        "Focale massima",
      placeholder:
        "Es. 70 mm",
    },
    {
      key:
        "aperture",
      label:
        "Apertura",
      placeholder:
        "Es. f/2.8",
    },
  ],

  audio: [
    {
      key:
        "audio_type",
      label:
        "Tipologia",
      placeholder:
        "Es. Microfono",
    },
    {
      key:
        "microphone_type",
      label:
        "Tipo microfono",
      placeholder:
        "Es. Dinamico",
    },
    {
      key:
        "channels",
      label:
        "Canali",
      placeholder:
        "Es. 2",
    },
    {
      key:
        "connection",
      label:
        "Connessioni",
      placeholder:
        "Es. XLR, USB-C",
      multiple:
        true,
    },
  ],

  luci: [
    {
      key:
        "light_type",
      label:
        "Tipo luce",
      placeholder:
        "Es. COB",
    },
    {
      key:
        "color_mode",
      label:
        "Modalità colore",
      placeholder:
        "Es. Bi-color",
    },
    {
      key:
        "power",
      label:
        "Potenza",
      placeholder:
        "Es. 300 W",
    },
    {
      key:
        "mount",
      label:
        "Attacco",
      placeholder:
        "Es. Bowens",
    },
  ],

  video: [
    {
      key:
        "video_type",
      label:
        "Tipologia",
      placeholder:
        "Es. Wireless Video",
    },
    {
      key:
        "max_resolution",
      label:
        "Risoluzione max",
      placeholder:
        "Es. 4K 30p",
    },
    {
      key:
        "inputs",
      label:
        "Ingressi",
      placeholder:
        "Es. HDMI, SDI",
      multiple:
        true,
    },
    {
      key:
        "outputs",
      label:
        "Uscite",
      placeholder:
        "Es. HDMI, SDI",
      multiple:
        true,
    },
  ],

  live: [
    {
      key:
        "live_type",
      label:
        "Tipologia",
      placeholder:
        "Es. Switcher",
    },
    {
      key:
        "inputs",
      label:
        "Ingressi",
      placeholder:
        "Es. 4x HDMI",
      multiple:
        true,
    },
    {
      key:
        "outputs",
      label:
        "Uscite",
      placeholder:
        "Es. HDMI, USB-C",
      multiple:
        true,
    },
    {
      key:
        "channels",
      label:
        "Canali",
      placeholder:
        "Es. 4",
    },
  ],

  accessori: [
    {
      key:
        "accessory_type",
      label:
        "Tipo accessorio",
      placeholder:
        "Es. Supporto",
    },
    {
      key:
        "compatibility",
      label:
        "Compatibilità",
      placeholder:
        "Es. Sony A7 IV, FX3",
      multiple:
        true,
    },
  ],
};


/* =========================================================
   HELPERS
   ========================================================= */

function slugify(
  value: string
) {
  return value
    .normalize("NFD")
    .replace(
      /[\u0300-\u036f]/g,
      ""
    )
    .toLowerCase()
    .trim()
    .replace(
      /[^a-z0-9]+/g,
      "-"
    )
    .replace(
      /^-+|-+$/g,
      ""
    );
}


function attributeToInputValue(
  value: unknown
) {
  if (
    Array.isArray(
      value
    )
  ) {
    return value
      .map(String)
      .join(", ");
  }

  if (
    value === null ||
    value ===
      undefined
  ) {
    return "";
  }

  return String(
    value
  );
}


function buildInitialAttributeState(
  attributes:
    | Record<
        string,
        unknown
      >
    | null
    | undefined
) {
  const result:
    Record<
      string,
      string
    > = {};

  Object.entries(
    attributes ?? {}
  ).forEach(
    ([
      key,
      value,
    ]) => {
      result[key] =
        attributeToInputValue(
          value
        );
    }
  );

  return result;
}


function splitMultipleValue(
  value: string
) {
  return value
    .split(",")
    .map(
      (item) =>
        item.trim()
    )
    .filter(
      Boolean
    );
}


/* =========================================================
   COMPONENT
   ========================================================= */

export function ProductForm({
  categories,
  action,
  submitLabel,
  product,
  mode = "edit",
}: ProductFormProps) {
  const [
    name,
    setName,
  ] =
    useState(
      product?.name ??
        ""
    );

  const [
    slug,
    setSlug,
  ] =
    useState(
      product?.slug ??
        ""
    );

  const [
    slugTouched,
    setSlugTouched,
  ] =
    useState(
      Boolean(
        product?.slug
      )
    );

  const [
    categoryId,
    setCategoryId,
  ] =
    useState(
      product?.category_id
        ? String(
            product.category_id
          )
        : ""
    );

  const [
    brand,
    setBrand,
  ] =
    useState(
      product?.brand ??
        ""
    );

  const [
    imageUrl,
    setImageUrl,
  ] =
    useState(
      product?.image_url ??
        ""
    );

  const [
    active,
    setActive,
  ] =
    useState(
      product?.active ??
        true
    );

  const [
    featured,
    setFeatured,
  ] =
    useState(
      product?.featured ??
        false
    );

  const [
    attributeValues,
    setAttributeValues,
  ] =
    useState<
      Record<
        string,
        string
      >
    >(
      buildInitialAttributeState(
        product?.attributes
      )
    );


  /* =======================================================
     CURRENT CATEGORY
     ======================================================= */

  const selectedCategory =
    categories.find(
      (category) =>
        String(
          category.id
        ) ===
        categoryId
    );

  const currentFields =
    selectedCategory
      ? CATEGORY_FIELDS[
          selectedCategory.slug
        ] ?? []
      : [];


  /* =======================================================
     ATTRIBUTES JSON
     ======================================================= */

  const attributesJson =
    useMemo(() => {
      /*
       * Conserviamo eventuali
       * metadati custom non gestiti
       * dal form.
       */

      const output:
        Record<
          string,
          unknown
        > = {
          ...(
            product?.attributes ??
            {}
          ),
        };

      /*
       * Togliamo tutti gli attributi
       * standard conosciuti.
       *
       * In questo modo:
       * - se cambio categoria non
       *   rimangono attributi vecchi
       * - se svuoto un campo viene
       *   realmente eliminato
       */

      const knownKeys =
        new Set(
          Object.values(
            CATEGORY_FIELDS
          ).flatMap(
            (fields) =>
              fields.map(
                (field) =>
                  field.key
              )
          )
        );

      knownKeys.forEach(
        (key) => {
          delete output[
            key
          ];
        }
      );

      /*
       * Reinseriamo soltanto i
       * metadati della categoria
       * selezionata.
       */

      currentFields.forEach(
        (field) => {
          const value =
            (
              attributeValues[
                field.key
              ] ??
              ""
            ).trim();

          if (!value) {
            return;
          }

          if (
            field.multiple
          ) {
            output[
              field.key
            ] =
              splitMultipleValue(
                value
              );

            return;
          }

          output[
            field.key
          ] =
            value;
        }
      );

      return JSON.stringify(
        output
      );
    }, [
      attributeValues,
      currentFields,
      product?.attributes,
    ]);


  /* =======================================================
     NAME / SLUG
     ======================================================= */

  function handleNameChange(
    value: string
  ) {
    setName(
      value
    );

    if (
      mode ===
        "create" &&
      !slugTouched
    ) {
      setSlug(
        slugify(
          value
        )
      );
    }
  }


  /* =======================================================
     ATTRIBUTE
     ======================================================= */

  function setAttribute(
    key: string,
    value: string
  ) {
    setAttributeValues(
      (current) => ({
        ...current,
        [key]:
          value,
      })
    );
  }


  return (
    <form
      action={
        action
      }
      method="post"
      className="grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_370px]"
    >

      {/* REQUIRED BY EXISTING API */}

      <input
        type="hidden"
        name="attributes_json"
        value={
          attributesJson
        }
      />


      {/* =====================================================
          LEFT COLUMN
          ===================================================== */}

      <div className="space-y-6">

        {/* ===================================================
            IDENTITY
            =================================================== */}

        <FormPanel
          number="01"
          eyebrow="Identità"
          title="Informazioni prodotto"
          description="Nome, marca, categoria e testi mostrati nel catalogo."
        >

          <div className="grid gap-5 lg:grid-cols-2">

            <Field
              label="Nome prodotto"
              required
              className="lg:col-span-2"
            >
              <input
                name="name"
                required
                value={
                  name
                }
                onChange={(
                  event
                ) =>
                  handleNameChange(
                    event
                      .target
                      .value
                  )
                }
                placeholder="Es. Sony A7 IV"
                className={
                  inputClass
                }
              />
            </Field>


            <Field
              label="Marca"
            >
              <input
                name="brand"
                value={
                  brand
                }
                onChange={(
                  event
                ) =>
                  setBrand(
                    event
                      .target
                      .value
                  )
                }
                placeholder="Es. Sony"
                className={
                  inputClass
                }
              />
            </Field>


            <Field
              label="Categoria"
              required
            >
              <select
                name="category_id"
                required
                value={
                  categoryId
                }
                onChange={(
                  event
                ) =>
                  setCategoryId(
                    event
                      .target
                      .value
                  )
                }
                className={
                  inputClass
                }
              >
                <option value="">
                  Seleziona categoria
                </option>

                {categories.map(
                  (
                    category
                  ) => (
                    <option
                      key={
                        category.id
                      }
                      value={
                        category.id
                      }
                    >
                      {
                        category.name
                      }
                    </option>
                  )
                )}
              </select>
            </Field>


            <Field
              label="Slug"
              hint="URL del prodotto"
              required
              className="lg:col-span-2"
            >
              <div className="flex overflow-hidden rounded-[15px] border border-black/10 bg-[#f6f5f0] focus-within:border-[#ff5a1f]/45 focus-within:bg-white focus-within:shadow-[0_0_0_4px_rgba(255,90,31,0.06)]">

                <div className="flex items-center border-r border-black/10 px-4 text-[14px] font-medium text-black/35">
                  /prodotto/
                </div>

                <input
                  name="slug"
                  required
                  value={
                    slug
                  }
                  onChange={(
                    event
                  ) => {
                    setSlugTouched(
                      true
                    );

                    setSlug(
                      slugify(
                        event
                          .target
                          .value
                      )
                    );
                  }}
                  className="h-[58px] min-w-0 flex-1 bg-transparent px-4 text-[15px] outline-none"
                />
              </div>
            </Field>


            <Field
              label="Descrizione breve"
              hint="Testo principale della scheda"
              className="lg:col-span-2"
            >
              <input
                name="short_description"
                defaultValue={
                  product?.short_description ??
                  ""
                }
                placeholder="Descrizione sintetica del prodotto"
                className={
                  inputClass
                }
              />
            </Field>


            <Field
              label="Descrizione completa"
              className="lg:col-span-2"
            >
              <textarea
                name="description"
                rows={6}
                defaultValue={
                  product?.description ??
                  ""
                }
                placeholder="Descrivi utilizzo, caratteristiche e punti di forza del prodotto."
                className={
                  textareaClass
                }
              />
            </Field>

          </div>
        </FormPanel>


        {/* ===================================================
            COMMERCIAL
            =================================================== */}

        <FormPanel
          number="02"
          eyebrow="Rental"
          title="Tariffe interne"
          description="La tariffa giornaliera è pubblica. La cauzione resta un dato gestionale interno."
        >

          <div className="grid gap-5 sm:grid-cols-2">

            <Field
              label="Prezzo / giorno"
              required
            >
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[16px] font-semibold text-black/35">
                  €
                </span>

                <input
                  name="price_day"
                  type="number"
                  step="0.01"
                  min="0"
                  required
                  defaultValue={
                    Number(
                      product?.price_day ??
                        0
                    )
                  }
                  className={`${inputClass} pl-10`}
                />
              </div>
            </Field>


            <Field
              label="Cauzione interna"
              hint="Non mostrata sul sito"
              required
            >
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[16px] font-semibold text-black/35">
                  €
                </span>

                <input
                  name="deposit"
                  type="number"
                  step="0.01"
                  min="0"
                  required
                  defaultValue={
                    Number(
                      product?.deposit ??
                        0
                    )
                  }
                  className={`${inputClass} pl-10`}
                />
              </div>
            </Field>

          </div>


          <div className="mt-5 rounded-[16px] bg-[#f3f2ed] px-5 py-4">
            <div className="flex items-start gap-3">
              <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#fff0e9] text-[12px] font-bold text-[#ff5a1f]">
                i
              </div>

              <p className="text-[14px] leading-6 text-black/50">
                La cauzione rimane disponibile
                nell&apos;area admin ma non viene
                pubblicata nella scheda prodotto.
                Le condizioni vengono comunicate
                al cliente prima della conferma.
              </p>
            </div>
          </div>

        </FormPanel>


        {/* ===================================================
            IMAGE
            =================================================== */}

        <FormPanel
          number="03"
          eyebrow="Media"
          title="Immagine prodotto"
          description="Usa un'immagine pulita e leggibile, preferibilmente con il prodotto ben isolato."
        >

          <Field
            label="URL immagine"
          >
            <input
              name="image_url"
              type="url"
              value={
                imageUrl
              }
              onChange={(
                event
              ) =>
                setImageUrl(
                  event
                    .target
                    .value
                )
              }
              placeholder="https://..."
              className={
                inputClass
              }
            />
          </Field>

        </FormPanel>


        {/* ===================================================
            STRUCTURED METADATA
            =================================================== */}

        <FormPanel
          number="04"
          eyebrow="Metadata"
          title="Specifiche strutturate"
          description="Questi campi alimentano filtri, ricerca e scheda tecnica del catalogo."
        >

          {!selectedCategory ? (
            <div className="rounded-[18px] border border-dashed border-black/15 bg-[#f6f5f0] p-6 text-[14px] leading-6 text-black/45">
              Seleziona prima una categoria
              per visualizzare i metadati
              tecnici disponibili.
            </div>
          ) : currentFields.length ===
            0 ? (
            <div className="rounded-[18px] border border-dashed border-black/15 bg-[#f6f5f0] p-6 text-[14px] leading-6 text-black/45">
              Nessun campo strutturato
              configurato per questa
              categoria.
            </div>
          ) : (
            <div className="grid gap-5 sm:grid-cols-2">

              {currentFields.map(
                (
                  field
                ) => (
                  <Field
                    key={
                      field.key
                    }
                    label={
                      field.label
                    }
                    hint={
                      field.multiple
                        ? "Separa più valori con una virgola"
                        : undefined
                    }
                  >
                    <input
                      value={
                        attributeValues[
                          field.key
                        ] ?? ""
                      }
                      onChange={(
                        event
                      ) =>
                        setAttribute(
                          field.key,
                          event
                            .target
                            .value
                        )
                      }
                      placeholder={
                        field.placeholder
                      }
                      className={
                        inputClass
                      }
                    />
                  </Field>
                )
              )}

            </div>
          )}

        </FormPanel>


        {/* ===================================================
            CONTENT
            =================================================== */}

        <FormPanel
          number="05"
          eyebrow="Scheda"
          title="Dettagli e contenuto kit"
          description="Una voce per riga. Verranno mostrate come elementi separati nella scheda prodotto."
        >

          <div className="grid gap-5 lg:grid-cols-2">

            <Field
              label="Dettagli tecnici"
              hint="Una specifica per riga"
            >
              <textarea
                name="specs"
                rows={8}
                defaultValue={(
                  product?.specs ??
                  []
                ).join(
                  "\n"
                )}
                placeholder={
                  "Registrazione 4K 60p\nStabilizzazione 5 assi\nDoppio slot SD"
                }
                className={
                  textareaClass
                }
              />
            </Field>


            <Field
              label="Contenuto del kit"
              hint="Un elemento per riga"
            >
              <textarea
                name="includes"
                rows={8}
                defaultValue={(
                  product?.includes ??
                  []
                ).join(
                  "\n"
                )}
                placeholder={
                  "Corpo camera\n2 batterie\nCaricabatterie"
                }
                className={
                  textareaClass
                }
              />
            </Field>

          </div>
        </FormPanel>

      </div>


      {/* =====================================================
          SIDEBAR
          ===================================================== */}

      <aside className="space-y-5 xl:sticky xl:top-[110px]">

        {/* PREVIEW */}

        <div className="overflow-hidden rounded-[24px] border border-black/10 bg-white">

          <div className="border-b border-black/10 px-5 py-4">

            <div className="text-[11px] font-bold uppercase tracking-[0.11em] text-[#ff5a1f]">
              Preview
            </div>

            <div className="mt-1 text-[18px] font-semibold">
              Scheda catalogo
            </div>

          </div>


          <div className="flex aspect-[4/3] items-center justify-center bg-[#f0efe9] p-6">

            {imageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={
                  imageUrl
                }
                alt=""
                className="h-full w-full object-contain"
              />
            ) : (
              <div className="text-center">
                <div className="text-[12px] font-black uppercase tracking-[0.13em] text-black/20">
                  LAP GEAR
                </div>

                <div className="mt-2 text-[13px] text-black/30">
                  Nessuna immagine
                </div>
              </div>
            )}

          </div>


          <div className="p-5">

            {brand && (
              <div className="text-[11px] font-bold uppercase tracking-[0.1em] text-[#ff5a1f]">
                {
                  brand
                }
              </div>
            )}

            <div className="mt-1 break-words text-[25px] font-semibold leading-tight tracking-[-0.04em]">
              {name ||
                "Nome prodotto"}
            </div>

            <div className="mt-4 flex flex-wrap gap-2">

              {selectedCategory && (
                <SmallBadge>
                  {
                    selectedCategory.name
                  }
                </SmallBadge>
              )}

              {active ? (
                <SmallBadge
                  success
                >
                  Pubblicato
                </SmallBadge>
              ) : (
                <SmallBadge>
                  Nascosto
                </SmallBadge>
              )}

              {featured && (
                <SmallBadge
                  accent
                >
                  In evidenza
                </SmallBadge>
              )}

            </div>
          </div>
        </div>


        {/* PUBLISHING */}

        <div className="overflow-hidden rounded-[24px] bg-[#181818] p-6 text-white">

          <div className="text-[11px] font-bold uppercase tracking-[0.11em] text-[#ff7b4a]">
            Pubblicazione
          </div>

          <h3 className="mt-2 text-[24px] font-semibold tracking-[-0.035em]">
            Stato prodotto.
          </h3>


          <div className="mt-6 space-y-3">

            <ToggleRow
              checked={
                active
              }
              onChange={
                setActive
              }
              title="Pubblicato"
              text="Visibile nel catalogo pubblico"
            >
              <input
                type="checkbox"
                name="active"
                value="true"
                checked={
                  active
                }
                onChange={(
                  event
                ) =>
                  setActive(
                    event
                      .target
                      .checked
                  )
                }
                className="sr-only"
              />
            </ToggleRow>


            <ToggleRow
              checked={
                featured
              }
              onChange={
                setFeatured
              }
              title="In evidenza"
              text="Può comparire nelle selezioni della Home"
            >
              <input
                type="checkbox"
                name="featured"
                value="true"
                checked={
                  featured
                }
                onChange={(
                  event
                ) =>
                  setFeatured(
                    event
                      .target
                      .checked
                  )
                }
                className="sr-only"
              />
            </ToggleRow>

          </div>
        </div>


        {/* SAVE */}

        <div className="rounded-[24px] border border-black/10 bg-white p-5">

          <button
            type="submit"
            className="flex h-[60px] w-full items-center justify-center rounded-[16px] bg-[#ff5a1f] px-6 text-[16px] font-semibold text-white transition hover:bg-[#181818]"
          >
            {
              submitLabel
            } →
          </button>


          <Link
            href="/admin/prodotti"
            className="mt-3 flex h-[54px] w-full items-center justify-center rounded-[15px] border border-black/10 bg-[#f3f2ed] px-5 text-[14px] font-semibold text-black/55 transition hover:border-black/25 hover:bg-white hover:text-black"
          >
            Annulla
          </Link>


          <p className="mt-4 text-center text-[12px] leading-5 text-black/35">
            Le unità fisiche vengono
            gestite separatamente
            nell&apos;Inventario.
          </p>

        </div>

      </aside>
    </form>
  );
}


/* =========================================================
   FORM PANEL
   ========================================================= */

function FormPanel({
  number,
  eyebrow,
  title,
  description,
  children,
}: {
  number: string;
  eyebrow: string;
  title: string;
  description:
    string;
  children:
    React.ReactNode;
}) {
  return (
    <section className="overflow-hidden rounded-[25px] border border-black/10 bg-white">

      <div className="flex gap-4 border-b border-black/10 bg-[#fbfaf7] p-6 sm:p-7">

        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#fff0e9] text-[12px] font-bold text-[#ff5a1f]">
          {
            number
          }
        </div>

        <div>
          <div className="text-[11px] font-bold uppercase tracking-[0.11em] text-[#ff5a1f]">
            {
              eyebrow
            }
          </div>

          <h2 className="mt-1 text-[25px] font-semibold tracking-[-0.04em]">
            {
              title
            }
          </h2>

          <p className="mt-2 max-w-[700px] text-[14px] leading-6 text-black/45">
            {
              description
            }
          </p>
        </div>

      </div>


      <div className="p-6 sm:p-7">
        {
          children
        }
      </div>

    </section>
  );
}


/* =========================================================
   FIELD
   ========================================================= */

function Field({
  label,
  hint,
  required = false,
  className = "",
  children,
}: {
  label: string;
  hint?: string;
  required?: boolean;
  className?: string;
  children:
    React.ReactNode;
}) {
  return (
    <label
      className={`block ${className}`}
    >
      <div className="mb-2 flex items-center justify-between gap-3">

        <span className="text-[13px] font-semibold text-black/60">
          {
            label
          }

          {required && (
            <span className="ml-1 text-[#ff5a1f]">
              *
            </span>
          )}
        </span>

        {hint && (
          <span className="text-[11px] font-medium text-black/30">
            {
              hint
            }
          </span>
        )}

      </div>

      {
        children
      }
    </label>
  );
}


/* =========================================================
   TOGGLE
   ========================================================= */

function ToggleRow({
  checked,
  onChange,
  title,
  text,
  children,
}: {
  checked: boolean;
  onChange: (
    value: boolean
  ) => void;
  title: string;
  text: string;
  children:
    React.ReactNode;
}) {
  return (
    <label className="flex cursor-pointer items-center justify-between gap-5 rounded-[17px] border border-white/10 bg-white/[0.06] p-4 transition hover:bg-white/[0.09]">

      {
        children
      }

      <div>
        <div className="text-[14px] font-semibold">
          {
            title
          }
        </div>

        <div className="mt-1 text-[12px] leading-5 text-white/38">
          {
            text
          }
        </div>
      </div>


      <button
        type="button"
        onClick={(
          event
        ) => {
          event.preventDefault();

          onChange(
            !checked
          );
        }}
        className={`relative h-7 w-12 shrink-0 rounded-full transition ${
          checked
            ? "bg-[#ff5a1f]"
            : "bg-white/15"
        }`}
      >
        <span
          className={`absolute top-1 h-5 w-5 rounded-full bg-white transition ${
            checked
              ? "left-6"
              : "left-1"
          }`}
        />
      </button>

    </label>
  );
}


/* =========================================================
   BADGE
   ========================================================= */

function SmallBadge({
  children,
  success = false,
  accent = false,
}: {
  children:
    React.ReactNode;
  success?: boolean;
  accent?: boolean;
}) {
  return (
    <span
      className={`rounded-full px-3 py-1.5 text-[11px] font-bold ${
        success
          ? "bg-[#e9f6ee] text-[#168a50]"
          : accent
            ? "bg-[#fff0e9] text-[#e94b12]"
            : "bg-[#f1f0ea] text-black/45"
      }`}
    >
      {
        children
      }
    </span>
  );
}


/* =========================================================
   STYLES
   ========================================================= */

const inputClass =
  "h-[58px] w-full rounded-[15px] border border-black/10 bg-[#f6f5f0] px-4 text-[15px] outline-none transition placeholder:text-black/25 focus:border-[#ff5a1f]/45 focus:bg-white focus:shadow-[0_0_0_4px_rgba(255,90,31,0.06)]";


const textareaClass =
  "min-h-[150px] w-full resize-y rounded-[15px] border border-black/10 bg-[#f6f5f0] px-4 py-4 text-[15px] leading-7 outline-none transition placeholder:text-black/25 focus:border-[#ff5a1f]/45 focus:bg-white focus:shadow-[0_0_0_4px_rgba(255,90,31,0.06)]";


export default ProductForm;