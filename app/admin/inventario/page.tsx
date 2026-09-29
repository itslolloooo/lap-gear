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





/* =========================================================

   TYPES

   ========================================================= */



type UnitStatus =

  | "available"

  | "maintenance"

  | "retired";





type Product = {

  id: number;



  name: string;



  slug: string;



  image_url:

    | string

    | null;

};





type InventoryUnit = {

  id: number;



  asset_code: string;



  serial_number:

    | string

    | null;



  status:

    UnitStatus;



  notes:

    | string

    | null;



  products:

    | Product

    | Product[]

    | null;

};





type SearchParams = {

  q?: string;

  stato?: string;

};





/* =========================================================

   HELPERS

   ========================================================= */



function getProduct(

  value:

    InventoryUnit["products"]

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





function statusLabel(

  status:

    UnitStatus

) {

  switch (

    status

  ) {

    case "available":

      return "Operativa";



    case "maintenance":

      return "Manutenzione";



    case "retired":

      return "Ritirata";

  }

}





function statusClasses(

  status:

    UnitStatus

) {

  switch (

    status

  ) {

    case "available":

      return "bg-[#e9f6ee] text-[#168a50]";



    case "maintenance":

      return "bg-[#fff2d5] text-[#aa6b08]";



    case "retired":

      return "bg-[#eeeeea] text-black/45";

  }

}





/* =========================================================

   PAGE

   ========================================================= */



export default async function AdminInventoryPage({

  searchParams,

}: {

  searchParams?: Promise<SearchParams>;

}) {



  /* =======================================================

     AUTH

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
   * Le sottopagine /inventario/nuovo e /inventario/[id]
   * usano ancora il vecchio guard ADMIN_USER_ID.
   * Finché non le convertiamo, lasciamo l'editing soltanto
   * all'Owner per evitare link che riportano al login.
   */

  const canEditInventory =

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

     INVENTORY

     ======================================================= */



  const {

    data,

    error,

  } =

    await supabase

      .from(

        "product_units"

      )

      .select(

        `

          id,

          asset_code,

          serial_number,

          status,

          notes,



          products (

            id,

            name,

            slug,

            image_url

          )

        `

      )

      .order(

        "asset_code",

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





  const units =

    (

      data ?? []

    ) as unknown as

      InventoryUnit[];





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



  const total =

    units.length;



  const available =

    units.filter(

      (unit) =>

        unit.status ===

        "available"

    ).length;



  const maintenance =

    units.filter(

      (unit) =>

        unit.status ===

        "maintenance"

    ).length;



  const retired =

    units.filter(

      (unit) =>

        unit.status ===

        "retired"

    ).length;





  /* =======================================================

     FILTERING

     ======================================================= */



  const filteredUnits =

    units.filter(

      (unit) => {

        const product =

          getProduct(

            unit.products

          );



        const searchable =

          [

            unit.asset_code,

            unit.serial_number,

            unit.notes,

            product?.name,

            product?.slug,

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





        const statusOk =

          status ===

            "tutti" ||

          unit.status ===

            status;





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

                    l’inventario.

                  </span>

                </h1>





                <p className="mt-7 max-w-[700px] text-[18px] leading-8 text-black/55">

                  Ogni unità fisica,

                  seriale, asset code,

                  manutenzione e stato

                  operativo del gear.

                </p>





                <div className="mt-8 flex flex-col gap-3 sm:flex-row">



                  {canEditInventory ? (

                    <Link

                      href="/admin/inventario/nuovo"

                      className="flex h-[58px] items-center justify-center gap-3 rounded-[16px] bg-[#181818] px-6 text-[15px] font-semibold text-white transition hover:bg-[#ff5a1f]"

                    >

                      <span className="text-[20px]">

                        +

                      </span>



                      Nuova unità

                    </Link>

                  ) : (

                    <div className="flex h-[58px] items-center justify-center rounded-[16px] border border-black/10 bg-[#f1f0ea] px-6 text-[14px] font-semibold text-black/45">

                      Consultazione inventario

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

                  Inventory Control

                </div>



                <div className="mt-3 text-[31px] font-semibold leading-tight tracking-[-0.045em]">

                  Stato

                  <br />

                  del gear.

                </div>





                <div className="mt-8 grid grid-cols-2 gap-3">



                  <HeroStat

                    value={

                      total

                    }

                    label="Unità"

                  />



                  <HeroStat

                    value={

                      available

                    }

                    label="Operative"

                    success

                  />



                  <HeroStat

                    value={

                      maintenance

                    }

                    label="Manutenzione"

                    warning={

                      maintenance >

                      0

                    }

                  />



                  <HeroStat

                    value={

                      retired

                    }

                    label="Ritirate"

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

            label="Inventario"

            value={

              total

            }

            detail="unità fisiche totali"

          />



          <StatCard

            number="02"

            label="Operative"

            value={

              available

            }

            detail="utilizzabili per il rental"

            success

          />



          <StatCard

            number="03"

            label="Manutenzione"

            value={

              maintenance

            }

            detail="temporaneamente escluse"

            warning={

              maintenance >

              0

            }

          />



          <StatCard

            number="04"

            label="Ritirate"

            value={

              retired

            }

            detail="fuori servizio"

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

                placeholder="Cerca prodotto, asset code, seriale..."

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

                Tutti gli stati

              </option>



              <option value="available">

                Operative

              </option>



              <option value="maintenance">

                In manutenzione

              </option>



              <option value="retired">

                Ritirate

              </option>

            </select>





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

                  filteredUnits.length

                }{" "}

                {filteredUnits.length ===

                1

                  ? "unità trovata"

                  : "unità trovate"}

              </div>





              <Link

                href="/admin/inventario"

                className="text-[13px] font-semibold text-[#ff5a1f]"

              >

                Rimuovi filtri

              </Link>



            </div>

          )}



        </section>





        {/* =================================================

            LIST HEADER

            ================================================= */}



        <div className="flex flex-col gap-4 pb-5 pt-10 sm:flex-row sm:items-end sm:justify-between">



          <div>



            <div className="text-[13px] font-bold uppercase tracking-[0.13em] text-[#ff5a1f]">

              Equipment Registry

            </div>



            <h2 className="mt-2 text-[40px] font-semibold tracking-[-0.052em] sm:text-[48px]">

              Unità fisiche.

            </h2>



          </div>





          <div className="text-[14px] font-medium text-black/45">

            {

              filteredUnits.length

            }{" "}

            di{" "}

            {

              total

            }

          </div>



        </div>





        {/* =================================================

            UNITS

            ================================================= */}



        {filteredUnits.length >

        0 ? (

          <section className="overflow-hidden rounded-[26px] border border-black/10 bg-white">



            {/* TABLE HEADER */}



            <div className="hidden grid-cols-[minmax(0,1fr)_170px_170px_150px] border-b border-black/10 bg-[#f3f2ed] px-6 py-4 text-[11px] font-bold uppercase tracking-[0.1em] text-black/35 xl:grid">



              <div>

                Attrezzatura

              </div>



              <div>

                Asset code

              </div>



              <div>

                Seriale

              </div>



              <div className="text-right">

                Gestione

              </div>



            </div>





            <div className="divide-y divide-black/10">



              {filteredUnits.map(

                (

                  unit

                ) => {

                  const product =

                    getProduct(

                      unit.products

                    );



                  return (

                    <article

                      key={

                        unit.id

                      }

                      className="group p-5 transition hover:bg-[#fcfbf8] sm:p-6"

                    >



                      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_170px_170px_150px] xl:items-center">



                        {/* =================================

                            PRODUCT

                            ================================= */}



                        <div className="flex min-w-0 items-center gap-5">



                          {/* IMAGE */}



                          <div className="flex h-[94px] w-[110px] shrink-0 items-center justify-center overflow-hidden rounded-[17px] bg-[#f0efe9]">



                            {product?.image_url ? (

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

                              <div className="text-[9px] font-bold uppercase tracking-[0.1em] text-black/20">

                                LAP GEAR

                              </div>

                            )}



                          </div>





                          {/* INFO */}



                          <div className="min-w-0">



                            <div className="flex flex-wrap items-center gap-2">



                              <StatusBadge

                                status={

                                  unit.status

                                }

                              />



                              <span className="rounded-full bg-[#f1f0ea] px-3 py-1.5 text-[11px] font-bold text-black/40">

                                Unit #{unit.id}

                              </span>



                            </div>





                            <h3 className="mt-3 truncate text-[25px] font-semibold leading-tight tracking-[-0.04em]">

                              {product?.name ??

                                "Prodotto non trovato"}

                            </h3>





                            {unit.notes && (

                              <p className="mt-2 line-clamp-2 max-w-[650px] text-[13px] leading-5 text-black/42">

                                {

                                  unit.notes

                                }

                              </p>

                            )}



                          </div>

                        </div>





                        {/* =================================

                            ASSET

                            ================================= */}



                        <div>



                          <div className="text-[11px] font-bold uppercase tracking-[0.08em] text-black/35 xl:hidden">

                            Asset code

                          </div>



                          <div className="mt-1 font-mono text-[15px] font-bold text-black/70">

                            {

                              unit.asset_code

                            }

                          </div>



                        </div>





                        {/* =================================

                            SERIAL

                            ================================= */}



                        <div>



                          <div className="text-[11px] font-bold uppercase tracking-[0.08em] text-black/35 xl:hidden">

                            Numero seriale

                          </div>



                          <div className="mt-1 break-all font-mono text-[14px] font-medium text-black/55">

                            {unit.serial_number ||

                              "—"}

                          </div>



                        </div>





                        {/* =================================

                            ACTION

                            ================================= */}



                        <div className="grid grid-cols-2 gap-2 xl:grid-cols-1">



                          {canEditInventory ? (

                            <Link

                              href={`/admin/inventario/${unit.id}`}

                              className="flex h-[48px] items-center justify-center rounded-[14px] bg-[#181818] px-4 text-[14px] font-semibold text-white transition hover:bg-[#ff5a1f]"

                            >

                              Gestisci

                            </Link>

                          ) : (

                            <div className="flex h-[48px] items-center justify-center rounded-[14px] border border-black/10 bg-[#f3f2ed] px-4 text-[12px] font-semibold text-black/40">

                              Sola lettura

                            </div>

                          )}





                          {product && (

                            <Link

                              href={

                                canEditInventory

                                  ? `/admin/prodotti/${product.id}`

                                  : `/prodotto/${product.slug}`

                              }

                              className="flex h-[44px] items-center justify-center rounded-[13px] border border-black/10 bg-[#f3f2ed] px-3 text-[12px] font-semibold text-black/50 transition hover:bg-white hover:text-black"

                            >

                              {canEditInventory

                                ? "Prodotto"

                                : "Scheda"}

                            </Link>

                          )}



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

                    Inventario

                  </div>



                  <h2 className="mt-3 text-[42px] font-semibold leading-[0.96] tracking-[-0.052em]">

                    {units.length ===

                    0

                      ? "Nessuna unità registrata."

                      : "Nessuna unità corrisponde ai filtri."}

                  </h2>





                  <div className="mt-7 flex flex-wrap gap-3">



                    {units.length ===

                    0 &&

                    canEditInventory ? (

                      <Link

                        href="/admin/inventario/nuovo"

                        className="flex h-[56px] items-center justify-center rounded-[16px] bg-[#181818] px-6 text-[15px] font-semibold text-white transition hover:bg-[#ff5a1f]"

                      >

                        + Prima unità

                      </Link>

                    ) : (

                      <Link

                        href="/admin/inventario"

                        className="flex h-[56px] items-center justify-center rounded-[16px] bg-[#181818] px-6 text-[15px] font-semibold text-white transition hover:bg-[#ff5a1f]"

                      >

                        Mostra tutte

                      </Link>

                    )}



                  </div>

                </div>

              </div>





              <div className="relative hidden overflow-hidden bg-[#181818] lg:block">



                <div className="absolute -right-20 -top-20 h-[220px] w-[220px] rounded-full bg-[#ff5a1f]/20" />



                <div className="absolute bottom-9 left-9 text-white">



                  <div className="text-[11px] font-bold uppercase tracking-[0.12em] text-[#ff7b4a]">

                    LAP GEAR

                  </div>



                  <div className="mt-2 text-[25px] font-semibold">

                    Inventory

                    <br />

                    Control.

                  </div>



                </div>

              </div>



            </div>

          </section>

        )}





        {/* =================================================

            EXPLANATION

            ================================================= */}



        <section className="mt-7 overflow-hidden rounded-[26px] bg-[#181818] text-white">



          <div className="grid lg:grid-cols-[1fr_auto] lg:items-center">



            <div className="p-7 sm:p-9">



              <div className="text-[12px] font-bold uppercase tracking-[0.12em] text-[#ff7b4a]">

                Asset management

              </div>



              <h2 className="mt-2 text-[31px] font-semibold tracking-[-0.045em]">

                Un prodotto può avere più unità fisiche.

              </h2>



              <p className="mt-3 max-w-[780px] text-[14px] leading-6 text-white/45">

                Qui gestisci il singolo

                pezzo reale: asset code,

                seriale, manutenzione e

                stato operativo. Le richieste

                di noleggio vengono poi

                collegate alle specifiche

                unità fisiche.

              </p>



            </div>





            <div className="border-t border-white/10 p-7 lg:border-l lg:border-t-0">



              {canEditInventory ? (

                <Link

                  href="/admin/inventario/nuovo"

                  className="flex h-[56px] min-w-[220px] items-center justify-center rounded-[16px] bg-[#ff5a1f] px-6 text-[15px] font-semibold text-white transition hover:bg-white hover:text-[#181818]"

                >

                  + Nuova unità

                </Link>

              ) : (

                <div className="flex min-h-[56px] min-w-[220px] items-center justify-center rounded-[16px] border border-white/10 bg-white/[0.06] px-6 text-center text-[13px] font-semibold text-white/50">

                  Modifiche riservate

                </div>

              )}



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

  success = false,

  warning = false,

}: {

  value: number;

  label: string;

  success?: boolean;

  warning?: boolean;

}) {

  return (

    <div className="rounded-[17px] border border-white/10 bg-white/[0.06] p-4">



      <div

        className={`text-[28px] font-semibold tracking-[-0.045em] ${

          warning

            ? "text-[#f4b64c]"

            : success

              ? "text-[#6bd49c]"

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

  success = false,

  warning = false,

}: {

  number: string;

  label: string;

  value: number;

  detail: string;

  success?: boolean;

  warning?: boolean;

}) {

  return (

    <div className="relative overflow-hidden rounded-[22px] border border-black/10 bg-white p-5 sm:p-6">



      <div

        className={`absolute inset-x-0 top-0 h-[4px] ${

          warning

            ? "bg-[#d98a08]"

            : success

              ? "bg-[#168a50]"

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

            warning

              ? "bg-[#fff2d5] text-[#aa6b08]"

              : success

                ? "bg-[#e9f6ee] text-[#168a50]"

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

  status,

}: {

  status:

    UnitStatus;

}) {

  return (

    <span

      className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.06em] ${statusClasses(

        status

      )}`}

    >



      <span

        className={`h-2 w-2 rounded-full ${

          status ===

          "available"

            ? "bg-[#168a50]"

            : status ===

                "maintenance"

              ? "bg-[#d98a08]"

              : "bg-black/25"

        }`}

      />



      {

        statusLabel(

          status

        )

      }



    </span>

  );

}