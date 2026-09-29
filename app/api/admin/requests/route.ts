import { NextRequest, NextResponse } from "next/server";
import { getServerSupabase } from "@/lib/supabase-server";

export async function POST(request: NextRequest) {
  const body = await request.json();
  if (!body?.customer?.name || !body?.customer?.email || !body?.from || !body?.to || !Array.isArray(body?.items) || !body.items.length) {
    return NextResponse.json({ error: "Dati richiesta incompleti" }, { status: 400 });
  }

  const supabase = getServerSupabase();
  if (!supabase) {
    return NextResponse.json({ reference: `DEMO-${Date.now().toString().slice(-6)}`, mode: "demo" });
  }

  const { data: customer, error: customerError } = await supabase
    .from("customers")
    .insert({ name: body.customer.name, email: body.customer.email, phone: body.customer.phone || null })
    .select("id")
    .single();
  if (customerError || !customer) return NextResponse.json({ error: customerError?.message || "Errore cliente" }, { status: 500 });

  const reference = `LAP-${new Date().getFullYear()}-${Math.random().toString(36).slice(2, 7).toUpperCase()}`;
  const { data: reservation, error: reservationError } = await supabase
    .from("reservations")
    .insert({ customer_id: customer.id, reference, start_date: body.from, end_date: body.to, status: "requested", notes: body.notes || null })
    .select("id")
    .single();
  if (reservationError || !reservation) return NextResponse.json({ error: reservationError?.message || "Errore prenotazione" }, { status: 500 });

  const rows = body.items.map((item: { productId: number; quantity: number; priceDay: number }) => ({
    reservation_id: reservation.id,
    product_id: item.productId,
    quantity: item.quantity,
    price_day: item.priceDay
  }));
  const { error: itemsError } = await supabase.from("reservation_items").insert(rows);
  if (itemsError) return NextResponse.json({ error: itemsError.message }, { status: 500 });

  return NextResponse.json({ reference, mode: "live" });
}
