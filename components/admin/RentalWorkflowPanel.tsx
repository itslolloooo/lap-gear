"use client";

import {
  useState,
} from "react";

import {
  useRouter,
} from "next/navigation";


type ReservationStatus =
  | "requested"
  | "confirmed"
  | "picked_up"
  | "returned"
  | "cancelled";


type Action =
  | "confirm"
  | "pickup"
  | "return"
  | "cancel";


type Props = {
  requestId: string;
  currentStatus: ReservationStatus;
  totalAssigned: number;
  totalQuantity: number;
  checkoutMissing: number;
  returnMissing: number;
  quoteSent: boolean;
  canOperate: boolean;
};


const STEPS: {
  status:
    Exclude<
      ReservationStatus,
      "cancelled"
    >;
  label: string;
}[] = [
  {
    status: "requested",
    label: "Richiesta",
  },
  {
    status: "confirmed",
    label: "Confermata",
  },
  {
    status: "picked_up",
    label: "Consegnata",
  },
  {
    status: "returned",
    label: "Rientrata",
  },
];


function stepIndex(
  status: ReservationStatus
) {
  switch (status) {
    case "requested":
      return 0;

    case "confirmed":
      return 1;

    case "picked_up":
      return 2;

    case "returned":
      return 3;

    case "cancelled":
      return -1;
  }
}


function statusLabel(
  status: ReservationStatus
) {
  switch (status) {
    case "requested":
      return "Da gestire";

    case "confirmed":
      return "Confermata";

    case "picked_up":
      return "Materiale consegnato";

    case "returned":
      return "Materiale rientrato";

    case "cancelled":
      return "Annullata";
  }
}


