import Link from "next/link";

import {
  redirect,
} from "next/navigation";

import {
  CategoryManager,
} from "@/components/admin/CategoryManager";

import {
  requireAdminAccess,
} from "@/lib/admin-auth";

import {
  getServerSupabase,
} from "@/lib/supabase-server";


export const dynamic =
  "force-dynamic";


type Category = {
  id: number;
  name: string;
  slug: string;
  position: number;
  active: boolean;
};


export default async function AdminCategoriesPage() {
  const access =
    await requireAdminAccess([
      "admin",
    ]);

  if (
    !access ||
    !access.isOwner
  ) {
    redirect(
      "/admin"
    );
  }

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
        "categories"
      )
      .select(
        `
          id,
          name,
          slug,
          position,
          active
        `
      )
      .eq(
        "active",
        true
      )
      .order(
        "name",
        {
          ascending: true,
        }
      );

  if (error) {
    throw new Error(
      error.message
    );
  }

  const categories =
    (data ??
      []) as Category[];

  return (
    <main className="min-h-screen bg-[#ebeae4] px-5 pb-16 pt-6 text-[#111111] sm:px-8 lg:px-10 lg:pb-20 xl:px-14">
      <div className="mx-auto max-w-[1400px]">
        <div className="mb-5 flex items-center gap-2 text-[13px] font-semibold text-black/40">
          <Link
            href="/admin"
            className="transition hover:text-[#ff5a1f]"
          >
            Admin
          </Link>
          <span>/</span>
          <Link
            href="/admin/prodotti"
            className="transition hover:text-[#ff5a1f]"
          >
            Prodotti
          </Link>
          <span>/</span>
          <span className="text-black/65">
            Categorie
          </span>
        </div>

        <section className="mb-6 overflow-hidden rounded-[30px] border border-black/10 bg-white shadow-[0_18px_60px_rgba(0,0,0,0.05)]">
          <div className="grid lg:grid-cols-[1fr_340px]">
            <div className="relative overflow-hidden p-8 sm:p-10 lg:p-12">
              <div className="pointer-events-none absolute -right-32 -top-36 h-[360px] w-[360px] rounded-full bg-[#ff5a1f]/[0.07]" />

              <div className="relative">
                <div className="text-[12px] font-bold uppercase tracking-[0.12em] text-[#ff5a1f]">
                  Catalogo / Categorie
                </div>

                <h1 className="mt-4 text-[48px] font-semibold leading-[0.94] tracking-[-0.055em] sm:text-[66px]">
                  Organizza il
                  <br />
                  catalogo.
                </h1>

                <p className="mt-5 max-w-[700px] text-[16px] leading-7 text-black/50">
                  Aggiungi nuove categorie senza toccare il database manualmente. Le nuove voci diventano subito disponibili nei moduli prodotto.
                </p>
              </div>
            </div>

            <div className="flex flex-col justify-between bg-[#181818] p-8 text-white sm:p-9">
              <div>
                <div className="text-[11px] font-bold uppercase tracking-[0.11em] text-[#ff7b4a]">
                  Category Control
                </div>

                <div className="mt-3 text-[31px] font-semibold tracking-[-0.045em]">
                  {categories.length}
                </div>

                <div className="mt-1 text-[13px] text-white/40">
                  categorie attive
                </div>
              </div>

              <Link
                href="/admin/prodotti"
                className="mt-8 flex h-[52px] items-center justify-center rounded-[15px] bg-white px-5 text-[14px] font-semibold text-[#181818] transition hover:bg-[#ff5a1f] hover:text-white"
              >
                Vai ai prodotti
              </Link>
            </div>
          </div>
        </section>

        <CategoryManager
          categories={
            categories
          }
        />
      </div>
    </main>
  );
}
