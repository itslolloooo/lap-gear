import Link from "next/link";

import {
  CheckoutChecklist,
  type CheckoutChecklistUnit,
} from "@/components/admin/CheckoutChecklist";

import {
  ReturnChecklist,
  type ReturnChecklistUnit,
} from "@/components/admin/ReturnChecklist";

import {
  RequestStatusForm,
} from "@/components/admin/RequestStatusForm";

import {
  QuotePanel,
} from "@/components/admin/QuotePanel";

import {
  notFound,
  redirect,
} from "next/navigation";

import {
  DeleteRequestButton,
} from "@/components/admin/DeleteRequestButton";

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


type SearchParams = {
  statusError?: string;
  statusSuccess?: string;

  assignmentError?: string;
  assignmentSuccess?: string;
};


type Customer = {
  name: string;
  email: string;

  phone:
    | string
    | null;
};


type Product = {
  id: number;
  name: string;

  deposit:
    | number
    | string;
};


type ProductUnit = {
  id: number;

  product_id:
    number;

  asset_code:
    string;

  serial_number:
    | string
    | null;

  status:
    | "available"
    | "maintenance"
    | "retired";
};


type UnitAssignment = {
  id: number;

  reservation_item_id:
    number;

  product_unit_id:
    number;

  product_units:
    | ProductUnit
    | ProductUnit[]
    | null;

  unit_condition_checks:
    | {
        id: number;

        stage:
          | "checkout"
          | "return";

        condition:
          | "ok"
          | "wear"
          | "damaged"
          | "missing";

        notes:
          | string
          | null;

        updated_at:
          string;
      }[]
    | null;
};


