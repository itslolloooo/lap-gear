import Link from "next/link";
import { redirect } from "next/navigation";

import AdminLogoutButton from "@/components/AdminLogoutButton";

import {
  requireAdminAccess,
} from "@/lib/admin-auth";

export const dynamic =
  "force-dynamic";

export default async function AdminPage() {
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

  const {
    user,
    profile,
  } = access;

  const isAdmin =
    profile.role ===
    "admin";

  const roleLabel =
    profile.role ===
      "admin"
      ? "Admin"
      : profile.role ===
          "operator"
        ? "Operatore"
        : "Viewer";

  return (
    <main className="min-h-screen bg-[#ebeae4] px-5 py-8 text-[#111111] sm:px-8 lg:px-12">
      <div className="mx-auto max-w-[1680px]">

        {/* =====================================================
            HERO
            ===================================================== */}

        <section className="overflow-hidden rounded-[30px] border border-black/10 bg-white shadow-[0_20px_65px_rgba(0,0,0,0.07)]">
          <div className="grid xl:grid-cols-[1fr_390px]">

            {/* LEFT */}

            <div className="relative overflow-hidden p-8 sm:p-10 lg:p-14">
              <div className="pointer-events-none absolute -right-32 -top-40 h-[420px] w-[420px] rounded-full bg-[#ff5a1f]/[0.08]" />

              <div className="pointer-events-none absolute -bottom-48 right-[17%] h-[330px] w-[330px] rounded-full border-[62px] border-black/[0.025]" />

              <div className="relative">
                <div className="inline-flex items-center gap-2.5 rounded-full bg-[#fff0e9] px-4 py-2 text-[13px] font-bold uppercase tracking-[0.12em] text-[#e94b12]">
                  <span className="h-2 w-2 rounded-full bg-[#ff5a1f]" />

                  LAP GEAR / Admin
                </div>

                <h1 className="mt-7 max-w-[900px] text-[58px] font-semibold leading-[0.89] tracking-[-0.065em] sm:text-[76px] lg:text-[92px]">
                  Gestisci
                  <br />

                  <span className="text-[#ff5a1f]">
                    il gear.
                  </span>
                </h1>

                <p className="mt-7 max-w-[700px] text-[18px] leading-8 text-black/60">
                  Catalogo, unità fisiche,
                  disponibilità e richieste
                  di noleggio in un unico
                  pannello operativo.
                </p>

                <div className="mt-10 flex flex-col gap-5 border-t border-black/10 pt-6 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <div className="text-[13px] font-bold uppercase tracking-[0.09em] text-black/40">
                      Sessione attiva
                    </div>

                    <div className="mt-1 flex flex-wrap items-center gap-2">
                      <span className="text-[16px] font-semibold">
                        {user.email}
                      </span>

                      <span className="rounded-full bg-[#fff0e9] px-3 py-1 text-[10px] font-bold uppercase tracking-[0.08em] text-[#ff5a1f]">
                        {roleLabel}
                      </span>
                    </div>
                  </div>

                  <div
                    className="
                      [&_button]:h-12
                      [&_button]:rounded-[14px]
                      [&_button]:border
                      [&_button]:border-black/10
                      [&_button]:bg-[#f3f2ed]
                      [&_button]:px-5
                      [&_button]:text-[14px]
                      [&_button]:font-semibold
                      [&_button]:text-black/60
                      [&_button]:transition
                      [&_button:hover]:border-black/25
                      [&_button:hover]:bg-[#151515]
                      [&_button:hover]:text-white
                    "
                  >
                    <AdminLogoutButton />
                  </div>
                </div>
              </div>
            </div>

            {/* RIGHT */}

            <div className="relative flex min-h-[330px] flex-col justify-between overflow-hidden bg-[#181818] p-8 text-white sm:p-10">
              <div className="pointer-events-none absolute -right-24 -top-24 h-[260px] w-[260px] rounded-full bg-[#ff5a1f]/20" />

              <div className="relative">
                <div className="flex items-center gap-3 text-[13px] font-bold uppercase tracking-[0.11em] text-white/50">
                  <span className="h-2.5 w-2.5 rounded-full bg-[#1ab36b]" />

                  Sistema operativo
                </div>

                <div className="mt-9 text-[40px] font-semibold leading-[0.96] tracking-[-0.055em]">
                  Rental
                  <br />
                  Control.
                </div>

                <div className="mt-6 h-1.5 w-16 rounded-full bg-[#ff5a1f]" />
              </div>

              <div className="relative mt-16 grid grid-cols-2 gap-3">
                <MiniStatus
                  number="01"
                  label="Catalogo"
                />

                <MiniStatus
                  number="02"
                  label="Inventario"
                />

                <MiniStatus
                  number="03"
                  label="Richieste"
                />

                <MiniStatus
                  number="04"
                  label="Disponibilità"
                />
              </div>
            </div>
          </div>
        </section>

        {/* =====================================================
            OPERATIONS
            ===================================================== */}

        <section className="py-12">
          <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <div className="text-[13px] font-bold uppercase tracking-[0.13em] text-[#ff5a1f]">
                Operazioni
              </div>

              <h2 className="mt-2 text-[42px] font-semibold tracking-[-0.05em] sm:text-[52px]">
                Cosa vuoi gestire?
              </h2>
            </div>

            <div className="max-w-[420px] text-[15px] leading-7 text-black/50">
              Tutto il flusso del
              noleggio, dal prodotto
              alla singola unità fisica.
            </div>
          </div>

          <div
            className={`grid gap-5 ${
              isAdmin
                ? "lg:grid-cols-4"
                : "lg:grid-cols-3"
            }`}
          >
            <AdminCard
              href="/admin/prodotti"
              number="01"
              eyebrow="Catalogo"
              title="Prodotti"
              description={
                isAdmin
                  ? "Schede prodotto, tariffe, immagini e dati tecnici."
                  : "Consulta catalogo, tariffe e dati tecnici."
              }
            />

            <AdminCard
              href="/admin/inventario"
              number="02"
              eyebrow="Gear fisico"
              title="Inventario"
              description={
                profile.role === "viewer"
                  ? "Consulta unità fisiche, seriali e stato operativo."
                  : "Unità fisiche, seriali, manutenzione e disponibilità."
              }
            />

            <AdminCard
              href="/admin/richieste"
              number="03"
              eyebrow="Rental"
              title="Richieste"
              description={
                profile.role ===
                "viewer"
                  ? "Consulta clienti, date, materiale e stato dei noleggi."
                  : "Clienti, date, preparazione kit e stato dei noleggi."
              }
              featured
            />

            {isAdmin && (
              <AdminCard
                href="/admin/utenti"
                number="04"
                eyebrow="Accessi"
                title="Utenti"
                description="Account staff, ruoli e autorizzazioni."
              />
            )}
          </div>
        </section>

        {/* =====================================================
            WORKFLOW
            ===================================================== */}

        <section className="mb-10 overflow-hidden rounded-[28px] bg-[#181818] text-white">
          <div className="grid lg:grid-cols-[350px_1fr]">

            <div className="relative overflow-hidden border-b border-white/10 p-8 sm:p-9 lg:border-b-0 lg:border-r">
              <div className="pointer-events-none absolute -bottom-24 -left-24 h-[220px] w-[220px] rounded-full bg-[#ff5a1f]/20" />

              <div className="relative">
                <div className="text-[13px] font-bold uppercase tracking-[0.12em] text-[#ff7b4a]">
                  Workflow
                </div>

                <h2 className="mt-4 text-[34px] font-semibold leading-[1.02] tracking-[-0.05em]">
                  Dal kit
                  <br />
                  al rientro.
                </h2>

                <p className="mt-5 max-w-[260px] text-[14px] leading-6 text-white/50">
                  Un unico flusso per
                  gestire materiale e
                  noleggi senza perdere
                  il controllo.
                </p>
              </div>
            </div>

            <div className="grid sm:grid-cols-2 xl:grid-cols-4">
              <FlowStep
                number="01"
                title="Richiesta"
                text="Il cliente compone il kit."
              />

              <FlowStep
                number="02"
                title="Verifica"
                text="Controlli date e disponibilità."
              />

              <FlowStep
                number="03"
                title="Consegna"
                text="Assegni le unità fisiche."
              />

              <FlowStep
                number="04"
                title="Rientro"
                text="Chiudi il noleggio."
              />
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}


/* =========================================================
   ADMIN CARD
   ========================================================= */

function AdminCard({
  href,
  number,
  eyebrow,
  title,
  description,
  featured = false,
}: {
  href: string;
  number: string;
  eyebrow: string;
  title: string;
  description: string;
  featured?: boolean;
}) {
  return (
    <Link
      href={href}
      className={`
        group
        relative
        flex
        min-h-[370px]
        flex-col
        overflow-hidden
        rounded-[27px]
        border
        transition
        duration-300
        hover:-translate-y-1
        hover:shadow-[0_25px_65px_rgba(0,0,0,0.09)]

        ${
          featured
            ? "border-[#ff5a1f]/20 bg-[#fff2ec]"
            : "border-black/10 bg-white hover:border-[#ff5a1f]/35"
        }
      `}
    >
      {/* accent line */}

      <div
        className={`
          h-[6px]
          w-full
          transition
          duration-300

          ${
            featured
              ? "bg-[#ff5a1f]"
              : "bg-[#181818] group-hover:bg-[#ff5a1f]"
          }
        `}
      />

      <div className="flex flex-1 flex-col justify-between p-7 sm:p-8">
        <div className="flex items-start justify-between">
          <div
            className={`
              flex
              h-12
              w-12
              items-center
              justify-center
              rounded-full
              text-[13px]
              font-bold

              ${
                featured
                  ? "bg-[#ff5a1f] text-white"
                  : "bg-[#efeee8] text-black/55"
              }
            `}
          >
            {number}
          </div>

          <div
            className={`
              flex
              h-12
              w-12
              items-center
              justify-center
              rounded-full
              text-[21px]
              transition
              duration-300
              group-hover:bg-[#ff5a1f]
              group-hover:text-white

              ${
                featured
                  ? "bg-white text-[#ff5a1f]"
                  : "bg-[#efeee8] text-black/55"
              }
            `}
          >
            ↗
          </div>
        </div>

        <div className="mt-16">
          <div className="text-[13px] font-bold uppercase tracking-[0.11em] text-[#ff5a1f]">
            {eyebrow}
          </div>

          <h3 className="mt-2 text-[42px] font-semibold leading-none tracking-[-0.055em]">
            {title}
          </h3>

          <p className="mt-5 max-w-[420px] text-[16px] leading-7 text-black/58">
            {description}
          </p>

          <div
            className={`
              mt-8
              flex
              items-center
              justify-between
              border-t
              pt-5

              ${
                featured
                  ? "border-[#ff5a1f]/15"
                  : "border-black/10"
              }
            `}
          >
            <span className="text-[13px] font-bold uppercase tracking-[0.08em] text-black/40">
              LAP GEAR
            </span>

            <span className="text-[14px] font-semibold">
              Apri →
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}


/* =========================================================
   MINI STATUS
   ========================================================= */

function MiniStatus({
  number,
  label,
}: {
  number: string;
  label: string;
}) {
  return (
    <div className="rounded-[16px] border border-white/10 bg-white/[0.065] p-4">
      <div className="text-[12px] font-bold text-[#ff7b4a]">
        {number}
      </div>

      <div className="mt-2 text-[14px] font-semibold text-white/80">
        {label}
      </div>
    </div>
  );
}


/* =========================================================
   FLOW
   ========================================================= */

function FlowStep({
  number,
  title,
  text,
}: {
  number: string;
  title: string;
  text: string;
}) {
  return (
    <div className="border-b border-white/10 p-7 last:border-b-0 sm:[&:nth-child(odd)]:border-r xl:border-b-0 xl:border-r xl:last:border-r-0">
      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#ff5a1f]/15 text-[12px] font-bold text-[#ff7b4a]">
        {number}
      </div>

      <div className="mt-6 text-[20px] font-semibold">
        {title}
      </div>

      <p className="mt-2 text-[14px] leading-6 text-white/50">
        {text}
      </p>
    </div>
  );
}