export function RentalWorkflowPanel({
  requestId,
  currentStatus,
  totalAssigned,
  totalQuantity,
  checkoutMissing,
  returnMissing,
  quoteSent,
  canOperate,
}: Props) {
  const router =
    useRouter();

  const [
    loading,
    setLoading,
  ] = useState<
    Action | null
  >(null);

  const [
    error,
    setError,
  ] = useState("");

  const [
    message,
    setMessage,
  ] = useState("");

  const currentStep =
    stepIndex(
      currentStatus
    );

  const allAssigned =
    totalQuantity > 0 &&
    totalAssigned >=
      totalQuantity;


  async function run(
    action: Action
  ) {
    if (
      !canOperate ||
      loading
    ) {
      return;
    }

    if (
      action === "cancel" &&
      !window.confirm(
        "Annullare questa richiesta?"
      )
    ) {
      return;
    }

    setLoading(action);
    setError("");
    setMessage("");

    try {
      const response =
        await fetch(
          `/api/admin/requests/${encodeURIComponent(
            requestId
          )}/workflow`,
          {
            method: "POST",
            headers: {
              "Content-Type":
                "application/json",
              Accept:
                "application/json",
            },
            cache:
              "no-store",
            body:
              JSON.stringify({
                action,
              }),
          }
        );

      const contentType =
        response.headers.get(
          "content-type"
        ) ?? "";

      const result =
        contentType.includes(
          "application/json"
        )
          ? await response.json()
          : null;

      if (
        !response.ok ||
        !result?.ok
      ) {
        throw new Error(
          result?.error ??
            `Errore ${response.status}`
        );
      }

      setMessage(
        result.message ??
          "Operazione completata."
      );

      router.refresh();
    } catch (
      workflowError
    ) {
      setError(
        workflowError instanceof
          Error
          ? workflowError.message
          : "Impossibile aggiornare la richiesta."
      );
    } finally {
      setLoading(null);
    }
  }


  function MainAction() {
    if (!canOperate) {
      return (
        <div className="rounded-[18px] border border-black/10 bg-[#f4f3ee] p-5 text-[14px] leading-6 text-black/50">
          Modalità sola lettura. Il tuo ruolo non può modificare il flusso della richiesta.
        </div>
      );
    }

    if (
      currentStatus ===
      "requested"
    ) {
      if (!quoteSent) {
        return (
          <div>
            <div className="mb-4 rounded-[16px] border border-[#d98a08]/15 bg-[#fff2d5] px-4 py-4 text-[13px] leading-6 text-[#8a650f]">
              Prima prepara e invia il preventivo al cliente.
            </div>

            <a
              href="#preventivo"
              className="flex min-h-[64px] w-full items-center justify-center rounded-[17px] bg-[#ff5a1f] px-6 text-[16px] font-semibold text-white transition hover:bg-[#e94b12]"
            >
              Prepara preventivo →
            </a>

            <button
              type="button"
              disabled={
                loading !== null
              }
              onClick={() =>
                void run(
                  "cancel"
                )
              }
              className="mt-4 text-[12px] font-semibold text-black/35 transition hover:text-[#b7352b] disabled:cursor-not-allowed disabled:opacity-40"
            >
              Annulla richiesta
            </button>
          </div>
        );
      }

      return (
        <div>
          <div className="mb-4 rounded-[16px] border border-[#168a50]/15 bg-[#e9f6ee] px-4 py-4 text-[13px] leading-6 text-[#126f41]">
            ✓ Preventivo inviato. Quando il cliente accetta, conferma la richiesta.
          </div>

          <button
            type="button"
            disabled={
              loading !== null
            }
            onClick={() =>
              void run(
                "confirm"
              )
            }
            className="flex min-h-[64px] w-full items-center justify-center rounded-[17px] bg-[#ff5a1f] px-6 text-[16px] font-semibold text-white transition hover:bg-[#e94b12] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ===
            "confirm"
              ? "Confermo..."
              : "Cliente ha confermato →"}
          </button>

          <button
            type="button"
            disabled={
              loading !== null
            }
            onClick={() =>
              void run(
                "cancel"
              )
            }
            className="mt-4 text-[12px] font-semibold text-black/35 transition hover:text-[#b7352b] disabled:cursor-not-allowed disabled:opacity-40"
          >
            Annulla richiesta
          </button>
        </div>
      );
    }

    if (
      currentStatus ===
      "confirmed"
    ) {
      return (
        <div>
          {!allAssigned ? (
            <>
              <div className="mb-4 rounded-[16px] border border-[#d98a08]/15 bg-[#fff2d5] px-4 py-4 text-[13px] leading-6 text-[#8a650f]">
                Ora prepara il kit: <strong>{totalAssigned}/{totalQuantity}</strong> unità assegnate.
              </div>

              <a
                href="#materiale"
                className="flex min-h-[64px] w-full items-center justify-center rounded-[17px] bg-[#181818] px-6 text-[16px] font-semibold text-white transition hover:bg-[#ff5a1f]"
              >
                Assegna materiale →
              </a>
            </>
          ) : (
            <button
              type="button"
              disabled={
                loading !== null
              }
              onClick={() =>
                void run(
                  "pickup"
                )
              }
              className="flex min-h-[64px] w-full items-center justify-center rounded-[17px] bg-[#181818] px-6 text-[16px] font-semibold text-white transition hover:bg-[#ff5a1f] disabled:cursor-not-allowed disabled:opacity-35"
            >
              {loading ===
              "pickup"
                ? "Registro consegna..."
                : "Consegna materiale →"}
            </button>
          )}

          <p className="mt-3 text-[12px] leading-5 text-black/40">
            I controlli di consegna ancora vuoti verranno registrati automaticamente come <strong>Tutto OK</strong>. Se c&apos;è un danno o un&apos;anomalia, registrala prima nei controlli dettagliati.
          </p>

          <button
            type="button"
            disabled={
              loading !== null
            }
            onClick={() =>
              void run(
                "cancel"
              )
            }
            className="mt-4 text-[12px] font-semibold text-black/35 transition hover:text-[#b7352b] disabled:cursor-not-allowed disabled:opacity-40"
          >
            Annulla richiesta
          </button>

          {checkoutMissing >
            0 &&
            allAssigned && (
            <div className="mt-3 text-[11px] font-semibold text-black/35">
              {checkoutMissing} {checkoutMissing === 1 ? "controllo" : "controlli"} verranno completati automaticamente.
            </div>
          )}
        </div>
      );
    }

    if (
      currentStatus ===
      "picked_up"
    ) {
      return (
        <div>
          <button
            type="button"
            disabled={
              loading !== null
            }
            onClick={() =>
              void run(
                "return"
              )
            }
            className="flex min-h-[64px] w-full items-center justify-center rounded-[17px] bg-[#168a50] px-6 text-[16px] font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ===
            "return"
              ? "Registro rientro..."
              : "Materiale riconsegnato →"}
          </button>

          <p className="mt-3 text-[12px] leading-5 text-black/40">
            I controlli di rientro ancora vuoti verranno segnati come <strong>Tutto OK</strong>. Eventuali anomalie già registrate non vengono sovrascritte.
          </p>

          {returnMissing >
            0 && (
            <div className="mt-3 text-[11px] font-semibold text-black/35">
              {returnMissing} {returnMissing === 1 ? "controllo" : "controlli"} verranno completati automaticamente.
            </div>
          )}
        </div>
      );
    }

    if (
      currentStatus ===
      "returned"
    ) {
      return (
        <div className="rounded-[18px] border border-[#168a50]/15 bg-[#e9f6ee] p-5">
          <div className="text-[12px] font-bold uppercase tracking-[0.1em] text-[#168a50]">
            ✓ Noleggio chiuso
          </div>
          <div className="mt-2 text-[15px] font-semibold text-[#126f41]">
            Il materiale risulta riconsegnato.
          </div>
        </div>
      );
    }

    return (
      <div className="rounded-[18px] border border-[#cf3d32]/15 bg-[#fff0ee] p-5">
        <div className="text-[12px] font-bold uppercase tracking-[0.1em] text-[#b7352b]">
          Richiesta annullata
        </div>
        <div className="mt-2 text-[14px] leading-6 text-[#9d352c]/75">
          Nessuna azione operativa necessaria.
        </div>
      </div>
    );
  }


  return (
    <section className="overflow-hidden rounded-[26px] border border-black/10 bg-white shadow-[0_12px_40px_rgba(0,0,0,0.04)]">
      <div className="border-b border-black/10 bg-[#fbfaf7] p-6 sm:p-7">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="text-[11px] font-bold uppercase tracking-[0.11em] text-[#ff5a1f]">
              Gestione rapida
            </div>

            <h2 className="mt-2 text-[30px] font-semibold tracking-[-0.045em]">
              {statusLabel(
                currentStatus
              )}.
            </h2>

            <p className="mt-2 max-w-[700px] text-[14px] leading-6 text-black/45">
              Segui l'azione evidenziata: il sistema ti porta sempre al prossimo passaggio necessario, senza saltare step.
            </p>
          </div>

          <a
            href="#controlli-materiale"
            className="text-[13px] font-semibold text-black/40 transition hover:text-[#ff5a1f]"
          >
            Controlli dettagliati ↓
          </a>
        </div>
      </div>

      <div className="grid border-b border-black/10 sm:grid-cols-4">
        {STEPS.map(
          (
            step,
            index
          ) => {
            const complete =
              currentStatus !==
                "cancelled" &&
              index <
                currentStep;

            const active =
              currentStatus !==
                "cancelled" &&
              index ===
                currentStep;

            return (
              <div
                key={
                  step.status
                }
                className="flex items-center gap-3 border-b border-black/10 p-4 last:border-b-0 sm:border-b-0 sm:border-r sm:last:border-r-0"
              >
                <div
                  className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[11px] font-bold ${
                    complete
                      ? "bg-[#e9f6ee] text-[#168a50]"
                      : active
                        ? "bg-[#ff5a1f] text-white"
                        : "bg-[#f1f0ea] text-black/30"
                  }`}
                >
                  {complete
                    ? "✓"
                    : String(
                        index + 1
                      ).padStart(
                        2,
                        "0"
                      )}
                </div>

                <div className={`text-[13px] font-semibold ${active ? "text-[#ff5a1f]" : "text-black/50"}`}>
                  {step.label}
                </div>
              </div>
            );
          }
        )}
      </div>

      <div className="p-6 sm:p-7">
        <MainAction />

        {message && (
          <div className="mt-4 rounded-[14px] border border-[#168a50]/15 bg-[#e9f6ee] px-4 py-3 text-[13px] font-semibold text-[#168a50]">
            ✓ {message}
          </div>
        )}

        {error && (
          <div className="mt-4 rounded-[14px] border border-[#cf3d32]/15 bg-[#fff0ee] px-4 py-3 text-[13px] font-medium leading-6 text-[#9d352c]">
            {error}
          </div>
        )}
      </div>
    </section>
  );
}


export default RentalWorkflowPanel;
