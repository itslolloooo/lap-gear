import Link from "next/link";
import { redirect } from "next/navigation";

import { requireAdminAccess } from "@/lib/admin-auth";
import { getServerSupabase } from "@/lib/supabase-server";

export const dynamic = "force-dynamic";

type ReservationStatus =
  | "requested"
  | "confirmed"
  | "picked_up"
  | "returned"
  | "cancelled";

type Customer = {
  name: string;
};

type Product = {
  name: string;
};

type Item = {
  quantity: number;
  products: Product | Product[] | null;
};

type Reservation = {
  id: string;
  reference: string;
  start_date: string;
  end_date: string;
  status: ReservationStatus;
  customers: Customer | Customer[] | null;
  reservation_items: Item[] | null;
};

type SearchParams = {
  mese?: string;
  stato?: string;
};

function first<T>(value: T | T[] | null) {
  if (!value) return null;
  return Array.isArray(value) ? value[0] ?? null : value;
}

function parseMonth(value?: string) {
  const match = String(value ?? "").match(/^(\d{4})-(\d{2})$/);

  if (match) {
    const year = Number(match[1]);
    const month = Number(match[2]) - 1;

    if (month >= 0 && month <= 11) {
      return new Date(year, month, 1);
    }
  }

  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), 1);
}

