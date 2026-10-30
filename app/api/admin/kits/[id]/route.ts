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

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const access = await getCurrentAdminAccess();

  if (
    !access ||
    !access.profile.active ||
    (access.profile.role !== "admin" && !access.isOwner)
  ) {
    return NextResponse.json({ error: "Non autorizzato." }, { status: 403 });
  }

  const { id } = await params;
  const kitId = Number(id);

  if (!Number.isInteger(kitId) || kitId <= 0) {
    return NextResponse.json({ error: "Kit non valido." }, { status: 400 });
  }

  const supabase = getServerSupabase();

  if (!supabase) {
    return NextResponse.json(
      { error: "Supabase non configurato." },
      { status: 500 }
    );
  }

  const formData = await request.formData();

  if (formData.get("action") === "delete") {
    const { error } = await supabase.from("kits").delete().eq("id", kitId);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.redirect(new URL("/admin/kit?deleted=1", request.url), 303);
  }

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

  const { error: updateError } = await supabase
    .from("kits")
    .update({
      name,
      slug,
      eyebrow,
      description,
      ideal_for: idealFor,
      active,
      position,
      updated_at: new Date().toISOString(),
    })
    .eq("id", kitId);

  if (updateError) {
    return NextResponse.json(
      {
        error:
          updateError.code === "23505"
            ? "Esiste già un kit con questo slug."
            : updateError.message,
      },
      { status: updateError.code === "23505" ? 409 : 500 }
    );
  }

  const { data: currentItems, error: currentError } = await supabase
    .from("kit_items")
    .select("product_id")
    .eq("kit_id", kitId);

  if (currentError) {
    return NextResponse.json({ error: currentError.message }, { status: 500 });
  }

  const { error: upsertError } = await supabase
    .from("kit_items")
    .upsert(
      items.map((item, index) => ({
        kit_id: kitId,
        product_id: item.productId,
        quantity: item.quantity,
        position: (index + 1) * 10,
      })),
      { onConflict: "kit_id,product_id" }
    );

  if (upsertError) {
    return NextResponse.json({ error: upsertError.message }, { status: 500 });
  }

  const keep = new Set(productIds);
  const removeIds = (currentItems ?? [])
    .map((item) => Number(item.product_id))
    .filter((productId) => !keep.has(productId));

  if (removeIds.length > 0) {
    const { error: deleteError } = await supabase
      .from("kit_items")
      .delete()
      .eq("kit_id", kitId)
      .in("product_id", removeIds);

    if (deleteError) {
      return NextResponse.json({ error: deleteError.message }, { status: 500 });
    }
  }

  return NextResponse.redirect(
    new URL(`/admin/kit/${kitId}?saved=1`, request.url),
    303
  );
}
