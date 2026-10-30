import Link from "next/link";
import { redirect } from "next/navigation";

import AdminLogoutButton from "@/components/AdminLogoutButton";
import { MaterialStatsServer } from "@/components/admin/MaterialStatsServer";

import { requireAdminAccess } from "@/lib/admin-auth";
import { getServerSupabase } from "@/lib/supabase-server";

export const dynamic = "force-dynamic";

type ReservationStatus =
  | "requested"
  | "confirmed"
  | "picked_up"
  | "returned"
  | "cancelled";

type Reservation = {
  id: string;
  reference: string;
  start_date: string;
  end_date: string;
  status: ReservationStatus;
  quote_sent_at: string | null;
  customers:
    | { name: string }
    | { name: string }[]
    | null;
  reservation_items:
    | {
        quantity: number;
        products:
          | { name: string }
          | { name: string }[]
          | null;
      }[]
    | null;
};

function first<T>(value: T | T[] | null) {
  if (!value) return null;
  return Array.isArray(value) ? value[0] ?? null : value;
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("it-IT", {
    day: "2-digit",
    month: "short",
  }).format(new Date(`${value}T00:00:00`));
}

function money(value: number) {
  return new Intl.NumberFormat("it-IT", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
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

function statusClasses(status: ReservationStatus) {
  switch (status) {
    case "requested":
      return "bg-[#fff2d5] text-[#8a650f]";
    case "confirmed":
      return "bg-[#edf2ff] text-[#245bff]";
    case "picked_up":
      return "bg-[#e9f6ee] text-[#168a50]";
    case "returned":
      return "bg-[#eeeeea] text-black/45";
    case "cancelled":
      return "bg-[#fff0ee] text-[#b7352b]";
  }
}

export default async function AdminPage() {
  const access = await requireAdminAccess([
    "admin",
    "operator",
    "viewer",
  ]);

  if (!access) {
    redirect("/admin/login");
  }

  const { user, profile } = access;

  const isAdmin = profile.role === "admin";
  const canManagePayments =
    profile.role === "admin" ||
    profile.role === "operator";

  const roleLabel =
    profile.role === "admin"
      ? "Admin"
      : profile.role === "operator"
        ? "Operatore"
        : "Viewer";

  const supabase = getServerSupabase();

  if (!supabase) {
    throw new Error("Supabase non configurato.");
  }

  const today = new Date();
  const todayKey = `${today.getFullYear()}-${String(
    today.getMonth() + 1
  ).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;

  const monthStart = new Date(
    today.getFullYear(),
    today.getMonth(),
    1
  );

  const nextMonthStart = new Date(
    today.getFullYear(),
    today.getMonth() + 1,
    1
  );

  const monthStartIso = monthStart.toISOString();
  const nextMonthStartIso = nextMonthStart.toISOString();

  const [
    reservationsResult,
    unitsResult,
    paymentsResult,
  ] = await Promise.all([
    supabase
      .from("reservations")
      .select(`
        id,
        reference,
        start_date,
        end_date,
        status,
        quote_sent_at,
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
      .neq("status", "cancelled")
      .order("start_date", { ascending: true }),

    supabase
      .from("product_units")
      .select("id,status"),

    supabase
      .from("reservation_payments")
      .select("amount,paid_at")
      .gte("paid_at", monthStartIso)
      .lt("paid_at", nextMonthStartIso),
  ]);

  const reservations =
    (reservationsResult.data ?? []) as unknown as Reservation[];

  const units =
    unitsResult.data ?? [];

  const monthPayments =
    paymentsResult.data ?? [];

  const todo = reservations.filter(
    (reservation) =>
      reservation.status === "requested" &&
      !reservation.quote_sent_at
  ).length;

  const confirmed = reservations.filter(
    (reservation) =>
      reservation.status === "confirmed"
  ).length;

  const outNow = reservations.filter(
    (reservation) =>
      reservation.status === "picked_up"
  ).length;

  const maintenance = units.filter(
    (unit) =>
      unit.status === "maintenance"
  ).length;

  const monthNet = monthPayments.reduce(
    (sum, payment) =>
      sum + Number(payment.amount ?? 0),
    0
  );

  const upcoming = reservations
    .filter(
      (reservation) =>
        reservation.status !== "returned" &&
        reservation.end_date >= todayKey
    )
    .slice(0, 6);

  const quickLinks = [
    {
      href: "/admin/richieste",
      eyebrow: "Rental",
      title: "Richieste",
      description: "Preventivi, conferme, consegne e rientri.",
      featured: true,
    },
    {
      href: "/admin/calendario",
      eyebrow: "Planning",
      title: "Calendario",
      description: "Tutti i noleggi ordinati per giorno.",
      featured: false,
    },
    {
      href: "/admin/inventario",
      eyebrow: "Gear",
      title: "Inventario",
      description: "Unità fisiche, seriali e manutenzione.",
      featured: false,
    },
    {
      href: "/admin/prodotti",
      eyebrow: "Catalogo",
      title: "Prodotti",
      description: "Schede, prezzi e disponibilità.",
      featured: false,
    },
  ];

  return (
    <main className="min-h-screen bg-[#ebeae4] px-4 pb-16 pt-5 text-[#111111] sm:px-6 lg:px-8 xl:px-10">
      <div className="mx-auto max-w-[1680px]">
        <header className="flex flex-col gap-4 rounded-[24px] border border-black/10 bg-white px-5 py-5 shadow-[0_10px_35px_rgba(0,0,0,0.035)] sm:px-7 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-11 w-11 items-center justify-center rounded-[13px] bg-[#181818] text-[13px] font-bold tracking-[-0.02em] text-white">
              LAP
            </div>

            <div>
              <div className="text-[11px] font-bold uppercase tracking-[0.12em] text-[#ff5a1f]">
                Rental control
              </div>
              <div className="mt-0.5 text-[24px] font-semibold tracking-[-0.04em]">
                Dashboard
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="hidden text-right sm:block">
              <div className="max-w-[280px] truncate text-[12px] font-semibold text-black/55">
                {user.email}
              </div>
              <div className="mt-0.5 text-[10px] font-bold uppercase tracking-[0.08em] text-black/25">
                {roleLabel}
              </div>
            </div>

            <div
              className="
                [&_button]:h-10
                [&_button]:rounded-[12px]
                [&_button]:border
                [&_button]:border-black/10
                [&_button]:bg-[#f4f3ee]
                [&_button]:px-4
                [&_button]:text-[12px]
                [&_button]:font-semibold
                [&_button]:text-black/55
                [&_button]:transition
                [&_button:hover]:bg-[#181818]
                [&_button:hover]:text-white
              "
            >
              <AdminLogoutButton />
            </div>
          </div>
        </header>

        <section className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
          <KpiCard
            label="Da gestire"
            value={String(todo)}
            hint="richieste senza preventivo"
            href="/admin/richieste?vista=da-gestire"
            warning={todo > 0}
          />

          <KpiCard
            label="Confermate"
            value={String(confirmed)}
            hint="noleggi da preparare"
            href="/admin/richieste?vista=confermate"
          />

          <KpiCard
            label="Materiale fuori"
            value={String(outNow)}
            hint="noleggi in corso"
            href="/admin/richieste?vista=in-corso"
            accent
          />

          <KpiCard
            label="Manutenzione"
            value={String(maintenance)}
            hint="unità da controllare"
            href="/admin/inventario?stato=maintenance"
            warning={maintenance > 0}
          />

          {canManagePayments ? (
            <KpiCard
              label="Incassato mese"
              value={money(monthNet)}
              hint="netto pagamenti registrati"
              href="/admin/pagamenti"
              accent
            />
          ) : (
            <KpiCard
              label="Unità fisiche"
              value={String(units.length)}
              hint="inventario totale"
              href="/admin/inventario"
            />
          )}
        </section>

        <section className="mt-5 grid gap-5 xl:grid-cols-[minmax(0,1.45fr)_minmax(340px,.55fr)]">
          <div className="overflow-hidden rounded-[24px] border border-black/10 bg-white">
            <div className="flex flex-col gap-3 border-b border-black/10 bg-[#fbfaf7] px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
              <div>
                <div className="text-[10px] font-bold uppercase tracking-[0.1em] text-[#ff5a1f]">
                  Agenda operativa
                </div>
                <div className="mt-1 text-[24px] font-semibold tracking-[-0.04em]">
                  Prossimi noleggi
                </div>
              </div>

              <Link
                href="/admin/calendario"
                className="text-[12px] font-semibold text-black/40 transition hover:text-[#ff5a1f]"
              >
                Apri calendario →
              </Link>
            </div>

            {upcoming.length === 0 ? (
              <div className="p-8 text-[13px] text-black/35">
                Nessun noleggio attivo o futuro.
              </div>
            ) : (
              <div className="divide-y divide-black/10">
                {upcoming.map((reservation) => {
                  const customer = first(reservation.customers);
                  const items = reservation.reservation_items ?? [];
                  const material = items
                    .map((item) => {
                      const product = first(item.products);
                      return product
                        ? `${item.quantity}× ${product.name}`
                        : null;
                    })
                    .filter(Boolean)
                    .slice(0, 3)
                    .join(" · ");

                  return (
                    <Link
                      key={reservation.id}
                      href={`/admin/richieste/${reservation.id}`}
                      className="grid gap-3 px-5 py-4 transition hover:bg-[#fbfaf7] sm:px-6 lg:grid-cols-[150px_minmax(180px,.8fr)_minmax(0,1.3fr)_130px_24px] lg:items-center"
                    >
                      <div>
                        <div className="font-mono text-[11px] font-semibold text-black/50">
                          {reservation.reference}
                        </div>
                        <div className="mt-1 text-[11px] text-black/30">
                          {formatDate(reservation.start_date)} → {formatDate(reservation.end_date)}
                        </div>
                      </div>

                      <div className="min-w-0">
                        <div className="truncate text-[13px] font-semibold">
                          {customer?.name ?? "Cliente"}
                        </div>
                      </div>

                      <div className="min-w-0 truncate text-[11px] text-black/40">
                        {material || "Nessun materiale"}
                      </div>

                      <div>
                        <span
                          className={`inline-flex rounded-full px-2.5 py-1 text-[9px] font-bold uppercase tracking-[0.05em] ${statusClasses(
                            reservation.status
                          )}`}
                        >
                          {statusLabel(reservation.status)}
                        </span>
                      </div>

                      <div className="text-right text-[16px] text-black/20">
                        →
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>

          <div className="space-y-5">
            <section className="rounded-[24px] bg-[#181818] p-6 text-white sm:p-7">
              <div className="text-[10px] font-bold uppercase tracking-[0.11em] text-[#ff7b4a]">
                Oggi
              </div>

              <div className="mt-2 text-[32px] font-semibold tracking-[-0.05em]">
                {new Intl.DateTimeFormat("it-IT", {
                  weekday: "long",
                  day: "numeric",
                  month: "long",
                }).format(today)}
              </div>

              <div className="mt-7 grid grid-cols-2 gap-3">
                <DarkMiniStat
                  label="Da gestire"
                  value={todo}
                />
                <DarkMiniStat
                  label="Fuori"
                  value={outNow}
                />
                <DarkMiniStat
                  label="Confermati"
                  value={confirmed}
                />
                <DarkMiniStat
                  label="Manutenzione"
                  value={maintenance}
                />
              </div>

              <Link
                href="/admin/richieste"
                className="mt-5 flex h-[46px] items-center justify-center rounded-[13px] bg-white text-[12px] font-semibold text-[#181818] transition hover:bg-[#ff5a1f] hover:text-white"
              >
                Gestisci richieste
              </Link>
            </section>

            {canManagePayments && (
              <section className="rounded-[24px] border border-black/10 bg-white p-6">
                <div className="text-[10px] font-bold uppercase tracking-[0.1em] text-[#ff5a1f]">
                  Finance
                </div>

                <div className="mt-2 text-[31px] font-semibold tracking-[-0.05em]">
                  {money(monthNet)}
                </div>

                <div className="mt-1 text-[11px] text-black/35">
                  netto registrato questo mese
                </div>

                <Link
                  href="/admin/pagamenti"
                  className="mt-5 inline-flex text-[12px] font-semibold text-black/45 transition hover:text-[#ff5a1f]"
                >
                  Vedi statistiche →
                </Link>
              </section>
            )}
          </div>
        </section>

        <section className="mt-5">
          <div className="mb-3 flex items-end justify-between px-1">
            <div>
              <div className="text-[10px] font-bold uppercase tracking-[0.1em] text-black/30">
                Moduli
              </div>
              <div className="mt-1 text-[22px] font-semibold tracking-[-0.035em]">
                Accesso rapido
              </div>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {quickLinks.map((link) => (
              <QuickModule
                key={link.href}
                {...link}
              />
            ))}
          </div>

          {(canManagePayments || isAdmin) && (
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              {canManagePayments && (
                <SmallModule
                  href="/admin/pagamenti"
                  label="Pagamenti"
                  text="Incassi, rimborsi e statistiche economiche."
                />
              )}

              {isAdmin && (
                <SmallModule
                  href="/admin/utenti"
                  label="Utenti"
                  text="Ruoli e autorizzazioni dello staff."
                />
              )}
            </div>
          )}
        </section>

        <div className="mt-10">
          <MaterialStatsServer />
        </div>
      </div>
    </main>
  );
}

function KpiCard({
  label,
  value,
  hint,
  href,
  accent = false,
  warning = false,
}: {
  label: string;
  value: string;
  hint: string;
  href: string;
  accent?: boolean;
  warning?: boolean;
}) {
  return (
    <Link
      href={href}
      className={`rounded-[20px] border p-4 transition hover:-translate-y-[1px] hover:shadow-[0_10px_28px_rgba(0,0,0,0.05)] ${
        accent
          ? "border-[#168a50]/15 bg-[#e9f6ee]"
          : warning
            ? "border-[#d98a08]/15 bg-[#fff2d5]"
            : "border-black/10 bg-white"
      }`}
    >
      <div className="text-[10px] font-bold uppercase tracking-[0.09em] text-black/30">
        {label}
      </div>
      <div className="mt-2 text-[30px] font-semibold leading-none tracking-[-0.05em]">
        {value}
      </div>
      <div className="mt-2 text-[10px] text-black/35">
        {hint}
      </div>
    </Link>
  );
}

function DarkMiniStat({
  label,
  value,
}: {
  label: string;
  value: number;
}) {
  return (
    <div className="rounded-[14px] bg-white/[0.07] px-4 py-3">
      <div className="text-[9px] font-bold uppercase tracking-[0.07em] text-white/30">
        {label}
      </div>
      <div className="mt-1 text-[20px] font-semibold">
        {value}
      </div>
    </div>
  );
}

function QuickModule({
  href,
  eyebrow,
  title,
  description,
  featured,
}: {
  href: string;
  eyebrow: string;
  title: string;
  description: string;
  featured: boolean;
}) {
  return (
    <Link
      href={href}
      className={`group rounded-[22px] border p-5 transition hover:-translate-y-[2px] hover:shadow-[0_14px_35px_rgba(0,0,0,0.06)] ${
        featured
          ? "border-[#ff5a1f]/20 bg-[#fff0e9]"
          : "border-black/10 bg-white"
      }`}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="text-[10px] font-bold uppercase tracking-[0.09em] text-[#ff5a1f]">
            {eyebrow}
          </div>
          <div className="mt-1 text-[24px] font-semibold tracking-[-0.04em]">
            {title}
          </div>
        </div>

        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#f1f0ea] text-[15px] transition group-hover:bg-[#181818] group-hover:text-white">
          ↗
        </div>
      </div>

      <p className="mt-4 text-[12px] leading-5 text-black/40">
        {description}
      </p>
    </Link>
  );
}

function SmallModule({
  href,
  label,
  text,
}: {
  href: string;
  label: string;
  text: string;
}) {
  return (
    <Link
      href={href}
      className="flex items-center justify-between gap-5 rounded-[18px] border border-black/10 bg-white px-5 py-4 transition hover:border-[#ff5a1f]/25"
    >
      <div>
        <div className="text-[13px] font-semibold">
          {label}
        </div>
        <div className="mt-1 text-[11px] text-black/35">
          {text}
        </div>
      </div>

      <div className="text-[16px] text-black/25">
        →
      </div>
    </Link>
  );
}
