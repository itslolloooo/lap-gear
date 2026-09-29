import {
  NextResponse,
} from "next/server";

import {
  createSupabaseAuthServerClient,
} from "@/lib/supabase-auth-server";

import {
  getServerSupabase,
} from "@/lib/supabase-server";


export const dynamic =
  "force-dynamic";


const VALID_STATUSES =
  new Set([
    "requested",
    "confirmed",
    "picked_up",
    "returned",
    "cancelled",
  ]);


/* =========================================================
   REDIRECT ALLA RICHIESTA
   ========================================================= */

function redirectToRequest(
  request: Request,
  id: string,
  params?: {
    success?: string;
    error?: string;
  }
) {
  const url =
    new URL(
      `/admin/richieste/${id}`,
      request.url
    );


  if (
    params?.success
  ) {
    url.searchParams.set(
      "statusSuccess",
      params.success
    );
  }


  if (
    params?.error
  ) {
    url.searchParams.set(
      "statusError",
      params.error
    );
  }


  return NextResponse.redirect(
    url,
    303
  );
}


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

  const auth =
    await createSupabaseAuthServerClient();


  const {
    data: {
      user,
    },
  } =
    await auth.auth.getUser();


  const adminUserId =
    process.env.ADMIN_USER_ID;


  if (
    !user ||
    !adminUserId ||
    user.id !==
      adminUserId
  ) {
    return NextResponse.redirect(
      new URL(
        "/admin/login",
        request.url
      ),
      303
    );
  }


  /* =======================================================
     ID RICHIESTA
     ======================================================= */

  const {
    id,
  } =
    await params;


  if (!id) {
    return NextResponse.json(
      {
        error:
          "ID richiesta non valido.",
      },
      {
        status: 400,
      }
    );
  }


  /* =======================================================
     FORM DATA
     ======================================================= */

  let formData:
    FormData;


  try {
    formData =
      await request.formData();
  } catch {
    return redirectToRequest(
      request,
      id,
      {
        error:
          "Dati del modulo non validi.",
      }
    );
  }


  const status =
    String(
      formData.get(
        "status"
      ) ?? ""
    ).trim();


  if (
    !VALID_STATUSES.has(
      status
    )
  ) {
    return redirectToRequest(
      request,
      id,
      {
        error:
          "Stato richiesta non valido.",
      }
    );
  }


  /* =======================================================
     SUPABASE
     ======================================================= */

  const supabase =
    getServerSupabase();


  if (!supabase) {
    return redirectToRequest(
      request,
      id,
      {
        error:
          "Servizio temporaneamente non disponibile.",
      }
    );
  }


  /* =======================================================
     CAMBIO STATO SICURO
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
      "Errore aggiornamento stato:",
      error
    );


    return redirectToRequest(
      request,
      id,
      {
        error:
          "Impossibile aggiornare lo stato della richiesta.",
      }
    );
  }


  const result =
    data as
      | {
          ok?: boolean;
          changed?: boolean;

          status?:
            string;

          previous_status?:
            string;

          code?:
            string;

          message?:
            string;

          product_id?:
            number;

          product_name?:
            string;
        }
      | null;


  /* =======================================================
     ERRORE DI BUSINESS
     ======================================================= */

  if (
    !result?.ok
  ) {
    return redirectToRequest(
      request,
      id,
      {
        error:
          result?.message ??
          "Non è possibile aggiornare lo stato della richiesta.",
      }
    );
  }


  /* =======================================================
     SUCCESS MESSAGE
     ======================================================= */

  let successMessage =
    "Stato aggiornato correttamente.";


  switch (
    status
  ) {

    case "confirmed":

      successMessage =
        "Richiesta confermata. La disponibilità è stata verificata.";

      break;


    case "picked_up":

      successMessage =
        "Noleggio segnato come ritirato.";

      break;


    case "returned":

      successMessage =
        "Materiale segnato come restituito.";

      break;


    case "cancelled":

      successMessage =
        "Richiesta annullata.";

      break;


    case "requested":

      successMessage =
        "Richiesta riportata nello stato da gestire.";

      break;
  }


  /* =======================================================
     REDIRECT
     ======================================================= */

  return redirectToRequest(
    request,
    id,
    {
      success:
        successMessage,
    }
  );
}