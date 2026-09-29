import Link from "next/link";

import {
  notFound,
  redirect,
} from "next/navigation";

import {
  InventoryUnitForm,
} from "@/components/admin/InventoryUnitForm";

import {
  createSupabaseAuthServerClient,
} from "@/lib/supabase-auth-server";

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

  active?: boolean;
};


type Unit = {
  id: number;

  product_id: number;

  asset_code: string;

  serial_number:
    | string
    | null;

  status:
    UnitStatus;

  notes:
    | string
    | null;

  created_at:
    string;

  products:
    | Product
    | Product[]
    | null;
};


type AvailabilityBlock = {
  id: number;

  start_date:
    string;

  end_date:
    string;

  reason:
    | string
    | null;

  created_at:
    string;
};


type Customer = {
  name: string;

  email:
    string;

  phone:
    | string
    | null;
};


type Reservation = {
  id: string;

  reference:
    string;

  start_date:
    string;

  end_date:
    string;

  status:
    | "requested"
    | "confirmed"
    | "picked_up"
    | "returned"
    | "cancelled";

  customers:
    | Customer
    | Customer[]
    | null;
};


type ReservationItem = {
  id: number;

  reservation_id:
    string;

  reservations:
    | Reservation
    | Reservation[]
    | null;
};


type Assignment = {
  id: number;

  reservation_item_id:
    number;

  reservation_items:
    | ReservationItem
    | ReservationItem[]
    | null;
};


/* =========================================================
   HELPERS
   ========================================================= */

