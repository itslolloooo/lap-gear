"use client";

import {
  useEffect,
  useMemo,
  useState,
} from "react";


type Payment = {
  id: number;
  reservation_id: string;
  amount:
    | number
    | string;
  kind: string;
  method: string;
  paid_at: string;
  notes:
    | string
    | null;
  reservations:
    | {
        reference?: string;
        customers?:
          | {
              name?: string;
            }
          | {
              name?: string;
            }[]
          | null;
      }
    | {
        reference?: string;
        customers?:
          | {
              name?: string;
            }
          | {
              name?: string;
            }[]
          | null;
      }[]
    | null;
};


function first<T>(
  value:
    | T
    | T[]
    | null
) {
  if (!value) {
    return null;
  }

  return Array.isArray(
    value
  )
    ? value[0] ?? null
    : value;
}


function money(
  value: number
) {
  return new Intl.NumberFormat(
    "it-IT",
    {
      style:
        "currency",
      currency:
        "EUR",
      minimumFractionDigits:
        2,
      maximumFractionDigits:
        2,
    }
  ).format(
    value
  );
}


function dateTime(
  value: string
) {
  return new Intl.DateTimeFormat(
    "it-IT",
    {
      day:
        "2-digit",
      month:
        "2-digit",
      year:
        "numeric",
      hour:
        "2-digit",
      minute:
        "2-digit",
    }
  ).format(
    new Date(
      value
    )
  );
}


function methodLabel(
  method: string
) {
  switch (method) {
    case "cash":
      return "Contanti";
    case "card":
      return "Carta";
    case "bank_transfer":
      return "Bonifico";
    case "paypal":
      return "PayPal";
    default:
      return "Altro";
  }
}


