import { notFound, redirect } from "next/navigation";

import { KitForm } from "@/components/admin/KitForm";
import { requireAdminAccess } from "@/lib/admin-auth";
import { getServerSupabase } from "@/lib/supabase-server";

export const dynamic = "force-dynamic";

export default async function EditKitPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const access = await requireAdminAccess(["admin"]);

  if (!access) {
    redirect("/admin/login");
  }

  const { id } = await params;
  const kitId = Number(id);

  if (!Number.isInteger(kitId) || kitId <= 0) {
    notFound();
  }

  const supabase = getServerSupabase();

  if (!supabase) {
    throw new Error("Supabase non configurato.");
  }

  const [kitResult, productResult] = await Promise.all([
    supabase
      .from("kits")
      .select(`
        id,
        slug,
        name,
        eyebrow,
        description,
        ideal_for,
        active,
        position,
        kit_items (
          product_id,
          quantity,
          position
        )
      `)
      .eq("id", kitId)
      .maybeSingle(),
    supabase
      .from("products")
      .select("id,name,price_day,categories(name)")
      .order("name"),
  ]);

  if (kitResult.error) {
    throw new Error(kitResult.error.message);
  }

  if (!kitResult.data) {
    notFound();
  }

  if (productResult.error) {
    throw new Error(productResult.error.message);
  }

  const kit: any = kitResult.data;
  const products = (productResult.data ?? []).map((product: any) => {
    const category = Array.isArray(product.categories)
      ? product.categories[0]
      : product.categories;

    return {
      id: Number(product.id),
      name: String(product.name),
      priceDay: Number(product.price_day ?? 0),
      categoryLabel: String(category?.name ?? ""),
    };
  });

  const items = (Array.isArray(kit.kit_items) ? kit.kit_items : [])
    .map((item: any) => ({
      productId: Number(item.product_id),
      quantity: Number(item.quantity ?? 1),
      position: Number(item.position ?? 0),
    }))
    .sort((a: any, b: any) => a.position - b.position)
    .map(({ productId, quantity }: any) => ({ productId, quantity }));

  return (
    <main className="min-h-screen bg-[#ebeae4] px-5 pb-16 pt-6 text-[#111111] sm:px-8 lg:px-10 xl:px-14">
      <div className="mx-auto max-w-[1200px]">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="text-[11px] font-bold uppercase tracking-[0.1em] text-[#ff5a1f]">
              Kit / Modifica
            </div>
            <h1 className="mt-2 text-[42px] font-semibold tracking-[-0.05em]">
              {kit.name}
            </h1>
          </div>

          <form action={`/api/admin/kits/${kitId}`} method="post">
            <input type="hidden" name="action" value="delete" />
            <button
              type="submit"
              className="h-[44px] rounded-[13px] border border-red-500/20 bg-red-50 px-4 text-[12px] font-semibold text-red-700 transition hover:bg-red-600 hover:text-white"
            >
              Elimina kit
            </button>
          </form>
        </div>

        <KitForm
          products={products}
          initialValue={{
            id: Number(kit.id),
            name: String(kit.name ?? ""),
            slug: String(kit.slug ?? ""),
            eyebrow: String(kit.eyebrow ?? ""),
            description: String(kit.description ?? ""),
            idealFor: Array.isArray(kit.ideal_for) ? kit.ideal_for.map(String) : [],
            active: Boolean(kit.active),
            position: Number(kit.position ?? 0),
            items,
          }}
        />
      </div>
    </main>
  );
}
