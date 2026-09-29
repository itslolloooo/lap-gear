export function rentalDays(from?: string, to?: string) {
  if (!from || !to) return 1;
  const start = new Date(`${from}T12:00:00`);
  const end = new Date(`${to}T12:00:00`);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return 1;
  return Math.max(1, Math.floor((end.getTime() - start.getTime()) / 86400000) + 1);
}

export function rentalMultiplier(days: number) {
  if (days <= 1) return 1;
  if (days === 2) return 1.75;
  if (days === 3) return 2.35;
  return 2.35 + (days - 3) * 0.55;
}

export function rentalPrice(priceDay: number, days: number) {
  return Math.round(priceDay * rentalMultiplier(days));
}
