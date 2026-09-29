"use client";

import {
  FormEvent,
  useEffect,
  useState,
} from "react";

import {
  useRouter,
} from "next/navigation";


type Props = {
  requestId: string;
  reference: string;
  customerName: string;
  customerEmail: string;
  estimateTotal: number;
  suggestedDeposit: number;

  quotedTotal: number | null;
  quoteDeposit: number | null;
  quotePaymentMethod: string | null;
  quotePaymentDetails: string | null;
  quoteValidUntil: string | null;
  quoteLogistics: string | null;
  quoteNotes: string | null;
  quoteSentAt: string | null;
  quoteRevision: number;

  canEdit: boolean;
};


function formatMoney(
  value: number
) {
  return new Intl.NumberFormat(
    "it-IT",
    {
      style: "currency",
      currency: "EUR",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }
  ).format(value);
}


function formatDateTime(
  value: string
) {
  return new Intl.DateTimeFormat(
    "it-IT",
    {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }
  ).format(
    new Date(value)
  );
}


function inputMoney(
  value: number | null,
  fallback: number
) {
  return (
    value ?? fallback
  ).toFixed(2);
}


function defaultValidUntil() {
  const date =
    new Date();

  date.setDate(
    date.getDate() +
      7
  );

  const year =
    date.getFullYear();
  const month =
    String(
      date.getMonth() +
        1
    ).padStart(
      2,
      "0"
    );
  const day =
    String(
      date.getDate()
    ).padStart(
      2,
      "0"
    );

  return `${year}-${month}-${day}`;
}


const PAYMENT_METHODS = [
  "Da concordare",
  "Bonifico bancario anticipato",
  "Bonifico bancario prima del ritiro",
  "Contanti al ritiro",
  "Carta / POS al ritiro",
  "Pagamento misto da concordare",
];


