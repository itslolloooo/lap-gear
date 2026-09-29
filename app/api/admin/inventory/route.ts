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
  request: NextRequest
) {
  /*
   * ==========================================
   * CONTROLLO ADMIN
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
   * LETTURA FORM
   * ==========================================
   */
  const formData =
    await request.formData();

  const productId =
    Number(
      formData.get(
        "product_id"
      )
    );

  const assetCode =
    String(
      formData.get(
        "asset_code"
      ) ?? ""
    )
      .trim()
      .toUpperCase();

  const serialNumber =
    String(
      formData.get(
        "serial_number"
      ) ?? ""
    ).trim();

  const status =
    String(
      formData.get(
        "status"
      ) ?? ""
    );

  const notes =
    String(
      formData.get(
        "notes"
      ) ?? ""
    ).trim();

  /*
   * ==========================================
   * VALIDAZIONE
   * ==========================================
   */
  const allowedStatuses = [
    "available",
    "maintenance",
    "retired",
  ];

  if (
    !productId ||
    !assetCode ||
    !allowedStatuses.includes(
      status
    )
  ) {
    return NextResponse.json(
      {
        error:
          "Dati unità non validi.",
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

  const {
    error,
  } = await supabase
    .from("product_units")
    .insert({
      product_id:
        productId,

      asset_code:
        assetCode,

      serial_number:
        serialNumber ||
        null,

      status,

      notes:
        notes ||
        null,
    });

  if (error) {
    console.error(
      "Errore creazione unità:",
      error
    );

    return NextResponse.json(
      {
        error:
          error.code ===
          "23505"
            ? "Esiste già un'unità con questo codice."
            : error.message,
      },
      {
        status: 500,
      }
    );
  }

  /*
   * ==========================================
   * RITORNO ALL'INVENTARIO
   * ==========================================
   */
  return NextResponse.redirect(
    new URL(
      "/admin/inventario",
      request.url
    ),
    303
  );
}