function monthKey(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

function dateKey(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function addDays(date: Date, days: number) {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

function statusLabel(status: ReservationStatus) {
  switch (status) {
    case "requested":
      return "Da gestire";
    case "confirmed":
      return "Confermata";
    case "picked_up":
      return "In corso";
    case "returned":
      return "Restituita";
    case "cancelled":
      return "Annullata";
  }
}

function statusClass(status: ReservationStatus) {
  switch (status) {
    case "requested":
      return "border-[#d98a08]/20 bg-[#fff2d5] text-[#8a650f]";
    case "confirmed":
      return "border-[#245bff]/15 bg-[#edf2ff] text-[#245bff]";
    case "picked_up":
      return "border-[#168a50]/15 bg-[#e9f6ee] text-[#126f41]";
    case "returned":
      return "border-black/10 bg-[#f0efea] text-black/45";
    case "cancelled":
      return "border-[#cf3d32]/10 bg-[#fff0ee] text-[#b7352b] opacity-60";
  }
}

function formatShortDate(value: string) {
  return new Intl.DateTimeFormat("it-IT", {
    day: "2-digit",
    month: "2-digit",
  }).format(new Date(`${value}T00:00:00`));
}

export default async function AdminCalendarPage({
  searchParams,
}: {
  searchParams?: Promise<SearchParams>;
}) {
  const access = await requireAdminAccess([
    "admin",
    "operator",
    "viewer",
  ]);

  if (!access) {
    redirect("/admin/login");
  }

  const params = searchParams ? await searchParams : {};
  const monthDate = parseMonth(params.mese);
  const statusFilter = String(params.stato ?? "attivi");

  const firstDay = new Date(
    monthDate.getFullYear(),
    monthDate.getMonth(),
    1
  );

  const lastDay = new Date(
    monthDate.getFullYear(),
    monthDate.getMonth() + 1,
    0
  );

  const gridStart = addDays(
    firstDay,
    -((firstDay.getDay() + 6) % 7)
  );

  const gridEnd = addDays(
    lastDay,
    6 - ((lastDay.getDay() + 6) % 7)
  );

  const supabase = getServerSupabase();

  if (!supabase) {
    throw new Error("Supabase non configurato.");
  }

  const { data, error } = await supabase
    .from("reservations")
    .select(`
      id,
      reference,
      start_date,
      end_date,
      status,
      customers (
        name
      ),
      reservation_items (
        quantity,
        products (
          name
        )
      )
    `)
    .lte("start_date", dateKey(gridEnd))
    .gte("end_date", dateKey(gridStart))
    .order("start_date", { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  let reservations = (data ?? []) as unknown as Reservation[];

  if (statusFilter === "attivi") {
    reservations = reservations.filter(
      (reservation) =>
        reservation.status !== "returned" &&
        reservation.status !== "cancelled"
    );
  } else if (statusFilter !== "tutti") {
    reservations = reservations.filter(
      (reservation) =>
        reservation.status === statusFilter
    );
  }

  const eventsByDay = new Map<string, Reservation[]>();

  for (const reservation of reservations) {
    const start = new Date(`${reservation.start_date}T00:00:00`);
    const end = new Date(`${reservation.end_date}T00:00:00`);

    for (
      let cursor = new Date(start);
      cursor <= end;
      cursor = addDays(cursor, 1)
    ) {
      if (cursor < gridStart || cursor > gridEnd) continue;

      const key = dateKey(cursor);
      const list = eventsByDay.get(key) ?? [];
      list.push(reservation);
      eventsByDay.set(key, list);
    }
  }

  const days: Date[] = [];
  for (
    let cursor = new Date(gridStart);
    cursor <= gridEnd;
    cursor = addDays(cursor, 1)
  ) {
    days.push(new Date(cursor));
  }

  const previousMonth = new Date(
    monthDate.getFullYear(),
    monthDate.getMonth() - 1,
    1
  );

  const nextMonth = new Date(
    monthDate.getFullYear(),
    monthDate.getMonth() + 1,
    1
  );

  const monthTitle = new Intl.DateTimeFormat("it-IT", {
    month: "long",
    year: "numeric",
  }).format(monthDate);

  const today = dateKey(new Date());

  const activeCount = reservations.filter(
    (reservation) =>
      reservation.status === "confirmed" ||
      reservation.status === "picked_up"
  ).length;

  return (
    <main className="min-h-screen bg-[#ebeae4] px-4 pb-16 pt-5 text-[#111111] sm:px-6 lg:px-8 xl:px-10">
      <div className="mx-auto max-w-[1680px]">
        <section className="overflow-hidden rounded-[28px] border border-black/10 bg-white shadow-[0_14px_45px_rgba(0,0,0,0.045)]">
          <div className="grid lg:grid-cols-[1fr_330px]">
            <div className="p-7 sm:p-9">
              <div className="text-[12px] font-bold uppercase tracking-[0.12em] text-[#ff5a1f]">
                Rental calendar
              </div>

              <div className="mt-2 flex flex-wrap items-end gap-4">
                <h1 className="capitalize text-[46px] font-semibold leading-none tracking-[-0.055em] sm:text-[58px]">
                  {monthTitle}
                </h1>

                <div className="pb-1 text-[13px] font-medium text-black/35">
                  {reservations.length} noleggi visibili
                </div>
              </div>

              <p className="mt-4 max-w-[720px] text-[15px] leading-6 text-black/45">
                Ogni noleggio rimane visibile per tutto il periodo dal ritiro al rientro. Clicca un evento per aprire direttamente la richiesta.
              </p>
            </div>

            <div className="flex flex-col justify-between bg-[#181818] p-7 text-white sm:p-8">
              <div>
                <div className="text-[10px] font-bold uppercase tracking-[0.1em] text-[#ff7b4a]">
                  Noleggi operativi
                </div>

                <div className="mt-2 text-[38px] font-semibold tracking-[-0.05em]">
                  {activeCount}
                </div>

                <div className="mt-1 text-[12px] text-white/40">
                  confermati o in corso nel periodo
                </div>
              </div>

              <Link
                href="/admin/richieste"
                className="mt-7 inline-flex h-[46px] items-center justify-center rounded-[13px] bg-white/[0.08] px-4 text-[12px] font-semibold text-white transition hover:bg-white hover:text-[#181818]"
              >
                Vai alle richieste →
              </Link>
            </div>
          </div>
        </section>

        <section className="mt-5 rounded-[22px] border border-black/10 bg-white p-4 sm:p-5">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center gap-2">
              <Link
                href={`/admin/calendario?mese=${monthKey(previousMonth)}&stato=${encodeURIComponent(statusFilter)}`}
                className="flex h-[44px] w-[44px] items-center justify-center rounded-[13px] border border-black/10 bg-[#f6f5f0] text-[18px] transition hover:bg-[#181818] hover:text-white"
              >
                ←
              </Link>

              <Link
                href="/admin/calendario"
                className="flex h-[44px] items-center justify-center rounded-[13px] border border-black/10 bg-[#f6f5f0] px-4 text-[12px] font-semibold text-black/55 transition hover:bg-white hover:text-black"
              >
                Oggi
              </Link>

              <Link
                href={`/admin/calendario?mese=${monthKey(nextMonth)}&stato=${encodeURIComponent(statusFilter)}`}
                className="flex h-[44px] w-[44px] items-center justify-center rounded-[13px] border border-black/10 bg-[#f6f5f0] text-[18px] transition hover:bg-[#181818] hover:text-white"
              >
                →
              </Link>
            </div>

            <div className="flex flex-wrap gap-2">
              {[
                ["attivi", "Attivi"],
                ["requested", "Da gestire"],
                ["confirmed", "Confermati"],
                ["picked_up", "In corso"],
                ["tutti", "Tutti"],
              ].map(([key, label]) => (
                <Link
                  key={key}
                  href={`/admin/calendario?mese=${monthKey(monthDate)}&stato=${key}`}
                  className={`rounded-full px-4 py-2 text-[11px] font-semibold transition ${
                    statusFilter === key
                      ? "bg-[#181818] text-white"
                      : "bg-[#f1f0ea] text-black/45 hover:text-black"
                  }`}
                >
                  {label}
                </Link>
              ))}
            </div>
          </div>
        </section>

        <section className="mt-5 overflow-hidden rounded-[24px] border border-black/10 bg-white">
          <div className="grid grid-cols-7 border-b border-black/10 bg-[#f5f4ef] text-center text-[10px] font-bold uppercase tracking-[0.08em] text-black/30">
            {["Lun", "Mar", "Mer", "Gio", "Ven", "Sab", "Dom"].map((day) => (
              <div key={day} className="border-r border-black/10 px-2 py-3 last:border-r-0">
                {day}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7">
            {days.map((day) => {
              const key = dateKey(day);
              const events = eventsByDay.get(key) ?? [];
              const inMonth =
                day.getMonth() === monthDate.getMonth();
              const isToday = key === today;

              return (
                <div
                  key={key}
                  className={`min-h-[150px] border-b border-r border-black/10 p-2 sm:min-h-[176px] sm:p-3 [&:nth-child(7n)]:border-r-0 ${
                    inMonth ? "bg-white" : "bg-[#faf9f6]"
                  }`}
                >
                  <div className="mb-2 flex items-center justify-between">
                    <div
                      className={`flex h-8 w-8 items-center justify-center rounded-full text-[12px] font-semibold ${
                        isToday
                          ? "bg-[#ff5a1f] text-white"
                          : inMonth
                            ? "text-black/60"
                            : "text-black/20"
                      }`}
                    >
                      {day.getDate()}
                    </div>

                    {events.length > 0 && (
                      <div className="text-[9px] font-bold text-black/20">
                        {events.length}
                      </div>
                    )}
                  </div>

                  <div className="space-y-1.5">
                    {events.slice(0, 4).map((reservation) => {
                      const customer = first(reservation.customers);
                      const itemNames = (reservation.reservation_items ?? [])
                        .map((item) => {
                          const product = first(item.products);
                          return product
                            ? `${item.quantity}× ${product.name}`
                            : null;
                        })
                        .filter(Boolean);

                      return (
                        <Link
                          key={reservation.id}
                          href={`/admin/richieste/${reservation.id}`}
                          className={`block rounded-[11px] border px-2.5 py-2 transition hover:-translate-y-[1px] hover:shadow-sm ${statusClass(
                            reservation.status
                          )}`}
                        >
                          <div className="flex items-center justify-between gap-2">
                            <div className="truncate font-mono text-[9px] font-bold">
                              {reservation.reference}
                            </div>

                            <div className="shrink-0 text-[8px] font-bold uppercase tracking-[0.04em] opacity-60">
                              {statusLabel(reservation.status)}
                            </div>
                          </div>

                          <div className="mt-1 truncate text-[11px] font-semibold">
                            {customer?.name ?? "Cliente"}
                          </div>

                          <div className="mt-0.5 truncate text-[9px] opacity-65">
                            {itemNames.join(" · ") || "Nessun materiale"}
                          </div>

                          <div className="mt-1 text-[8px] opacity-55">
                            {formatShortDate(reservation.start_date)} → {formatShortDate(reservation.end_date)}
                          </div>
                        </Link>
                      );
                    })}

                    {events.length > 4 && (
                      <div className="px-1 text-[9px] font-semibold text-black/30">
                        +{events.length - 4} altri
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </div>
    </main>
  );
}
