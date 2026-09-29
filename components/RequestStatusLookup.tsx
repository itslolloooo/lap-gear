"use client";

import {
  FormEvent,
  useState,
} from "react";

import Link from "next/link";


type RentalStatus =
  | "requested"
  | "confirmed"
  | "picked_up"
  | "returned"
  | "cancelled";


type RequestResult = {
  reference:
    string;

  status:
    RentalStatus;

  startDate:
    string;

  endDate:
    string;

  createdAt:
    string;

  customerName:
    string;

  days:
    number;

  total:
    number;

  quote:
    | {
        total:
          number;

        deposit:
          number;

        paymentMethod:
          string | null;

        paymentDetails:
          string | null;

        validUntil:
          string | null;

        logistics:
          string | null;

        notes:
          string | null;

        sentAt:
          string;

        revision:
          number;
      }
    | null;

  items:
    {
      name:
        string;

      slug:
        string | null;

      quantity:
        number;

      priceDay:
        number;
    }[];
};


type Props = {
  initialReference?:
    string;
};


const STEPS:
  {
    status:
      Exclude<
        RentalStatus,
        "cancelled"
      >;

    label:
      string;

    description:
      string;
  }[] = [
    {
      status:
        "requested",

      label:
        "Ricevuta",

      description:
        "La richiesta è arrivata a LAP GEAR.",
    },

    {
      status:
        "confirmed",

      label:
        "Confermata",

      description:
        "Disponibilità verificata e noleggio confermato.",
    },

    {
      status:
        "picked_up",

      label:
        "Ritirata",

      description:
        "Il materiale è stato consegnato.",
    },

    {
      status:
        "returned",

      label:
        "Restituita",

      description:
        "Il noleggio è stato chiuso.",
    },
  ];


function formatDate(
  value: string
) {

  return new Intl.DateTimeFormat(
    "it-IT",
    {
      day:
        "2-digit",

      month:
        "long",

      year:
        "numeric",
    }
  ).format(
    new Date(
      `${value}T00:00:00`
    )
  );
}