export function QuotePanel({
  requestId,
  reference,
  customerName,
  customerEmail,
  estimateTotal,
  suggestedDeposit,
  quotedTotal,
  quoteDeposit,
  quotePaymentMethod,
  quotePaymentDetails,
  quoteValidUntil,
  quoteLogistics,
  quoteNotes,
  quoteSentAt,
  quoteRevision,
  canEdit,
}: Props) {
  const router =
    useRouter();

  const [
    total,
    setTotal,
  ] = useState(
    inputMoney(
      quotedTotal,
      estimateTotal
    )
  );

  const [
    deposit,
    setDeposit,
  ] = useState(
    inputMoney(
      quoteDeposit,
      suggestedDeposit
    )
  );

  const [
    paymentMethod,
    setPaymentMethod,
  ] = useState(
    quotePaymentMethod ??
      "Da concordare"
  );

  const [
    paymentDetails,
    setPaymentDetails,
  ] = useState(
    quotePaymentDetails ??
      ""
  );

  const [
    validUntil,
    setValidUntil,
  ] = useState(
    quoteValidUntil ??
      defaultValidUntil()
  );

  const [
    logistics,
    setLogistics,
  ] = useState(
    quoteLogistics ??
      "Ritiro e riconsegna da concordare con LAP GEAR."
  );

  const [
    notes,
    setNotes,
  ] = useState(
    quoteNotes ?? ""
  );

  const [
    loading,
    setLoading,
  ] = useState<
    | "save"
    | "preview"
    | "send"
    | null
  >(null);

  const [
    message,
    setMessage,
  ] = useState("");

  const [
    error,
    setError,
  ] = useState("");


  useEffect(() => {
    setTotal(
      inputMoney(
        quotedTotal,
        estimateTotal
      )
    );

    setDeposit(
      inputMoney(
        quoteDeposit,
        suggestedDeposit
      )
    );

    setPaymentMethod(
      quotePaymentMethod ??
        "Da concordare"
    );

    setPaymentDetails(
      quotePaymentDetails ??
        ""
    );

    setValidUntil(
      quoteValidUntil ??
        defaultValidUntil()
    );

    setLogistics(
      quoteLogistics ??
        "Ritiro e riconsegna da concordare con LAP GEAR."
    );

    setNotes(
      quoteNotes ?? ""
    );
  }, [
    quotedTotal,
    quoteDeposit,
    quotePaymentMethod,
    quotePaymentDetails,
    quoteValidUntil,
    quoteLogistics,
    quoteNotes,
    estimateTotal,
    suggestedDeposit,
  ]);


  function parseMoney(
    value: string
  ) {
    return Number(
      value
        .trim()
        .replace(
          ",",
          "."
        )
    );
  }


  async function perform(
    action:
      | "save"
      | "preview"
      | "send"
  ) {
    if (!canEdit) {
      return;
    }

    const parsedTotal =
      parseMoney(
        total
      );

    const parsedDeposit =
      parseMoney(
        deposit
      );

    if (
      !Number.isFinite(
        parsedTotal
      ) ||
      parsedTotal < 0
    ) {
      setError(
        "Inserisci un prezzo valido."
      );
      return;
    }

    if (
      !Number.isFinite(
        parsedDeposit
      ) ||
      parsedDeposit < 0
    ) {
      setError(
        "Inserisci una cauzione valida."
      );
      return;
    }

    if (
      action === "send" &&
      !paymentMethod.trim()
    ) {
      setError(
        "Indica il metodo di pagamento prima dell'invio."
      );
      return;
    }

    setLoading(action);
    setMessage("");
    setError("");

    try {
      const response =
        await fetch(
          `/api/admin/requests/${encodeURIComponent(
            requestId
          )}/quote`,
          {
            method: "POST",
            headers: {
              "Content-Type":
                "application/json",
              Accept:
                action ===
                "preview"
                  ? "application/pdf"
                  : "application/json",
            },
            cache: "no-store",
            body:
              JSON.stringify({
                action,
                quotedTotal:
                  parsedTotal,
                quoteDeposit:
                  parsedDeposit,
                quotePaymentMethod:
                  paymentMethod,
                quotePaymentDetails:
                  paymentDetails,
                quoteValidUntil:
                  validUntil,
                quoteLogistics:
                  logistics,
                quoteNotes:
                  notes,
              }),
          }
        );

      const contentType =
        response.headers.get(
          "content-type"
        ) ?? "";

      if (
        action === "preview" &&
        response.ok &&
        contentType.includes(
          "application/pdf"
        )
      ) {
        const blob =
          await response.blob();

        const url =
          URL.createObjectURL(
            blob
          );

        const anchor =
          document.createElement(
            "a"
          );

        anchor.href = url;
        anchor.download =
          `Preventivo-LAP-GEAR-${reference}-BOZZA.pdf`;
        anchor.rel =
          "noopener";

        document.body.appendChild(
          anchor
        );
        anchor.click();
        anchor.remove();

        window.setTimeout(
          () =>
            URL.revokeObjectURL(
              url
            ),
          1000
        );

        setMessage(
          "PDF di anteprima generato."
        );
        return;
      }

      const result =
        contentType.includes(
          "application/json"
        )
          ? await response.json()
          : null;

      if (!response.ok) {
        throw new Error(
          result?.error ??
            `Errore ${response.status}`
        );
      }

      setMessage(
        result?.message ??
          (action === "send"
            ? "Preventivo PDF inviato."
            : "Preventivo salvato.")
      );

      router.refresh();
    } catch (
      submitError
    ) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Impossibile gestire il preventivo."
      );
    } finally {
      setLoading(null);
    }
  }


  function submit(
    event:
      FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();
    void perform("save");
  }


  const adjustment =
    parseMoney(
      total
    ) -
    estimateTotal;


  return (
    <section className="overflow-hidden rounded-[25px] border border-black/10 bg-white">
      <div className="border-b border-black/10 bg-[#fbfaf7] p-6 sm:p-7">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="text-[11px] font-bold uppercase tracking-[0.11em] text-[#ff5a1f]">
              Preventivo PDF
            </div>

            <h2 className="mt-2 text-[30px] font-semibold tracking-[-0.045em]">
              Carta intestata, prezzo e condizioni.
            </h2>

            <p className="mt-2 max-w-[760px] text-[14px] leading-6 text-black/45">
              Genera il PDF LAP GEAR da allegare all&apos;email. Prezzo di catalogo e cauzioni dei prodotti restano invariati: qui definisci i valori della singola richiesta.
            </p>
          </div>

          {quoteSentAt ? (
            <div className="rounded-full bg-[#e9f6ee] px-4 py-2 text-[11px] font-bold text-[#168a50]">
              ✓ Rev. {String(
                Math.max(
                  1,
                  quoteRevision
                )
              ).padStart(
                2,
                "0"
              )} · {formatDateTime(quoteSentAt)}
            </div>
          ) : quotedTotal !== null ? (
            <div className="rounded-full bg-[#fff2d5] px-4 py-2 text-[11px] font-bold text-[#aa6b08]">
              Bozza salvata
            </div>
          ) : (
            <div className="rounded-full bg-[#f1f0ea] px-4 py-2 text-[11px] font-bold text-black/40">
              Non ancora inviato
            </div>
          )}
        </div>
      </div>

      <form
        onSubmit={submit}
        className="p-6 sm:p-7"
      >
        <div className="grid gap-5 lg:grid-cols-[minmax(0,.9fr)_minmax(0,1.1fr)]">
          <div className="space-y-5">
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-[18px] bg-[#181818] p-5 text-white">
                <div className="text-[10px] font-bold uppercase tracking-[0.1em] text-white/35">
                  Stima da catalogo
                </div>

                <div className="mt-2 text-[27px] font-semibold tracking-[-0.045em]">
                  {formatMoney(
                    estimateTotal
                  )}
                </div>
              </div>

              <div className="rounded-[18px] bg-[#fff0e9] p-5">
                <div className="text-[10px] font-bold uppercase tracking-[0.1em] text-[#e94b12]">
                  Cauzione suggerita
                </div>

                <div className="mt-2 text-[27px] font-semibold tracking-[-0.045em]">
                  {formatMoney(
                    suggestedDeposit
                  )}
                </div>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block">
                <span className="text-[11px] font-bold uppercase tracking-[0.1em] text-black/35">
                  Totale noleggio
                </span>

                <div className="relative mt-2">
                  <input
                    type="text"
                    inputMode="decimal"
                    value={total}
                    disabled={!canEdit}
                    onChange={(event) =>
                      setTotal(
                        event.target.value
                      )
                    }
                    className="h-[58px] w-full rounded-[15px] border border-black/10 bg-[#f6f5f0] px-4 pr-12 text-[20px] font-semibold outline-none transition focus:border-[#ff5a1f]/50 focus:bg-white disabled:cursor-not-allowed disabled:opacity-60"
                  />

                  <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-[15px] font-semibold text-black/35">
                    €
                  </span>
                </div>
              </label>

              <label className="block">
                <span className="text-[11px] font-bold uppercase tracking-[0.1em] text-black/35">
                  Cauzione
                </span>

                <div className="relative mt-2">
                  <input
                    type="text"
                    inputMode="decimal"
                    value={deposit}
                    disabled={!canEdit}
                    onChange={(event) =>
                      setDeposit(
                        event.target.value
                      )
                    }
                    className="h-[58px] w-full rounded-[15px] border border-black/10 bg-[#f6f5f0] px-4 pr-12 text-[20px] font-semibold outline-none transition focus:border-[#ff5a1f]/50 focus:bg-white disabled:cursor-not-allowed disabled:opacity-60"
                  />

                  <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-[15px] font-semibold text-black/35">
                    €
                  </span>
                </div>
              </label>
            </div>

            {Number.isFinite(
              adjustment
            ) &&
              Math.abs(
                adjustment
              ) >= 0.01 && (
              <div className="rounded-[14px] bg-[#f1f0ea] px-4 py-3 text-[12px] text-black/45">
                Adeguamento rispetto al listino: <span className="font-semibold text-black/65">{formatMoney(adjustment)}</span>
              </div>
            )}

            <label className="block">
              <span className="text-[11px] font-bold uppercase tracking-[0.1em] text-black/35">
                Metodo di pagamento
              </span>

              <select
                value={paymentMethod}
                disabled={!canEdit}
                onChange={(event) =>
                  setPaymentMethod(
                    event.target.value
                  )
                }
                className="mt-2 h-[56px] w-full rounded-[15px] border border-black/10 bg-[#f6f5f0] px-4 text-[14px] font-semibold outline-none transition focus:border-[#ff5a1f]/50 focus:bg-white disabled:cursor-not-allowed disabled:opacity-60"
              >
                {PAYMENT_METHODS.map(
                  (method) => (
                    <option
                      key={method}
                      value={method}
                    >
                      {method}
                    </option>
                  )
                )}
              </select>
            </label>

            <label className="block">
              <span className="text-[11px] font-bold uppercase tracking-[0.1em] text-black/35">
                Dettagli pagamento
              </span>

              <textarea
                value={paymentDetails}
                disabled={!canEdit}
                onChange={(event) =>
                  setPaymentDetails(
                    event.target.value
                  )
                }
                maxLength={1200}
                placeholder="Es. saldo entro 48h dalla conferma; IBAN o indicazioni operative se necessarie."
                className="mt-2 min-h-[105px] w-full resize-y rounded-[15px] border border-black/10 bg-[#f6f5f0] px-4 py-4 text-[14px] leading-6 outline-none transition placeholder:text-black/25 focus:border-[#ff5a1f]/50 focus:bg-white disabled:cursor-not-allowed disabled:opacity-60"
              />
            </label>

            <label className="block">
              <span className="text-[11px] font-bold uppercase tracking-[0.1em] text-black/35">
                Preventivo valido fino al
              </span>

              <input
                type="date"
                value={validUntil}
                disabled={!canEdit}
                onChange={(event) =>
                  setValidUntil(
                    event.target.value
                  )
                }
                className="mt-2 h-[56px] w-full rounded-[15px] border border-black/10 bg-[#f6f5f0] px-4 text-[14px] font-semibold outline-none transition focus:border-[#ff5a1f]/50 focus:bg-white disabled:cursor-not-allowed disabled:opacity-60"
              />
            </label>
          </div>

          <div className="space-y-5">
            <label className="block">
              <span className="text-[11px] font-bold uppercase tracking-[0.1em] text-black/35">
                Ritiro / riconsegna
              </span>

              <textarea
                value={logistics}
                disabled={!canEdit}
                onChange={(event) =>
                  setLogistics(
                    event.target.value
                  )
                }
                maxLength={1600}
                placeholder="Es. ritiro presso LAP GEAR, orari da concordare; riconsegna nello stesso luogo."
                className="mt-2 min-h-[118px] w-full resize-y rounded-[15px] border border-black/10 bg-[#f6f5f0] px-4 py-4 text-[14px] leading-6 outline-none transition placeholder:text-black/25 focus:border-[#ff5a1f]/50 focus:bg-white disabled:cursor-not-allowed disabled:opacity-60"
              />
            </label>

            <label className="block">
              <span className="text-[11px] font-bold uppercase tracking-[0.1em] text-black/35">
                Note al cliente
              </span>

              <textarea
                value={notes}
                disabled={!canEdit}
                onChange={(event) =>
                  setNotes(
                    event.target.value
                  )
                }
                maxLength={3000}
                placeholder="Es. sconto kit completo, accessori inclusi, richieste particolari o condizioni concordate."
                className="mt-2 min-h-[150px] w-full resize-y rounded-[15px] border border-black/10 bg-[#f6f5f0] px-4 py-4 text-[14px] leading-6 outline-none transition placeholder:text-black/25 focus:border-[#ff5a1f]/50 focus:bg-white disabled:cursor-not-allowed disabled:opacity-60"
              />
            </label>

            <div className="rounded-[17px] border border-black/10 bg-[#fbfaf7] p-5">
              <div className="text-[11px] font-bold uppercase tracking-[0.1em] text-[#ff5a1f]">
                Nel PDF
              </div>

              <div className="mt-3 grid gap-2 text-[13px] leading-6 text-black/50 sm:grid-cols-2">
                <div>✓ carta intestata LAP GEAR</div>
                <div>✓ cliente e periodo</div>
                <div>✓ materiale e prezzi</div>
                <div>✓ totale e cauzione</div>
                <div>✓ pagamento e validità</div>
                <div>✓ ritiro / riconsegna</div>
                <div>✓ note personalizzate</div>
                <div>✓ condizioni di noleggio</div>
              </div>
            </div>

            <div className="text-[12px] leading-5 text-black/35">
              Destinatario: <span className="font-semibold text-black/55">{customerName}</span> · {customerEmail}
            </div>
          </div>
        </div>

        {message && (
          <div className="mt-5 rounded-[14px] border border-[#168a50]/15 bg-[#e9f6ee] px-4 py-3 text-[13px] font-semibold text-[#168a50]">
            ✓ {message}
          </div>
        )}

        {error && (
          <div className="mt-5 rounded-[14px] border border-[#cf3d32]/15 bg-[#fff0ee] px-4 py-3 text-[13px] font-medium leading-6 text-[#9d352c]">
            {error}
          </div>
        )}

        {canEdit ? (
          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-end">
            <button
              type="submit"
              disabled={loading !== null}
              className="h-[54px] rounded-[15px] border border-black/10 bg-[#f1f0ea] px-6 text-[14px] font-semibold text-black/60 transition hover:bg-white hover:text-black disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading === "save"
                ? "Salvataggio..."
                : "Salva bozza"}
            </button>

            <button
              type="button"
              disabled={loading !== null}
              onClick={() =>
                void perform(
                  "preview"
                )
              }
              className="h-[54px] rounded-[15px] border border-black/10 bg-white px-6 text-[14px] font-semibold text-black/65 transition hover:border-[#ff5a1f]/35 hover:text-[#ff5a1f] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ===
              "preview"
                ? "Generazione PDF..."
                : "Anteprima PDF"}
            </button>

            <button
              type="button"
              disabled={loading !== null}
              onClick={() =>
                void perform(
                  "send"
                )
              }
              className="h-[54px] rounded-[15px] bg-[#ff5a1f] px-7 text-[14px] font-semibold text-white transition hover:bg-[#e94b12] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading === "send"
                ? "Invio PDF in corso..."
                : quoteSentAt
                  ? "Aggiorna e reinvia PDF →"
                  : "Invia PDF via email →"}
            </button>
          </div>
        ) : (
          <div className="mt-6 rounded-[14px] bg-[#f1f0ea] px-4 py-3 text-[13px] leading-6 text-black/45">
            Il preventivo è in sola lettura per questo stato o per il tuo ruolo.
          </div>
        )}
      </form>
    </section>
  );
}


export default QuotePanel;
