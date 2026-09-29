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

type ReservationStatus =
  | "requested"
  | "confirmed"
  | "picked_up"
  | "returned"
  | "cancelled";


type Customer = {
  id: number;
  name: string;
  email: string;

  phone:
    | string
    | null;
};


type ReservationProduct = {
  id: number;
  name: string;
  slug: string;
};


type ReservationItem = {
  id: number;

  quantity:
    number;

  price_day:
    | number
    | string;

  products:
    | ReservationProduct
    | ReservationProduct[]
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
    ReservationStatus;

  notes:
    | string
    | null;

  created_at:
    string;

  customers:
    | Customer
    | Customer[]
    | null;

  reservation_items:
    | ReservationItem[]
    | null;
};


type SearchParams = {
  q?: string;
  stato?: string;
};


/* =========================================================
   HELPERS
   ========================================================= */

function getCustomer(
  value:
    | Customer
    | Customer[]
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


function getProduct(
  value:
    | ReservationProduct
    | ReservationProduct[]
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


function rentalDays(
  from: string,
  to: string
) {
  const start =
    new Date(
      `${from}T00:00:00`
    );

  const end =
    new Date(
      `${to}T00:00:00`
    );

  return (
    Math.floor(
      (
        end.getTime() -
        start.getTime()
      ) /
        86400000
    ) + 1
  );
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


function formatCreatedAt(
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

      hour:
        "2-digit",

      minute:
        "2-digit",
    }
  ).format(
    new Date(
      value
    )
  );
}


function formatMoney(
  value: number
) {
  return new Intl.NumberFormat(
    "it-IT",
    {
      style:
        "currency",

      currency:
        "EUR",

      minimumFractionDigits:
        2,

      maximumFractionDigits:
        2,
    }
  ).format(
    value
  );
}


function statusLabel(
  status:
    ReservationStatus
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


function statusClasses(
  status:
    ReservationStatus
) {
  switch (
    status
  ) {
    case "requested":
      return "bg-[#fff2d5] text-[#aa6b08]";

    case "confirmed":
      return "bg-[#edf2ff] text-[#245bff]";

    case "picked_up":
      return "bg-[#e9f6ee] text-[#168a50]";

    case "returned":
      return "bg-[#eeeeea] text-black/45";

    case "cancelled":
      return "bg-[#fff0ee] text-[#c33d32]";
  }
}


/* =========================================================
   PAGE
   ========================================================= */

export default async function AdminRequestsPage({
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

  const canOperate =
    access.profile.role ===
      "admin" ||
    access.profile.role ===
      "operator";


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
     REQUESTS
     ======================================================= */

  const {
    data,
    error,
  } =
    await supabase
      .from(
        "reservations"
      )
      .select(
        `
          id,
          reference,
          start_date,
          end_date,
          status,
          notes,
          created_at,

          customers (
            id,
            name,
            email,
            phone
          ),

          reservation_items (
            id,
            quantity,
            price_day,

            products (
              id,
              name,
              slug
            )
          )
        `
      )
      .order(
        "created_at",
        {
          ascending:
            false,
        }
      );


  if (error) {
    throw new Error(
      error.message
    );
  }


  const reservations =
    (
      data ??
      []
    ) as unknown as
      Reservation[];


  /* =======================================================
     PARAMS
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

  const filterStatus =
    params.stato ??
    "tutte";


  /* =======================================================
     COUNTS
     ======================================================= */

  const requested =
    reservations.filter(
      (reservation) =>
        reservation.status ===
        "requested"
    ).length;

  const confirmed =
    reservations.filter(
      (reservation) =>
        reservation.status ===
        "confirmed"
    ).length;

  const pickedUp =
    reservations.filter(
      (reservation) =>
        reservation.status ===
        "picked_up"
    ).length;

  const returned =
    reservations.filter(
      (reservation) =>
        reservation.status ===
        "returned"
    ).length;


  /* =======================================================
     FILTER
     ======================================================= */

  const filteredReservations =
    reservations.filter(
      (
        reservation
      ) => {
        const customer =
          getCustomer(
            reservation.customers
          );

        const products =
          (
            reservation.reservation_items ??
            []
          )
            .map(
              (
                item
              ) =>
                getProduct(
                  item.products
                )?.name
            )
            .filter(
              Boolean
            )
            .join(" ");


        const searchable =
          [
            reservation.reference,
            customer?.name,
            customer?.email,
            customer?.phone,
            products,
            reservation.notes,
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
          filterStatus ===
            "tutte" ||
          reservation.status ===
            filterStatus;


        return (
          queryOk &&
          statusOk
        );
      }
    );


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

                  LAP GEAR / Admin
                </div>


                <h1 className="mt-7 text-[53px] font-semibold leading-[0.9] tracking-[-0.062em] sm:text-[68px] lg:text-[78px]">

                  Gestisci
                  <br />

                  <span className="text-[#ff5a1f]">
                    le richieste.
                  </span>
                </h1>


                <p className="mt-7 max-w-[720px] text-[18px] leading-8 text-black/55">
                  Dalla nuova richiesta
                  fino alla riconsegna:
                  materiale, cliente,
                  assegnazioni e stato del
                  noleggio.
                </p>


                <div className="mt-8">

                  <Link
                    href="/admin"
                    className="inline-flex h-[58px] items-center justify-center rounded-[16px] border border-black/10 bg-[#f1f0ea] px-6 text-[15px] font-semibold text-black/60 transition hover:border-black/25 hover:bg-white hover:text-black"
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
                  Rental Control
                </div>

                <div className="mt-3 text-[31px] font-semibold leading-tight tracking-[-0.045em]">
                  Pipeline
                  <br />
                  noleggi.
                </div>


                <div className="mt-8 grid grid-cols-2 gap-3">

                  <HeroStat
                    value={
                      reservations.length
                    }
                    label="Totali"
                  />

                  <HeroStat
                    value={
                      requested
                    }
                    label="Da gestire"
                    warning={
                      requested >
                      0
                    }
                  />

                  <HeroStat
                    value={
                      confirmed
                    }
                    label="Confermate"
                  />

                  <HeroStat
                    value={
                      pickedUp
                    }
                    label="Fuori"
                    success={
                      pickedUp >
                      0
                    }
                  />

                </div>

              </div>
            </div>

          </div>
        </section>


        {/* =================================================
            PIPELINE
            ================================================= */}

        <section className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">

          <PipelineCard
            number="01"
            label="Da gestire"
            value={
              requested
            }
            description="Nuove richieste da verificare"
            tone="warning"
          />

          <PipelineCard
            number="02"
            label="Confermate"
            value={
              confirmed
            }
            description="Noleggi approvati"
            tone="blue"
          />

          <PipelineCard
            number="03"
            label="Ritirate"
            value={
              pickedUp
            }
            description="Materiale attualmente fuori"
            tone="success"
          />

          <PipelineCard
            number="04"
            label="Restituite"
            value={
              returned
            }
            description="Noleggi completati"
          />

        </section>


        {/* =================================================
            FILTER
            ================================================= */}

        <section className="mt-6 overflow-hidden rounded-[24px] border border-black/10 bg-white">

          <form
            method="get"
            className="grid gap-3 p-5 lg:grid-cols-[1fr_240px_auto]"
          >

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
                placeholder="Cerca cliente, riferimento, email, prodotto..."
                className="h-[58px] w-full rounded-[16px] border border-black/10 bg-[#f5f4ef] pl-13 pr-4 text-[15px] outline-none transition placeholder:text-black/30 focus:border-[#ff5a1f]/45 focus:bg-white focus:shadow-[0_0_0_4px_rgba(255,90,31,0.06)]"
              />

            </div>


            <select
              name="stato"
              defaultValue={
                filterStatus
              }
              className="h-[58px] rounded-[16px] border border-black/10 bg-[#f5f4ef] px-4 text-[15px] font-semibold outline-none transition focus:border-[#ff5a1f]/45 focus:bg-white"
            >
              <option value="tutte">
                Tutte
              </option>

              <option value="requested">
                Da gestire
              </option>

              <option value="confirmed">
                Confermate
              </option>

              <option value="picked_up">
                Ritirate
              </option>

              <option value="returned">
                Restituite
              </option>

              <option value="cancelled">
                Annullate
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
            filterStatus !==
              "tutte") && (
            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-black/10 bg-[#f5f4ef] px-5 py-3">

              <div className="text-[13px] font-medium text-black/45">
                {
                  filteredReservations.length
                }{" "}
                {filteredReservations.length ===
                1
                  ? "richiesta"
                  : "richieste"}
              </div>


              <Link
                href="/admin/richieste"
                className="text-[13px] font-semibold text-[#ff5a1f]"
              >
                Rimuovi filtri
              </Link>

            </div>
          )}

        </section>


        {/* =================================================
            LIST TITLE
            ================================================= */}

        <div className="flex flex-col gap-4 pb-5 pt-10 sm:flex-row sm:items-end sm:justify-between">

          <div>

            <div className="text-[13px] font-bold uppercase tracking-[0.13em] text-[#ff5a1f]">
              Rental requests
            </div>

            <h2 className="mt-2 text-[40px] font-semibold tracking-[-0.052em] sm:text-[48px]">
              Richieste.
            </h2>

          </div>


          <div className="text-[14px] font-medium text-black/45">
            {
              filteredReservations.length
            }{" "}
            di{" "}
            {
              reservations.length
            }
          </div>

        </div>


        {/* =================================================
            LIST
            ================================================= */}

        {filteredReservations.length >
        0 ? (
          <section className="space-y-4">

            {filteredReservations.map(
              (
                reservation
              ) => {
                const customer =
                  getCustomer(
                    reservation.customers
                  );

                const days =
                  rentalDays(
                    reservation.start_date,
                    reservation.end_date
                  );

                const items =
                  reservation.reservation_items ??
                  [];

                const totalPieces =
                  items.reduce(
                    (
                      sum,
                      item
                    ) =>
                      sum +
                      item.quantity,
                    0
                  );

                const estimatedTotal =
                  items.reduce(
                    (
                      sum,
                      item
                    ) =>
                      sum +
                      Number(
                        item.price_day
                      ) *
                        item.quantity *
                        days,
                    0
                  );


                return (
                  <article
                    key={
                      reservation.id
                    }
                    className="group overflow-hidden rounded-[25px] border border-black/10 bg-white transition hover:border-[#ff5a1f]/20 hover:shadow-[0_16px_50px_rgba(0,0,0,0.05)]"
                  >

                    <div
                      className={`h-[5px] ${
                        reservation.status ===
                        "requested"
                          ? "bg-[#d98a08]"
                          : reservation.status ===
                              "cancelled"
                            ? "bg-[#cf3d32]"
                            : "bg-[#181818]"
                      }`}
                    />


                    <div className="p-6 sm:p-7">

                      <div className="grid gap-7 xl:grid-cols-[minmax(0,1fr)_210px_170px_auto] xl:items-center">

                        {/* CUSTOMER */}

                        <div>

                          <div className="flex flex-wrap items-center gap-2">

                            <span className="font-mono text-[12px] font-bold text-[#ff5a1f]">
                              {
                                reservation.reference
                              }
                            </span>

                            <StatusBadge
                              status={
                                reservation.status
                              }
                            />

                          </div>


                          <h3 className="mt-3 text-[27px] font-semibold leading-tight tracking-[-0.04em]">
                            {customer?.name ??
                              "Cliente"}
                          </h3>


                          <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-[13px] text-black/42">

                            <span>
                              {customer?.email ??
                                "Email non disponibile"}
                            </span>

                            {customer?.phone && (
                              <span>
                                {
                                  customer.phone
                                }
                              </span>
                            )}

                          </div>


                          <div className="mt-4 flex flex-wrap gap-2">

                            {items
                              .slice(
                                0,
                                3
                              )
                              .map(
                                (
                                  item
                                ) => {
                                  const product =
                                    getProduct(
                                      item.products
                                    );

                                  return (
                                    <span
                                      key={
                                        item.id
                                      }
                                      className="rounded-full bg-[#f1f0ea] px-3 py-1.5 text-[11px] font-semibold text-black/50"
                                    >
                                      {
                                        item.quantity
                                      }
                                      ×{" "}
                                      {product?.name ??
                                        "Prodotto"}
                                    </span>
                                  );
                                }
                              )}


                            {items.length >
                              3 && (
                              <span className="rounded-full bg-[#f1f0ea] px-3 py-1.5 text-[11px] font-semibold text-black/40">
                                +
                                {items.length -
                                  3}{" "}
                                altri
                              </span>
                            )}

                          </div>

                        </div>


                        {/* PERIOD */}

                        <InfoColumn
                          label="Periodo"
                        >
                          <div className="text-[15px] font-semibold">
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

                          <div className="mt-2 text-[12px] font-medium text-black/35">
                            {days}{" "}
                            {days ===
                            1
                              ? "giorno"
                              : "giorni"}
                          </div>
                        </InfoColumn>


                        {/* VALUE */}

                        <InfoColumn
                          label="Richiesta"
                        >
                          <div className="text-[22px] font-semibold tracking-[-0.035em]">
                            {
                              formatMoney(
                                estimatedTotal
                              )
                            }
                          </div>

                          <div className="mt-1 text-[12px] text-black/40">
                            {totalPieces}{" "}
                            {totalPieces ===
                            1
                              ? "pezzo"
                              : "pezzi"}
                          </div>

                          <div className="mt-2 text-[11px] text-black/30">
                            {formatCreatedAt(
                              reservation.created_at
                            )}
                          </div>

                        </InfoColumn>


                        {/* ACTION */}

                        <Link
                          href={`/admin/richieste/${reservation.id}`}
                          className="flex h-[52px] items-center justify-center rounded-[15px] bg-[#181818] px-6 text-[14px] font-semibold text-white transition group-hover:bg-[#ff5a1f]"
                        >
                          {canOperate
                            ? "Gestisci →"
                            : "Apri →"}
                        </Link>

                      </div>

                    </div>
                  </article>
                );
              }
            )}

          </section>
        ) : (
          <section className="overflow-hidden rounded-[28px] border border-black/10 bg-white">

            <div className="grid min-h-[360px] lg:grid-cols-[1fr_300px]">

              <div className="flex items-center p-8 sm:p-12">

                <div>

                  <div className="text-[13px] font-bold uppercase tracking-[0.13em] text-[#ff5a1f]">
                    Rental Control
                  </div>

                  <h2 className="mt-3 text-[40px] font-semibold leading-[0.96] tracking-[-0.052em]">
                    {reservations.length ===
                    0
                      ? "Nessuna richiesta ricevuta."
                      : "Nessuna richiesta corrisponde ai filtri."}
                  </h2>


                  {reservations.length >
                    0 && (
                    <Link
                      href="/admin/richieste"
                      className="mt-7 inline-flex h-[56px] items-center justify-center rounded-[16px] bg-[#181818] px-6 text-[15px] font-semibold text-white transition hover:bg-[#ff5a1f]"
                    >
                      Mostra tutte
                    </Link>
                  )}

                </div>

              </div>


              <div className="relative hidden overflow-hidden bg-[#181818] lg:block">

                <div className="absolute -right-20 -top-20 h-[220px] w-[220px] rounded-full bg-[#ff5a1f]/20" />

                <div className="absolute bottom-9 left-9 text-white">

                  <div className="text-[11px] font-bold uppercase tracking-[0.12em] text-[#ff7b4a]">
                    LAP GEAR
                  </div>

                  <div className="mt-2 text-[25px] font-semibold">
                    Rental
                    <br />
                    Control.
                  </div>

                </div>

              </div>

            </div>
          </section>
        )}

      </div>
    </main>
  );
}


/* =========================================================
   COMPONENTS
   ========================================================= */

function HeroStat({
  value,
  label,
  warning = false,
  success = false,
}: {
  value: number;
  label: string;
  warning?: boolean;
  success?: boolean;
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


function PipelineCard({
  number,
  label,
  value,
  description,
  tone = "default",
}: {
  number: string;
  label: string;
  value: number;
  description: string;

  tone?:
    | "default"
    | "warning"
    | "blue"
    | "success";
}) {
  const rail = {
    default:
      "bg-[#181818]",

    warning:
      "bg-[#d98a08]",

    blue:
      "bg-[#245bff]",

    success:
      "bg-[#168a50]",
  }[
    tone
  ];


  const badge = {
    default:
      "bg-[#f1f0ea] text-black/45",

    warning:
      "bg-[#fff2d5] text-[#aa6b08]",

    blue:
      "bg-[#edf2ff] text-[#245bff]",

    success:
      "bg-[#e9f6ee] text-[#168a50]",
  }[
    tone
  ];


  return (
    <article className="relative overflow-hidden rounded-[22px] border border-black/10 bg-white p-5 sm:p-6">

      <div
        className={`absolute inset-x-0 top-0 h-[4px] ${rail}`}
      />


      <div className="flex items-start justify-between gap-5">

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

          <p className="mt-2 text-[13px] leading-5 text-black/40">
            {
              description
            }
          </p>

        </div>


        <div
          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[11px] font-bold ${badge}`}
        >
          {
            number
          }
        </div>

      </div>

    </article>
  );
}


function StatusBadge({
  status,
}: {
  status:
    ReservationStatus;
}) {
  return (
    <span
      className={`rounded-full px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.065em] ${statusClasses(
        status
      )}`}
    >
      {
        statusLabel(
          status
        )
      }
    </span>
  );
}


function InfoColumn({
  label,
  children,
}: {
  label: string;

  children:
    React.ReactNode;
}) {
  return (
    <div>

      <div className="mb-2 text-[10px] font-bold uppercase tracking-[0.1em] text-black/30">
        {
          label
        }
      </div>

      {
        children
      }

    </div>
  );
}