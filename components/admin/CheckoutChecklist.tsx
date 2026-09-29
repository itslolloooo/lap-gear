"use client";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  useRouter,
} from "next/navigation";


export type CheckoutCondition =
  | "ok"
  | "wear"
  | "damaged"
  | "missing";


export type CheckoutChecklistUnit = {
  assignmentId: number;

  productName:
    string;

  assetCode:
    string;

  serialNumber:
    string | null;

  condition:
    CheckoutCondition | null;

  notes:
    string;
};


type Draft = {
  condition:
    CheckoutCondition | "";

  notes:
    string;
};


type Props = {
  units:
    CheckoutChecklistUnit[];

  editable?:
    boolean;
};


function conditionLabel(
  condition:
    CheckoutCondition
) {
  switch (
    condition
  ) {
    case "ok":
      return "Tutto OK";

    case "wear":
      return "Segni / usura";

    case "damaged":
      return "Danneggiata";

    case "missing":
      return "Mancante";
  }
}


export function CheckoutChecklist({
  units,
  editable = true,
}: Props) {

  const router =
    useRouter();


  const [
    drafts,
    setDrafts,
  ] =
    useState<
      Record<
        number,
        Draft
      >
    >({});


  const [
    savingId,
    setSavingId,
  ] =
    useState<
      number | null
    >(
      null
    );


  const [
    error,
    setError,
  ] =
    useState("");


  const [
    success,
    setSuccess,
  ] =
    useState("");


  useEffect(
    () => {

      setDrafts(
        Object.fromEntries(
          units.map(
            (
              unit
            ) => [
              unit.assignmentId,

              {
                condition:
                  unit.condition ??
                  "",

                notes:
                  unit.notes ??
                  "",
              },
            ]
          )
        )
      );

    },
    [
      units,
    ]
  );


  const completed =
    useMemo(
      () =>
        units.filter(
          (
            unit
          ) =>
            Boolean(
              unit.condition
            )
        ).length,
      [
        units,
      ]
    );


  async function save(
    assignmentId:
      number
  ) {

    if (!editable) {
      return;
    }


    const draft =
      drafts[
        assignmentId
      ];


    if (
      !draft?.condition
    ) {
      setError(
        "Seleziona la condizione del materiale."
      );

      return;
    }


    if (
      draft.condition !==
        "ok" &&
      !draft.notes.trim()
    ) {
      setError(
        "Inserisci una nota per descrivere il problema."
      );

      return;
    }


    setSavingId(
      assignmentId
    );

    setError(
      ""
    );

    setSuccess(
      ""
    );


    try {

      const response =
        await fetch(
          "/api/admin/checkout-checks",
          {
            method:
              "POST",

            headers: {
              "Content-Type":
                "application/json",
            },

            body:
              JSON.stringify({
                assignment_id:
                  assignmentId,

                condition:
                  draft.condition,

                notes:
                  draft.notes,
              }),
          }
        );


      const result =
        await response.json();


      if (
        !response.ok ||
        !result?.ok
      ) {
        throw new Error(
          result?.error ??
          "Errore salvataggio controllo."
        );
      }


      setSuccess(
        result.message ??
        "Controllo salvato."
      );


      router.refresh();

    } catch (
      saveError
    ) {

      setError(
        saveError instanceof
          Error
          ? saveError.message
          : "Errore salvataggio controllo."
      );

    } finally {

      setSavingId(
        null
      );

    }

  }


  return (
    <section className="overflow-hidden rounded-[26px] border border-black/10 bg-white">

      <div className="border-b border-black/10 bg-[#181818] p-6 text-white sm:p-7">

        <div className="text-[12px] font-bold uppercase tracking-[0.12em] text-[#ff7b4a]">
          Checkout Control
        </div>


        <div className="mt-2 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">

          <div>

            <h2 className="text-[30px] font-semibold tracking-[-0.045em]">
              Checklist consegna.
            </h2>


            <p className="mt-2 max-w-[680px] text-[14px] leading-6 text-white/50">
              Registra lo stato di ogni
              unità prima di consegnare
              il materiale al cliente.
            </p>

          </div>


          <div
            className={`rounded-full px-4 py-2 text-[12px] font-semibold ${
              completed ===
              units.length
                ? "bg-[#168a50] text-white"
                : "bg-white/10 text-white/65"
            }`}
          >
            {completed}/
            {units.length} controllate
          </div>

        </div>

      </div>


      {!editable && (
        <div className="border-b border-[#245bff]/15 bg-[#edf2ff] px-6 py-4 text-[13px] font-semibold text-[#245bff] sm:px-7">
          Checklist bloccata: il materiale è già stato ritirato.
        </div>
      )}


      {error && (
        <div className="border-b border-[#cf3d32]/15 bg-[#fff0ee] px-6 py-4 text-[13px] font-semibold text-[#a9362d]">
          {error}
        </div>
      )}


      {success && (
        <div className="border-b border-[#168a50]/15 bg-[#e9f6ee] px-6 py-4 text-[13px] font-semibold text-[#168a50]">
          ✓ {success}
        </div>
      )}


      <div className="divide-y divide-black/10">

        {units.map(
          (
            unit
          ) => {

            const draft =
              drafts[
                unit.assignmentId
              ] ?? {
                condition:
                  unit.condition ??
                  "",
                notes:
                  unit.notes ??
                  "",
              };


            const saved =
              Boolean(
                unit.condition
              );


            return (
              <article
                key={
                  unit.assignmentId
                }
                className="p-6 sm:p-7"
              >

                <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">

                  <div className="min-w-0">

                    <div className="flex flex-wrap items-center gap-2">

                      <span className="font-mono text-[15px] font-bold text-black/75">
                        {
                          unit.assetCode
                        }
                      </span>


                      <span
                        className={`rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-[0.06em] ${
                          saved
                            ? "bg-[#e9f6ee] text-[#168a50]"
                            : "bg-[#fff2d5] text-[#aa6b08]"
                        }`}
                      >
                        {saved
                          ? "Controllata"
                          : "Da controllare"}
                      </span>

                    </div>


                    <div className="mt-2 text-[19px] font-semibold tracking-[-0.025em]">
                      {
                        unit.productName
                      }
                    </div>


                    {unit.serialNumber && (
                      <div className="mt-1 font-mono text-[11px] text-black/35">
                        S/N{" "}
                        {
                          unit.serialNumber
                        }
                      </div>
                    )}

                  </div>


                  {editable ? (

                    <div className="grid w-full gap-3 xl:max-w-[650px] xl:grid-cols-[190px_1fr_auto]">

                      <select
                        value={
                          draft.condition
                        }
                        onChange={(
                          event
                        ) => {

                          const value =
                            event.target
                              .value as
                              CheckoutCondition
                              | "";


                          setDrafts(
                            (
                              current
                            ) => ({
                              ...current,

                              [
                                unit.assignmentId
                              ]: {
                                ...draft,

                                condition:
                                  value,
                              },
                            })
                          );

                        }}
                        className="h-[52px] rounded-[14px] border border-black/10 bg-[#f5f4ef] px-4 text-[13px] font-semibold text-[#181818] outline-none transition focus:border-[#ff5a1f]/50 focus:bg-white"
                      >

                        <option value="">
                          Condizione
                        </option>

                        <option value="ok">
                          ✓ Tutto OK
                        </option>

                        <option value="wear">
                          Segni / usura
                        </option>

                        <option value="damaged">
                          Danneggiata
                        </option>

                        <option value="missing">
                          Mancante
                        </option>

                      </select>


                      <input
                        type="text"
                        value={
                          draft.notes
                        }
                        onChange={(
                          event
                        ) =>
                          setDrafts(
                            (
                              current
                            ) => ({
                              ...current,

                              [
                                unit.assignmentId
                              ]: {
                                ...draft,

                                notes:
                                  event.target
                                    .value,
                              },
                            })
                          )
                        }
                        placeholder={
                          draft.condition ===
                            "ok" ||
                          !draft.condition
                            ? "Note facoltative"
                            : "Descrivi il problema"
                        }
                        className="h-[52px] min-w-0 rounded-[14px] border border-black/10 bg-[#f5f4ef] px-4 text-[13px] text-[#181818] outline-none transition placeholder:text-black/30 focus:border-[#ff5a1f]/50 focus:bg-white"
                      />


                      <button
                        type="button"
                        disabled={
                          savingId ===
                          unit.assignmentId
                        }
                        onClick={() =>
                          save(
                            unit.assignmentId
                          )
                        }
                        className="h-[52px] rounded-[14px] bg-[#181818] px-5 text-[13px] font-semibold text-white transition hover:bg-[#ff5a1f] disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        {savingId ===
                        unit.assignmentId
                          ? "Salvo..."
                          : saved
                            ? "Aggiorna"
                            : "Salva"}
                      </button>

                    </div>

                  ) : (

                    <div className="w-full rounded-[15px] border border-black/10 bg-[#f5f4ef] p-4 xl:max-w-[520px]">

                      <div className="text-[10px] font-bold uppercase tracking-[0.08em] text-black/30">
                        Stato alla consegna
                      </div>


                      <div className="mt-1 text-[14px] font-semibold text-black/70">
                        {unit.condition
                          ? conditionLabel(
                              unit.condition
                            )
                          : "Controllo non registrato"}
                      </div>


                      {unit.notes && (
                        <div className="mt-2 text-[13px] leading-6 text-black/45">
                          {unit.notes}
                        </div>
                      )}

                    </div>

                  )}

                </div>

              </article>
            );

          }
        )}

      </div>


      <div
        className={`border-t px-6 py-5 sm:px-7 ${
          completed ===
          units.length
            ? "border-[#168a50]/15 bg-[#e9f6ee]"
            : "border-[#d98a08]/15 bg-[#fff2d5]"
        }`}
      >

        {completed ===
        units.length ? (

          <div className="text-[13px] font-semibold text-[#168a50]">
            ✓ Checklist completa.
            Il materiale può essere
            segnato come Ritirato.
          </div>

        ) : (

          <div className="text-[13px] font-semibold text-[#8a650f]">
            Mancano{" "}
            {
              units.length -
              completed
            }{" "}
            {
              units.length -
                completed ===
              1
                ? "controllo"
                : "controlli"
            }{" "}
            prima del ritiro.
          </div>

        )}

      </div>

    </section>
  );
}


export default CheckoutChecklist;
