"use client";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  useRouter,
} from "next/navigation";


type Payment = {
  id: number;
  reservation_id: string;
  amount:
    | number
    | string;
  kind:
    | "payment"
    | "deposit"
    | "refund"
    | "adjustment";
  method:
    | "cash"
    | "card"
    | "bank_transfer"
    | "paypal"
    | "other";
  paid_at: string;
  notes:
    | string
    | null;
};


type Props = {
  reservationId: string;
  orderTotal: number;
  canEdit: boolean;
};


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


function kindLabel(
  kind:
    Payment["kind"]
) {
  switch (kind) {
    case "payment":
      return "Pagamento";
    case "deposit":
      return "Acconto";
    case "refund":
      return "Rimborso";
    case "adjustment":
      return "Rettifica";
  }
}


function methodLabel(
  method:
    Payment["method"]
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
    case "other":
      return "Altro";
  }
}


export function PaymentPanel({
  reservationId,
  orderTotal,
  canEdit,
}: Props) {
  const router =
    useRouter();

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
    saving,
    setSaving,
  ] =
    useState(
      false
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

  const [
    amount,
    setAmount,
  ] =
    useState("");

  const [
    kind,
    setKind,
  ] =
    useState<
      Payment["kind"]
    >(
      "payment"
    );

  const [
    method,
    setMethod,
  ] =
    useState<
      Payment["method"]
    >(
      "bank_transfer"
    );

  const [
    notes,
    setNotes,
  ] =
    useState("");


  const paid =
    useMemo(
      () =>
        payments.reduce(
          (
            sum,
            payment
          ) =>
            sum +
            Number(
              payment.amount
            ),
          0
        ),
      [
        payments,
      ]
    );

  const balance =
    orderTotal -
    paid;


  async function load() {
    setLoading(
      true
    );

    try {
      const response =
        await fetch(
          `/api/admin/payments?reservation_id=${encodeURIComponent(
            reservationId
          )}`,
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
          setPayments([]);
          return;
        }

        throw new Error(
          result?.error ??
          "Impossibile caricare i pagamenti."
        );
      }

      setSetupRequired(
        false
      );

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


  useEffect(
    () => {
      void load();
    },
    [
      reservationId,
    ]
  );


  async function submit(
    event:
      React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (
      saving
    ) {
      return;
    }

    const numericAmount =
      Number(
        amount.replace(
          ",",
          "."
        )
      );

    if (
      !Number.isFinite(
        numericAmount
      ) ||
      numericAmount === 0
    ) {
      setError(
        "Inserisci un importo valido."
      );
      return;
    }

    setSaving(
      true
    );
    setError("");

    try {
      const response =
        await fetch(
          "/api/admin/payments",
          {
            method:
              "POST",
            headers: {
              "Content-Type":
                "application/json",
            },
            body:
              JSON.stringify({
                reservation_id:
                  reservationId,
                amount:
                  numericAmount,
                kind,
                method,
                notes,
              }),
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
        }

        throw new Error(
          result?.error ??
          "Impossibile registrare il pagamento."
        );
      }

      setAmount("");
      setNotes("");

      await load();

      router.refresh();
    } catch (
      saveError
    ) {
      setError(
        saveError instanceof
          Error
          ? saveError.message
          : "Errore registrazione pagamento."
      );
    } finally {
      setSaving(
        false
      );
    }
  }


  return (
    <section
      id="pagamenti"
      className="overflow-hidden rounded-[26px] border border-black/10 bg-white"
    >
      <div className="border-b border-black/10 bg-[#fbfaf7] p-6 sm:p-7">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="text-[11px] font-bold uppercase tracking-[0.11em] text-[#ff5a1f]">
              Pagamenti
            </div>

            <h2 className="mt-1 text-[28px] font-semibold tracking-[-0.04em]">
              Incassi e storico.
            </h2>

            <p className="mt-2 max-w-[650px] text-[13px] leading-6 text-black/45">
              Registra ogni movimento separatamente. Acconti, saldi, rimborsi e rettifiche restano nello storico.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <MoneyStat
              label="Totale"
              value={
                orderTotal
              }
            />

            <MoneyStat
              label="Incassato"
              value={
                paid
              }
              success={
                paid > 0
              }
            />

            <MoneyStat
              label="Residuo"
              value={
                balance
              }
              warning={
                balance > 0
              }
            />
          </div>
        </div>
      </div>

      {setupRequired && (
        <div className="border-b border-[#d98a08]/20 bg-[#fff2d5] px-6 py-4 text-[13px] leading-6 text-[#8a650f] sm:px-7">
          Il modulo pagamenti è pronto nel codice, ma la nuova tabella database deve ancora essere applicata su Supabase.
        </div>
      )}

      {error && (
        <div className="border-b border-[#cf3d32]/15 bg-[#fff0ee] px-6 py-4 text-[13px] font-medium text-[#9d352c] sm:px-7">
          {error}
        </div>
      )}

      {canEdit &&
        !setupRequired && (
        <form
          onSubmit={
            submit
          }
          className="grid gap-3 border-b border-black/10 p-6 sm:p-7 lg:grid-cols-[160px_170px_170px_minmax(0,1fr)_auto]"
        >
          <input
            value={
              amount
            }
            onChange={(
              event
            ) =>
              setAmount(
                event.target
                  .value
              )
            }
            inputMode="decimal"
            placeholder="Importo €"
            className="h-[52px] rounded-[14px] border border-black/10 bg-[#f6f5f0] px-4 text-[14px] outline-none transition focus:border-[#ff5a1f]/45 focus:bg-white"
          />

          <select
            value={
              kind
            }
            onChange={(
              event
            ) =>
              setKind(
                event.target
                  .value as
                  Payment["kind"]
              )
            }
            className="h-[52px] rounded-[14px] border border-black/10 bg-[#f6f5f0] px-4 text-[13px] font-semibold outline-none"
          >
            <option value="payment">
              Pagamento
            </option>
            <option value="deposit">
              Acconto
            </option>
            <option value="refund">
              Rimborso
            </option>
            <option value="adjustment">
              Rettifica
            </option>
          </select>

          <select
            value={
              method
            }
            onChange={(
              event
            ) =>
              setMethod(
                event.target
                  .value as
                  Payment["method"]
              )
            }
            className="h-[52px] rounded-[14px] border border-black/10 bg-[#f6f5f0] px-4 text-[13px] font-semibold outline-none"
          >
            <option value="bank_transfer">
              Bonifico
            </option>
            <option value="cash">
              Contanti
            </option>
            <option value="card">
              Carta
            </option>
            <option value="paypal">
              PayPal
            </option>
            <option value="other">
              Altro
            </option>
          </select>

          <input
            value={
              notes
            }
            onChange={(
              event
            ) =>
              setNotes(
                event.target
                  .value
              )
            }
            placeholder="Nota facoltativa"
            className="h-[52px] min-w-0 rounded-[14px] border border-black/10 bg-[#f6f5f0] px-4 text-[13px] outline-none transition focus:border-[#ff5a1f]/45 focus:bg-white"
          />

          <button
            type="submit"
            disabled={
              saving
            }
            className="h-[52px] rounded-[14px] bg-[#181818] px-6 text-[13px] font-semibold text-white transition hover:bg-[#ff5a1f] disabled:opacity-40"
          >
            {saving
              ? "Registro..."
              : "Registra"}
          </button>
        </form>
      )}

      <div>
        {loading ? (
          <div className="p-6 text-[13px] text-black/35 sm:p-7">
            Caricamento storico…
          </div>
        ) : payments.length ===
          0 ? (
          <div className="p-6 text-[13px] text-black/35 sm:p-7">
            Nessun pagamento registrato.
          </div>
        ) : (
          <div className="divide-y divide-black/10">
            {payments.map(
              (
                payment
              ) => (
                <div
                  key={
                    payment.id
                  }
                  className="grid gap-3 px-6 py-4 sm:px-7 lg:grid-cols-[150px_130px_130px_minmax(0,1fr)_140px] lg:items-center"
                >
                  <div>
                    <div className="text-[13px] font-semibold">
                      {kindLabel(
                        payment.kind
                      )}
                    </div>

                    <div className="mt-1 text-[10px] text-black/30">
                      {dateTime(
                        payment.paid_at
                      )}
                    </div>
                  </div>

                  <div className="text-[12px] font-semibold text-black/50">
                    {methodLabel(
                      payment.method
                    )}
                  </div>

                  <div
                    className={`text-[16px] font-semibold ${
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

                  <div className="text-[12px] leading-5 text-black/40">
                    {payment.notes ||
                      "—"}
                  </div>

                  <div className="font-mono text-[10px] text-black/25 lg:text-right">
                    MOV-{String(
                      payment.id
                    ).padStart(
                      5,
                      "0"
                    )}
                  </div>
                </div>
              )
            )}
          </div>
        )}
      </div>
    </section>
  );
}


function MoneyStat({
  label,
  value,
  success = false,
  warning = false,
}: {
  label: string;
  value: number;
  success?: boolean;
  warning?: boolean;
}) {
  return (
    <div
      className={`min-w-[104px] rounded-[14px] px-3 py-3 ${
        success
          ? "bg-[#e9f6ee]"
          : warning
            ? "bg-[#fff2d5]"
            : "bg-[#f1f0ea]"
      }`}
    >
      <div className="text-[9px] font-bold uppercase tracking-[0.08em] text-black/30">
        {label}
      </div>

      <div className="mt-1 text-[13px] font-semibold">
        {money(
          value
        )}
      </div>
    </div>
  );
}


export default PaymentPanel;