type ReservationItem = {
  id: number;

  product_id:
    number;

  quantity:
    number;

  price_day:
    | number
    | string;

  products:
    | Product
    | Product[]
    | null;

  unit_assignments:
    | UnitAssignment[]
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

  quoted_total:
    | number
    | string
    | null;

  quote_notes:
    | string
    | null;

  quote_sent_at:
    | string
    | null;

  quote_updated_at:
    | string
    | null;

  quote_deposit:
    | number
    | string
    | null;

  quote_payment_method:
    | string
    | null;

  quote_payment_details:
    | string
    | null;

  quote_valid_until:
    | string
    | null;

  quote_logistics:
    | string
    | null;

  quote_revision:
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


type AvailabilityBlockRow = {
  product_unit_id:
    number;
};


type ReservationIdRow = {
  id: string;
};


type ReservationItemIdRow = {
  id: number;
};


type BusyAssignmentRow = {
  product_unit_id:
    number;
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

export default async function AdminRequestPage({
  params,
  searchParams,
}: {
  params: Promise<{
    id: string;
  }>;

  searchParams?:
    Promise<SearchParams>;
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


  const canDelete =
    access.profile.role ===
      "admin";


  /* =======================================================
     PARAMS
     ======================================================= */

  const {
    id,
  } =
    await params;


  const query =
    searchParams
      ? await searchParams
      : {};


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
     REQUEST
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
          quoted_total,
          quote_notes,
          quote_sent_at,
          quote_updated_at,
          quote_deposit,
          quote_payment_method,
          quote_payment_details,
          quote_valid_until,
          quote_logistics,
          quote_revision,

          customers (
            name,
            email,
            phone
          ),

          reservation_items (
            id,
            product_id,
            quantity,
            price_day,

            products (
              id,
              name,
              deposit
            ),

            unit_assignments (
              id,
              reservation_item_id,
              product_unit_id,

              product_units (
                id,
                product_id,
                asset_code,
                serial_number,
                status
              ),

              unit_condition_checks (
                id,
                stage,
                condition,
                notes,
                updated_at
              )
            )
          )
        `
      )
      .eq(
        "id",
        id
      )
      .maybeSingle();


  if (error) {
    throw new Error(
      error.message
    );
  }


  if (!data) {
    notFound();
  }


  const reservation =
    data as unknown as
      Reservation;


  const items =
    reservation.reservation_items ??
    [];
  const checkoutChecklistUnits:
    CheckoutChecklistUnit[] =
    items.flatMap(
      (
        item
      ) => {

        const product =
          first(
            item.products
          );


        return (
          item.unit_assignments ??
          []
        ).flatMap(
          (
            assignment
          ) => {

            const unit =
              first(
                assignment.product_units
              );


            if (!unit) {
              return [];
            }


            const checkoutCheck =
              (
                assignment
                  .unit_condition_checks ??
                []
              ).find(
                (
                  check
                ) =>
                  check.stage ===
                  "checkout"
              );


            return [
              {
                assignmentId:
                  assignment.id,

                productName:
                  product?.name ??
                  "Prodotto",

                assetCode:
                  unit.asset_code,

                serialNumber:
                  unit.serial_number,

                condition:
                  checkoutCheck
                    ?.condition ??
                  null,

                notes:
                  checkoutCheck
                    ?.notes ??
                  "",
              },
            ];

          }
        );

      }
    );


  const returnChecklistUnits:
    ReturnChecklistUnit[] =
    items.flatMap(
      (
        item
      ) => {

        const product =
          first(
            item.products
          );


        return (
          item.unit_assignments ??
          []
        ).flatMap(
          (
            assignment
          ) => {

            const unit =
              first(
                assignment.product_units
              );


            if (!unit) {
              return [];
            }


            const checks =
              assignment
                .unit_condition_checks ??
              [];


            const checkoutCheck =
              checks.find(
                (
                  check
                ) =>
                  check.stage ===
                  "checkout"
              );


            const returnCheck =
              checks.find(
                (
                  check
                ) =>
                  check.stage ===
                  "return"
              );


            return [
              {
                assignmentId:
                  assignment.id,

                productName:
                  product?.name ??
                  "Prodotto",

                assetCode:
                  unit.asset_code,

                serialNumber:
                  unit.serial_number,

                checkoutCondition:
                  checkoutCheck
                    ?.condition ??
                  null,

                checkoutNotes:
                  checkoutCheck
                    ?.notes ??
                  "",

                condition:
                  returnCheck
                    ?.condition ??
                  null,

                notes:
                  returnCheck
                    ?.notes ??
                  "",
              },
            ];

          }
        );

      }
    );


  /* =======================================================
     PRODUCT UNITS
     ======================================================= */

  const productIds =
    [
      ...new Set(
        items.map(
          (
            item
          ) =>
            Number(
              item.product_id
            )
        )
      ),
    ];


  let units:
    ProductUnit[] =
    [];


  if (
    productIds.length >
    0
  ) {
    const {
      data:
        unitsData,
      error:
        unitsError,
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
            status
          `
        )
        .in(
          "product_id",
          productIds
        )
        .order(
          "asset_code",
          {
            ascending:
              true,
          }
        );


    if (
      unitsError
    ) {
      throw new Error(
        unitsError.message
      );
    }


    units =
      (
        unitsData ??
        []
      ) as ProductUnit[];
  }


  const unitIds =
    units.map(
      (
        unit
      ) =>
        Number(
          unit.id
        )
    );


  /* =======================================================
     BLOCKED UNITS
     =======================================================
     Blocchi che si sovrappongono alle date
     della richiesta corrente.
     ======================================================= */

  const blockedUnitIds =
    new Set<number>();


  if (
    unitIds.length >
    0
  ) {
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
          "product_unit_id"
        )
        .in(
          "product_unit_id",
          unitIds
        )
        .lte(
          "start_date",
          reservation.end_date
        )
        .gte(
          "end_date",
          reservation.start_date
        );


    if (
      blocksError
    ) {
      throw new Error(
        blocksError.message
      );
    }


    (
      (
        blocksData ??
        []
      ) as AvailabilityBlockRow[]
    ).forEach(
      (
        block
      ) => {
        blockedUnitIds.add(
          Number(
            block.product_unit_id
          )
        );
      }
    );
  }


  /* =======================================================
     BUSY UNITS
     =======================================================
     Cerchiamo le altre reservation attive
     che si sovrappongono a questa.
     ======================================================= */

  const busyUnitIds =
    new Set<number>();


  let overlappingReservationIds:
    string[] =
    [];


  const {
    data:
      overlappingReservations,
    error:
      overlappingReservationsError,
  } =
    await supabase
      .from(
        "reservations"
      )
      .select(
        "id"
      )
      .in(
        "status",
        [
          "confirmed",
          "picked_up",
        ]
      )
      .lte(
        "start_date",
        reservation.end_date
      )
      .gte(
        "end_date",
        reservation.start_date
      )
      .neq(
        "id",
        reservation.id
      );


  if (
    overlappingReservationsError
  ) {
    throw new Error(
      overlappingReservationsError.message
    );
  }


  overlappingReservationIds =
    (
      (
        overlappingReservations ??
        []
      ) as ReservationIdRow[]
    ).map(
      (
        row
      ) =>
        String(
          row.id
        )
    );


  /* =======================================================
     ITEMS DELLE ALTRE RESERVATION
     ======================================================= */

  let overlappingItemIds:
    number[] =
    [];


  if (
    overlappingReservationIds.length >
    0
  ) {
    const {
      data:
        overlappingItems,
      error:
        overlappingItemsError,
    } =
      await supabase
        .from(
          "reservation_items"
        )
        .select(
          "id"
        )
        .in(
          "reservation_id",
          overlappingReservationIds
        );


    if (
      overlappingItemsError
    ) {
      throw new Error(
        overlappingItemsError.message
      );
    }


    overlappingItemIds =
      (
        (
          overlappingItems ??
          []
        ) as ReservationItemIdRow[]
      ).map(
        (
          row
        ) =>
          Number(
            row.id
          )
      );
  }


  /* =======================================================
     UNITÀ ASSEGNATE AD ALTRI NOLEGGI
     ======================================================= */

  if (
    overlappingItemIds.length >
      0 &&
    unitIds.length >
      0
  ) {
    const {
      data:
        busyAssignments,
      error:
        busyAssignmentsError,
    } =
      await supabase
        .from(
          "unit_assignments"
        )
        .select(
          "product_unit_id"
        )
        .in(
          "reservation_item_id",
          overlappingItemIds
        )
        .in(
          "product_unit_id",
          unitIds
        );


    if (
      busyAssignmentsError
    ) {
      throw new Error(
        busyAssignmentsError.message
      );
    }


    (
      (
        busyAssignments ??
        []
      ) as BusyAssignmentRow[]
    ).forEach(
      (
        assignment
      ) => {
        busyUnitIds.add(
          Number(
            assignment.product_unit_id
          )
        );
      }
    );
  }


  /* =======================================================
     CALCULATIONS
     ======================================================= */

  const customer =
    first(
      reservation.customers
    );


  const days =
    rentalDays(
      reservation.start_date,
      reservation.end_date
    );


  const total =
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


  const totalQuantity =
    items.reduce(
      (
        sum,
        item
      ) =>
        sum +
        item.quantity,
      0
    );


  const totalAssigned =
    items.reduce(
      (
        sum,
        item
      ) =>
        sum +
        (
          item.unit_assignments
            ?.length ??
          0
        ),
      0
    );


  const canAssign =
    canOperate &&
    reservation.status ===
      "confirmed";


  const quotedTotal =
    reservation.quoted_total ===
      null
      ? null
      : Number(
          reservation.quoted_total
        );


  const quoteDeposit =
    reservation.quote_deposit ===
      null
      ? null
      : Number(
          reservation.quote_deposit
        );


  const suggestedDeposit =
    items.reduce(
      (
        sum,
        item
      ) => {
        const product =
          first(
            item.products
          );

        return (
          sum +
          Number(
            product?.deposit ??
              0
          ) *
            item.quantity
        );
      },
      0
    );


  const quoteRevision =
    Number(
      reservation.quote_revision ??
        0
    ) || 0;


  const canEditQuote =
    canOperate &&
    (
      reservation.status ===
        "requested" ||
      reservation.status ===
        "confirmed"
    );


  const allAssigned =
    totalQuantity >
      0 &&
    totalAssigned >=
      totalQuantity;


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
            href="/admin/richieste"
            className="shrink-0 transition hover:text-[#ff5a1f]"
          >
            Richieste
          </Link>

          <span>
            /
          </span>

          <span className="truncate text-black/65">
            {
              reservation.reference
            }
          </span>

        </div>


        {/* =================================================
            HERO
            ================================================= */}

        <section className="overflow-hidden rounded-[30px] border border-black/10 bg-white shadow-[0_18px_60px_rgba(0,0,0,0.06)]">

          <div className="grid xl:grid-cols-[1fr_400px]">

            <div className="relative overflow-hidden p-8 sm:p-10 lg:p-12">

              <div className="pointer-events-none absolute -right-32 -top-36 h-[360px] w-[360px] rounded-full bg-[#ff5a1f]/[0.07]" />


              <div className="relative">

                <div className="flex flex-wrap items-center gap-3">

                  <div className="text-[13px] font-bold uppercase tracking-[0.13em] text-[#ff5a1f]">
                    Rental Request
                  </div>

                  <StatusBadge
                    status={
                      reservation.status
                    }
                  />

                </div>


                <h1 className="mt-4 break-words font-mono text-[43px] font-semibold leading-[0.94] tracking-[-0.055em] sm:text-[58px]">
                  {
                    reservation.reference
                  }
                </h1>


                <div className="mt-6 text-[20px] font-semibold tracking-[-0.025em]">
                  {customer?.name ??
                    "Cliente"}
                </div>


                <div className="mt-7">

                  <Link
                    href="/admin/richieste"
                    className="inline-flex h-[52px] items-center justify-center rounded-[15px] border border-black/10 bg-[#f1f0ea] px-5 text-[14px] font-semibold text-black/55 transition hover:bg-white hover:text-black"
                  >
                    ← Richieste
                  </Link>

                </div>

              </div>

            </div>


            {/* RIGHT */}

            <div className="relative overflow-hidden bg-[#181818] p-8 text-white sm:p-9">

              <div className="pointer-events-none absolute -right-24 -top-24 h-[230px] w-[230px] rounded-full bg-[#ff5a1f]/20" />


              <div className="relative">

                <div className="text-[11px] font-bold uppercase tracking-[0.12em] text-[#ff7b4a]">
                  Request overview
                </div>


                <div className="mt-7 grid grid-cols-2 gap-3">

                  <HeroStat
                    value={
                      days
                    }
                    label={
                      days ===
                      1
                        ? "Giorno"
                        : "Giorni"
                    }
                  />

                  <HeroStat
                    value={
                      totalQuantity
                    }
                    label="Pezzi"
                  />

                  <HeroStat
                    value={
                      totalAssigned
                    }
                    label="Assegnati"
                    success={
                      allAssigned
                    }
                  />

                  <HeroStat
                    value={
                      items.length
                    }
                    label="Prodotti"
                  />

                </div>


                <div className="mt-6 border-t border-white/10 pt-5">

                  <div className="text-[10px] font-bold uppercase tracking-[0.09em] text-white/30">
                    Stima noleggio
                  </div>

                  <div className="mt-2 text-[31px] font-semibold tracking-[-0.045em]">
                    {
                      formatMoney(
                        total
                      )
                    }
                  </div>

                </div>

              </div>

            </div>

          </div>

        </section>


        {/* =================================================
            WORKFLOW
            ================================================= */}

        <section className="mt-6 overflow-hidden rounded-[24px] border border-black/10 bg-white">

          <div className="grid sm:grid-cols-4">

            <WorkflowStep
              number="01"
              label="Richiesta"
              active={
                reservation.status ===
                  "requested"
              }
              complete={
                reservation.status !==
                  "requested" &&
                reservation.status !==
                  "cancelled"
              }
            />

            <WorkflowStep
              number="02"
              label="Confermata"
              active={
                reservation.status ===
                  "confirmed"
              }
              complete={
                reservation.status ===
                  "picked_up" ||
                reservation.status ===
                  "returned"
              }
            />

            <WorkflowStep
              number="03"
              label="Ritirata"
              active={
                reservation.status ===
                  "picked_up"
              }
              complete={
                reservation.status ===
                  "returned"
              }
            />

            <WorkflowStep
              number="04"
              label="Restituita"
              active={
                reservation.status ===
                  "returned"
              }
              complete={
                false
              }
            />

          </div>

        </section>


        {/* =================================================
            MAIN GRID
            ================================================= */}

        <div className="mt-7 grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">

          {/* =================================================
              LEFT
              ================================================= */}

          <div className="space-y-6">

            {/* CUSTOMER / PERIOD */}

            <section className="grid gap-5 lg:grid-cols-2">

              <article className="rounded-[24px] border border-black/10 bg-white p-6 sm:p-7">

                <div className="text-[11px] font-bold uppercase tracking-[0.11em] text-[#ff5a1f]">
                  Cliente
                </div>

                <h2 className="mt-3 text-[28px] font-semibold tracking-[-0.04em]">
                  {customer?.name ??
                    "—"}
                </h2>


                <div className="mt-5 space-y-3">

                  <InfoRow
                    label="Email"
                    value={
                      customer?.email ??
                      "—"
                    }
                  />

                  <InfoRow
                    label="Telefono"
                    value={
                      customer?.phone ||
                      "Non indicato"
                    }
                  />

                </div>

              </article>


              <article className="rounded-[24px] border border-black/10 bg-white p-6 sm:p-7">

                <div className="text-[11px] font-bold uppercase tracking-[0.11em] text-[#ff5a1f]">
                  Periodo
                </div>


                <div className="mt-4">

                  <div className="text-[13px] font-semibold text-black/35">
                    Ritiro
                  </div>

                  <div className="mt-1 text-[22px] font-semibold">
                    {formatDate(
                      reservation.start_date
                    )}
                  </div>

                </div>


                <div className="mt-4 border-t border-black/10 pt-4">

                  <div className="text-[13px] font-semibold text-black/35">
                    Riconsegna
                  </div>

                  <div className="mt-1 text-[22px] font-semibold">
                    {formatDate(
                      reservation.end_date
                    )}
                  </div>

                </div>


                <div className="mt-5 rounded-[14px] bg-[#f3f2ed] px-4 py-3 text-[13px] font-semibold text-black/50">
                  {days}{" "}
                  {days ===
                  1
                    ? "giorno di noleggio"
                    : "giorni di noleggio"}
                </div>

              </article>

            </section>


            {/* =================================================
                QUOTE
                ================================================= */}

            <QuotePanel
              requestId={
                reservation.id
              }
              reference={
                reservation.reference
              }
              customerName={
                customer?.name ??
                "Cliente"
              }
              customerEmail={
                customer?.email ??
                ""
              }
              estimateTotal={
                total
              }
              suggestedDeposit={
                suggestedDeposit
              }
              quotedTotal={
                quotedTotal
              }
              quoteDeposit={
                quoteDeposit
              }
              quotePaymentMethod={
                reservation.quote_payment_method
              }
              quotePaymentDetails={
                reservation.quote_payment_details
              }
              quoteValidUntil={
                reservation.quote_valid_until
              }
              quoteLogistics={
                reservation.quote_logistics
              }
              quoteNotes={
                reservation.quote_notes
              }
              quoteSentAt={
                reservation.quote_sent_at
              }
              quoteRevision={
                quoteRevision
              }
              canEdit={
                canEditQuote
              }
            />


            {/* =================================================
                EQUIPMENT
                ================================================= */}

            <section className="overflow-hidden rounded-[25px] border border-black/10 bg-white">

              <div className="border-b border-black/10 bg-[#fbfaf7] p-6 sm:p-7">

                <div className="text-[11px] font-bold uppercase tracking-[0.11em] text-[#ff5a1f]">
                  Equipment
                </div>


                <div className="mt-2 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">

                  <div>

                    <h2 className="text-[30px] font-semibold tracking-[-0.045em]">
                      Materiale richiesto.
                    </h2>

                    <p className="mt-2 text-[14px] leading-6 text-black/45">
                      La selezione mostra solo
                      le unità realmente libere
                      nelle date del noleggio.
                    </p>

                  </div>


                  <div
                    className={`rounded-full px-4 py-2 text-[12px] font-semibold ${
                      allAssigned
                        ? "bg-[#e9f6ee] text-[#168a50]"
                        : "bg-[#f1f0ea] text-black/45"
                    }`}
                  >
                    {
                      totalAssigned
                    }
                    /
                    {
                      totalQuantity
                    }{" "}
                    assegnate
                  </div>

                </div>

              </div>


              {/* ASSIGNMENT ERROR */}

              {query.assignmentError && (
                <div className="border-b border-[#cf3d32]/15 bg-[#fff0ee] px-6 py-4 sm:px-7">

                  <div className="flex items-start gap-3">

                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#cf3d32] text-[12px] font-bold text-white">
                      !
                    </div>

                    <div>

                      <div className="text-[11px] font-bold uppercase tracking-[0.09em] text-[#b7352b]">
                        Assegnazione non riuscita
                      </div>

                      <div className="mt-1 text-[13px] leading-6 text-[#9d352c]">
                        {
                          query.assignmentError
                        }
                      </div>

                    </div>

                  </div>

                </div>
              )}


              {/* ASSIGNMENT SUCCESS */}

              {query.assignmentSuccess && (
                <div className="border-b border-[#168a50]/15 bg-[#e9f6ee] px-6 py-4 sm:px-7">

                  <div className="flex items-center gap-3">

                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#168a50] text-[12px] font-bold text-white">
                      ✓
                    </div>

                    <div className="text-[13px] font-semibold text-[#168a50]">
                      {
                        query.assignmentSuccess
                      }
                    </div>

                  </div>

                </div>
              )}


              <div className="divide-y divide-black/10">

                {items.map(
                  (
                    item
                  ) => {
                    const product =
                      first(
                        item.products
                      );


                    const assignments =
                      item.unit_assignments ??
                      [];


                    const assignedIds =
                      new Set(
                        assignments.map(
                          (
                            assignment
                          ) =>
                            Number(
                              assignment.product_unit_id
                            )
                        )
                      );


                    /*
                     * =================================================
                     * UNITÀ REALMENTE SELEZIONABILI
                     * =================================================
                     *
                     * 1. prodotto corretto
                     * 2. stato available
                     * 3. non già assegnata a questa riga
                     * 4. nessun blocco calendario
                     * 5. non occupata da altro noleggio sovrapposto
                     */

                    const candidateUnits =
                      units.filter(
                        (
                          unit
                        ) => {
                          const unitId =
                            Number(
                              unit.id
                            );


                          return (
                            Number(
                              unit.product_id
                            ) ===
                              Number(
                                item.product_id
                              ) &&
                            unit.status ===
                              "available" &&
                            !assignedIds.has(
                              unitId
                            ) &&
                            !blockedUnitIds.has(
                              unitId
                            ) &&
                            !busyUnitIds.has(
                              unitId
                            )
                          );
                        }
                      );


                    const remaining =
                      Math.max(
                        0,
                        item.quantity -
                          assignments.length
                      );


                    const lineTotal =
                      Number(
                        item.price_day
                      ) *
                      item.quantity *
                      days;


                    return (
                      <article
                        key={
                          item.id
                        }
                        className="p-6 sm:p-7"
                      >

                        {/* PRODUCT */}

                        <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">

                          <div>

                            <div className="flex flex-wrap items-center gap-2">

                              <span className="rounded-full bg-[#181818] px-3 py-1.5 text-[11px] font-bold text-white">
                                {
                                  item.quantity
                                }×
                              </span>


                              <span
                                className={`rounded-full px-3 py-1.5 text-[11px] font-bold ${
                                  remaining ===
                                  0
                                    ? "bg-[#e9f6ee] text-[#168a50]"
                                    : "bg-[#fff2d5] text-[#aa6b08]"
                                }`}
                              >
                                {remaining ===
                                0
                                  ? "Unità complete"
                                  : `${remaining} da assegnare`}
                              </span>

                            </div>


                            <h3 className="mt-3 text-[25px] font-semibold tracking-[-0.04em]">
                              {product?.name ??
                                "Prodotto"}
                            </h3>


                            <div className="mt-2 text-[13px] text-black/42">
                              €
                              {Number(
                                item.price_day
                              ).toFixed(
                                2
                              )}{" "}
                              / giorno ×{" "}
                              {days}{" "}
                              {days ===
                              1
                                ? "giorno"
                                : "giorni"}
                            </div>

                          </div>


                          <div className="text-left sm:text-right">

                            <div className="text-[10px] font-bold uppercase tracking-[0.09em] text-black/30">
                              Riga
                            </div>

                            <div className="mt-1 text-[23px] font-semibold">
                              {
                                formatMoney(
                                  lineTotal
                                )
                              }
                            </div>

                          </div>

                        </div>


                        {/* =================================================
                            ASSIGNED UNITS
                            ================================================= */}

                        <div className="mt-6">

                          <div className="text-[11px] font-bold uppercase tracking-[0.1em] text-black/35">
                            Unità assegnate
                          </div>


                          {assignments.length ===
                          0 ? (
                            <div className="mt-3 rounded-[15px] border border-dashed border-black/15 bg-[#f6f5f0] px-4 py-4 text-[13px] text-black/40">
                              Nessuna unità ancora
                              assegnata.
                            </div>
                          ) : (
                            <div className="mt-3 grid gap-2">

                              {assignments.map(
                                (
                                  assignment
                                ) => {
                                  const unit =
                                    first(
                                      assignment.product_units
                                    );


                                  return (
                                    <div
                                      key={
                                        assignment.id
                                      }
                                      className="flex flex-col gap-3 rounded-[15px] border border-black/10 bg-[#f3f2ed] p-4 sm:flex-row sm:items-center sm:justify-between"
                                    >

                                      <div>

                                        <div className="flex flex-wrap items-center gap-2">

                                          <Link
                                            href={
                                              unit
                                                ? `/admin/inventario/${unit.id}`
                                                : "#"
                                            }
                                            className="font-mono text-[14px] font-bold text-black/70 transition hover:text-[#ff5a1f]"
                                          >
                                            {unit?.asset_code ??
                                              "Unità"}
                                          </Link>


                                          <span className="h-2 w-2 rounded-full bg-[#168a50]" />

                                        </div>


                                        {unit?.serial_number && (
                                          <div className="mt-1 font-mono text-[11px] text-black/35">
                                            S/N{" "}
                                            {
                                              unit.serial_number
                                            }
                                          </div>
                                        )}

                                      </div>


                                      {canOperate &&
                                        reservation.status ===
                                          "confirmed" && (
                                        <form
                                          action="/api/admin/assignments"
                                          method="post"
                                        >

                                          <input
                                            type="hidden"
                                            name="action"
                                            value="remove"
                                          />

                                          <input
                                            type="hidden"
                                            name="reservation_id"
                                            value={
                                              reservation.id
                                            }
                                          />

                                          <input
                                            type="hidden"
                                            name="assignment_id"
                                            value={
                                              assignment.id
                                            }
                                          />


                                          <button
                                            type="submit"
                                            className="flex h-[42px] items-center justify-center rounded-[12px] border border-[#cf3d32]/15 bg-[#fff0ee] px-4 text-[12px] font-semibold text-[#b7352b] transition hover:bg-[#cf3d32] hover:text-white"
                                          >
                                            Rimuovi
                                          </button>

                                        </form>
                                      )}

                                    </div>
                                  );
                                }
                              )}

                            </div>
                          )}

                        </div>


                        {/* =================================================
                            ASSIGN NEW UNIT
                            ================================================= */}

                        <div className="mt-5">

                          {!canAssign ? (
                            <div className="rounded-[15px] border border-[#d98a08]/20 bg-[#fff2d5] px-4 py-4 text-[13px] leading-6 text-[#8a650f]">
                              {!canOperate
                                ? "Modalità sola lettura: il tuo ruolo non può modificare le assegnazioni."
                                : reservation.status === "picked_up" ||
                                    reservation.status === "returned"
                                  ? "Assegnazioni bloccate: dopo il ritiro le unità fisiche non possono più essere modificate."
                                  : "Conferma prima la richiesta per assegnare le unità fisiche."}
                            </div>
                          ) : remaining ===
                            0 ? (
                            <div className="rounded-[15px] border border-[#168a50]/15 bg-[#e9f6ee] px-4 py-4 text-[13px] font-semibold text-[#168a50]">
                              ✓ Tutte le unità
                              richieste sono state
                              assegnate.
                            </div>
                          ) : candidateUnits.length ===
                            0 ? (
                            <div className="rounded-[15px] border border-[#cf3d32]/15 bg-[#fff0ee] px-4 py-4">

                              <div className="text-[13px] font-semibold text-[#b7352b]">
                                Nessuna unità libera
                                nelle date richieste.
                              </div>

                              <div className="mt-1 text-[12px] leading-5 text-[#9d352c]/70">
                                Le unità operative
                                risultano già
                                impegnate oppure
                                bloccate nel periodo{" "}
                                {formatDate(
                                  reservation.start_date
                                )}{" "}
                                →{" "}
                                {formatDate(
                                  reservation.end_date
                                )}.
                              </div>

                            </div>
                          ) : (
                            <div>

                              <div className="mb-3 flex flex-wrap items-center justify-between gap-2">

                                <div className="text-[11px] font-bold uppercase tracking-[0.09em] text-black/35">
                                  Assegna unità
                                </div>

                                <div className="rounded-full bg-[#e9f6ee] px-3 py-1.5 text-[10px] font-bold text-[#168a50]">
                                  {
                                    candidateUnits.length
                                  }{" "}
                                  {candidateUnits.length ===
                                  1
                                    ? "unità libera"
                                    : "unità libere"}
                                </div>

                              </div>


                              <form
                                action="/api/admin/assignments"
                                method="post"
                                className="grid gap-3 sm:grid-cols-[1fr_auto]"
                              >

                                <input
                                  type="hidden"
                                  name="action"
                                  value="assign"
                                />

                                <input
                                  type="hidden"
                                  name="reservation_id"
                                  value={
                                    reservation.id
                                  }
                                />

                                <input
                                  type="hidden"
                                  name="reservation_item_id"
                                  value={
                                    item.id
                                  }
                                />


                                <select
                                  name="product_unit_id"
                                  required
                                  defaultValue=""
                                  className="h-[54px] min-w-0 rounded-[14px] border border-black/10 bg-[#f6f5f0] px-4 text-[14px] font-medium outline-none transition focus:border-[#ff5a1f]/45 focus:bg-white"
                                >

                                  <option value="">
                                    Seleziona unità ·{" "}
                                    {
                                      remaining
                                    }{" "}
                                    da assegnare
                                  </option>


                                  {candidateUnits.map(
                                    (
                                      unit
                                    ) => (
                                      <option
                                        key={
                                          unit.id
                                        }
                                        value={
                                          unit.id
                                        }
                                      >
                                        {
                                          unit.asset_code
                                        }
                                        {unit.serial_number
                                          ? ` · S/N ${unit.serial_number}`
                                          : ""}
                                      </option>
                                    )
                                  )}

                                </select>


                                <button
                                  type="submit"
                                  className="h-[54px] rounded-[14px] bg-[#181818] px-6 text-[14px] font-semibold text-white transition hover:bg-[#ff5a1f]"
                                >
                                  Assegna
                                </button>

                              </form>

                            </div>
                          )}

                        </div>

                      </article>
                    );
                  }
                )}

              </div>


              {/* TOTAL */}

              <div className="flex flex-col gap-3 border-t border-black/10 bg-[#181818] p-6 text-white sm:flex-row sm:items-end sm:justify-between sm:p-7">

                <div>

                  <div className="text-[11px] font-bold uppercase tracking-[0.1em] text-[#ff7b4a]">
                    Totale stimato
                  </div>

                  <div className="mt-1 text-[13px] text-white/35">
                    {
                      totalQuantity
                    }{" "}
                    {totalQuantity ===
                    1
                      ? "pezzo"
                      : "pezzi"}{" "}
                    ·{" "}
                    {
                      days
                    }{" "}
                    {days ===
                    1
                      ? "giorno"
                      : "giorni"}
                  </div>

                </div>


                <div className="text-[36px] font-semibold tracking-[-0.05em]">
                  {
                    formatMoney(
                      total
                    )
                  }
                </div>

              </div>

            </section>


            {/* =================================================
                CHECKOUT CHECKLIST
                ================================================= */}

            {(reservation.status ===
              "confirmed" ||
              reservation.status ===
                "picked_up" ||
              reservation.status ===
                "returned") &&
              checkoutChecklistUnits.length >
                0 && (
                <CheckoutChecklist
                  units={
                    checkoutChecklistUnits
                  }
                  editable={
                    canOperate &&
                    reservation.status ===
                      "confirmed"
                  }
                />
              )}


            {/* =================================================
                RETURN CHECKLIST
                ================================================= */}

            {(reservation.status ===
              "picked_up" ||
              reservation.status ===
                "returned") &&
              returnChecklistUnits.length >
                0 && (
                <ReturnChecklist
                  units={
                    returnChecklistUnits
                  }
                  editable={
                    canOperate &&
                    reservation.status ===
                      "picked_up"
                  }
                />
              )}


            {/* NOTES */}

            <section className="rounded-[24px] border border-black/10 bg-white p-6 sm:p-7">

              <div className="text-[11px] font-bold uppercase tracking-[0.11em] text-[#ff5a1f]">
                Note richiesta
              </div>

              <p className="mt-4 whitespace-pre-wrap text-[15px] leading-7 text-black/55">
                {reservation.notes ||
                  "Nessuna nota inserita dal cliente."}
              </p>

            </section>

          </div>


          {/* =================================================
              SIDEBAR
              ================================================= */}

          <aside className="space-y-5 xl:sticky xl:top-[110px]">

            {/* STATUS */}

            <section className="overflow-hidden rounded-[24px] bg-[#181818] text-white">

              <div className="border-b border-white/10 p-6">

                <div className="text-[11px] font-bold uppercase tracking-[0.11em] text-[#ff7b4a]">
                  Rental Control
                </div>

                <h2 className="mt-2 text-[27px] font-semibold tracking-[-0.04em]">
                  Stato noleggio.
                </h2>

              </div>


              {query.statusError && (
                <div className="mx-6 mt-6 rounded-[15px] border border-[#cf3d32]/20 bg-[#fff0ee] px-4 py-4 text-[13px] font-medium leading-6 text-[#a9362d]">
                  {
                    query.statusError
                  }
                </div>
              )}


              {query.statusSuccess && (
                <div className="mx-6 mt-6 rounded-[15px] border border-[#168a50]/15 bg-[#e9f6ee] px-4 py-4 text-[13px] font-medium leading-6 text-[#168a50]">
                  ✓{" "}
                  {
                    query.statusSuccess
                  }
                </div>
              )}


              {canOperate ? (
                <RequestStatusForm
                  requestId={
                    reservation.id
                  }
                  currentStatus={
                    reservation.status
                  }
                />
              ) : (
                <div className="m-6 rounded-[15px] border border-white/10 bg-white/[0.06] px-4 py-4 text-[13px] leading-6 text-white/55">
                  Modalità sola lettura.
                  Il ruolo Viewer non può
                  modificare lo stato del
                  noleggio.
                </div>
              )}
            </section>


            {/* EQUIPMENT STATUS */}

            <section className="rounded-[24px] border border-black/10 bg-white p-6">

              <div className="text-[11px] font-bold uppercase tracking-[0.11em] text-[#ff5a1f]">
                Equipment status
              </div>


              <div className="mt-4 flex items-end justify-between gap-4">

                <div>

                  <div className="text-[35px] font-semibold leading-none tracking-[-0.05em]">
                    {
                      totalAssigned
                    }
                    /
                    {
                      totalQuantity
                    }
                  </div>

                  <div className="mt-2 text-[12px] text-black/40">
                    unità assegnate
                  </div>

                </div>


                <div
                  className={`flex h-11 w-11 items-center justify-center rounded-full text-[18px] font-bold ${
                    allAssigned
                      ? "bg-[#e9f6ee] text-[#168a50]"
                      : "bg-[#fff2d5] text-[#aa6b08]"
                  }`}
                >
                  {allAssigned
                    ? "✓"
                    : "!"}
                </div>

              </div>


              <div className="mt-5 h-2 overflow-hidden rounded-full bg-[#ecebe6]">

                <div
                  className={`h-full rounded-full ${
                    allAssigned
                      ? "bg-[#168a50]"
                      : "bg-[#ff5a1f]"
                  }`}
                  style={{
                    width:
                      totalQuantity >
                      0
                        ? `${Math.min(
                            100,
                            (
                              totalAssigned /
                              totalQuantity
                            ) *
                              100
                          )}%`
                        : "0%",
                  }}
                />

              </div>

            </section>


            {/* INFO */}

            <section className="rounded-[24px] border border-black/10 bg-white p-6">

              <div className="text-[11px] font-bold uppercase tracking-[0.11em] text-black/35">
                Informazioni
              </div>


              <div className="mt-5 space-y-4">

                <InfoRow
                  label="Riferimento"
                  value={
                    reservation.reference
                  }
                  mono
                />

                <InfoRow
                  label="Ricevuta"
                  value={
                    formatDateTime(
                      reservation.created_at
                    )
                  }
                />

                <InfoRow
                  label="Durata"
                  value={`${days} ${
                    days ===
                    1
                      ? "giorno"
                      : "giorni"
                  }`}
                />

              </div>

            </section>


            {/* DELETE */}

            {canDelete && (
              <DeleteRequestButton
                requestId={
                  reservation.id
                }
                reference={
                  reservation.reference
                }
              />
            )}

          </aside>

        </div>

      </div>
    </main>
  );
}


