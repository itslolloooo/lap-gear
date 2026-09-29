import Link from "next/link";



import {

  redirect,

} from "next/navigation";



import {

  requireAdminAccess,

} from "@/lib/admin-auth";



import {

  getServerSupabase,

} from "@/lib/supabase-server";





export const dynamic =

  "force-dynamic";





type Category = {

  id: number;

  name: string;

  slug: string;

};





type ProductUnit = {

  id: number;



  status:

    | "available"

    | "maintenance"

    | "retired";

};





type AdminProduct = {

  id: number;



  slug: string;



  name: string;



  price_day:

    | number

    | string;



  deposit:

    | number

    | string;



  active: boolean;



  featured: boolean;



  brand:

    | string

    | null;



  image_url:

    | string

    | null;



  attributes:

    | Record<

        string,

        unknown

      >

    | null;



  categories:

    | Category

    | Category[]

    | null;



  product_units:

    | ProductUnit[]

    | null;

};





type SearchParams = {

  q?: string;

  stato?: string;

};





/* =========================================================

   HELPERS

   ========================================================= */



function getCategory(

  value:

    | Category

    | Category[]

    | null

) {

  if (!value) {

    return null;

  }



  if (

    Array.isArray(

      value

    )

  ) {

    return (

      value[0] ??

      null

    );

  }



  return value;

}





function hasAttributes(

  attributes:

    | Record<

        string,

        unknown

      >

    | null

) {

  if (!attributes) {

    return false;

  }



  return Object.values(

    attributes

  ).some(

    (value) => {

      if (

        Array.isArray(

          value

        )

      ) {

        return (

          value.length >

          0

        );

      }



      return (

        value !== null &&

        value !==

          undefined &&

        String(

          value

        ).trim() !==

          ""

      );

    }

  );

}





function isComplete(

  product:

    AdminProduct

) {

  return Boolean(

    product.brand?.trim() &&

      product.image_url &&

      hasAttributes(

        product.attributes

      )

  );

}





function formatMoney(

  value:

    | number

    | string

) {

  const amount =

    Number(

      value

    );



  return new Intl.NumberFormat(

    "it-IT",

    {

      style:

        "currency",



      currency:

        "EUR",



      maximumFractionDigits:

        amount % 1 ===

        0

          ? 0

          : 2,

    }

  ).format(

    amount

  );

}





/* =========================================================

   PAGE

   ========================================================= */



