import Link from "next/link";

import {
  redirect,
} from "next/navigation";

import {
  requireAdminAccess,
} from "@/lib/admin-auth";

import {
  AdminUsersClient,
} from "@/components/admin/AdminUsersClient";


export const dynamic =
  "force-dynamic";


export default async function AdminUsersPage() {

  const access =
    await requireAdminAccess([
      "admin",
    ]);


  if (!access) {
    redirect(
      "/admin/login"
    );
  }


  return (
    <main className="min-h-screen bg-[#ebeae4] px-5 pb-20 pt-8 text-[#111111] sm:px-8 lg:px-10 xl:px-14">

      <div className="mx-auto max-w-[1500px]">

        <header className="rounded-[30px] bg-[#181818] p-7 text-white sm:p-9 lg:p-11">

          <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">

            <div>

              <div className="text-[12px] font-bold uppercase tracking-[0.13em] text-[#ff7b4a]">
                LAP GEAR / ADMIN
              </div>


              <h1 className="mt-4 text-[48px] font-semibold leading-[0.95] tracking-[-0.055em] sm:text-[64px]">
                Utenti.
              </h1>


              <p className="mt-5 max-w-[700px] text-[16px] leading-7 text-white/50">
                Crea account per lo staff,
                assegna i ruoli e disattiva
                gli accessi quando necessario.
              </p>

            </div>


            <div className="flex flex-wrap gap-3">

              <Link
                href="/admin"
                className="flex h-[50px] items-center justify-center rounded-[14px] border border-white/15 bg-white/[0.06] px-5 text-[13px] font-semibold text-white transition hover:bg-white hover:text-[#181818]"
              >
                ← Dashboard
              </Link>


              <div className="flex h-[50px] items-center rounded-[14px] bg-[#ff5a1f] px-5 text-[13px] font-semibold text-white">
                {access.profile.name}
                {" · "}
                Admin
              </div>

            </div>

          </div>

        </header>


        <div className="mt-6">

          <AdminUsersClient />

        </div>

      </div>

    </main>
  );
}
