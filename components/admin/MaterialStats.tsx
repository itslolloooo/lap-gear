import Link from "next/link";

export type MaterialStatRow = {
  id: number;
  name: string;
  totalUnits: number;
  availableUnits: number;
  maintenanceUnits: number;
  retiredUnits: number;
  requestedQty: number;
  requestCount: number;
  grossValue: number;
};

const euro = (v: number) =>
  new Intl.NumberFormat("it-IT", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(v);

export function MaterialStats({ rows }: { rows: MaterialStatRow[] }) {
  const sum = (key: keyof MaterialStatRow) =>
    rows.reduce((total, row) => total + Number(row[key] || 0), 0);

  const totalUnits = sum("totalUnits");
  const availableUnits = sum("availableUnits");
  const maintenanceUnits = sum("maintenanceUnits");
  const retiredUnits = sum("retiredUnits");
  const totalValue = sum("grossValue");
  const neverRequested = rows.filter((row) => row.requestCount === 0).length;

  const ranked = [...rows]
    .filter((row) => row.requestCount > 0 || row.requestedQty > 0)
    .sort(
      (a, b) =>
        b.requestedQty - a.requestedQty ||
        b.grossValue - a.grossValue ||
        a.name.localeCompare(b.name, "it", { sensitivity: "base" })
    )
    .slice(0, 8);

  return (
    <section className="mb-10">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="text-[13px] font-bold uppercase tracking-[0.13em] text-[#ff5a1f]">
            Materiale / Analytics
          </div>
          <h2 className="mt-2 text-[42px] font-semibold tracking-[-0.05em] sm:text-[52px]">
            Come gira il gear.
          </h2>
          <p className="mt-3 max-w-[720px] text-[14px] leading-6 text-black/45">
            Dati sulle richieste non annullate. Il valore indica il valore dei noleggi richiesti, non gli incassi.
          </p>
        </div>
        <Link
          href="/admin/inventario"
          className="inline-flex h-[48px] items-center justify-center rounded-[14px] border border-black/10 bg-white px-5 text-[13px] font-semibold text-black/55 transition hover:border-[#ff5a1f]/25 hover:bg-[#fff0e9] hover:text-[#e94b12]"
        >
          Apri inventario →
        </Link>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-6">
        <Stat label="Unità totali" value={String(totalUnits)} hint="gear fisico" />
        <Stat label="Operative" value={String(availableUnits)} hint="stato disponibile" accent />
        <Stat label="Manutenzione" value={String(maintenanceUnits)} hint="da controllare" warning={maintenanceUnits > 0} />
        <Stat label="Ritirate" value={String(retiredUnits)} hint="fuori servizio" />
        <Stat label="Mai richiesti" value={String(neverRequested)} hint="prodotti senza storico" warning={neverRequested > 0} />
        <Stat label="Valore storico" value={euro(totalValue)} hint="richieste non annullate" />
      </div>

      <div className="mt-5 grid gap-5 xl:grid-cols-[minmax(0,1.35fr)_minmax(320px,.65fr)]">
        <div className="overflow-hidden rounded-[24px] border border-black/10 bg-white">
          <div className="border-b border-black/10 bg-[#fbfaf7] px-6 py-5 sm:px-7">
            <div className="text-[11px] font-bold uppercase tracking-[0.1em] text-[#ff5a1f]">
              Più richiesti
            </div>
            <div className="mt-1 text-[22px] font-semibold tracking-[-0.035em]">
              Ranking materiale.
            </div>
          </div>

          {ranked.length === 0 ? (
            <div className="p-7 text-[13px] leading-6 text-black/40">
              Non c&apos;è ancora abbastanza storico. La classifica comparirà automaticamente con le prime richieste.
            </div>
          ) : (
            <div className="divide-y divide-black/10">
              {ranked.map((row, index) => (
                <div
                  key={row.id}
                  className="grid gap-3 px-6 py-4 sm:grid-cols-[42px_minmax(0,1fr)_90px_100px_120px] sm:items-center sm:px-7"
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#f1f0ea] text-[11px] font-bold text-black/45">
                    {String(index + 1).padStart(2, "0")}
                  </div>
                  <div className="min-w-0">
                    <div className="truncate text-[14px] font-semibold">{row.name}</div>
                    <div className="mt-1 text-[10px] text-black/30">{row.totalUnits} unità in inventario</div>
                  </div>
                  <Metric label="Richieste" value={String(row.requestCount)} />
                  <Metric label="Pezzi" value={String(row.requestedQty)} />
                  <Metric label="Valore" value={euro(row.grossValue)} right />
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="rounded-[24px] bg-[#181818] p-6 text-white sm:p-7">
          <div className="text-[11px] font-bold uppercase tracking-[0.1em] text-[#ff7b4a]">
            Lettura rapida
          </div>
          <div className="mt-4 text-[28px] font-semibold leading-[1.05] tracking-[-0.045em]">
            Cosa guardare nel tempo.
          </div>
          <div className="mt-7 space-y-4 text-[12px] leading-5 text-white/45">
            <p><strong className="text-white/80">Domanda.</strong> Quali prodotti entrano più spesso nelle richieste.</p>
            <p><strong className="text-white/80">Valore.</strong> Quali prodotti pesano di più sul valore dei noleggi.</p>
            <p><strong className="text-white/80">Gear fermo.</strong> Cosa non viene mai richiesto e può essere riprezzato o promosso.</p>
            <p><strong className="text-white/80">Operatività.</strong> Manutenzione e fuori servizio restano visibili a colpo d&apos;occhio.</p>
          </div>
        </div>
      </div>
    </section>
  );
}

function Stat({ label, value, hint, accent = false, warning = false }: {
  label: string;
  value: string;
  hint: string;
  accent?: boolean;
  warning?: boolean;
}) {
  return (
    <div className={`rounded-[22px] border p-5 ${accent ? "border-[#168a50]/15 bg-[#e9f6ee]" : warning ? "border-[#d98a08]/15 bg-[#fff2d5]" : "border-black/10 bg-white"}`}>
      <div className="text-[10px] font-bold uppercase tracking-[0.09em] text-black/30">{label}</div>
      <div className="mt-2 text-[28px] font-semibold tracking-[-0.045em]">{value}</div>
      <div className="mt-1 text-[11px] text-black/35">{hint}</div>
    </div>
  );
}

function Metric({ label, value, right = false }: { label: string; value: string; right?: boolean }) {
  return (
    <div className={right ? "sm:text-right" : ""}>
      <div className="text-[9px] font-bold uppercase tracking-[0.07em] text-black/25">{label}</div>
      <div className="mt-1 text-[13px] font-semibold text-black/60">{value}</div>
    </div>
  );
}

export default MaterialStats;