export default async function AdminProductsPage({

  searchParams,

}: {

  searchParams?: Promise<SearchParams>;

}) {



  /* =======================================================

     ADMIN AUTH

     ======================================================= */



  const access =

    await requireAdminAccess([

      "admin",

      "operator",

      "viewer",

    ]);



  if (!access) {

    redirect(

      "/admin/login"

    );

  }



  const roleLabel =

    access.profile.role ===

      "admin"

      ? "Admin"

      : access.profile.role ===

          "operator"

        ? "Operatore"

        : "Viewer";



  /*
   * Le sottopagine /prodotti/nuovo e /prodotti/[id]
   * usano ancora il vecchio guard ADMIN_USER_ID.
   * Per ora l'editing rimane all'Owner; gli altri ruoli
   * possono consultare catalogo, prezzi e metadati.
   */

  const canEditProducts =

    access.isOwner;





  /* =======================================================

     SUPABASE

     ======================================================= */



  const supabase =

    getServerSupabase();



  if (!supabase) {

    throw new Error(

      "Supabase non configurato."

    );

  }





  /* =======================================================

     PRODUCTS

     ======================================================= */



  const {

    data,

    error,

  } =

    await supabase

      .from(

        "products"

      )

      .select(

        `

          id,

          slug,

          name,

          price_day,

          deposit,

          active,

          featured,

          brand,

          image_url,

          attributes,



          categories (

            id,

            name,

            slug

          ),



          product_units (

            id,

            status

          )

        `

      )

      .order(

        "name",

        {

          ascending:

            true,

        }

      );



  if (error) {

    throw new Error(

      error.message

    );

  }



  const products =

    (

      data ?? []

    ) as unknown as AdminProduct[];





  /* =======================================================

     SEARCH PARAMS

     ======================================================= */



  const params =

    searchParams

      ? await searchParams

      : {};



  const query =

    (

      params.q ??

      ""

    )

      .trim()

      .toLowerCase();



  const status =

    params.stato ??

    "tutti";





  /* =======================================================

     STATS

     ======================================================= */



  const totalProducts =

    products.length;



  const activeProducts =

    products.filter(

      (product) =>

        product.active

    ).length;



  const featuredProducts =

    products.filter(

      (product) =>

        product.featured

    ).length;



  const incompleteProducts =

    products.filter(

      (product) =>

        !isComplete(

          product

        )

    ).length;



  const totalUnits =

    products.reduce(

      (

        total,

        product

      ) =>

        total +

        (

          product.product_units

            ?.length ??

          0

        ),

      0

    );





  /* =======================================================

     FILTERING

     ======================================================= */



  const filteredProducts =

    products.filter(

      (product) => {

        const category =

          getCategory(

            product.categories

          );



        const searchable =

          [

            product.name,

            product.slug,

            product.brand,

            category?.name,

          ]

            .filter(

              Boolean

            )

            .join(" ")

            .toLowerCase();



        const queryOk =

          !query ||

          searchable.includes(

            query

          );



        let statusOk =

          true;



        switch (

          status

        ) {

          case "attivi":

            statusOk =

              product.active;

            break;



          case "nascosti":

            statusOk =

              !product.active;

            break;



          case "featured":

            statusOk =

              product.featured;

            break;



          case "incompleti":

            statusOk =

              !isComplete(

                product

              );

            break;

        }



        return (

          queryOk &&

          statusOk

        );

      }

    );





  /* =======================================================

     RENDER

     ======================================================= */



  return (

    <main className="min-h-screen bg-[#ebeae4] px-5 pb-16 pt-6 text-[#111111] sm:px-8 lg:px-10 lg:pb-20 xl:px-14">



      <div className="mx-auto max-w-[1680px]">



        {/* =================================================

            HERO

            ================================================= */}



        <section className="overflow-hidden rounded-[30px] border border-black/10 bg-white shadow-[0_18px_60px_rgba(0,0,0,0.06)]">



          <div className="grid xl:grid-cols-[1fr_430px]">



            {/* LEFT */}



            <div className="relative overflow-hidden p-8 sm:p-10 lg:p-12">



              <div className="pointer-events-none absolute -right-36 -top-40 h-[420px] w-[420px] rounded-full bg-[#ff5a1f]/[0.07]" />



              <div className="relative">



                <div className="inline-flex items-center gap-2.5 rounded-full bg-[#fff0e9] px-4 py-2 text-[13px] font-bold uppercase tracking-[0.12em] text-[#e94b12]">



                  <span className="h-2 w-2 rounded-full bg-[#ff5a1f]" />



                  LAP GEAR / {roleLabel}

                </div>



                <h1 className="mt-7 text-[53px] font-semibold leading-[0.9] tracking-[-0.062em] sm:text-[68px] lg:text-[78px]">



                  Gestisci

                  <br />



                  <span className="text-[#ff5a1f]">

                    i prodotti.

                  </span>

                </h1>



                <p className="mt-7 max-w-[700px] text-[18px] leading-8 text-black/55">

                  Catalogo, prezzi,

                  metadati tecnici e

                  visibilità pubblica

                  dell’attrezzatura.

                </p>





                {/* ACTIONS */}



                <div className="mt-8 flex flex-col gap-3 sm:flex-row">



                  {canEditProducts ? (

                    <Link

                      href="/admin/prodotti/nuovo"

                      className="flex h-[58px] items-center justify-center gap-3 rounded-[16px] bg-[#181818] px-6 text-[15px] font-semibold text-white transition hover:bg-[#ff5a1f]"

                    >

                      <span className="text-[20px]">

                        +

                      </span>



                      Nuovo prodotto

                    </Link>

                  ) : (

                    <div className="flex h-[58px] items-center justify-center rounded-[16px] border border-black/10 bg-[#f1f0ea] px-6 text-[14px] font-semibold text-black/45">

                      Consultazione catalogo

                    </div>

                  )}



                  <Link

                    href="/admin"

                    className="flex h-[58px] items-center justify-center rounded-[16px] border border-black/10 bg-[#f1f0ea] px-6 text-[15px] font-semibold text-black/60 transition hover:border-black/25 hover:bg-white hover:text-black"

                  >

                    ← Dashboard

                  </Link>



                </div>

              </div>

            </div>





            {/* RIGHT */}



            <div className="relative overflow-hidden bg-[#181818] p-8 text-white sm:p-10">



              <div className="pointer-events-none absolute -right-24 -top-24 h-[260px] w-[260px] rounded-full bg-[#ff5a1f]/20" />



              <div className="relative">



                <div className="text-[12px] font-bold uppercase tracking-[0.13em] text-[#ff7b4a]">

                  Catalog Control

                </div>



                <div className="mt-3 text-[31px] font-semibold leading-tight tracking-[-0.045em]">

                  Stato

                  <br />

                  catalogo.

                </div>





                <div className="mt-8 grid grid-cols-2 gap-3">



                  <HeroStat

                    value={

                      totalProducts

                    }

                    label="Prodotti"

                  />



                  <HeroStat

                    value={

                      totalUnits

                    }

                    label="Unità fisiche"

                  />



                  <HeroStat

                    value={

                      activeProducts

                    }

                    label="Pubblicati"

                  />



                  <HeroStat

                    value={

                      incompleteProducts

                    }

                    label="Da completare"

                    warning={

                      incompleteProducts >

                      0

                    }

                  />



                </div>

              </div>

            </div>

          </div>

        </section>





        {/* =================================================

            STATS

            ================================================= */}



        <section className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">



          <StatCard

            number="01"

            label="Catalogo"

            value={

              totalProducts

            }

            detail="prodotti totali"

          />



          <StatCard

            number="02"

            label="Pubblicati"

            value={

              activeProducts

            }

            detail="visibili sul sito"

          />



          <StatCard

            number="03"

            label="In evidenza"

            value={

              featuredProducts

            }

            detail="selezione Home"

          />



          <StatCard

            number="04"

            label="Metadati"

            value={

              incompleteProducts

            }

            detail="schede da completare"

            accent={

              incompleteProducts >

              0

            }

          />



        </section>





        {/* =================================================

            FILTERS

            ================================================= */}



        <section className="mt-6 overflow-hidden rounded-[24px] border border-black/10 bg-white">



          <form

            method="get"

            className="grid gap-3 p-5 lg:grid-cols-[1fr_240px_auto]"

          >



            {/* SEARCH */}



            <div className="relative">



              <span className="pointer-events-none absolute left-5 top-1/2 -translate-y-1/2 text-[18px] text-black/30">

                ⌕

              </span>



              <input

                type="search"

                name="q"

                defaultValue={

                  params.q ??

                  ""

                }

                placeholder="Cerca prodotto, marca, categoria..."

                className="h-[58px] w-full rounded-[16px] border border-black/10 bg-[#f5f4ef] pl-13 pr-4 text-[15px] outline-none transition placeholder:text-black/30 focus:border-[#ff5a1f]/45 focus:bg-white focus:shadow-[0_0_0_4px_rgba(255,90,31,0.06)]"

              />



            </div>





            {/* STATUS */}



            <select

              name="stato"

              defaultValue={

                status

              }

              className="h-[58px] rounded-[16px] border border-black/10 bg-[#f5f4ef] px-4 text-[15px] font-semibold outline-none transition focus:border-[#ff5a1f]/45 focus:bg-white"

            >

              <option value="tutti">

                Tutti i prodotti

              </option>



              <option value="attivi">

                Solo pubblicati

              </option>



              <option value="nascosti">

                Solo nascosti

              </option>



              <option value="featured">

                In evidenza

              </option>



              <option value="incompleti">

                Metadati incompleti

              </option>

            </select>





            {/* SUBMIT */}



            <button

              type="submit"

              className="h-[58px] rounded-[16px] bg-[#181818] px-7 text-[15px] font-semibold text-white transition hover:bg-[#ff5a1f]"

            >

              Filtra

            </button>

          </form>





          {(query ||

            status !==

              "tutti") && (

            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-black/10 bg-[#f5f4ef] px-5 py-3">



              <div className="text-[13px] font-medium text-black/45">

                {

                  filteredProducts.length

                }{" "}

                {filteredProducts.length ===

                1

                  ? "risultato"

                  : "risultati"}

              </div>



              <Link

                href="/admin/prodotti"

                className="text-[13px] font-semibold text-[#ff5a1f]"

              >

                Rimuovi filtri

              </Link>



            </div>

          )}

        </section>





        {/* =================================================

            PRODUCTS HEADER

            ================================================= */}



        <div className="flex flex-col gap-4 pb-5 pt-10 sm:flex-row sm:items-end sm:justify-between">



          <div>

            <div className="text-[13px] font-bold uppercase tracking-[0.13em] text-[#ff5a1f]">

              Equipment Library

            </div>



            <h2 className="mt-2 text-[40px] font-semibold tracking-[-0.052em] sm:text-[48px]">

              Prodotti.

            </h2>

          </div>



          <div className="text-[14px] font-medium text-black/45">

            {

              filteredProducts.length

            }{" "}

            di{" "}

            {

              totalProducts

            }

          </div>



        </div>





        {/* =================================================

            PRODUCTS LIST

            ================================================= */}



        {filteredProducts.length >

        0 ? (

          <section className="overflow-hidden rounded-[26px] border border-black/10 bg-white">



            <div className="hidden grid-cols-[minmax(0,1fr)_140px_150px_170px] border-b border-black/10 bg-[#f3f2ed] px-6 py-4 text-[11px] font-bold uppercase tracking-[0.1em] text-black/35 xl:grid">



              <div>

                Prodotto

              </div>



              <div>

                Tariffa

              </div>



              <div>

                Inventario

              </div>



              <div className="text-right">

                Gestione

              </div>

            </div>





            <div className="divide-y divide-black/10">



              {filteredProducts.map(

                (

                  product

                ) => {

                  const category =

                    getCategory(

                      product.categories

                    );



                  const units =

                    product.product_units ??

                    [];



                  const availableUnits =

                    units.filter(

                      (

                        unit

                      ) =>

                        unit.status ===

                        "available"

                    ).length;



                  const maintenanceUnits =

                    units.filter(

                      (

                        unit

                      ) =>

                        unit.status ===

                        "maintenance"

                    ).length;



                  const complete =

                    isComplete(

                      product

                    );



                  return (

                    <article

                      key={

                        product.id

                      }

                      className="group p-5 transition hover:bg-[#fcfbf8] sm:p-6"

                    >



                      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_140px_150px_170px] xl:items-center">



                        {/* =================================

                            PRODUCT

                            ================================= */}



                        <div className="flex min-w-0 items-center gap-5">



                          {/* IMAGE */}



                          <div className="flex h-[104px] w-[118px] shrink-0 items-center justify-center overflow-hidden rounded-[17px] bg-[#f0efe9]">



                            {product.image_url ? (

                              // eslint-disable-next-line @next/next/no-img-element

                              <img

                                src={

                                  product.image_url

                                }

                                alt={

                                  product.name

                                }

                                className="h-full w-full object-contain p-3"

                              />

                            ) : (

                              <span className="text-[10px] font-bold uppercase tracking-[0.1em] text-black/20">

                                LAP GEAR

                              </span>

                            )}



                          </div>





                          {/* INFO */}



                          <div className="min-w-0">



                            <div className="flex flex-wrap items-center gap-2">



                              {category && (

                                <span className="rounded-full bg-[#f0efe9] px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.07em] text-black/45">

                                  {

                                    category.name

                                  }

                                </span>

                              )}



                              {product.active ? (

                                <StatusBadge

                                  type="active"

                                >

                                  Pubblicato

                                </StatusBadge>

                              ) : (

                                <StatusBadge

                                  type="hidden"

                                >

                                  Nascosto

                                </StatusBadge>

                              )}



                              {product.featured && (

                                <StatusBadge

                                  type="featured"

                                >

                                  In evidenza

                                </StatusBadge>

                              )}



                            </div>





                            {product.brand && (

                              <div className="mt-3 text-[12px] font-bold uppercase tracking-[0.1em] text-[#ff5a1f]">

                                {

                                  product.brand

                                }

                              </div>

                            )}





                            <h3 className="mt-1 truncate text-[26px] font-semibold leading-tight tracking-[-0.04em]">

                              {

                                product.name

                              }

                            </h3>





                            <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-2 text-[12px] font-medium text-black/38">



                              <span>

                                #{product.id}

                              </span>



                              <span>

                                /{

                                  product.slug

                                }

                              </span>



                              <span

                                className={

                                  complete

                                    ? "text-[#168a50]"

                                    : "text-[#d96a24]"

                                }

                              >

                                {complete

                                  ? "● Metadati completi"

                                  : "● Scheda da completare"}

                              </span>



                            </div>

                          </div>

                        </div>





                        {/* =================================

                            PRICE

                            ================================= */}



                        <div className="grid grid-cols-2 gap-3 sm:max-w-[320px] xl:block xl:max-w-none">



                          <div>

                            <div className="text-[11px] font-bold uppercase tracking-[0.08em] text-black/35 xl:hidden">

                              Tariffa

                            </div>



                            <div className="mt-1 text-[22px] font-semibold tracking-[-0.035em]">

                              {

                                formatMoney(

                                  product.price_day

                                )

                              }

                            </div>



                            <div className="mt-1 text-[12px] text-black/38">

                              / giorno

                            </div>

                          </div>





                          <div className="xl:mt-4">

                            <div className="text-[11px] font-bold uppercase tracking-[0.08em] text-black/35">

                              Cauzione interna

                            </div>



                            <div className="mt-1 text-[14px] font-semibold text-black/55">

                              {

                                formatMoney(

                                  product.deposit

                                )

                              }

                            </div>

                          </div>



                        </div>





                        {/* =================================

                            INVENTORY

                            ================================= */}



                        <div>



                          <div className="text-[11px] font-bold uppercase tracking-[0.08em] text-black/35 xl:hidden">

                            Inventario

                          </div>



                          <div className="mt-1 text-[22px] font-semibold tracking-[-0.035em]">

                            {

                              units.length

                            }{" "}

                            {units.length ===

                            1

                              ? "unità"

                              : "unità"}

                          </div>



                          <div className="mt-2 space-y-1 text-[12px] font-medium">



                            <div className="flex items-center gap-2 text-[#168a50]">

                              <span className="h-2 w-2 rounded-full bg-[#168a50]" />



                              {

                                availableUnits

                              } operative

                            </div>



                            {maintenanceUnits >

                              0 && (

                              <div className="flex items-center gap-2 text-[#b97910]">

                                <span className="h-2 w-2 rounded-full bg-[#d98a08]" />



                                {

                                  maintenanceUnits

                                } manutenzione

                              </div>

                            )}



                          </div>

                        </div>





                        {/* =================================

                            ACTIONS

                            ================================= */}



                        <div className="grid grid-cols-2 gap-2 sm:flex xl:grid xl:grid-cols-1">



                          {canEditProducts && (

                            <Link

                              href={`/admin/prodotti/${product.id}`}

                              className="flex h-[48px] items-center justify-center rounded-[14px] bg-[#181818] px-4 text-[14px] font-semibold text-white transition hover:bg-[#ff5a1f]"

                            >

                              Modifica

                            </Link>

                          )}



                          <Link

                            href={`/prodotto/${product.slug}`}

                            target="_blank"

                            className="flex h-[48px] items-center justify-center rounded-[14px] border border-black/10 bg-[#f3f2ed] px-4 text-[14px] font-semibold text-black/55 transition hover:border-black/25 hover:bg-white hover:text-black"

                          >

                            Pagina ↗

                          </Link>



                        </div>

                      </div>

                    </article>

                  );

                }

              )}



            </div>

          </section>

        ) : (



          /* =================================================

             EMPTY

             ================================================= */



          <section className="overflow-hidden rounded-[28px] border border-black/10 bg-white">



            <div className="grid min-h-[380px] lg:grid-cols-[1fr_300px]">



              <div className="flex items-center p-8 sm:p-12">



                <div>

                  <div className="text-[13px] font-bold uppercase tracking-[0.13em] text-[#ff5a1f]">

                    Nessun risultato

                  </div>



                  <h2 className="mt-3 text-[42px] font-semibold leading-[0.96] tracking-[-0.052em]">

                    Nessun prodotto

                    <br />

                    corrisponde ai filtri.

                  </h2>



                  <Link

                    href="/admin/prodotti"

                    className="mt-7 inline-flex h-[56px] items-center justify-center rounded-[16px] bg-[#181818] px-6 text-[15px] font-semibold text-white transition hover:bg-[#ff5a1f]"

                  >

                    Mostra tutti

                  </Link>

                </div>

              </div>



              <div className="relative hidden overflow-hidden bg-[#181818] lg:block">



                <div className="absolute -right-20 -top-20 h-[220px] w-[220px] rounded-full bg-[#ff5a1f]/20" />



                <div className="absolute bottom-9 left-9 text-white">



                  <div className="text-[11px] font-bold uppercase tracking-[0.12em] text-[#ff7b4a]">

                    LAP GEAR

                  </div>



                  <div className="mt-2 text-[25px] font-semibold">

                    Catalog

                    <br />

                    Control.

                  </div>



                </div>

              </div>

            </div>

          </section>

        )}





        {/* =================================================

            ADMIN NOTE

            ================================================= */}



        <section className="mt-7 overflow-hidden rounded-[26px] bg-[#181818] text-white">



          <div className="grid lg:grid-cols-[1fr_auto] lg:items-center">



            <div className="p-7 sm:p-9">



              <div className="text-[12px] font-bold uppercase tracking-[0.12em] text-[#ff7b4a]">

                Inventario interno

              </div>



              <h2 className="mt-2 text-[31px] font-semibold tracking-[-0.045em]">

                Le quantità restano solo nell’area admin.

              </h2>



              <p className="mt-3 max-w-[760px] text-[14px] leading-6 text-white/45">

                Il catalogo pubblico mostra

                soltanto la verifica di

                disponibilità. Qui continui a

                vedere unità fisiche, stato e

                dati gestionali.

              </p>



            </div>



            <div className="border-t border-white/10 p-7 lg:border-l lg:border-t-0">



              <Link

                href="/admin/inventario"

                className="flex h-[56px] min-w-[230px] items-center justify-center rounded-[16px] bg-[#ff5a1f] px-6 text-[15px] font-semibold text-white transition hover:bg-white hover:text-[#181818]"

              >

                Apri inventario →

              </Link>



            </div>

          </div>

        </section>



      </div>

    </main>

  );

}





