import {
  NextResponse,
} from "next/server";

import {
  requireAdminAccess,
} from "@/lib/admin-auth";

import {
  getServerSupabase,
} from "@/lib/supabase-server";


export const dynamic =
  "force-dynamic";


type ReservationStatus =
  | "requested"
  | "confirmed"
  | "picked_up"
  | "returned"
  | "cancelled";


const VALID_STATUSES:
  ReservationStatus[] = [
    "requested",
    "confirmed",
    "picked_up",
    "returned",
    "cancelled",
  ];


/* =========================================================
   POST
   ========================================================= */

export async function POST(
  request: Request,
  {
    params,
  }: {
    params: Promise<{
      id: string;
    }>;
  }
) {

  /* =======================================================
     AUTH
     ======================================================= */

  const access =
    await requireAdminAccess([
      "admin",
      "operator",
    ]);


  if (!access) {
    return NextResponse.json(
      {
        ok: false,
        error:
          "Non autorizzato.",
      },
      {
        status: 401,
      }
    );
  }


  /* =======================================================
     ID
     ======================================================= */

  const {
    id,
  } =
    await params;


  if (!id) {
    return NextResponse.json(
      {
        ok: false,
        error:
          "ID richiesta non valido.",
      },
      {
        status: 400,
      }
    );
  }


  /* =======================================================
     FORM
     ======================================================= */

  let formData:
    FormData;


  try {
    formData =
      await request.formData();
  } catch {
    return NextResponse.json(
      {
        ok: false,
        error:
          "Dati del modulo non validi.",
      },
      {
        status: 400,
      }
    );
  }


  const status =
    String(
      formData.get(
        "status"
      ) ?? ""
    ).trim() as
      ReservationStatus;


  if (
    !VALID_STATUSES.includes(
      status
    )
  ) {
    return NextResponse.json(
      {
        ok: false,
        error:
          "Stato richiesta non valido.",
      },
      {
        status: 400,
      }
    );
  }


  /* =======================================================
     SUPABASE
     ======================================================= */

  const supabase =
    getServerSupabase();


  if (!supabase) {
    return NextResponse.json(
      {
        ok: false,
        error:
          "Servizio temporaneamente non disponibile.",
      },
      {
        status: 500,
      }
    );
  }


  /* =======================================================
     CAMBIO STATO ATOMICO
     ======================================================= */

  const {
    data,
    error,
  } =
    await supabase.rpc(
      "set_reservation_status_safe",
      {
        p_reservation_id:
          id,

        p_status:
          status,
      }
    );


  if (error) {
    console.error(
      "Errore set_reservation_status_safe:",
      error
    );


    return NextResponse.json(
      {
        ok: false,

        error:
          error.message ??
          "Impossibile aggiornare lo stato della richiesta.",

        code:
          error.code ??
          null,

        details:
          error.details ??
          null,

        hint:
          error.hint ??
          null,
      },
      {
        status: 500,
      }
    );
  }


  const result =
    data as
      | {
          ok?: boolean;
          changed?: boolean;
          status?: string;
          previous_status?: string;
          code?: string;
          message?: string;
          product_id?: number;
          product_name?: string;
          missing?: number;
        }
      | null;


  if (!result) {
    return NextResponse.json(
      {
        ok: false,
        error:
          "Risposta del database non valida.",
      },
      {
        status: 500,
      }
    );
  }


  if (!result.ok) {

    let httpStatus =
      400;


    switch (
      result.code
    ) {

      case "not_found":
        httpStatus =
          404;
        break;


      case "not_available":

      case "missing_assignments":

      case "missing_checkout_checks":

      case "missing_return_checks":

      case "invalid_transition":
        httpStatus =
          409;
        break;


      default:
        httpStatus =
          400;
        break;

    }


    return NextResponse.json(
      {
        ok: false,

        code:
          result.code ??
          "status_change_failed",

        error:
          result.message ??
          "Non è possibile aggiornare lo stato della richiesta.",

        missing:
          result.missing ??
          null,
      },
      {
        status:
          httpStatus,
      }
    );
  }


  /* =======================================================
     SUCCESS MESSAGE
     ======================================================= */

  let message =
    "Stato aggiornato correttamente.";


  switch (
    status
  ) {

    case "confirmed":
      message =
        "Richiesta confermata. La disponibilità è stata verificata.";
      break;


    case "picked_up":
      message =
        "Checklist di consegna completa. Noleggio segnato come ritirato.";
      break;


    case "returned":
      message =
        "Checklist di riconsegna completa. Noleggio chiuso.";
      break;


    case "cancelled":
      message =
        "Richiesta annullata.";
      break;


    case "requested":
      message =
        "Richiesta riportata da gestire.";
      break;

  }


  return NextResponse.json({
    ok: true,

    changed:
      result.changed ??
      true,

    status,

    previousStatus:
      result.previous_status ??
      null,

    message,
  });
}


/* =========================================================
   DELETE
   ========================================================= */

export async function DELETE(
  _request: Request,
  {
    params,
  }: {
    params: Promise<{
      id: string;
    }>;
  }
) {

  /* =======================================================
     AUTH - SOLO ADMIN
     ======================================================= */

  const access =
    await requireAdminAccess([
      "admin",
    ]);


  if (!access) {
    return NextResponse.json(
      {
        ok: false,
        error:
          "Non autorizzato.",
      },
      {
        status: 401,
      }
    );
  }


  /* =======================================================
     ID
     ======================================================= */

  const {
    id,
  } =
    await params;


  if (!id) {
    return NextResponse.json(
      {
        ok: false,
        error:
          "ID richiesta non valido.",
      },
      {
        status: 400,
      }
    );
  }


  /* =======================================================
     SUPABASE
     ======================================================= */

  const supabase =
    getServerSupabase();


  if (!supabase) {
    return NextResponse.json(
      {
        ok: false,
        error:
          "Servizio temporaneamente non disponibile.",
      },
      {
        status: 500,
      }
    );
  }


  /* =======================================================
     VERIFICA ESISTENZA
     ======================================================= */

  const {
    data:
      reservation,
    error:
      lookupError,
  } =
    await supabase
      .from(
        "reservations"
      )
      .select(
        "id, reference"
      )
      .eq(
        "id",
        id
      )
      .maybeSingle();


  if (lookupError) {
    console.error(
      "Errore verifica richiesta da eliminare:",
      lookupError
    );

    return NextResponse.json(
      {
        ok: false,
        error:
          "Impossibile verificare la richiesta.",
      },
      {
        status: 500,
      }
    );
  }


  if (!reservation) {
    return NextResponse.json(
      {
        ok: false,
        error:
          "Richiesta non trovata.",
      },
      {
        status: 404,
      }
    );
  }


  /* =======================================================
     ELIMINA RICHIESTA
     ======================================================= */

  const {
    error:
      deleteError,
  } =
    await supabase
      .from(
        "reservations"
      )
      .delete()
      .eq(
        "id",
        id
      );


  if (deleteError) {
    console.error(
      "Errore eliminazione richiesta:",
      deleteError
    );

    return NextResponse.json(
      {
        ok: false,
        error:
          deleteError.message ??
          "Impossibile eliminare la richiesta.",
      },
      {
        status: 500,
      }
    );
  }


  return NextResponse.json(
    {
      ok: true,
      id,
      reference:
        reservation.reference,
      message:
        "Richiesta eliminata definitivamente.",
    },
    {
      status: 200,
    }
  );
}