export function PaymentsDashboard() {
  const [
    payments,
    setPayments,
  ] =
    useState<
      Payment[]
    >([]);

  const [
    loading,
    setLoading,
  ] =
    useState(
      true
    );

  const [
    error,
    setError,
  ] =
    useState("");

  const [
    setupRequired,
    setSetupRequired,
  ] =
    useState(
      false
    );


  useEffect(
    () => {
      void (
        async () => {
          try {
            const response =
              await fetch(
                "/api/admin/payments",
                {
                  cache:
                    "no-store",
                }
              );

            const result =
              await response.json();

            if (
              !response.ok
            ) {
              if (
                result?.setup_required
              ) {
                setSetupRequired(
                  true
                );
                return;
              }

              throw new Error(
                result?.error ??
                "Impossibile caricare i pagamenti."
              );
            }

            setPayments(
              result.payments ??
              []
            );
          } catch (
            loadError
          ) {
            setError(
              loadError instanceof
                Error
                ? loadError.message
                : "Errore caricamento pagamenti."
            );
          } finally {
            setLoading(
              false
            );
          }
        }
      )();
    },
    []
  );


  const stats =
    useMemo(
      () => {
        const positive =
          payments.reduce(
            (
              sum,
              payment
            ) => {
              const amount =
                Number(
                  payment.amount
                );

              return (
                sum +
                (
                  amount > 0
                    ? amount
                    : 0
                )
              );
            },
            0
          );

        const refunds =
          payments.reduce(
            (
              sum,
              payment
            ) => {
              const amount =
                Number(
                  payment.amount
                );

              return (
                sum +
                (
                  amount < 0
                    ? Math.abs(
                        amount
                      )
                    : 0
                )
              );
            },
            0
          );

        const byMethod =
          payments.reduce<
            Record<
              string,
              number
            >
          >(
            (
              acc,
              payment
            ) => {
              const amount =
                Number(
                  payment.amount
                );

              acc[
                payment.method
              ] =
                (
                  acc[
                    payment.method
                  ] ??
                  0
                ) +
                amount;

              return acc;
            },
            {}
          );

        const monthlyMap =
          new Map<
            string,
            {
              positive: number;
              refunds: number;
              net: number;
              count: number;
            }
          >();

        for (
          const payment
          of payments
        ) {
          const date =
            new Date(
              payment.paid_at
            );

          const key =
            `${date.getFullYear()}-${String(
              date.getMonth() + 1
            ).padStart(2, "0")}`;

          const current =
            monthlyMap.get(
              key
            ) ?? {
              positive: 0,
              refunds: 0,
              net: 0,
              count: 0,
            };

          const amount =
            Number(
              payment.amount
            );

          if (
            amount >= 0
          ) {
            current.positive +=
              amount;
          } else {
            current.refunds +=
              Math.abs(
                amount
              );
          }

          current.net +=
            amount;

          current.count +=
            1;

          monthlyMap.set(
            key,
            current
          );
        }

        const now =
          new Date();

        const currentMonthKey =
          `${now.getFullYear()}-${String(
            now.getMonth() + 1
          ).padStart(2, "0")}`;

        const previousMonth =
          new Date(
            now.getFullYear(),
            now.getMonth() - 1,
            1
          );

        const previousMonthKey =
          `${previousMonth.getFullYear()}-${String(
            previousMonth.getMonth() + 1
          ).padStart(2, "0")}`;

        const currentMonth =
          monthlyMap.get(
            currentMonthKey
          ) ?? {
            positive: 0,
            refunds: 0,
            net: 0,
            count: 0,
          };

        const previousMonthStats =
          monthlyMap.get(
            previousMonthKey
          ) ?? {
            positive: 0,
            refunds: 0,
            net: 0,
            count: 0,
          };

        const monthFormatter =
          new Intl.DateTimeFormat(
            "it-IT",
            {
              month:
                "short",
              year:
                "2-digit",
            }
          );

        const monthly =
          Array.from(
            monthlyMap.entries()
          )
            .sort(
              ([a], [b]) =>
                a.localeCompare(
                  b
                )
            )
            .slice(
              -12
            )
            .map(
              (
                [
                  key,
                  value,
                ]
              ) => {
                const [
                  year,
                  month,
                ] =
                  key
                    .split(
                      "-"
                    )
                    .map(
                      Number
                    );

                return {
                  key,
                  label:
                    monthFormatter.format(
                      new Date(
                        year,
                        month -
                          1,
                        1
                      )
                    ),
                  ...value,
                };
              }
            );

        const lastSix =
          monthly.slice(
            -6
          );

        const averageSix =
          lastSix.length >
          0
            ? lastSix.reduce(
                (
                  sum,
                  month
                ) =>
                  sum +
                  month.net,
                0
              ) /
              lastSix.length
            : 0;

        const changePct =
          previousMonthStats.net !==
          0
            ? (
                (
                  currentMonth.net -
                  previousMonthStats.net
                ) /
                Math.abs(
                  previousMonthStats.net
                )
              ) *
              100
            : null;

        return {
          positive,
          refunds,
          net:
            positive -
            refunds,
          byMethod,
          currentMonth,
          previousMonth:
            previousMonthStats,
          monthly,
          averageSix,
          changePct,
        };
      },
      [
        payments,
      ]
    );


  return (
    <div className="space-y-6">
      {setupRequired && (
        <div className="rounded-[20px] border border-[#d98a08]/20 bg-[#fff2d5] px-6 py-5 text-[13px] leading-6 text-[#8a650f]">
          Il modulo pagamenti è presente nel codice ma la tabella <span className="font-mono">reservation_payments</span> deve ancora essere applicata su Supabase.
        </div>
      )}

      {error && (
        <div className="rounded-[20px] border border-[#cf3d32]/15 bg-[#fff0ee] px-6 py-5 text-[13px] text-[#9d352c]">
          {error}
        </div>
      )}

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Stat
          label="Incassi"
          value={
            money(
              stats.positive
            )
          }
          hint="movimenti positivi"
        />

        <Stat
          label="Rimborsi"
          value={
            money(
              stats.refunds
            )
          }
          hint="uscite registrate"
        />

        <Stat
          label="Netto"
          value={
            money(
              stats.net
            )
          }
          hint="incassi meno rimborsi"
          accent
        />

        <Stat
          label="Movimenti"
          value={
            String(
              payments.length
            )
          }
          hint="righe nello storico"
        />
      </section>

      <section className="grid gap-5 xl:grid-cols-[minmax(0,1.45fr)_minmax(320px,.55fr)]">
        <MonthlyCashflowChart
          data={
            stats.monthly
          }
        />

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-1">
          <Stat
            label="Questo mese"
            value={
              money(
                stats.currentMonth.net
              )
            }
            hint={`${stats.currentMonth.count} movimenti netti`}
            accent
          />

          <Stat
            label="Incassato mese"
            value={
              money(
                stats.currentMonth.positive
              )
            }
            hint="entrate registrate"
          />

          <Stat
            label="Rimborsi mese"
            value={
              money(
                stats.currentMonth.refunds
              )
            }
            hint="uscite registrate"
          />

          <Stat
            label="Media 6 mesi"
            value={
              money(
                stats.averageSix
              )
            }
            hint={
              stats.changePct ===
              null
                ? "confronto mese precedente non disponibile"
                : `${stats.changePct >= 0 ? "+" : ""}${stats.changePct.toFixed(1)}% vs mese precedente`
            }
          />
        </div>
      </section>

      <section className="grid gap-5 xl:grid-cols-[360px_minmax(0,1fr)]">
        <div className="rounded-[24px] border border-black/10 bg-white p-6">
          <div className="text-[11px] font-bold uppercase tracking-[0.1em] text-[#ff5a1f]">
            Metodi di pagamento
          </div>

          <div className="mt-5 space-y-3">
            {[
              "bank_transfer",
              "cash",
              "card",
              "paypal",
              "other",
            ].map(
              (
                method
              ) => (
                <div
                  key={
                    method
                  }
                  className="flex items-center justify-between gap-4 rounded-[14px] bg-[#f4f3ee] px-4 py-3"
                >
                  <span className="text-[12px] font-semibold text-black/55">
                    {methodLabel(
                      method
                    )}
                  </span>

                  <span className="text-[13px] font-semibold">
                    {money(
                      stats.byMethod[
                        method
                      ] ??
                      0
                    )}
                  </span>
                </div>
              )
            )}
          </div>
        </div>

        <div className="overflow-hidden rounded-[24px] border border-black/10 bg-white">
          <div className="border-b border-black/10 bg-[#fbfaf7] px-6 py-5">
            <div className="text-[11px] font-bold uppercase tracking-[0.1em] text-[#ff5a1f]">
              Storico pagamenti
            </div>

            <div className="mt-1 text-[22px] font-semibold tracking-[-0.035em]">
              Tutti i movimenti.
            </div>
          </div>

          {loading ? (
            <div className="p-6 text-[13px] text-black/35">
              Caricamento…
            </div>
          ) : payments.length ===
            0 ? (
            <div className="p-6 text-[13px] text-black/35">
              Nessun movimento registrato.
            </div>
          ) : (
            <div className="divide-y divide-black/10">
              {payments.map(
                (
                  payment
                ) => {
                  const reservation =
                    first(
                      payment.reservations
                    );

                  const customer =
                    first(
                      reservation
                        ?.customers ??
                        null
                    );

                  return (
                    <div
                      key={
                        payment.id
                      }
                      className="grid gap-3 px-6 py-4 lg:grid-cols-[150px_160px_minmax(0,1fr)_130px_120px] lg:items-center"
                    >
                      <div>
                        <div className="text-[12px] font-semibold">
                          {dateTime(
                            payment.paid_at
                          )}
                        </div>
                      </div>

                      <div className="font-mono text-[11px] text-black/45">
                        {reservation
                          ?.reference ??
                          "—"}
                      </div>

                      <div>
                        <div className="text-[13px] font-semibold">
                          {customer
                            ?.name ??
                            "Cliente"}
                        </div>

                        {payment.notes && (
                          <div className="mt-1 truncate text-[11px] text-black/35">
                            {payment.notes}
                          </div>
                        )}
                      </div>

                      <div className="text-[12px] font-semibold text-black/50">
                        {methodLabel(
                          payment.method
                        )}
                      </div>

                      <div
                        className={`text-[15px] font-semibold lg:text-right ${
                          Number(
                            payment.amount
                          ) < 0
                            ? "text-[#b7352b]"
                            : "text-[#168a50]"
                        }`}
                      >
                        {money(
                          Number(
                            payment.amount
                          )
                        )}
                      </div>
                    </div>
                  );
                }
              )}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}



function MonthlyCashflowChart({
  data,
}: {
  data: Array<{
    key: string;
    label: string;
    net: number;
    positive: number;
    refunds: number;
    count: number;
  }>;
}) {
  const width =
    760;
  const height =
    270;
  const padX =
    34;
  const padTop =
    28;
  const padBottom =
    46;

  const maxAbs =
    Math.max(
      1,
      ...data.map(
        (
          item
        ) =>
          Math.abs(
            item.net
          )
      )
    );

  const zeroY =
    padTop +
    (
      height -
      padTop -
      padBottom
    ) /
      2;

  const barWidth =
    data.length >
    0
      ? Math.min(
          54,
          (
            width -
            padX * 2
          ) /
            Math.max(
              data.length,
              1
            ) *
            0.56
        )
      : 36;

  return (
    <div className="overflow-hidden rounded-[24px] border border-black/10 bg-white">
      <div className="border-b border-black/10 bg-[#fbfaf7] px-6 py-5 sm:px-7">
        <div className="text-[11px] font-bold uppercase tracking-[0.1em] text-[#ff5a1f]">
          Cashflow mensile
        </div>

        <div className="mt-1 text-[22px] font-semibold tracking-[-0.035em]">
          Quanto entra davvero ogni mese.
        </div>
      </div>

      {data.length ===
      0 ? (
        <div className="p-7 text-[13px] text-black/40">
          Il grafico comparirà appena registri i primi pagamenti.
        </div>
      ) : (
        <div className="p-5 sm:p-7">
          <svg
            viewBox={`0 0 ${width} ${height}`}
            className="h-auto w-full overflow-visible"
            role="img"
            aria-label="Incassi netti mensili"
          >
            <line
              x1={
                padX
              }
              x2={
                width -
                padX
              }
              y1={
                zeroY
              }
              y2={
                zeroY
              }
              stroke="currentColor"
              className="text-black/15"
              strokeWidth="1"
            />

            {data.map(
              (
                row,
                index
              ) => {
                const slot =
                  (
                    width -
                    padX * 2
                  ) /
                  Math.max(
                    data.length,
                    1
                  );

                const x =
                  padX +
                  index *
                    slot +
                  slot /
                    2 -
                  barWidth /
                    2;

                const magnitude =
                  (
                    Math.abs(
                      row.net
                    ) /
                    maxAbs
                  ) *
                  (
                    (
                      height -
                      padTop -
                      padBottom
                    ) /
                      2 -
                    12
                  );

                const y =
                  row.net >=
                  0
                    ? zeroY -
                      magnitude
                    : zeroY;

                return (
                  <g
                    key={
                      row.key
                    }
                  >
                    <rect
                      x={
                        x
                      }
                      y={
                        y
                      }
                      width={
                        barWidth
                      }
                      height={
                        Math.max(
                          2,
                          magnitude
                        )
                      }
                      rx="8"
                      fill="currentColor"
                      className={
                        row.net >=
                        0
                          ? "text-[#168a50]"
                          : "text-[#b7352b]"
                      }
                    />

                    <text
                      x={
                        x +
                        barWidth /
                          2
                      }
                      y={
                        height -
                        16
                      }
                      textAnchor="middle"
                      className="fill-black/40 text-[10px] font-semibold"
                    >
                      {
                        row.label
                      }
                    </text>
                  </g>
                );
              }
            )}
          </svg>

          <div className="mt-2 flex flex-wrap gap-4 border-t border-black/10 pt-4">
            {data.slice(-3).map(
              (
                row
              ) => (
                <div
                  key={
                    row.key
                  }
                  className="text-[11px] text-black/40"
                >
                  <span className="font-semibold text-black/65">
                    {
                      row.label
                    }
                  </span>{" "}
                  · netto {money(
                    row.net
                  )} · entrate {money(
                    row.positive
                  )}
                </div>
              )
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function Stat({
  label,
  value,
  hint,
  accent = false,
}: {
  label: string;
  value: string;
  hint: string;
  accent?: boolean;
}) {
  return (
    <div
      className={`rounded-[22px] border p-5 ${
        accent
          ? "border-[#ff5a1f]/20 bg-[#fff0e9]"
          : "border-black/10 bg-white"
      }`}
    >
      <div className="text-[10px] font-bold uppercase tracking-[0.09em] text-black/30">
        {label}
      </div>

      <div className="mt-2 text-[28px] font-semibold tracking-[-0.045em]">
        {value}
      </div>

      <div className="mt-1 text-[11px] text-black/35">
        {hint}
      </div>
    </div>
  );
}


export default PaymentsDashboard;