/* =========================================================

   HERO STAT

   ========================================================= */



function HeroStat({

  value,

  label,

  warning = false,

}: {

  value: number;

  label: string;

  warning?: boolean;

}) {

  return (

    <div className="rounded-[17px] border border-white/10 bg-white/[0.06] p-4">



      <div

        className={`text-[28px] font-semibold tracking-[-0.045em] ${

          warning

            ? "text-[#ff7b4a]"

            : "text-white"

        }`}

      >

        {

          value

        }

      </div>



      <div className="mt-1 text-[11px] font-semibold uppercase tracking-[0.08em] text-white/38">

        {

          label

        }

      </div>



    </div>

  );

}





/* =========================================================

   STAT CARD

   ========================================================= */



function StatCard({

  number,

  label,

  value,

  detail,

  accent = false,

}: {

  number: string;

  label: string;

  value: number;

  detail: string;

  accent?: boolean;

}) {

  return (

    <div className="relative overflow-hidden rounded-[22px] border border-black/10 bg-white p-5 sm:p-6">



      <div

        className={`absolute inset-x-0 top-0 h-[4px] ${

          accent

            ? "bg-[#ff5a1f]"

            : "bg-[#181818]"

        }`}

      />



      <div className="flex items-start justify-between gap-4">



        <div>

          <div className="text-[12px] font-bold uppercase tracking-[0.1em] text-black/35">

            {

              label

            }

          </div>



          <div className="mt-3 text-[37px] font-semibold leading-none tracking-[-0.055em]">

            {

              value

            }

          </div>



          <div className="mt-2 text-[13px] text-black/40">

            {

              detail

            }

          </div>

        </div>



        <div

          className={`flex h-9 w-9 items-center justify-center rounded-full text-[11px] font-bold ${

            accent

              ? "bg-[#fff0e9] text-[#ff5a1f]"

              : "bg-[#f1f0ea] text-black/45"

          }`}

        >

          {

            number

          }

        </div>

      </div>

    </div>

  );

}





/* =========================================================

   STATUS BADGE

   ========================================================= */



function StatusBadge({

  type,

  children,

}: {

  type:

    | "active"

    | "hidden"

    | "featured";



  children:

    React.ReactNode;

}) {

  const styles = {

    active:

      "bg-[#e9f6ee] text-[#168a50]",



    hidden:

      "bg-[#eeeeea] text-black/45",



    featured:

      "bg-[#fff0e9] text-[#e94b12]",

  };



  return (

    <span

      className={`rounded-full px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.06em] ${styles[type]}`}

    >

      {

        children

      }

    </span>

  );

}