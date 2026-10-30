import Link from "next/link";
import { redirect } from "next/navigation";

import { requireAdminAccess } from "@/lib/admin-auth";
import { getServerSupabase } from "@/lib/supabase-server";
import { getStoredKits } from "@/lib/kits-server";

export const dynamic = "force-dynamic";

export default async function AdminKitsPage() {
  const access = await requireAdminAccess(["admin", "operator", "viewer"]);

  if (!access) {
    redirect("/admin/login");
  }

  const canEdit = access.isOwner || access.profile.role === "admin";
  const supabase = getServerSupabase();

  if (!supabase) {
    throw new Error("Supabase non configurato.");
  }

  const [kits, productResult] = await Promise.all([
    getStoredKits(),
    supabase.from("products").select("id,name,price_day").order("name"),
  ]);

  if (productResult.error) {
    throw new Error(productResult.error.message);
  }

  const products = new Map(
    (productResult.data ?? []).map((product) => [
      Number(product.id),
      {
        name: String(product.name),
        priceDay: Number(product.price_day ?? 0),
      },
    ])
  );

  const activeCount = kits.filter((kit) => kit.active).length;

  return (
    <main className="min-h-screen bg-[#ebeae4] px-5 pb-16 pt-6 text-[#111111] sm:px-8 lg:px-10 xl:px-14">
      <div className="mx-auto max-w-[1680px]">
        <section className="overflow-hidden rounded-[28px] border border-black/10 bg-white">
          <div className="grid lg:grid-cols-[1fr_340px]">
            <div className="p-7 sm:p-9 lg:p-10">
              <div className="text-[11px] font-bold uppercase tracking-[0.12em] text-[#ff5a1f]">
                Catalogo / Kit
              </div>
              <h1 className="mt-3 text-[46px] font-semibold leading-[0.94] tracking-[-0.055em] sm:text-[58px]">
                Gestisci i kit pronti.
              </h1>
              <p className="mt-4 max-w-[720px] text-[15px] leading-7 text-black/50">
                Crea configurazioni, scegli prodotti e quantità e decidi quali kit mostrare sul sito.
              </p>

              {canEdit && (
                <Link
                  href="/admin/kit/nuovo"
                  className="mt-7 inline-flex h-[52px] items-center rounded-[14px] bg-[#181818] px-5 text-[14px] font-semibold text-white transition hover:bg-[#ff5a1f]"
                >
                  + Nuovo kit
                </Link>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3 bg-[#181818] p-7 text-white sm:p-9 lg:grid-cols-1">
              <Stat value={kits.length} label="Kit totali" />
              <Stat value={activeCount} label="Pubblicati" />
            </div>
          </div>
        </section>

        <section className="mt-6 overflow-hidden rounded-[24px] border border-black/10 bg-white">
          <div className="hidden grid-cols-[minmax(0,1.2fr)_110px_140px_150px] border-b border-black/10 bg-[#f5f4ef] px-6 py-4 text-[10px] font-bold uppercase tracking-[0.1em] text-black/35 lg:grid">
            <div>Kit</div>
            <div>Prodotti</div>
            <div>Valore / giorno</div>
            <div className="text-right">Gestione</div>
          </div>

          {kits.length === 0 ? (
            <div className="p-8 text-[14px] text-black/40">
              Nessun kit configurato.
            </div>
          ) : (
            <div className="divide-y divide-black/10">
              {kits.map((kit) => {
                const value = kit.items.reduce((sum, item) => {
                  const product = products.get(item.product_id);
                  return sum + (product?.priceDay ?? 0) * item.quantity;
                }, 0);

                return (
                  <article
                    key={kit.id}
                    className="grid gap-5 p-5 transition hover:bg-[#fbfaf7] sm:p-6 lg:grid-cols-[minmax(0,1.2fr)_110px_140px_150px] lg:items-center"
                  >
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span
                          className={`rounded-full px-2.5 py-1 text-[9px] font-bold uppercase tracking-[0.06em] ${
                            kit.active
                              ? "bg-[#e8f6ee] text-[#168a50]"
                              : "bg-[#f0efe9] text-black/40"
                          }`}
                        >
                          {kit.active ? "Pubblicato" : "Nascosto"}
                        </span>

                        <span className="text-[10px] font-semibold text-black/30">
                          Ordine {kit.position}
                        </span>
                      </div>

                      <h2 className="mt-3 text-[24px] font-semibold tracking-[-0.04em]">
                        {kit.name}
                      </h2>

                      <p className="mt-1 line-clamp-2 max-w-[760px] text-[12px] leading-5 text-black/40">
                        {kit.description || "Nessuna descrizione."}
                      </p>
                    </div>

                    <div>
                      <div className="text-[10px] font-bold uppercase tracking-[0.08em] text-black/30 lg:hidden">
                        Prodotti
                      </div>
                      <div className="mt-1 text-[14px] font-semibold">
                        {kit.items.length}
                      </div>
                    </div>

                    <div>
                      <div className="text-[10px] font-bold uppercase tracking-[0.08em] text-black/30 lg:hidden">
                        Valore / giorno
                      </div>
                      <div className="mt-1 text-[17px] font-semibold">
                        €{value.toFixed(0)}
                      </div>
                    </div>

                    <div className="lg:text-right">
                      {canEdit ? (
                        <Link
                          href={`/admin/kit/${kit.id}`}
                          className="inline-flex h-[44px] items-center justify-center rounded-[13px] bg-[#181818] px-4 text-[12px] font-semibold text-white transition hover:bg-[#ff5a1f]"
                        >
                          Gestisci
                        </Link>
                      ) : (
                        <span className="text-[12px] font-semibold text-black/35">
                          Sola lettura
                        </span>
                      )}
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}

function Stat({
  value,
  label,
}: {
  value: number;
  label: string;
}) {
  return (
    <div className="rounded-[16px] border border-white/10 bg-white/[0.06] p-4">
      <div className="text-[28px] font-semibold tracking-[-0.04em]">
        {value}
      </div>
      <div className="mt-1 text-[10px] font-bold uppercase tracking-[0.08em] text-white/35">
        {label}
      </div>
    </div>
  );
}
