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


const VALID_CONDITIONS =
  new Set([
    "ok",
    "wear",
    "damaged",
    "missing",
  ]);


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
     BODY
     ======================================================= */

  let body:
    Record<string, unknown>;


  try {
    body =
      await request.json();
  } catch {
    return NextResponse.json(
      {
        ok: false,
        error:
          "Dati non validi.",
      },
      {
        status: 400,
      }
    );
  }


  const assignmentId =
    Number(
      body.assignment_id
    );


  const condition =
    String(
      body.condition ??
        ""
    ).trim();


  const notes =
    String(
      body.notes ??
        ""
    ).trim();


  /* =======================================================
     VALIDAZIONE
     ======================================================= */

  if (
    !Number.isInteger(
      assignmentId
    ) ||
    assignmentId <= 0
  ) {
    return NextResponse.json(
      {
        ok: false,
        error:
          "Assegnazione non valida.",
      },
      {
        status: 400,
      }
    );
  }


  if (
    !VALID_CONDITIONS.has(
      condition
    )
  ) {
    return NextResponse.json(
      {
        ok: false,
        error:
          "Condizione non valida.",
      },
      {
        status: 400,
      }
    );
  }


  if (
    condition !== "ok" &&
    !notes
  ) {
    return NextResponse.json(
      {
        ok: false,
        error:
          "Inserisci una nota per descrivere il problema.",
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
     RPC
     ======================================================= */

  const {
    data,
    error,
  } =
    await supabase.rpc(
      "save_unit_condition_check_safe",
      {
        p_assignment_id:
          assignmentId,

        p_stage:
          "checkout",

        p_condition:
          condition,

        p_notes:
          notes,
      }
    );


  if (error) {
    console.error(
      "Errore save_unit_condition_check_safe checkout:",
      error
    );


    return NextResponse.json(
      {
        ok: false,

        error:
          error.message ??
          "Impossibile salvare il controllo.",

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
          code?: string;
          message?: string;
          check_id?: number;
        }
      | null;


  if (!result?.ok) {
    return NextResponse.json(
      {
        ok: false,

        code:
          result?.code ??
          null,

        error:
          result?.message ??
          "Impossibile salvare il controllo.",
      },
      {
        status: 400,
      }
    );
  }


  return NextResponse.json({
    ok: true,

    message:
      result.message ??
      "Controllo salvato.",
  });
}
