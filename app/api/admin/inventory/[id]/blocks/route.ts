import {
  NextRequest,
  NextResponse,
} from "next/server";

import {
  createSupabaseAuthServerClient,
} from "@/lib/supabase-auth-server";

import {
  getServerSupabase,
} from "@/lib/supabase-server";

export async function POST(
  request: NextRequest,
  {
    params,
  }: {
    params: Promise<{
      id: string;
    }>;
  }
) {
  /*
   * ==========================================
   * ADMIN
   * ==========================================
   */

  const auth =
    await createSupabaseAuthServerClient();

  const {
    data: { user },
  } =
    await auth.auth.getUser();

  const adminUserId =
    process.env.ADMIN_USER_ID;

  if (
    !user ||
    !adminUserId ||
    user.id !== adminUserId
  ) {
    return NextResponse.redirect(
      new URL(
        "/admin/login",
        request.url
      ),
      303
    );
  }

  /*
   * ==========================================
   * UNIT ID
   * ==========================================
   */

  const { id } =
    await params;

  const unitId =
    Number(id);

  if (
    !Number.isInteger(
      unitId
    ) ||
    unitId <= 0
  ) {
    return NextResponse.json(
      {
        error:
          "ID unità non valido.",
      },
      {
        status: 400,
      }
    );
  }

  /*
   * ==========================================
   * FORM
   * ==========================================
   */

  const formData =
    await request.formData();

  const startDate =
    String(
      formData.get(
        "start_date"
      ) ?? ""
    ).trim();

  const endDate =
    String(
      formData.get(
        "end_date"
      ) ?? ""
    ).trim();

  const reason =
    String(
      formData.get(
        "reason"
      ) ?? ""
    ).trim();

  if (
    !isValidDate(
      startDate
    ) ||
    !isValidDate(
      endDate
    ) ||
    endDate <
      startDate
  ) {
    return NextResponse.json(
      {
        error:
          "Intervallo date non valido.",
      },
      {
        status: 400,
      }
    );
  }

  /*
   * ==========================================
   * SUPABASE
   * ==========================================
   */

  const supabase =
    getServerSupabase();

  if (!supabase) {
    return NextResponse.json(
      {
        error:
          "Supabase non configurato.",
      },
      {
        status: 500,
      }
    );
  }

  /*
   * Verifica unità
   */

  const {
    data: unit,
    error: unitError,
  } = await supabase
    .from(
      "product_units"
    )
    .select(
      "id"
    )
    .eq(
      "id",
      unitId
    )
    .maybeSingle();

  if (
    unitError ||
    !unit
  ) {
    return NextResponse.json(
      {
        error:
          "Unità non trovata.",
      },
      {
        status: 404,
      }
    );
  }

  /*
   * ==========================================
   * CONTROLLO SOVRAPPOSIZIONI
   * ==========================================
   */

  const {
    data: overlapping,
    error:
      overlapError,
  } = await supabase
    .from(
      "availability_blocks"
    )
    .select(
      "id"
    )
    .eq(
      "product_unit_id",
      unitId
    )
    .lte(
      "start_date",
      endDate
    )
    .gte(
      "end_date",
      startDate
    )
    .limit(1);

  if (overlapError) {
    return NextResponse.json(
      {
        error:
          overlapError.message,
      },
      {
        status: 500,
      }
    );
  }

  if (
    overlapping &&
    overlapping.length >
      0
  ) {
    return NextResponse.json(
      {
        error:
          "Esiste già un blocco che si sovrappone a queste date.",
      },
      {
        status: 409,
      }
    );
  }

  /*
   * ==========================================
   * INSERT
   * ==========================================
   */

  const {
    error,
  } = await supabase
    .from(
      "availability_blocks"
    )
    .insert({
      product_unit_id:
        unitId,

      start_date:
        startDate,

      end_date:
        endDate,

      reason:
        reason ||
        null,
    });

  if (error) {
    console.error(
      "Errore creazione blocco:",
      error
    );

    return NextResponse.json(
      {
        error:
          error.message,
      },
      {
        status: 500,
      }
    );
  }

  return NextResponse.redirect(
    new URL(
      `/admin/inventario/${unitId}#disponibilita`,
      request.url
    ),
    303
  );
}


/* =========================================================
   HELPERS
   ========================================================= */

function isValidDate(
  value: string
) {
  return /^\d{4}-\d{2}-\d{2}$/.test(
    value
  );
}