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
  phone: string | null;
};


type ReservationProduct = {
  id: number;
  name: string;
  slug: string;
};


type ReservationItem = {
  id: number;
  quantity: number;
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
  reference: string;
  start_date: string;
  end_date: string;
  status: ReservationStatus;
  notes: string | null;
  created_at: string;

  quoted_total:
    | number
    | string
    | null;

  quote_sent_at:
    | string
    | null;

  quote_revision:
    | number
    | null;

  quote_deposit:
    | number
    | string
    | null;

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
  vista?: string;
  stato?: string;
};


type ViewKey =
  | "tutte"
  | "da-gestire"
  | "preventivi"
  | "confermate"
  | "in-corso"
  | "chiuse";


function first<T>(
  value:
    | T
    | T[]
    | null
) {
  if (!value) {
    return null;
  }

  return Array.isArray(value)
    ? value[0] ?? null
    : value;
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

  return Math.max(
    1,
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
        "2-digit",
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
  switch (status) {
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
  switch (status) {
    case "requested":
      return "bg-[#fff2d5] text-[#9a6208]";
    case "confirmed":
      return "bg-[#edf2ff] text-[#245bff]";
    case "picked_up":
      return "bg-[#e9f6ee] text-[#168a50]";
    case "returned":
      return "bg-[#eeeeea] text-black/50";
    case "cancelled":
      return "bg-[#fff0ee] text-[#b7352b]";
  }
}


function estimatedTotal(
  reservation:
    Reservation
) {
  const days =
    rentalDays(
      reservation.start_date,
      reservation.end_date
    );

  return (
    reservation.reservation_items ??
    []
  ).reduce(
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
}


function viewMatches(
  reservation:
    Reservation,
  view:
    ViewKey
) {
  switch (view) {
    case "da-gestire":
      return (
        reservation.status ===
          "requested" &&
        !reservation.quote_sent_at
      );

    case "preventivi":
      return (
        reservation.status ===
          "requested" &&
        Boolean(
          reservation.quote_sent_at
        )
      );

    case "confermate":
      return (
        reservation.status ===
        "confirmed"
      );

    case "in-corso":
      return (
        reservation.status ===
        "picked_up"
      );

    case "chiuse":
      return (
        reservation.status ===
          "returned" ||
        reservation.status ===
          "cancelled"
      );

    case "tutte":
    default:
      return true;
  }
}


function viewHref(
  view:
    ViewKey
) {
  return view ===
    "tutte"
    ? "/admin/richieste"
    : `/admin/richieste?vista=${encodeURIComponent(
        view
      )}`;
}


function getProductNames(
  reservation:
    Reservation
) {
  return (
    reservation.reservation_items ??
    []
  )
    .map(
      (
        item
      ) =>
        first(
          item.products
        )?.name
    )
    .filter(
      (
        name
      ): name is string =>
        Boolean(name)
    );
}


export default async function AdminRequestsPage({
  searchParams,
}: {
  searchParams?:
    Promise<SearchParams>;
}) {

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


  const supabase =
    getServerSupabase();

  if (!supabase) {
    throw new Error(
      "Supabase non configurato."
    );
  }


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
          quoted_total,
          quote_sent_at,
          quote_revision,
          quote_deposit,

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


  const params =
    searchParams
      ? await searchParams
      : {};

  const query =
    String(
      params.q ??
      ""
    )
      .trim()
      .toLowerCase();

  const allowedViews:
    ViewKey[] = [
      "tutte",
      "da-gestire",
      "preventivi",
      "confermate",
      "in-corso",
      "chiuse",
    ];

  const requestedView =
    String(
      params.vista ??
      "tutte"
    ) as ViewKey;

  const view:
    ViewKey =
    allowedViews.includes(
      requestedView
    )
      ? requestedView
      : "tutte";

  const legacyStatus =
    String(
      params.stato ??
      ""
    ).trim();


  const counts = {
    all:
      reservations.length,

    todo:
      reservations.filter(
        (
          reservation
        ) =>
          viewMatches(
            reservation,
            "da-gestire"
          )
      ).length,

    quotes:
      reservations.filter(
        (
          reservation
        ) =>
          viewMatches(
            reservation,
            "preventivi"
          )
      ).length,

    confirmed:
      reservations.filter(
        (
          reservation
        ) =>
          reservation.status ===
          "confirmed"
      ).length,

    active:
      reservations.filter(
        (
          reservation
        ) =>
          reservation.status ===
          "picked_up"
      ).length,

    closed:
      reservations.filter(
        (
          reservation
        ) =>
          reservation.status ===
            "returned" ||
          reservation.status ===
            "cancelled"
      ).length,
  };


  const filtered =
    reservations.filter(
      (
        reservation
      ) => {

        const customer =
          first(
            reservation.customers
          );

        const products =
          getProductNames(
            reservation
          );

        const searchable =
          [
            reservation.reference,
            customer?.name,
            customer?.email,
            customer?.phone,
            reservation.notes,
            ...products,
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

        const viewOk =
          viewMatches(
            reservation,
            view
          );

        const legacyStatusOk =
          !legacyStatus ||
          legacyStatus ===
            "tutte" ||
          reservation.status ===
            legacyStatus;

        return (
          queryOk &&
          viewOk &&
          legacyStatusOk
        );
      }
    );


  const viewCards:
    {
      key: ViewKey;
      label: string;
      count: number;
      hint: string;
    }[] = [
      {
        key:
          "da-gestire",
        label:
          "Da gestire",
        count:
          counts.todo,
        hint:
          "Richieste senza preventivo",
      },
      {
        key:
          "preventivi",
        label:
          "Preventivi",
        count:
          counts.quotes,
        hint:
          "Inviati, in attesa",
      },
      {
        key:
          "confermate",
        label:
          "Confermate",
        count:
          counts.confirmed,
        hint:
          "Da preparare",
      },
      {
        key:
          "in-corso",
        label:
          "In corso",
        count:
          counts.active,
        hint:
          "Materiale fuori",
      },
      {
        key:
          "chiuse",
        label:
          "Chiuse",
        count:
          counts.closed,
        hint:
          "Restituite o annullate",
      },
    ];


  return (
    <main className="min-h-screen bg-[#ebeae4] px-4 pb-14 pt-5 text-[#111111] sm:px-6 lg:px-8 xl:px-10">

      <div className="mx-auto max-w-[1680px]">

        <section className="rounded-[26px] border border-black/10 bg-white px-5 py-5 shadow-[0_14px_40px_rgba(0,0,0,0.045)] sm:px-7">

          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">

            <div className="min-w-0">

              <div className="flex flex-wrap items-center gap-3">

                <Link
                  href="/admin"
                  className="text-[13px] font-semibold text-black/40 transition hover:text-[#ff5a1f]"
                >
                  ← Dashboard
                </Link>

                <span className="h-1 w-1 rounded-full bg-black/20" />

                <div className="text-[12px] font-bold uppercase tracking-[0.12em] text-[#ff5a1f]">
                  Rental control
                </div>

              </div>


              <div className="mt-2 flex flex-wrap items-end gap-x-4 gap-y-2">

                <h1 className="text-[40px] font-semibold leading-none tracking-[-0.055em] sm:text-[50px]">
                  Richieste.
                </h1>

                <div className="pb-1 text-[14px] font-medium text-black/35">
                  {counts.all} totali
                </div>

              </div>


              <p className="mt-3 max-w-[680px] text-[15px] leading-6 text-black/45">
                Una vista compatta per capire
                subito cosa richiede attenzione:
                preventivo, conferma, preparazione,
                consegna e rientro.
              </p>

            </div>


            <div className="shrink-0">

              <div className="rounded-[18px] bg-[#181818] px-5 py-4 text-white">

                <div className="text-[10px] font-bold uppercase tracking-[0.1em] text-white/35">
                  Da fare ora
                </div>

                <div className="mt-1 text-[30px] font-semibold leading-none tracking-[-0.045em] text-[#ff7b4a]">
                  {counts.todo}
                </div>

                <div className="mt-1 text-[12px] text-white/45">
                  richieste da preventivare
                </div>

              </div>

            </div>

          </div>

        </section>


        <section className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-5">

          {viewCards.map(
            (
              card
            ) => {
              const active =
                view ===
                card.key;

              return (
                <Link
                  key={
                    card.key
                  }
                  href={
                    viewHref(
                      card.key
                    )
                  }
                  className={`rounded-[20px] border p-4 transition ${
                    active
                      ? "border-[#ff5a1f]/35 bg-[#fff0e9] shadow-[0_10px_30px_rgba(255,90,31,0.08)]"
                      : "border-black/10 bg-white hover:border-black/20 hover:bg-[#fbfaf7]"
                  }`}
                >

                  <div className="flex items-center justify-between gap-4">

                    <div className="text-[13px] font-semibold text-black/55">
                      {
                        card.label
                      }
                    </div>

                    <div
                      className={`flex h-8 min-w-8 items-center justify-center rounded-full px-2 text-[13px] font-bold ${
                        active
                          ? "bg-[#ff5a1f] text-white"
                          : "bg-[#f1f0ea] text-black/55"
                      }`}
                    >
                      {
                        card.count
                      }
                    </div>

                  </div>

                  <div className="mt-2 text-[11px] leading-5 text-black/35">
                    {
                      card.hint
                    }
                  </div>

                </Link>
              );
            }
          )}

        </section>


        <section className="mt-5 rounded-[22px] border border-black/10 bg-white p-4 sm:p-5">

          <form
            method="get"
            className="flex flex-col gap-3 md:flex-row md:items-center"
          >

            {view !==
              "tutte" && (
              <input
                type="hidden"
                name="vista"
                value={
                  view
                }
              />
            )}


            <div className="relative min-w-0 flex-1">

              <input
                type="search"
                name="q"
                defaultValue={
                  params.q ??
                  ""
                }
                placeholder="Cerca riferimento, cliente, email, telefono o attrezzatura…"
                className="h-[50px] w-full rounded-[15px] border border-black/10 bg-[#f6f5f0] px-4 pr-12 text-[14px] outline-none transition placeholder:text-black/30 focus:border-[#ff5a1f]/45 focus:bg-white"
              />

              <div className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-[16px] text-black/25">
                ⌕
              </div>

            </div>


            <button
              type="submit"
              className="h-[50px] rounded-[15px] bg-[#181818] px-6 text-[14px] font-semibold text-white transition hover:bg-[#ff5a1f]"
            >
              Cerca
            </button>


            {(query ||
              view !==
                "tutte" ||
              legacyStatus) && (
              <Link
                href="/admin/richieste"
                className="flex h-[50px] items-center justify-center rounded-[15px] border border-black/10 bg-white px-5 text-[13px] font-semibold text-black/45 transition hover:bg-[#f6f5f0] hover:text-black"
              >
                Azzera
              </Link>
            )}

          </form>

        </section>


        <div className="flex items-end justify-between gap-5 px-1 pb-3 pt-7">

          <div>

            <div className="text-[11px] font-bold uppercase tracking-[0.11em] text-black/30">
              Risultati
            </div>

            <div className="mt-1 text-[22px] font-semibold tracking-[-0.035em]">
              {filtered.length}{" "}
              {filtered.length ===
              1
                ? "richiesta"
                : "richieste"}
            </div>

          </div>


          {view !==
            "tutte" && (
            <Link
              href="/admin/richieste"
              className="text-[12px] font-semibold text-black/35 transition hover:text-[#ff5a1f]"
            >
              Mostra tutte
            </Link>
          )}

        </div>


        {filtered.length ===
        0 ? (

          <section className="rounded-[24px] border border-black/10 bg-white p-8 text-center sm:p-12">

            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#f1f0ea] text-[18px]">
              —
            </div>

            <h2 className="mt-4 text-[24px] font-semibold tracking-[-0.035em]">
              Nessuna richiesta trovata.
            </h2>

            <p className="mx-auto mt-2 max-w-[520px] text-[14px] leading-6 text-black/40">
              Cambia filtro oppure azzera
              la ricerca per tornare
              all'elenco completo.
            </p>

          </section>

        ) : (

          <section className="overflow-hidden rounded-[24px] border border-black/10 bg-white">

            <div className="hidden grid-cols-[160px_minmax(180px,1fr)_175px_minmax(220px,1.2fr)_155px_180px_72px] gap-4 border-b border-black/10 bg-[#f5f4ef] px-5 py-3 text-[10px] font-bold uppercase tracking-[0.09em] text-black/30 xl:grid">

              <div>
                Richiesta
              </div>

              <div>
                Cliente
              </div>

              <div>
                Periodo
              </div>

              <div>
                Kit
              </div>

              <div>
                Importo
              </div>

              <div>
                Stato
              </div>

              <div className="text-right">
                Apri
              </div>

            </div>


            <div className="divide-y divide-black/10">

              {filtered.map(
                (
                  reservation
                ) => {

                  const customer =
                    first(
                      reservation.customers
                    );

                  const items =
                    reservation.reservation_items ??
                    [];

                  const products =
                    getProductNames(
                      reservation
                    );

                  const days =
                    rentalDays(
                      reservation.start_date,
                      reservation.end_date
                    );

                  const estimate =
                    estimatedTotal(
                      reservation
                    );

                  const quoteTotal =
                    reservation.quoted_total ===
                      null ||
                    reservation.quoted_total ===
                      undefined
                      ? null
                      : Number(
                          reservation.quoted_total
                        );

                  const finalTotal =
                    quoteTotal ??
                    estimate;

                  const quoteSent =
                    Boolean(
                      reservation.quote_sent_at
                    );

                  const pieces =
                    items.reduce(
                      (
                        sum,
                        item
                      ) =>
                        sum +
                        item.quantity,
                      0
                    );

                  return (
                    <article
                      key={
                        reservation.id
                      }
                      className="group transition hover:bg-[#fcfbf8]"
                    >

                      <div className="grid gap-4 p-5 sm:p-6 xl:grid-cols-[160px_minmax(180px,1fr)_175px_minmax(220px,1.2fr)_155px_180px_72px] xl:items-center xl:px-5 xl:py-4">

                        <div className="min-w-0">

                          <Link
                            href={`/admin/richieste/${reservation.id}`}
                            className="font-mono text-[13px] font-bold text-black/75 transition hover:text-[#ff5a1f]"
                          >
                            {
                              reservation.reference
                            }
                          </Link>

                          <div className="mt-1 text-[11px] text-black/30">
                            {
                              formatCreatedAt(
                                reservation.created_at
                              )
                            }
                          </div>

                        </div>


                        <div className="min-w-0">

                          <div className="truncate text-[15px] font-semibold">
                            {customer?.name ??
                              "Cliente"}
                          </div>

                          <div className="mt-1 truncate text-[11px] text-black/35">
                            {customer?.email ??
                              "—"}
                          </div>

                          {customer?.phone && (
                            <div className="mt-0.5 truncate text-[11px] text-black/30">
                              {
                                customer.phone
                              }
                            </div>
                          )}

                        </div>


                        <div>

                          <div className="text-[13px] font-semibold text-black/65">
                            {
                              formatDate(
                                reservation.start_date
                              )
                            }
                            {" → "}
                            {
                              formatDate(
                                reservation.end_date
                              )
                            }
                          </div>

                          <div className="mt-1 text-[11px] text-black/30">
                            {days}{" "}
                            {days ===
                            1
                              ? "giorno"
                              : "giorni"}
                          </div>

                        </div>


                        <div className="min-w-0">

                          <div className="truncate text-[13px] font-semibold text-black/60">
                            {products.length >
                            0
                              ? products
                                  .slice(
                                    0,
                                    2
                                  )
                                  .join(
                                    " · "
                                  )
                              : "Nessun prodotto"}
                          </div>

                          <div className="mt-1 text-[11px] text-black/30">
                            {pieces}{" "}
                            {pieces ===
                            1
                              ? "pezzo"
                              : "pezzi"}

                            {products.length >
                              2 &&
                              ` · +${
                                products.length -
                                2
                              } altri`}
                          </div>

                        </div>


                        <div>

                          <div className="text-[16px] font-semibold tracking-[-0.025em]">
                            {
                              formatMoney(
                                finalTotal
                              )
                            }
                          </div>

                          <div className="mt-1 text-[10px] font-semibold uppercase tracking-[0.06em] text-black/30">
                            {quoteTotal !==
                            null
                              ? "Preventivo"
                              : "Stima"}
                          </div>

                        </div>


                        <div className="flex flex-wrap items-center gap-2">

                          <span
                            className={`rounded-full px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.055em] ${statusClasses(
                              reservation.status
                            )}`}
                          >
                            {
                              statusLabel(
                                reservation.status
                              )
                            }
                          </span>


                          {reservation.status ===
                            "requested" && (
                            <span
                              className={`rounded-full px-3 py-1.5 text-[10px] font-bold ${
                                quoteSent
                                  ? "bg-[#e9f6ee] text-[#168a50]"
                                  : "bg-[#fff0e9] text-[#b14a20]"
                              }`}
                            >
                              {quoteSent
                                ? `Preventivo inviato${
                                    reservation.quote_revision
                                      ? ` · rev. ${reservation.quote_revision}`
                                      : ""
                                  }`
                                : "Da preventivare"}
                            </span>
                          )}

                        </div>


                        <div className="xl:text-right">

                          <Link
                            href={`/admin/richieste/${reservation.id}`}
                            className="inline-flex h-10 items-center justify-center rounded-[12px] bg-[#181818] px-4 text-[12px] font-semibold text-white transition group-hover:bg-[#ff5a1f]"
                          >
                            {canOperate
                              ? "Gestisci"
                              : "Apri"}
                          </Link>

                        </div>

                      </div>

                    </article>
                  );
                }
              )}

            </div>

          </section>
        )}

      </div>

    </main>
  );
}