function formatDateTime(
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


function formatMoney(
  value: number
) {

  return new Intl.NumberFormat(
    "it-IT",
    {
      style:
        "currency",

      currency:
        "EUR",
    }
  ).format(
    value
  );
}


function stepIndex(
  status:
    RentalStatus
) {

  switch (
    status
  ) {

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


export function RequestStatusLookup({
  initialReference = "",
}: Props) {

  const [
    reference,
    setReference,
  ] =
    useState(
      initialReference
    );


  const [
    email,
    setEmail,
  ] =
    useState("");


  const [
    loading,
    setLoading,
  ] =
    useState(false);


  const [
    error,
    setError,
  ] =
    useState("");


  const [
    result,
    setResult,
  ] =
    useState<
      RequestResult | null
    >(
      null
    );


  async function submit(
    event:
      FormEvent<HTMLFormElement>
  ) {

    event.preventDefault();


    setLoading(
      true
    );

    setError(
      ""
    );

    setResult(
      null
    );


    try {

      const response =
        await fetch(
          "/api/request/status",
          {
            method:
              "POST",

            headers: {
              "Content-Type":
                "application/json",
            },

            body:
              JSON.stringify({
                reference,
                email,
              }),
          }
        );


      const data =
        await response.json();


      if (
        !response.ok ||
        !data?.ok
      ) {
        throw new Error(
          data?.error ??
          "Impossibile consultare la richiesta."
        );
      }


      setResult(
        data.request as
          RequestResult
      );

    } catch (
      lookupError
    ) {

      setError(
        lookupError instanceof
          Error
          ? lookupError.message
          : "Impossibile consultare la richiesta."
      );

    } finally {

      setLoading(
        false
      );

    }

  }


  const currentStep =
    result
      ? stepIndex(
          result.status
        )
      : -1;


  return (
    <div className="space-y-6">

      <section className="overflow-hidden rounded-[30px] border border-black/10 bg-white shadow-[0_18px_60px_rgba(0,0,0,0.05)]">

        <div className="grid lg:grid-cols-[1fr_0.8fr]">

          <div className="p-7 sm:p-10 lg:p-12">

            <div className="text-[12px] font-bold uppercase tracking-[0.12em] text-[#ff5a1f]">
              Stato richiesta
            </div>


            <h1 className="mt-4 max-w-[760px] text-[48px] font-semibold leading-[0.94] tracking-[-0.055em] sm:text-[70px]">
              Segui il tuo
              noleggio.
            </h1>


            <p className="mt-5 max-w-[620px] text-[17px] leading-7 text-black/50">
              Inserisci il riferimento
              ricevuto al momento della
              richiesta e la stessa email
              utilizzata per inviarla.
            </p>

          </div>


          <div className="bg-[#181818] p-7 text-white sm:p-9 lg:p-10">

            <form
              onSubmit={
                submit
              }
              className="space-y-4"
            >

              <label className="block">

                <span className="text-[11px] font-bold uppercase tracking-[0.1em] text-white/40">
                  Riferimento
                </span>


                <input
                  required
                  value={
                    reference
                  }
                  onChange={(
                    event
                  ) =>
                    setReference(
                      event.target
                        .value
                        .toUpperCase()
                    )
                  }
                  placeholder="LAP-260921-ABC123"
                  className="mt-2 h-[54px] w-full rounded-[15px] border border-white/10 bg-white/[0.07] px-4 font-mono text-[14px] text-white outline-none transition placeholder:text-white/20 focus:border-[#ff5a1f]/70"
                />

              </label>


              <label className="block">

                <span className="text-[11px] font-bold uppercase tracking-[0.1em] text-white/40">
                  Email
                </span>


                <input
                  required
                  type="email"
                  value={
                    email
                  }
                  onChange={(
                    event
                  ) =>
                    setEmail(
                      event.target
                        .value
                    )
                  }
                  placeholder="nome@email.it"
                  className="mt-2 h-[54px] w-full rounded-[15px] border border-white/10 bg-white/[0.07] px-4 text-[14px] text-white outline-none transition placeholder:text-white/20 focus:border-[#ff5a1f]/70"
                />

              </label>


              <button
                type="submit"
                disabled={
                  loading
                }
                className="flex h-[54px] w-full items-center justify-center rounded-[15px] bg-[#ff5a1f] px-5 text-[14px] font-semibold text-white transition hover:bg-[#e94b12] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loading
                  ? "Controllo..."
                  : "Controlla stato"}
              </button>

            </form>


            {error && (
              <div className="mt-4 rounded-[14px] border border-[#cf3d32]/25 bg-[#cf3d32]/10 px-4 py-3 text-[13px] leading-6 text-[#ffb9b2]">
                {error}
              </div>
            )}

          </div>

        </div>

      </section>


      {result && (

        <>

          {result.status ===
          "cancelled" ? (

            <section className="rounded-[26px] border border-[#cf3d32]/15 bg-[#fff0ee] p-6 sm:p-8">

              <div className="text-[12px] font-bold uppercase tracking-[0.1em] text-[#b7352b]">
                Richiesta annullata
              </div>


              <div className="mt-2 text-[26px] font-semibold tracking-[-0.035em] text-[#9d352c]">
                {result.reference}
              </div>


              <p className="mt-3 max-w-[700px] text-[14px] leading-6 text-[#9d352c]/75">
                Questa richiesta risulta
                annullata. Per una nuova
                disponibilità puoi comporre
                un altro kit.
              </p>

            </section>

          ) : (

            <section className="overflow-hidden rounded-[26px] border border-black/10 bg-white">

              <div className="border-b border-black/10 p-6 sm:p-8">

                <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">

                  <div>

                    <div className="text-[11px] font-bold uppercase tracking-[0.11em] text-[#ff5a1f]">
                      {result.customerName}
                    </div>


                    <h2 className="mt-2 font-mono text-[27px] font-semibold tracking-[-0.035em]">
                      {result.reference}
                    </h2>

                  </div>


                  <div className="rounded-full bg-[#f1f0ea] px-4 py-2 text-[12px] font-semibold text-black/55">
                    {formatDate(
                      result.startDate
                    )}
                    {" → "}
                    {formatDate(
                      result.endDate
                    )}
                  </div>

                </div>

              </div>


              <div className="grid sm:grid-cols-4">

                {STEPS.map(
                  (
                    step,
                    index
                  ) => {

                    const complete =
                      index <
                      currentStep;


                    const active =
                      index ===
                      currentStep;


                    return (
                      <div
                        key={
                          step.status
                        }
                        className="border-b border-black/10 p-5 last:border-b-0 sm:border-b-0 sm:border-r sm:last:border-r-0"
                      >

                        <div
                          className={`flex h-10 w-10 items-center justify-center rounded-full text-[12px] font-bold ${
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


                        <div
                          className={`mt-4 text-[16px] font-semibold ${
                            active
                              ? "text-[#ff5a1f]"
                              : "text-black/70"
                          }`}
                        >
                          {step.label}
                        </div>


                        <div className="mt-1 text-[12px] leading-5 text-black/35">
                          {step.description}
                        </div>

                      </div>
                    );

                  }
                )}

              </div>

            </section>

          )}


          {result.quote && (
            <section className="overflow-hidden rounded-[26px] border border-[#ff5a1f]/20 bg-white">

              <div className="grid lg:grid-cols-[1fr_330px]">

                <div className="p-6 sm:p-8">

                  <div className="flex flex-wrap items-center gap-3">
                    <div className="text-[11px] font-bold uppercase tracking-[0.11em] text-[#ff5a1f]">
                      Preventivo LAP GEAR
                    </div>

                    <div className="rounded-full bg-[#fff0e9] px-3 py-1.5 text-[10px] font-bold text-[#e94b12]">
                      Rev. {String(
                        Math.max(
                          1,
                          result.quote.revision
                        )
                      ).padStart(
                        2,
                        "0"
                      )}
                    </div>
                  </div>

                  <h2 className="mt-2 text-[30px] font-semibold tracking-[-0.045em]">
                    Il preventivo che abbiamo preparato per te.
                  </h2>

                  <div className="mt-6 grid gap-3 sm:grid-cols-2">
                    <div className="rounded-[18px] bg-[#181818] p-5 text-white">
                      <div className="text-[10px] font-bold uppercase tracking-[0.09em] text-[#ff7b4a]">
                        Totale noleggio
                      </div>

                      <div className="mt-2 text-[34px] font-semibold tracking-[-0.05em]">
                        {formatMoney(
                          result.quote.total
                        )}
                      </div>
                    </div>

                    <div className="rounded-[18px] bg-[#fff0e9] p-5">
                      <div className="text-[10px] font-bold uppercase tracking-[0.09em] text-[#e94b12]">
                        Cauzione
                      </div>

                      <div className="mt-2 text-[30px] font-semibold tracking-[-0.05em]">
                        {formatMoney(
                          result.quote.deposit
                        )}
                      </div>

                      <div className="mt-1 text-[11px] leading-5 text-black/35">
                        Gestita separatamente dal totale noleggio.
                      </div>
                    </div>
                  </div>

                  <div className="mt-5 grid gap-3 sm:grid-cols-2">
                    <div className="rounded-[16px] bg-[#f3f2ed] px-5 py-4">
                      <div className="text-[10px] font-bold uppercase tracking-[0.09em] text-black/30">
                        Pagamento
                      </div>

                      <div className="mt-2 text-[14px] font-semibold text-black/65">
                        {result.quote.paymentMethod ||
                          "Da concordare"}
                      </div>

                      {result.quote.paymentDetails && (
                        <div className="mt-2 whitespace-pre-wrap text-[12px] leading-5 text-black/40">
                          {result.quote.paymentDetails}
                        </div>
                      )}
                    </div>

                    <div className="rounded-[16px] bg-[#f3f2ed] px-5 py-4">
                      <div className="text-[10px] font-bold uppercase tracking-[0.09em] text-black/30">
                        Validità
                      </div>

                      <div className="mt-2 text-[14px] font-semibold text-black/65">
                        {result.quote.validUntil
                          ? `Fino al ${formatDate(
                              result.quote.validUntil
                            )}`
                          : "Da concordare"}
                      </div>

                      {result.quote.logistics && (
                        <div className="mt-3 border-t border-black/10 pt-3 text-[12px] leading-5 text-black/40">
                          {result.quote.logistics}
                        </div>
                      )}
                    </div>
                  </div>

                  {result.quote.notes && (
                    <div className="mt-5 rounded-[16px] bg-[#fff4ef] px-5 py-4">

                      <div className="text-[10px] font-bold uppercase tracking-[0.09em] text-[#a93e18]">
                        Note al preventivo
                      </div>

                      <p className="mt-2 whitespace-pre-wrap text-[14px] leading-6 text-[#5c3c30]">
                        {result.quote.notes}
                      </p>

                    </div>
                  )}

                </div>

                <div className="bg-[#181818] p-6 text-white sm:p-8">

                  <div className="text-[11px] font-bold uppercase tracking-[0.1em] text-[#ff7b4a]">
                    Preventivo inviato
                  </div>

                  <div className="mt-2 text-[18px] font-semibold">
                    {formatDateTime(
                      result.quote.sentAt
                    )}
                  </div>

                  <div className="mt-6 border-t border-white/10 pt-5">

                    <div className="text-[11px] text-white/35">
                      Stima iniziale
                    </div>

                    <div className="mt-1 text-[20px] font-semibold text-white/70">
                      {formatMoney(
                        result.total
                      )}
                    </div>

                  </div>

                  <p className="mt-6 text-[12px] leading-5 text-white/40">
                    Il PDF completo è stato inviato via email e contiene materiale, cauzione, pagamento e condizioni operative. Il preventivo non equivale ancora alla conferma del noleggio.
                  </p>

                </div>

              </div>

            </section>
          )}


          <section className="grid gap-6 lg:grid-cols-[1fr_320px]">

            <div className="overflow-hidden rounded-[26px] border border-black/10 bg-white">

              <div className="border-b border-black/10 bg-[#fbfaf7] p-6">

                <div className="text-[11px] font-bold uppercase tracking-[0.1em] text-[#ff5a1f]">
                  Il tuo kit
                </div>


                <h2 className="mt-2 text-[28px] font-semibold tracking-[-0.04em]">
                  Materiale richiesto.
                </h2>

              </div>


              <div className="divide-y divide-black/10">

                {result.items.map(
                  (
                    item,
                    index
                  ) => (
                    <div
                      key={`${item.slug ?? item.name}-${index}`}
                      className="flex items-center justify-between gap-5 p-5 sm:px-6"
                    >

                      <div>

                        <div className="text-[16px] font-semibold">
                          {item.name}
                        </div>


                        <div className="mt-1 text-[12px] text-black/35">
                          {formatMoney(
                            item.priceDay
                          )}{" "}
                          / giorno
                        </div>

                      </div>


                      <div className="rounded-full bg-[#181818] px-3 py-1.5 text-[11px] font-bold text-white">
                        {item.quantity}×
                      </div>

                    </div>
                  )
                )}

              </div>

            </div>


            <aside className="rounded-[26px] bg-[#181818] p-6 text-white">

              <div className="text-[11px] font-bold uppercase tracking-[0.1em] text-[#ff7b4a]">
                Riepilogo
              </div>


              <div className="mt-6">

                <div className="text-[12px] text-white/35">
                  Durata
                </div>

                <div className="mt-1 text-[21px] font-semibold">
                  {result.days}{" "}
                  {result.days ===
                  1
                    ? "giorno"
                    : "giorni"}
                </div>

              </div>


              <div className="mt-5 border-t border-white/10 pt-5">

                <div className="text-[12px] text-white/35">
                  {result.quote
                    ? "Preventivo"
                    : "Stima noleggio"}
                </div>

                <div className="mt-1 text-[29px] font-semibold tracking-[-0.04em]">
                  {formatMoney(
                    result.quote
                      ? result.quote.total
                      : result.total
                  )}
                </div>

                {result.quote && (
                  <div className="mt-2 text-[11px] text-white/30">
                    Stima iniziale {formatMoney(
                      result.total
                    )}
                  </div>
                )}

              </div>


              <Link
                href="/catalogo"
                className="mt-7 flex h-[50px] items-center justify-center rounded-[14px] bg-white px-5 text-[13px] font-semibold text-[#181818] transition hover:bg-[#ff5a1f] hover:text-white"
              >
                Vai al catalogo
              </Link>

            </aside>

          </section>

        </>

      )}

    </div>
  );
}


export default RequestStatusLookup;