/* =========================================================
   STATUS BADGE
   ========================================================= */

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


/* =========================================================
   HERO STAT
   ========================================================= */

function HeroStat({
  value,
  label,
  success = false,
}: {
  value:
    string
    | number;

  label:
    string;

  success?:
    boolean;
}) {
  return (
    <div className="rounded-[16px] border border-white/10 bg-white/[0.06] p-4">

      <div
        className={`text-[27px] font-semibold tracking-[-0.045em] ${
          success
            ? "text-[#6bd49c]"
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


/* =========================================================
   WORKFLOW
   ========================================================= */

function WorkflowStep({
  number,
  label,
  active,
  complete,
}: {
  number: string;
  label: string;
  active: boolean;
  complete: boolean;
}) {
  return (
    <div className="border-b border-black/10 p-5 last:border-b-0 sm:border-b-0 sm:border-r sm:last:border-r-0">

      <div className="flex items-center gap-3">

        <div
          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[11px] font-bold ${
            complete
              ? "bg-[#e9f6ee] text-[#168a50]"
              : active
                ? "bg-[#ff5a1f] text-white"
                : "bg-[#f1f0ea] text-black/35"
          }`}
        >
          {complete
            ? "✓"
            : number}
        </div>


        <div>

          <div
            className={`text-[14px] font-semibold ${
              active
                ? "text-[#ff5a1f]"
                : "text-black/60"
            }`}
          >
            {
              label
            }
          </div>

          <div className="mt-0.5 text-[11px] text-black/30">
            {complete
              ? "Completato"
              : active
                ? "Stato attuale"
                : "Successivo"}
          </div>

        </div>

      </div>

    </div>
  );
}


/* =========================================================
   INFO ROW
   ========================================================= */

function InfoRow({
  label,
  value,
  mono = false,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div>

      <div className="text-[10px] font-bold uppercase tracking-[0.09em] text-black/30">
        {
          label
        }
      </div>

      <div
        className={`mt-1 break-words text-[14px] font-semibold text-black/65 ${
          mono
            ? "font-mono"
            : ""
        }`}
      >
        {
          value
        }
      </div>

    </div>
  );
}