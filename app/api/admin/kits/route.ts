import { NextRequest, NextResponse } from "next/server";

import { getCurrentAdminAccess } from "@/lib/admin-auth";
import { getServerSupabase } from "@/lib/supabase-server";

type ParsedItem = {
  productId: number;
  quantity: number;
};

function text(formData: FormData, key: string) {
  return String(formData.get(key) ?? "").trim();
}

function normalizeSlug(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function parseItems(value: FormDataEntryValue | null): ParsedItem[] {
  try {
    const parsed = JSON.parse(String(value ?? "[]"));

    if (!Array.isArray(parsed)) {
      return [];
    }

    const unique = new Map<number, ParsedItem>();

    for (const raw of parsed) {
      const productId = Number(raw?.productId);
      const quantity = Number(raw?.quantity);

      if (
        Number.isInteger(productId) &&
        productId > 0 &&
        Number.isInteger(quantity) &&
        quantity > 0 &&
        quantity <= 99
      ) {
        unique.set(productId, { productId, quantity });
      }
    }

    return Array.from(unique.values());
  } catch {
    return [];
  }
}

export async function POST(request: NextRequest) {
  const access = await getCurrentAdminAccess();

  if (
    !access ||
    !access.profile.active ||
    (access.profile.role !== "admin" && !access.isOwner)
  ) {
    return NextResponse.json({ error: "Non autorizzato." }, { status: 403 });
  }

  const formData = await request.formData();
  const name = text(formData, "name");
  const slug = normalizeSlug(text(formData, "slug") || name);
  const eyebrow = text(formData, "eyebrow");
  const description = text(formData, "description");
  const idealFor = text(formData, "ideal_for")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
  const position = Number(formData.get("position") ?? 0);
  const active = formData.get("active") === "true";
  const items = parseItems(formData.get("items_json"));

  if (
    !name ||
    !slug ||
    !Number.isInteger(position) ||
    items.length === 0
  ) {
    return NextResponse.json(
      { error: "Dati kit non validi." },
      { status: 400 }
    );
  }

  const supabase = getServerSupabase();

  if (!supabase) {
    return NextResponse.json(
      { error: "Supabase non configurato." },
      { status: 500 }
    );
  }

  const productIds = items.map((item) => item.productId);
  const { data: validProducts, error: productError } = await supabase
    .from("products")
    .select("id")
    .in("id", productIds);

  if (
    productError ||
    (validProducts?.length ?? 0) !== productIds.length
  ) {
    return NextResponse.json(
      { error: "Uno o più prodotti non sono validi." },
      { status: 400 }
    );
  }

  const { data: kit, error } = await supabase
    .from("kits")
    .insert({
      name,
      slug,
      eyebrow,
      description,
      ideal_for: idealFor,
      active,
      position,
      updated_at: new Date().toISOString(),
    })
    .select("id")
    .single();

  if (error || !kit) {
    return NextResponse.json(
      {
        error:
          error?.code === "23505"
            ? "Esiste già un kit con questo slug."
            : error?.message || "Impossibile creare il kit.",
      },
      { status: error?.code === "23505" ? 409 : 500 }
    );
  }

  const { error: itemError } = await supabase
    .from("kit_items")
    .insert(
      items.map((item, index) => ({
        kit_id: kit.id,
        product_id: item.productId,
        quantity: item.quantity,
        position: (index + 1) * 10,
      }))
    );

  if (itemError) {
    await supabase.from("kits").delete().eq("id", kit.id);

    return NextResponse.json(
      { error: "Impossibile salvare i prodotti del kit." },
      { status: 500 }
    );
  }

  return NextResponse.redirect(
    new URL(`/admin/kit/${kit.id}?created=1`, request.url),
    303
  );
}
