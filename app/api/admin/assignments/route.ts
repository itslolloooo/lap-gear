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


/* =========================================================
   REDIRECT
   ========================================================= */

function redirectToRequest(
  request: Request,
  reservationId: string,
  params?: {
    success?: string;
    error?: string;
  }
) {
  const url =
    new URL(
      `/admin/richieste/${reservationId}`,
      request.url
    );


  if (
    params?.success
  ) {
    url.searchParams.set(
      "assignmentSuccess",
      params.success
    );
  }


  if (
    params?.error
  ) {
    url.searchParams.set(
      "assignmentError",
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
  request: Request
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
    return NextResponse.redirect(
      new URL(
        "/admin/login",
        request.url
      ),
      303
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
        error:
          "Dati non validi.",
      },
      {
        status:
          400,
      }
    );
  }


  const action =
    String(
      formData.get(
        "action"
      ) ?? ""
    ).trim();


  const reservationId =
    String(
      formData.get(
        "reservation_id"
      ) ?? ""
    ).trim();


  if (!reservationId) {
    return NextResponse.json(
      {
        error:
          "Richiesta non valida.",
      },
      {
        status:
          400,
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
      reservationId,
      {
        error:
          "Servizio temporaneamente non disponibile.",
      }
    );
  }


  /* =======================================================
     ASSIGN
     ======================================================= */

  if (
    action ===
    "assign"
  ) {
    const reservationItemId =
      Number(
        formData.get(
          "reservation_item_id"
        )
      );


    const productUnitId =
      Number(
        formData.get(
          "product_unit_id"
        )
      );


    if (
      !Number.isInteger(
        reservationItemId
      ) ||
      reservationItemId <=
        0 ||
      !Number.isInteger(
        productUnitId
      ) ||
      productUnitId <=
        0
    ) {
      return redirectToRequest(
        request,
        reservationId,
        {
          error:
            "Unità selezionata non valida.",
        }
      );
    }


    /* -----------------------------------------------------
       VERIFICA CHE LA RIGA APPARTENGA ALLA RICHIESTA
       ----------------------------------------------------- */

    const {
      data:
        item,
      error:
        itemError,
    } =
      await supabase
        .from(
          "reservation_items"
        )
        .select(
          `
            id,
            reservation_id
          `
        )
        .eq(
          "id",
          reservationItemId
        )
        .maybeSingle();


    if (
      itemError
    ) {
      console.error(
        "Errore verifica reservation item:",
        itemError
      );


      return redirectToRequest(
        request,
        reservationId,
        {
          error:
            "Impossibile verificare il materiale richiesto.",
        }
      );
    }


    if (
      !item ||
      String(
        item.reservation_id
      ) !==
        reservationId
    ) {
      return redirectToRequest(
        request,
        reservationId,
        {
          error:
            "Elemento della richiesta non valido.",
        }
      );
    }


    /* -----------------------------------------------------
       ASSEGNAZIONE SICURA
       ----------------------------------------------------- */

    const {
      data,
      error,
    } =
      await supabase.rpc(
        "assign_product_unit_safe",
        {
          p_reservation_item_id:
            reservationItemId,

          p_product_unit_id:
            productUnitId,
        }
      );


    if (error) {
      console.error(
        "Errore assegnazione unità:",
        error
      );


      return redirectToRequest(
        request,
        reservationId,
        {
          error:
            "Impossibile assegnare l'unità.",
        }
      );
    }


    const result =
      data as
        | {
            ok?: boolean;
            changed?: boolean;
            code?: string;
            message?: string;
            unit_id?: number;
            asset_code?: string;
          }
        | null;


    if (
      !result?.ok
    ) {
      return redirectToRequest(
        request,
        reservationId,
        {
          error:
            result?.message ??
            "L'unità non può essere assegnata.",
        }
      );
    }


    return redirectToRequest(
      request,
      reservationId,
      {
        success:
          result.message ??
          "Unità assegnata.",
      }
    );
  }


  /* =======================================================
     REMOVE
     ======================================================= */

  if (
    action ===
    "remove"
  ) {
    const assignmentId =
      Number(
        formData.get(
          "assignment_id"
        )
      );


    if (
      !Number.isInteger(
        assignmentId
      ) ||
      assignmentId <=
        0
    ) {
      return redirectToRequest(
        request,
        reservationId,
        {
          error:
            "Assegnazione non valida.",
        }
      );
    }


    /* -----------------------------------------------------
       RECUPERA ASSEGNAZIONE
       ----------------------------------------------------- */

    const {
      data:
        assignment,
      error:
        assignmentError,
    } =
      await supabase
        .from(
          "unit_assignments"
        )
        .select(
          `
            id,

            reservation_items (
              id,
              reservation_id
            ),

            product_units (
              asset_code
            )
          `
        )
        .eq(
          "id",
          assignmentId
        )
        .maybeSingle();


    if (
      assignmentError
    ) {
      console.error(
        "Errore verifica assegnazione:",
        assignmentError
      );


      return redirectToRequest(
        request,
        reservationId,
        {
          error:
            "Impossibile verificare l'assegnazione.",
        }
      );
    }


    if (
      !assignment
    ) {
      return redirectToRequest(
        request,
        reservationId,
        {
          error:
            "Assegnazione non trovata.",
        }
      );
    }


    const relation =
      Array.isArray(
        assignment.reservation_items
      )
        ? assignment
            .reservation_items[0]
        : assignment
            .reservation_items;


    if (
      !relation ||
      String(
        relation.reservation_id
      ) !==
        reservationId
    ) {
      return redirectToRequest(
        request,
        reservationId,
        {
          error:
            "L'assegnazione non appartiene a questa richiesta.",
        }
      );
    }


    /* -----------------------------------------------------
       STATO RICHIESTA
       ----------------------------------------------------- */

    const {
      data:
        reservation,
      error:
        reservationError,
    } =
      await supabase
        .from(
          "reservations"
        )
        .select(
          "status"
        )
        .eq(
          "id",
          reservationId
        )
        .maybeSingle();


    if (
      reservationError
    ) {
      console.error(
        "Errore stato richiesta:",
        reservationError
      );


      return redirectToRequest(
        request,
        reservationId,
        {
          error:
            "Impossibile verificare lo stato della richiesta.",
        }
      );
    }


    if (
      !reservation ||
      reservation.status !==
        "confirmed"
    ) {
      return redirectToRequest(
        request,
        reservationId,
        {
          error:
            "Le assegnazioni possono essere modificate solo mentre il noleggio è confermato.",
        }
      );
    }


    /* -----------------------------------------------------
       DELETE
       ----------------------------------------------------- */

    const {
      error:
        deleteError,
    } =
      await supabase
        .from(
          "unit_assignments"
        )
        .delete()
        .eq(
          "id",
          assignmentId
        );


    if (
      deleteError
    ) {
      console.error(
        "Errore rimozione assegnazione:",
        deleteError
      );


      return redirectToRequest(
        request,
        reservationId,
        {
          error:
            "Impossibile rimuovere l'unità.",
        }
      );
    }


    return redirectToRequest(
      request,
      reservationId,
      {
        success:
          "Unità rimossa dall'assegnazione.",
      }
    );
  }


  /* =======================================================
     INVALID ACTION
     ======================================================= */

  return redirectToRequest(
    request,
    reservationId,
    {
      error:
        "Operazione non valida.",
    }
  );
}