"use client";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  useRouter,
} from "next/navigation";


export type ReturnCondition =
  | "ok"
  | "wear"
  | "damaged"
  | "missing";


export type ReturnChecklistUnit = {
  assignmentId: number;

  productName:
    string;

  assetCode:
    string;

  serialNumber:
    string | null;

  checkoutCondition:
    ReturnCondition | null;

  checkoutNotes:
    string;

  condition:
    ReturnCondition | null;

  notes:
    string;
};


type Draft = {
  condition:
    ReturnCondition | "";

  notes:
    string;
};


type Props = {
  units:
    ReturnChecklistUnit[];

  editable?:
    boolean;
};


type Comparison =
  | "pending"
  | "same"
  | "better"
  | "worse"
  | "no_baseline";


const CONDITION_SEVERITY:
  Record<
    ReturnCondition,
    number
  > = {
    ok: 0,
    wear: 1,
    damaged: 2,
    missing: 3,
  };


function conditionLabel(
  condition:
    ReturnCondition
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


function comparisonForUnit(
  unit:
    ReturnChecklistUnit
): Comparison {

  if (!unit.condition) {
    return "pending";
  }


  if (
    !unit.checkoutCondition
  ) {
    return "no_baseline";
  }


  const before =
    CONDITION_SEVERITY[
      unit.checkoutCondition
    ];


  const after =
    CONDITION_SEVERITY[
      unit.condition
    ];


  if (after > before) {
    return "worse";
  }


  if (after < before) {
    return "better";
  }


  return "same";
}


function ComparisonBadge({
  comparison,
}: {
  comparison:
    Comparison;
}) {

  switch (
    comparison
  ) {

    case "worse":

      return (
        <span className="rounded-full bg-[#fff0ee] px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.06em] text-[#c33d32]">
          ⚠ Nuova anomalia
        </span>
      );


    case "better":

      return (
        <span className="rounded-full bg-[#edf2ff] px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.06em] text-[#245bff]">
          Condizione migliorata
        </span>
      );


    case "same":

      return (
        <span className="rounded-full bg-[#e9f6ee] px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.06em] text-[#168a50]">
          Nessuna variazione
        </span>
      );


    case "no_baseline":

      return (
        <span className="rounded-full bg-[#fff2d5] px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.06em] text-[#aa6b08]">
          Baseline assente
        </span>
      );


    default:

      return (
        <span className="rounded-full bg-[#f1f0ea] px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.06em] text-black/40">
          Da confrontare
        </span>
      );

  }
}


export function ReturnChecklist({
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


  const anomalies =
    useMemo(
      () =>
        units.filter(
          (
            unit
          ) =>
            comparisonForUnit(
              unit
            ) ===
              "worse"
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
          "/api/admin/return-checks",
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

      {/* HEADER */}

      <div className="border-b border-black/10 bg-[#181818] p-6 text-white sm:p-7">

        <div className="text-[12px] font-bold uppercase tracking-[0.12em] text-[#ff7b4a]">
          Return Control
        </div>


        <div className="mt-2 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">

          <div>

            <h2 className="text-[30px] font-semibold tracking-[-0.045em]">
              Checklist riconsegna.
            </h2>


            <p className="mt-2 max-w-[700px] text-[14px] leading-6 text-white/50">
              Confronta automaticamente lo
              stato del materiale al rientro
              con quello registrato alla consegna.
            </p>

          </div>


          <div className="flex flex-wrap gap-2">

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


            {anomalies > 0 && (
              <div className="rounded-full bg-[#cf3d32] px-4 py-2 text-[12px] font-semibold text-white">
                ⚠ {anomalies}{" "}
                {anomalies === 1
                  ? "anomalia"
                  : "anomalie"}
              </div>
            )}

          </div>

        </div>

      </div>


      {/* SUMMARY ANOMALIES */}

      {anomalies > 0 && (
        <div className="border-b border-[#cf3d32]/15 bg-[#fff0ee] px-6 py-5 sm:px-7">

          <div className="text-[11px] font-bold uppercase tracking-[0.09em] text-[#b7352b]">
            Attenzione al rientro
          </div>


          <div className="mt-1 text-[14px] font-semibold text-[#9d352c]">
            {anomalies === 1
              ? "1 unità presenta una condizione peggiore rispetto alla consegna."
              : `${anomalies} unità presentano una condizione peggiore rispetto alla consegna.`}
          </div>

        </div>
      )}


      {!editable && (
        <div className="border-b border-[#245bff]/15 bg-[#edf2ff] px-6 py-4 text-[13px] font-semibold text-[#245bff] sm:px-7">
          Checklist bloccata: il noleggio è già stato chiuso.
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


      {/* UNITÀ */}

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


            const comparison =
              comparisonForUnit(
                unit
              );


            const previewCondition =
              draft.condition ||
              unit.condition;


            let previewComparison:
              Comparison =
              comparison;


            if (
              previewCondition &&
              unit.checkoutCondition
            ) {

              const before =
                CONDITION_SEVERITY[
                  unit.checkoutCondition
                ];


              const after =
                CONDITION_SEVERITY[
                  previewCondition
                ];


              previewComparison =
                after > before
                  ? "worse"
                  : after < before
                    ? "better"
                    : "same";

            } else if (
              previewCondition &&
              !unit.checkoutCondition
            ) {

              previewComparison =
                "no_baseline";

            } else {

              previewComparison =
                "pending";

            }


            return (
              <article
                key={
                  unit.assignmentId
                }
                className={`p-6 sm:p-7 ${
                  comparison ===
                  "worse"
                    ? "bg-[#fffaf9]"
                    : ""
                }`}
              >

                <div className="flex flex-col gap-5">

                  {/* HEADER UNITÀ */}

                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">

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


                        <ComparisonBadge
                          comparison={
                            previewComparison
                          }
                        />

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

                  </div>


                  {/* CONFRONTO */}

                  <div className="grid gap-3 lg:grid-cols-2">

                    {/* CONSEGNA */}

                    <div className="rounded-[16px] border border-black/10 bg-[#f4f3ee] p-4">

                      <div className="text-[10px] font-bold uppercase tracking-[0.09em] text-black/30">
                        Alla consegna
                      </div>


                      <div className="mt-2 text-[15px] font-semibold text-black/70">
                        {unit.checkoutCondition
                          ? conditionLabel(
                              unit.checkoutCondition
                            )
                          : "Controllo non registrato"}
                      </div>


                      {unit.checkoutNotes && (
                        <div className="mt-2 text-[13px] leading-6 text-black/45">
                          {unit.checkoutNotes}
                        </div>
                      )}

                    </div>


                    {/* RICONSEGNA */}

                    <div
                      className={`rounded-[16px] border p-4 ${
                        previewComparison ===
                        "worse"
                          ? "border-[#cf3d32]/25 bg-[#fff0ee]"
                          : "border-black/10 bg-[#f4f3ee]"
                      }`}
                    >

                      <div
                        className={`text-[10px] font-bold uppercase tracking-[0.09em] ${
                          previewComparison ===
                          "worse"
                            ? "text-[#b7352b]"
                            : "text-black/30"
                        }`}
                      >
                        Alla riconsegna
                      </div>


                      {editable ? (

                        <div className="mt-3 grid gap-3 sm:grid-cols-[190px_1fr_auto]">

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
                                  ReturnCondition
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
                            className="h-[52px] rounded-[14px] border border-black/10 bg-white px-4 text-[13px] font-semibold text-[#181818] outline-none transition focus:border-[#ff5a1f]/50"
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
                            className="h-[52px] min-w-0 rounded-[14px] border border-black/10 bg-white px-4 text-[13px] text-[#181818] outline-none transition placeholder:text-black/30 focus:border-[#ff5a1f]/50"
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

                        <>

                          <div className="mt-2 text-[15px] font-semibold text-black/70">
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

                        </>

                      )}

                    </div>

                  </div>


                  {/* WARNING DETTAGLIO */}

                  {previewComparison ===
                    "worse" && (
                    <div className="rounded-[15px] border border-[#cf3d32]/15 bg-[#fff0ee] px-4 py-3 text-[13px] font-semibold leading-6 text-[#a9362d]">
                      ⚠ La condizione registrata
                      al rientro è peggiore rispetto
                      a quella presente alla consegna.
                    </div>
                  )}

                </div>

              </article>
            );

          }
        )}

      </div>


      {/* FOOTER */}

      <div
        className={`border-t px-6 py-5 sm:px-7 ${
          completed ===
          units.length
            ? anomalies > 0
              ? "border-[#cf3d32]/15 bg-[#fff0ee]"
              : "border-[#168a50]/15 bg-[#e9f6ee]"
            : "border-[#d98a08]/15 bg-[#fff2d5]"
        }`}
      >

        {completed !==
        units.length ? (

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
            prima della chiusura.
          </div>

        ) : anomalies > 0 ? (

          <div className="text-[13px] font-semibold text-[#a9362d]">
            ⚠ Checklist completa con{" "}
            {anomalies}{" "}
            {anomalies === 1
              ? "anomalia rilevata"
              : "anomalie rilevate"}.
            Verifica le note prima di
            chiudere il noleggio.
          </div>

        ) : (

          <div className="text-[13px] font-semibold text-[#168a50]">
            ✓ Checklist completa.
            Nessun peggioramento rilevato
            rispetto alla consegna.
          </div>

        )}

      </div>

    </section>
  );
}


export default ReturnChecklist;
