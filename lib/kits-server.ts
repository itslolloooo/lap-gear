import { getServerSupabase } from "@/lib/supabase-server";

export type StoredKitItem = {
  product_id: number;
  quantity: number;
  position: number;
};

export type StoredKit = {
  id: number;
  slug: string;
  name: string;
  eyebrow: string;
  description: string;
  ideal_for: string[];
  active: boolean;
  position: number;
  items: StoredKitItem[];
};

export async function getStoredKits({
  activeOnly = false,
}: {
  activeOnly?: boolean;
} = {}): Promise<StoredKit[]> {
  const supabase = getServerSupabase();

  if (!supabase) {
    throw new Error("Supabase non configurato.");
  }

  let query = supabase
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
    .order("position", { ascending: true })
    .order("id", { ascending: true });

  if (activeOnly) {
    query = query.eq("active", true);
  }

  const { data, error } = await query;

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []).map((row: any) => ({
    id: Number(row.id),
    slug: String(row.slug ?? ""),
    name: String(row.name ?? ""),
    eyebrow: String(row.eyebrow ?? ""),
    description: String(row.description ?? ""),
    ideal_for: Array.isArray(row.ideal_for) ? row.ideal_for.map(String) : [],
    active: Boolean(row.active),
    position: Number(row.position ?? 0),
    items: (Array.isArray(row.kit_items) ? row.kit_items : [])
      .map((item: any) => ({
        product_id: Number(item.product_id),
        quantity: Number(item.quantity ?? 1),
        position: Number(item.position ?? 0),
      }))
      .sort((a: StoredKitItem, b: StoredKitItem) => a.position - b.position),
  }));
}