function first<T>(
  value:
    | T
    | T[]
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


function formatDate(
  value: string
) {
  return new Intl.DateTimeFormat(
    "it-IT",
    {
      day:
        "2-digit",

      month:
        "2-digit",

      year:
        "numeric",
    }
  ).format(
    new Date(
      `${value}T00:00:00`
    )
  );
}


function formatDateTime(
  value: string
) {
  return new Intl.DateTimeFormat(
    "it-IT",
    {
      day:
        "2-digit",

      month:
        "2-digit",

      year:
        "numeric",
    }
  ).format(
    new Date(
      value
    )
  );
}


function unitStatusLabel(
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


function reservationStatusLabel(
  status:
    Reservation["status"]
) {
  switch (
    status
  ) {
    case "requested":
      return "Da gestire";

    case "confirmed":
      return "Confermata";

    case "picked_up":
      return "Ritirata";

    case "returned":
      return "Restituita";

    case "cancelled":
      return "Annullata";
  }
}


function reservationStatusClass(
  status:
    Reservation["status"]
) {
  switch (
    status
  ) {
    case "confirmed":
      return "bg-[#edf2ff] text-[#245bff]";

    case "picked_up":
      return "bg-[#e9f6ee] text-[#168a50]";

    case "returned":
      return "bg-[#eeeeea] text-black/45";

    case "cancelled":
      return "bg-[#fff0ee] text-[#c53e32]";

    default:
      return "bg-[#fff2d5] text-[#aa6b08]";
  }
}


/* =========================================================
   PAGE
   ========================================================= */

export default async function InventoryUnitPage({
  params,
}: {
  params: Promise<{
    id: string;
  }>;
}) {

  /* =======================================================
     AUTH
     ======================================================= */

  const auth =
    await createSupabaseAuthServerClient();

  const {
    data: {
      user,
    },
  } =
    await auth.auth.getUser();

  const adminUserId =
    process.env.ADMIN_USER_ID;

  if (
    !user ||
    !adminUserId ||
    user.id !==
      adminUserId
  ) {
    redirect(
      "/admin/login"
    );
  }


  /* =======================================================
     ID
     ======================================================= */

  const {
    id,
  } =
    await params;

  const unitId =
    Number(
      id
    );

  if (
    !Number.isFinite(
      unitId
    )
  ) {
    notFound();
  }


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
     UNIT
     ======================================================= */

  const {
    data:
      unitData,
    error:
      unitError,
  } =
    await supabase
      .from(
        "product_units"
      )
      .select(
        `
          id,
          product_id,
          asset_code,
          serial_number,
          status,
          notes,
          created_at,

          products (
            id,
            name,
            slug,
            image_url
          )
        `
      )
      .eq(
        "id",
        unitId
      )
      .maybeSingle();


  if (
    unitError
  ) {
    throw new Error(
      unitError.message
    );
  }


  if (
    !unitData
  ) {
    notFound();
  }


  const unit =
    unitData as unknown as
      Unit;


  const product =
    first(
      unit.products
    );


  /* =======================================================
     PRODUCTS
     ======================================================= */

  const {
    data:
      products,
    error:
      productsError,
  } =
    await supabase
      .from(
        "products"
      )
      .select(
        `
          id,
          name,
          slug,
          image_url,
          active
        `
      )
      .order(
        "name",
        {
          ascending:
            true,
        }
      );


  if (
    productsError
  ) {
    throw new Error(
      productsError.message
    );
  }


  /* =======================================================
     AVAILABILITY BLOCKS
     ======================================================= */

  const {
    data:
      blocksData,
    error:
      blocksError,
  } =
    await supabase
      .from(
        "availability_blocks"
      )
      .select(
        `
          id,
          start_date,
          end_date,
          reason,
          created_at
        `
      )
      .eq(
        "product_unit_id",
        unit.id
      )
      .order(
        "start_date",
        {
          ascending:
            false,
        }
      );


  if (
    blocksError
  ) {
    throw new Error(
      blocksError.message
    );
  }


  const blocks =
    (
      blocksData ??
      []
    ) as AvailabilityBlock[];


  /* =======================================================
     ASSIGNMENTS
     ======================================================= */

  const {
    data:
      assignmentsData,
    error:
      assignmentsError,
  } =
    await supabase
      .from(
        "unit_assignments"
      )
      .select(
        `
          id,
          reservation_item_id,

          reservation_items (
            id,
            reservation_id,

            reservations (
              id,
              reference,
              start_date,
              end_date,
              status,

              customers (
                name,
                email,
                phone
              )
            )
          )
        `
      )
      .eq(
        "product_unit_id",
        unit.id
      );


  if (
    assignmentsError
  ) {
    throw new Error(
      assignmentsError.message
    );
  }


  const assignments =
    (
      assignmentsData ??
      []
    ) as unknown as
      Assignment[];


  const activeAssignments =
    assignments.filter(
      (
        assignment
      ) => {
        const item =
          first(
            assignment.reservation_items
          );

        const reservation =
          item
            ? first(
                item.reservations
              )
            : null;

        return (
          reservation?.status ===
            "confirmed" ||
          reservation?.status ===
            "picked_up"
        );
      }
    ).length;


  /* =======================================================
     RENDER
     ======================================================= */

  return (
    <main className="min-h-screen bg-[#ebeae4] px-5 pb-16 pt-6 text-[#111111] sm:px-8 lg:px-10 lg:pb-20 xl:px-14">

      <div className="mx-auto max-w-[1500px]">

        {/* =================================================
            BREADCRUMB
            ================================================= */}

        <div className="mb-5 flex items-center gap-2 overflow-hidden text-[13px] font-semibold text-black/40">

          <Link
            href="/admin"
            className="shrink-0 transition hover:text-[#ff5a1f]"
          >
            Admin
          </Link>

          <span>
            /
          </span>

          <Link
            href="/admin/inventario"
            className="shrink-0 transition hover:text-[#ff5a1f]"
          >
            Inventario
          </Link>

          <span>
            /
          </span>

          <span className="truncate text-black/65">
            {
              unit.asset_code
            }
          </span>

        </div>


        {/* =================================================
            HERO
            ================================================= */}

        <section className="overflow-hidden rounded-[30px] border border-black/10 bg-white shadow-[0_18px_60px_rgba(0,0,0,0.055)]">

          <div className="grid lg:grid-cols-[1fr_380px]">

            {/* LEFT */}

            <div className="relative overflow-hidden p-8 sm:p-10">

              <div className="pointer-events-none absolute -right-32 -top-36 h-[360px] w-[360px] rounded-full bg-[#ff5a1f]/[0.07]" />

              <div className="relative">

                <div className="flex flex-wrap items-center gap-2">

                  <span className="text-[13px] font-bold uppercase tracking-[0.13em] text-[#ff5a1f]">
                    Inventory Control
                  </span>

                  <UnitStatusBadge
                    status={
                      unit.status
                    }
                  />

                </div>


                <h1 className="mt-4 break-words font-mono text-[45px] font-semibold leading-[0.95] tracking-[-0.05em] sm:text-[58px]">
                  {
                    unit.asset_code
                  }
                </h1>


                <p className="mt-5 text-[18px] font-semibold text-black/65">
                  {product?.name ??
                    "Prodotto non trovato"}
                </p>


                <div className="mt-7 flex flex-wrap gap-3">

                  <Link
                    href="/admin/inventario"
                    className="flex h-[52px] items-center justify-center rounded-[15px] border border-black/10 bg-[#f1f0ea] px-5 text-[14px] font-semibold text-black/55 transition hover:bg-white hover:text-black"
                  >
                    ← Inventario
                  </Link>


                  {product && (
                    <Link
                      href={`/admin/prodotti/${product.id}`}
                      className="flex h-[52px] items-center justify-center rounded-[15px] bg-[#181818] px-5 text-[14px] font-semibold text-white transition hover:bg-[#ff5a1f]"
                    >
                      Scheda prodotto →
                    </Link>
                  )}

                </div>

              </div>
            </div>


            {/* RIGHT */}

            <div className="relative overflow-hidden bg-[#181818] p-8 text-white">

              <div className="pointer-events-none absolute -right-24 -top-24 h-[230px] w-[230px] rounded-full bg-[#ff5a1f]/20" />

              <div className="relative">

                <div className="text-[11px] font-bold uppercase tracking-[0.12em] text-[#ff7b4a]">
                  Asset overview
                </div>


                <div className="mt-7 grid grid-cols-2 gap-3">

                  <HeroStat
                    value={`#${unit.id}`}
                    label="Unit ID"
                  />

                  <HeroStat
                    value={
                      blocks.length
                    }
                    label="Blocchi"
                  />

                  <HeroStat
                    value={
                      assignments.length
                    }
                    label="Noleggi"
                  />

                  <HeroStat
                    value={
                      activeAssignments
                    }
                    label="Attivi"
                    accent={
                      activeAssignments >
                      0
                    }
                  />

                </div>


                <div className="mt-7 border-t border-white/10 pt-5">

                  <div className="text-[10px] font-bold uppercase tracking-[0.09em] text-white/30">
                    Seriale
                  </div>

                  <div className="mt-1 break-all font-mono text-[14px] font-semibold text-white/70">
                    {unit.serial_number ||
                      "Non inserito"}
                  </div>

                </div>

              </div>
            </div>
          </div>
        </section>


        {/* =================================================
            EDIT
            ================================================= */}

        <section className="pt-7">

          <div className="mb-5">

            <div className="text-[13px] font-bold uppercase tracking-[0.13em] text-[#ff5a1f]">
              Asset settings
            </div>

            <h2 className="mt-2 text-[40px] font-semibold tracking-[-0.052em]">
              Dati unità.
            </h2>

          </div>


          <InventoryUnitForm
            products={
              products ??
              []
            }
            action={`/api/admin/inventory/${unit.id}`}
            submitLabel="Salva modifiche"
            initialData={{
              product_id:
                unit.product_id,

              asset_code:
                unit.asset_code,

              serial_number:
                unit.serial_number,

              status:
                unit.status,

              notes:
                unit.notes,
            }}
          />

        </section>


        {/* =================================================
            CALENDAR BLOCKS
            ================================================= */}

        <section className="pt-10">

          <div className="mb-5">

            <div className="text-[13px] font-bold uppercase tracking-[0.13em] text-[#ff5a1f]">
              Availability Control
            </div>

            <h2 className="mt-2 text-[40px] font-semibold tracking-[-0.052em]">
              Blocchi calendario.
            </h2>

            <p className="mt-3 max-w-[720px] text-[15px] leading-7 text-black/48">
              Usa i blocchi per manutenzioni,
              utilizzi interni o qualsiasi
              periodo in cui questa specifica
              unità non deve risultare
              disponibile.
            </p>

          </div>


          <div className="grid items-start gap-6 xl:grid-cols-[420px_1fr]">

            {/* CREATE BLOCK */}

            <form
              action={`/api/admin/inventory/${unit.id}/blocks`}
              method="post"
              className="overflow-hidden rounded-[24px] border border-black/10 bg-white"
            >

              <div className="border-b border-black/10 bg-[#fbfaf7] p-6">

                <div className="text-[11px] font-bold uppercase tracking-[0.11em] text-[#ff5a1f]">
                  Nuovo blocco
                </div>

                <h3 className="mt-1 text-[25px] font-semibold tracking-[-0.04em]">
                  Rendi indisponibile.
                </h3>

              </div>


              <div className="space-y-4 p-6">

                <FieldLabel
                  label="Dal"
                >
                  <input
                    type="date"
                    name="start_date"
                    required
                    className={
                      inputClass
                    }
                  />
                </FieldLabel>


                <FieldLabel
                  label="Al"
                >
                  <input
                    type="date"
                    name="end_date"
                    required
                    className={
                      inputClass
                    }
                  />
                </FieldLabel>


                <FieldLabel
                  label="Motivo"
                >
                  <textarea
                    name="reason"
                    rows={4}
                    placeholder="Es. Manutenzione, utilizzo interno..."
                    className={
                      textareaClass
                    }
                  />
                </FieldLabel>


                <button
                  type="submit"
                  className="flex h-[58px] w-full items-center justify-center rounded-[16px] bg-[#181818] px-6 text-[15px] font-semibold text-white transition hover:bg-[#ff5a1f]"
                >
                  + Aggiungi blocco
                </button>

              </div>

            </form>


            {/* BLOCK LIST */}

            <div className="overflow-hidden rounded-[24px] border border-black/10 bg-white">

              <div className="flex items-center justify-between gap-5 border-b border-black/10 bg-[#f3f2ed] px-6 py-5">

                <div>

                  <div className="text-[11px] font-bold uppercase tracking-[0.1em] text-black/35">
                    Periodi registrati
                  </div>

                  <div className="mt-1 text-[21px] font-semibold">
                    {
                      blocks.length
                    }{" "}
                    {blocks.length ===
                    1
                      ? "blocco"
                      : "blocchi"}
                  </div>

                </div>

              </div>


              {blocks.length >
              0 ? (
                <div className="divide-y divide-black/10">

                  {blocks.map(
                    (
                      block
                    ) => (
                      <article
                        key={
                          block.id
                        }
                        className="grid gap-5 p-6 sm:grid-cols-[1fr_auto] sm:items-center"
                      >

                        <div>

                          <div className="flex flex-wrap items-center gap-2">

                            <span className="rounded-full bg-[#fff2d5] px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.06em] text-[#aa6b08]">
                              Indisponibile
                            </span>

                            <span className="text-[11px] font-medium text-black/30">
                              #{block.id}
                            </span>

                          </div>


                          <div className="mt-3 text-[19px] font-semibold">
                            {formatDate(
                              block.start_date
                            )}
                            {" → "}
                            {formatDate(
                              block.end_date
                            )}
                          </div>


                          <div className="mt-2 text-[14px] leading-6 text-black/45">
                            {block.reason ||
                              "Nessun motivo specificato"}
                          </div>


                          <div className="mt-2 text-[11px] text-black/30">
                            Creato il{" "}
                            {formatDateTime(
                              block.created_at
                            )}
                          </div>

                        </div>


                        <form
                          action={`/api/admin/inventory/${unit.id}/blocks/${block.id}`}
                          method="post"
                        >
                          <button
                            type="submit"
                            className="flex h-[46px] items-center justify-center rounded-[13px] border border-[#cf3d32]/15 bg-[#fff0ee] px-4 text-[13px] font-semibold text-[#b7352b] transition hover:bg-[#cf3d32] hover:text-white"
                          >
                            Rimuovi
                          </button>
                        </form>

                      </article>
                    )
                  )}

                </div>
              ) : (
                <div className="p-8 text-[14px] leading-6 text-black/40">
                  Nessun blocco calendario
                  presente per questa unità.
                </div>
              )}

            </div>

          </div>
        </section>


        {/* =================================================
            RENTAL HISTORY
            ================================================= */}

        <section className="pt-10">

          <div className="mb-5">

            <div className="text-[13px] font-bold uppercase tracking-[0.13em] text-[#ff5a1f]">
              Rental history
            </div>

            <h2 className="mt-2 text-[40px] font-semibold tracking-[-0.052em]">
              Assegnazioni.
            </h2>

          </div>


          <div className="overflow-hidden rounded-[25px] border border-black/10 bg-white">

            {assignments.length >
            0 ? (
              <div className="divide-y divide-black/10">

                {assignments.map(
                  (
                    assignment
                  ) => {
                    const item =
                      first(
                        assignment.reservation_items
                      );

                    const reservation =
                      item
                        ? first(
                            item.reservations
                          )
                        : null;

                    const customer =
                      reservation
                        ? first(
                            reservation.customers
                          )
                        : null;


                    if (
                      !reservation
                    ) {
                      return null;
                    }


                    return (
                      <article
                        key={
                          assignment.id
                        }
                        className="grid gap-6 p-6 lg:grid-cols-[1fr_240px_auto] lg:items-center"
                      >

                        {/* REQUEST */}

                        <div>

                          <div className="flex flex-wrap items-center gap-2">

                            <span className="font-mono text-[12px] font-bold text-[#ff5a1f]">
                              {
                                reservation.reference
                              }
                            </span>

                            <span
                              className={`rounded-full px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.06em] ${reservationStatusClass(
                                reservation.status
                              )}`}
                            >
                              {reservationStatusLabel(
                                reservation.status
                              )}
                            </span>

                          </div>


                          <div className="mt-3 text-[22px] font-semibold tracking-[-0.03em]">
                            {customer?.name ??
                              "Cliente"}
                          </div>


                          <div className="mt-1 text-[13px] text-black/40">
                            {customer?.email ??
                              "—"}
                          </div>

                        </div>


                        {/* PERIOD */}

                        <div>

                          <div className="text-[10px] font-bold uppercase tracking-[0.09em] text-black/30">
                            Periodo
                          </div>

                          <div className="mt-2 text-[14px] font-semibold">
                            {formatDate(
                              reservation.start_date
                            )}
                          </div>

                          <div className="mt-1 text-[13px] text-black/40">
                            →{" "}
                            {formatDate(
                              reservation.end_date
                            )}
                          </div>

                        </div>


                        {/* ACTION */}

                        <Link
                          href={`/admin/richieste/${reservation.id}`}
                          className="flex h-[48px] items-center justify-center rounded-[14px] bg-[#181818] px-5 text-[14px] font-semibold text-white transition hover:bg-[#ff5a1f]"
                        >
                          Richiesta →
                        </Link>

                      </article>
                    );
                  }
                )}

              </div>
            ) : (
              <div className="p-8">

                <div className="text-[13px] font-bold uppercase tracking-[0.1em] text-[#ff5a1f]">
                  Nessuna assegnazione
                </div>

                <div className="mt-2 text-[21px] font-semibold">
                  Questa unità non è ancora
                  stata associata a un noleggio.
                </div>

              </div>
            )}

          </div>
        </section>


        {/* =================================================
            INTERNAL INFO
            ================================================= */}

        <section className="mt-8 overflow-hidden rounded-[26px] bg-[#181818] text-white">

          <div className="grid lg:grid-cols-[1fr_auto] lg:items-center">

            <div className="p-7 sm:p-9">

              <div className="text-[12px] font-bold uppercase tracking-[0.12em] text-[#ff7b4a]">
                Internal asset
              </div>

              <h2 className="mt-2 text-[30px] font-semibold tracking-[-0.045em]">
                Tutti questi dati restano interni.
              </h2>

              <p className="mt-3 max-w-[730px] text-[14px] leading-6 text-white/45">
                Asset code, seriale, numero
                di unità, manutenzioni e
                assegnazioni non vengono
                mostrati nel catalogo pubblico.
              </p>

            </div>


            <div className="border-t border-white/10 p-7 lg:border-l lg:border-t-0">

              <Link
                href="/admin/inventario"
                className="flex h-[56px] min-w-[210px] items-center justify-center rounded-[16px] bg-[#ff5a1f] px-6 text-[15px] font-semibold text-white transition hover:bg-white hover:text-[#181818]"
              >
                Tutto l’inventario →
              </Link>

            </div>

          </div>
        </section>

      </div>
    </main>
  );
}


/* =========================================================
   COMPONENTS
   ========================================================= */

function UnitStatusBadge({
  status,
}: {
  status:
    UnitStatus;
}) {
  const config = {
    available: {
      label:
        "Operativa",

      className:
        "bg-[#e9f6ee] text-[#168a50]",

      dot:
        "bg-[#168a50]",
    },

    maintenance: {
      label:
        "Manutenzione",

      className:
        "bg-[#fff2d5] text-[#aa6b08]",

      dot:
        "bg-[#d98a08]",
    },

    retired: {
      label:
        "Ritirata",

      className:
        "bg-[#eeeeea] text-black/45",

      dot:
        "bg-black/25",
    },
  }[
    status
  ];


  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.06em] ${config.className}`}
    >
      <span
        className={`h-2 w-2 rounded-full ${config.dot}`}
      />

      {
        config.label
      }
    </span>
  );
}


function HeroStat({
  value,
  label,
  accent = false,
}: {
  value:
    string
    | number;

  label:
    string;

  accent?:
    boolean;
}) {
  return (
    <div className="rounded-[16px] border border-white/10 bg-white/[0.06] p-4">

      <div
        className={`text-[25px] font-semibold tracking-[-0.045em] ${
          accent
            ? "text-[#ff7b4a]"
            : "text-white"
        }`}
      >
        {
          value
        }
      </div>

      <div className="mt-1 text-[10px] font-bold uppercase tracking-[0.08em] text-white/35">
        {
          label
        }
      </div>

    </div>
  );
}


function FieldLabel({
  label,
  children,
}: {
  label:
    string;

  children:
    React.ReactNode;
}) {
  return (
    <label className="block">

      <span className="mb-2 block text-[13px] font-semibold text-black/55">
        {
          label
        }
      </span>

      {
        children
      }

    </label>
  );
}


const inputClass =
  "h-[56px] w-full rounded-[15px] border border-black/10 bg-[#f6f5f0] px-4 text-[15px] outline-none transition focus:border-[#ff5a1f]/45 focus:bg-white focus:shadow-[0_0_0_4px_rgba(255,90,31,0.06)]";


const textareaClass =
  "w-full resize-y rounded-[15px] border border-black/10 bg-[#f6f5f0] px-4 py-4 text-[15px] leading-6 outline-none transition placeholder:text-black/25 focus:border-[#ff5a1f]/45 focus:bg-white focus:shadow-[0_0_0_4px_rgba(255,90,31,0.06)]";