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


type Props = {
  requestId: string;
  currentStatus: ReservationStatus;
};


export function RequestStatusForm({
  requestId,
  currentStatus,
}: Props) {
  const router =
    useRouter();


  const [
    status,
    setStatus,
  ] =
    useState<ReservationStatus>(
      currentStatus
    );


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
    success,
    setSuccess,
  ] =
    useState("");


  async function handleSubmit(
    event:
      React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();


    setLoading(
      true
    );

    setError(
      ""
    );

    setSuccess(
      ""
    );


    try {
      const formData =
        new FormData();


      formData.set(
        "status",
        status
      );


      const response =
        await fetch(
          `/api/admin/requests/${requestId}`,
          {
            method:
              "POST",

            body:
              formData,

            redirect:
              "follow",
          }
        );


      /*
       * Se la route usa un redirect,
       * fetch lo segue.
       *
       * In quel caso torniamo semplicemente
       * alla pagina richiesta.
       */

      if (
        response.redirected
      ) {
        router.replace(
          response.url
        );

        router.refresh();

        return;
      }


      const contentType =
        response.headers.get(
          "content-type"
        ) ?? "";


      /*
       * Route che restituisce JSON.
       */

      if (
        contentType.includes(
          "application/json"
        )
      ) {
        const result =
          await response.json();


        if (
          !response.ok ||
          result?.ok === false
        ) {
          throw new Error(
            result?.message ??
              result?.error ??
              "Impossibile aggiornare lo stato."
          );
        }


        setSuccess(
          successMessage(
            status
          )
        );


        router.refresh();

        return;
      }


      /*
       * Qualsiasi risposta inattesa.
       */

      if (
        !response.ok
      ) {
        throw new Error(
          "Impossibile aggiornare lo stato."
        );
      }


      setSuccess(
        successMessage(
          status
        )
      );


      router.refresh();
    } catch (
      submitError
    ) {
      setError(
        submitError instanceof
          Error
          ? submitError.message
          : "Errore durante l'aggiornamento dello stato."
      );
    } finally {
      setLoading(
        false
      );
    }
  }


  return (
    <div>

      {error && (
        <div className="mx-6 mt-6 rounded-[15px] border border-[#cf3d32]/20 bg-[#fff0ee] px-4 py-4 text-[13px] font-medium leading-6 text-[#a9362d]">
          {error}
        </div>
      )}


      {success && (
        <div className="mx-6 mt-6 rounded-[15px] border border-[#168a50]/15 bg-[#e9f6ee] px-4 py-4 text-[13px] font-medium leading-6 text-[#168a50]">
          ✓ {success}
        </div>
      )}


      <form
        onSubmit={
          handleSubmit
        }
        className="p-6"
      >

        <label className="block">

          <span className="mb-2 block text-[12px] font-semibold text-white/55">
            Stato
          </span>


          <select
            value={
              status
            }
            onChange={(
              event
            ) =>
              setStatus(
                event.target
                  .value as
                  ReservationStatus
              )
            }
            disabled={
              loading
            }
            className="h-[56px] w-full rounded-[14px] border border-white/10 bg-white/[0.08] px-4 text-[14px] font-semibold text-white outline-none disabled:opacity-50"
          >

            <option
              value="requested"
              className="text-black"
            >
              Da gestire
            </option>

            <option
              value="confirmed"
              className="text-black"
            >
              Confermata
            </option>

            <option
              value="picked_up"
              className="text-black"
            >
              Ritirata
            </option>

            <option
              value="returned"
              className="text-black"
            >
              Restituita
            </option>

            <option
              value="cancelled"
              className="text-black"
            >
              Annullata
            </option>

          </select>

        </label>


        <button
          type="submit"
          disabled={
            loading ||
            status ===
              currentStatus
          }
          className="mt-4 flex h-[56px] w-full items-center justify-center rounded-[15px] bg-[#ff5a1f] px-5 text-[15px] font-semibold text-white transition hover:bg-white hover:text-[#181818] disabled:cursor-not-allowed disabled:opacity-40"
        >
          {loading
            ? "Salvataggio..."
            : "Salva stato"}
        </button>

      </form>

    </div>
  );
}


function successMessage(
  status:
    ReservationStatus
) {
  switch (
    status
  ) {
    case "confirmed":
      return "Richiesta confermata.";

    case "picked_up":
      return "Noleggio segnato come ritirato.";

    case "returned":
      return "Materiale segnato come restituito.";

    case "cancelled":
      return "Richiesta annullata.";

    case "requested":
      return "Richiesta riportata da gestire.";
  }
}


export default RequestStatusForm;