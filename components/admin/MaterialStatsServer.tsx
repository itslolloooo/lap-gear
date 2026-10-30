import {
  MaterialStats,
  type MaterialMonthlyStat,
  type MaterialStatRow,
} from "@/components/admin/MaterialStats";
import { getServerSupabase } from "@/lib/supabase-server";

type Reservation = {
  id: string;
  status: string;
  start_date: string;
  end_date: string;
};

type Item = {
  product_id: number;
  quantity: number | string;
  price_day: number | string;
  reservations: Reservation | Reservation[] | null;
};

export async function MaterialStatsServer() {
  const supabase = getServerSupabase();
  if (!supabase) return <MaterialStats rows={[]} />;

  const [productsResult, unitsResult, itemsResult] = await Promise.all([
    supabase.from("products").select("id,name"),
    supabase.from("product_units").select("id,product_id,status"),
    supabase.from("reservation_items").select(`
      product_id,
      quantity,
      price_day,
      reservations (
        id,
        status,
        start_date,
        end_date
      )
    `),
  ]);

  if (productsResult.error || unitsResult.error || itemsResult.error) {
    console.error("Errore statistiche materiale:", productsResult.error ?? unitsResult.error ?? itemsResult.error);
    return <MaterialStats rows={[]} />;
  }

  const rows = new Map<number, MaterialStatRow>();
  for (const product of productsResult.data ?? []) {
    rows.set(Number(product.id), {
      id: Number(product.id),
      name: String(product.name ?? "Prodotto"),
      totalUnits: 0,
      availableUnits: 0,
      maintenanceUnits: 0,
      retiredUnits: 0,
      requestedQty: 0,
      requestCount: 0,
      grossValue: 0,
    });
  }

  for (const unit of unitsResult.data ?? []) {
    const row = rows.get(Number(unit.product_id));
    if (!row) continue;
    row.totalUnits += 1;
    if (unit.status === "available") row.availableUnits += 1;
    if (unit.status === "maintenance") row.maintenanceUnits += 1;
    if (unit.status === "retired") row.retiredUnits += 1;
  }

  const requestIds = new Map<number, Set<string>>();
  for (const rawItem of (itemsResult.data ?? []) as unknown as Item[]) {
    const reservation = Array.isArray(rawItem.reservations)
      ? rawItem.reservations[0] ?? null
      : rawItem.reservations;

    if (!reservation || reservation.status === "cancelled") continue;

    const productId = Number(rawItem.product_id);
    const row = rows.get(productId);
    if (!row) continue;

    const qty = Number(rawItem.quantity ?? 0);
    const price = Number(rawItem.price_day ?? 0);
    const start = new Date(`${reservation.start_date}T00:00:00`);
    const end = new Date(`${reservation.end_date}T00:00:00`);
    const days = Math.max(1, Math.floor((end.getTime() - start.getTime()) / 86400000) + 1);

    row.requestedQty += qty;
    row.grossValue += qty * price * days;

    const ids = requestIds.get(productId) ?? new Set<string>();
    ids.add(String(reservation.id));
    requestIds.set(productId, ids);
  }

  for (const [productId, ids] of requestIds) {
    const row = rows.get(productId);
    if (row) row.requestCount = ids.size;
  }

  const monthMap =
    new Map<
      string,
      {
        requestIds: Set<string>;
        grossValue: number;
      }
    >();

  for (const rawItem of (itemsResult.data ?? []) as unknown as Item[]) {
    const reservation = Array.isArray(rawItem.reservations)
      ? rawItem.reservations[0] ?? null
      : rawItem.reservations;

    if (!reservation || reservation.status === "cancelled") continue;

    const startDate = new Date(`${reservation.start_date}T00:00:00`);
    const monthKey = `${startDate.getFullYear()}-${String(
      startDate.getMonth() + 1
    ).padStart(2, "0")}`;

    const current =
      monthMap.get(monthKey) ?? {
        requestIds: new Set<string>(),
        grossValue: 0,
      };

    const qty = Number(rawItem.quantity ?? 0);
    const price = Number(rawItem.price_day ?? 0);
    const endDate = new Date(`${reservation.end_date}T00:00:00`);
    const days = Math.max(
      1,
      Math.floor((endDate.getTime() - startDate.getTime()) / 86400000) + 1
    );

    current.requestIds.add(String(reservation.id));
    current.grossValue += qty * price * days;
    monthMap.set(monthKey, current);
  }

  const monthFormatter =
    new Intl.DateTimeFormat("it-IT", {
      month: "short",
      year: "2-digit",
    });

  const monthly:
    MaterialMonthlyStat[] =
    Array.from(monthMap.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-12)
      .map(([month, value]) => {
        const [year, monthNumber] =
          month.split("-").map(Number);

        return {
          month,
          label: monthFormatter.format(
            new Date(year, monthNumber - 1, 1)
          ),
          requestCount: value.requestIds.size,
          grossValue: value.grossValue,
        };
      });

  return (
    <MaterialStats
      rows={Array.from(rows.values()).sort((a, b) =>
        a.name.localeCompare(b.name, "it", { sensitivity: "base" })
      )}
      monthly={monthly}
    />
  );
}

export default MaterialStatsServer;
