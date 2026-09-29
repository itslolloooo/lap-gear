"use client";

import {
  useState,
} from "react";

import {
  useRouter,
} from "next/navigation";


type Props = {
  requestId: string;
  reference: string;
};


type DeleteResponse = {
  ok?: boolean;
  error?: string;
  message?: string;
};


export function DeleteRequestButton({
  requestId,
  reference,
}: Props) {

  const router =
    useRouter();


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


  async function handleDelete() {

    const confirmed =
      window.confirm(
        `Eliminare definitivamente la richiesta ${reference}?\n\nQuesta operazione non può essere annullata.`
      );


    if (!confirmed) {
      return;
    }


    setLoading(true);
    setError("");


    try {

      const response =
        await fetch(
          `/api/admin/requests/${encodeURIComponent(
            requestId
          )}`,
          {
            method:
              "DELETE",

            headers: {
              Accept:
                "application/json",
            },

            cache:
              "no-store",
          }
        );


      const contentType =
        response.headers.get(
          "content-type"
        ) ?? "";


      if (
        !contentType.includes(
          "application/json"
        )
      ) {

        const responseText =
          await response.text();


        console.error(
          "DELETE REQUEST - risposta non JSON",
          {
            status:
              response.status,

            url:
              response.url,

            response:
              responseText.slice(
                0,
                500
              ),
          }
        );


        throw new Error(
          `Il server ha restituito una risposta non valida (${response.status}).`
        );

      }


      const result =
        await response.json() as
          DeleteResponse;


      if (
        !response.ok ||
        !result.ok
      ) {

        throw new Error(
          result.error ??
            "Errore durante l'eliminazione."
        );

      }


      router.replace(
        "/admin/richieste"
      );

      router.refresh();

    } catch (
      deleteError
    ) {

      console.error(
        "Errore eliminazione richiesta:",
        deleteError
      );


      setError(
        deleteError instanceof
          Error
          ? deleteError.message
          : "Errore durante l'eliminazione."
      );


      setLoading(false);

    }

  }


  return (
    <section className="overflow-hidden rounded-[24px] border border-[#cf3d32]/20 bg-white">

      <div className="border-b border-[#cf3d32]/10 bg-[#fff8f7] p-6">

        <div className="text-[11px] font-bold uppercase tracking-[0.11em] text-[#cf3d32]">
          Danger Zone
        </div>


        <h2 className="mt-2 text-[24px] font-semibold tracking-[-0.04em]">
          Elimina richiesta.
        </h2>


        <p className="mt-2 text-[13px] leading-6 text-black/45">
          Rimuove definitivamente
          questa richiesta e le
          relative assegnazioni.
        </p>

      </div>


      <div className="p-6">

        <button
          type="button"
          onClick={
            handleDelete
          }
          disabled={
            loading
          }
          className="flex h-[54px] w-full items-center justify-center rounded-[15px] border border-[#cf3d32]/20 bg-[#fff0ee] px-5 text-[14px] font-semibold text-[#b7352b] transition hover:border-[#cf3d32] hover:bg-[#cf3d32] hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading
            ? "Eliminazione..."
            : "Elimina richiesta"}
        </button>


        {error && (
          <div className="mt-3 rounded-[13px] bg-[#fff0ee] px-4 py-3 text-[12px] font-semibold text-[#b7352b]">

            {error}

          </div>
        )}

      </div>

    </section>
  );
}


export default DeleteRequestButton;