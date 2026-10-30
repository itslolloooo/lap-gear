import { redirect } from "next/navigation";

import { KitForm } from "@/components/admin/KitForm";
import { requireAdminAccess } from "@/lib/admin-auth";
import { getServerSupabase } from "@/lib/supabase-server";

export const dynamic = "force-dynamic";

export default async function NewKitPage() {
  const access = await requireAdminAccess(["admin"]);

  if (!access) {
    redirect("/admin/login");
  }

  const supabase = getServerSupabase();

  if (!supabase) {
    throw new Error("Supabase non configurato.");
  }

  const { data, error } = await supabase
    .from("products")
    .select("id,name,price_day,categories(name)")
    .order("name");

  if (error) {
    throw new Error(error.message);
  }

  const products = (data ?? []).map((product: any) => {
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

  return (
    <main className="min-h-screen bg-[#ebeae4] px-5 pb-16 pt-6 text-[#111111] sm:px-8 lg:px-10 xl:px-14">
      <div className="mx-auto max-w-[1200px]">
        <div className="mb-6">
          <div className="text-[11px] font-bold uppercase tracking-[0.1em] text-[#ff5a1f]">
            Kit / Nuovo
          </div>
          <h1 className="mt-2 text-[42px] font-semibold tracking-[-0.05em]">
            Crea un kit.
          </h1>
        </div>

        <KitForm products={products} />
      </div>
    </main>
  );
}
