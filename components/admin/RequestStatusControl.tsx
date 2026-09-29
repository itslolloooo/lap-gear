"use client";

import {
  FormEvent,
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
  requestId:
    string;

  currentStatus:
    ReservationStatus;
};


export default function RequestStatusControl({
  requestId,
  currentStatus,
}: Props) {
  const router =
    useRouter();


  const [
    status,
    setStatus,
  ] =
    useState<
      ReservationStatus
    >(
      currentStatus
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
    useState(
      ""
    );


  const [
    success,
    setSuccess,
  ] =
    useState(
      ""
    );


  async function submit(
    event:
      FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();


    if (
      saving
    ) {
      return;
    }


    setSaving(
      true
    );

    setError(
      ""
    );

    setSuccess(
      ""
    );


    const formData =
      new FormData();

    formData.set(
      "status",
      status
    );


    try {
      const response =
        await fetch(
          `/api/admin/requests/${requestId}`,
          {
            method:
              "POST",

            body:
              formData,
          }
        );


      const result =
        await response.json();


      if (
        !response.ok
      ) {
        throw new Error(
          result.error ??
            "Errore durante il salvataggio."
        );
      }


      setSuccess(
        "Stato aggiornato."
      );


      router.refresh();
    } catch (
      saveError
    ) {
      setError(
        saveError instanceof
          Error
          ? saveError.message
          : "Errore durante il salvataggio."
      );
    } finally {
      setSaving(
        false
      );
    }
  }


  return (
    <form
      onSubmit={
        submit
      }
      style={{
        display:
          "grid",

        gap:
          18,
      }}
    >

      <label
        style={{
          display:
            "grid",

          gap:
            8,
        }}
      >
        <span>
          Stato
        </span>


        <select
          name="status"
          value={
            status
          }
          disabled={
            saving
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
          style={{
            minHeight:
              52,

            padding:
              "0 16px",

            border:
              "1px solid #d8d8d8",

            background:
              "#fff",

            font:
              "inherit",
          }}
        >
          <option value="requested">
            Da gestire
          </option>

          <option value="confirmed">
            Confermata
          </option>

          <option value="picked_up">
            Ritirata
          </option>

          <option value="returned">
            Restituita
          </option>

          <option value="cancelled">
            Annullata
          </option>
        </select>
      </label>


      {error && (
        <div
          style={{
            padding:
              "14px 16px",

            border:
              "1px solid #efc2bc",

            background:
              "#fff0ee",

            color:
              "#a63d32",

            fontSize:
              13,

            lineHeight:
              1.5,
          }}
        >
          <strong>
            Impossibile aggiornare
            la richiesta.
          </strong>

          <div
            style={{
              marginTop:
                4,
            }}
          >
            {error}
          </div>
        </div>
      )}


      {success && (
        <div
          style={{
            padding:
              "14px 16px",

            border:
              "1px solid #cfe5d3",

            background:
              "#edf7ef",

            color:
              "#2e6b37",

            fontSize:
              13,
          }}
        >
          {success}
        </div>
      )}


      <button
        type="submit"
        disabled={
          saving
        }
        className="primaryAction"
        style={{
          border:
            0,

          cursor:
            saving
              ? "wait"
              : "pointer",

          opacity:
            saving
              ? 0.6
              : 1,
        }}
      >
        {saving
          ? "Verifica e salvataggio..."
          : "Salva stato"}
      </button>

    </form>
  );
}