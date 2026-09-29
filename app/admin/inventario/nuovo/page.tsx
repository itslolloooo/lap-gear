import Link from "next/link";

import {
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


export default async function NewInventoryUnitPage() {

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
     PRODUCTS
     ======================================================= */

  const {
    data:
      products,
    error,
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

  if (error) {
    throw new Error(
      error.message
    );
  }


  return (
    <main className="min-h-screen bg-[#ebeae4] px-5 pb-16 pt-6 text-[#111111] sm:px-8 lg:px-10 lg:pb-20 xl:px-14">

      <div className="mx-auto max-w-[1500px]">

        {/* BREADCRUMB */}

        <div className="mb-5 flex items-center gap-2 text-[13px] font-semibold text-black/40">

          <Link
            href="/admin"
            className="transition hover:text-[#ff5a1f]"
          >
            Admin
          </Link>

          <span>
            /
          </span>

          <Link
            href="/admin/inventario"
            className="transition hover:text-[#ff5a1f]"
          >
            Inventario
          </Link>

          <span>
            /
          </span>

          <span className="text-black/65">
            Nuova unità
          </span>

        </div>


        {/* HERO */}

        <section className="mb-7 overflow-hidden rounded-[30px] border border-black/10 bg-white shadow-[0_18px_60px_rgba(0,0,0,0.055)]">

          <div className="grid lg:grid-cols-[1fr_330px]">

            <div className="relative overflow-hidden p-8 sm:p-10">

              <div className="pointer-events-none absolute -right-28 -top-32 h-[330px] w-[330px] rounded-full bg-[#ff5a1f]/[0.07]" />

              <div className="relative">

                <div className="text-[13px] font-bold uppercase tracking-[0.13em] text-[#ff5a1f]">
                  Inventory Control
                </div>

                <h1 className="mt-3 text-[48px] font-semibold leading-[0.93] tracking-[-0.058em] sm:text-[61px]">
                  Nuova
                  <br />

                  <span className="text-[#ff5a1f]">
                    unità fisica.
                  </span>
                </h1>

                <p className="mt-5 max-w-[650px] text-[16px] leading-7 text-black/50">
                  Registra il singolo
                  pezzo reale associandolo
                  al prodotto del catalogo.
                </p>

              </div>
            </div>


            <div className="flex flex-col justify-between bg-[#181818] p-8 text-white">

              <div>

                <div className="text-[11px] font-bold uppercase tracking-[0.12em] text-[#ff7b4a]">
                  Asset Registry
                </div>

                <div className="mt-3 text-[27px] font-semibold leading-tight">
                  Un prodotto.
                  <br />
                  Più unità.
                </div>

              </div>


              <p className="mt-10 text-[13px] leading-6 text-white/40">
                Asset code e seriale
                identificano il singolo
                esemplare che verrà poi
                assegnato alle richieste.
              </p>

            </div>

          </div>
        </section>


        {/* FORM */}

        <InventoryUnitForm
          products={
            products ??
            []
          }
          action="/api/admin/inventory"
          submitLabel="Crea unità"
        />

      </div>
    </main>
  );
}