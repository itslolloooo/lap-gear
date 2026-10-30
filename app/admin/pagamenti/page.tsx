import {
  redirect,
} from "next/navigation";

import {
  PaymentsDashboard,
} from "@/components/admin/PaymentsDashboard";

import {
  requireAdminAccess,
} from "@/lib/admin-auth";


export const dynamic =
  "force-dynamic";


export default async function AdminPaymentsPage() {
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

  return (
    <main className="min-h-screen bg-[#ebeae4] px-5 pb-16 pt-6 text-[#111111] sm:px-8 lg:px-10 lg:pb-20 xl:px-14">
      <div className="mx-auto max-w-[1680px]">
        <section className="mb-6 overflow-hidden rounded-[30px] border border-black/10 bg-white shadow-[0_18px_60px_rgba(0,0,0,0.05)]">
          <div className="grid lg:grid-cols-[1fr_360px]">
            <div className="relative overflow-hidden p-8 sm:p-10 lg:p-12">
              <div className="pointer-events-none absolute -right-32 -top-36 h-[360px] w-[360px] rounded-full bg-[#ff5a1f]/[0.07]" />

              <div className="relative">
                <div className="text-[12px] font-bold uppercase tracking-[0.12em] text-[#ff5a1f]">
                  Finance / Rental
                </div>

                <h1 className="mt-4 text-[50px] font-semibold leading-[0.94] tracking-[-0.055em] sm:text-[68px]">
                  Pagamenti
                  <br />
                  e incassi.
                </h1>

                <p className="mt-5 max-w-[700px] text-[16px] leading-7 text-black/50">
                  Storico completo dei movimenti economici collegati alle richieste di noleggio.
                </p>
              </div>
            </div>

            <div className="flex flex-col justify-between bg-[#181818] p-8 text-white sm:p-9">
              <div>
                <div className="text-[11px] font-bold uppercase tracking-[0.11em] text-[#ff7b4a]">
                  Cash Control
                </div>

                <div className="mt-3 text-[31px] font-semibold tracking-[-0.045em]">
                  Incassi.
                  <br />
                  Storico.
                  <br />
                  Statistiche.
                </div>
              </div>

              <div className="mt-8 text-[12px] leading-5 text-white/40">
                I dati derivano dai movimenti registrati nelle singole richieste.
              </div>
            </div>
          </div>
        </section>

        <PaymentsDashboard />
      </div>
    </main>
  );
}
