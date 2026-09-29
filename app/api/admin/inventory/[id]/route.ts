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


function redirectToUnit(
  request: Request,
  id: string,
  params?: {
    success?: string;
    error?: string;
  }
) {
  const url =
    new URL(
      `/admin/inventario/${id}`,
      request.url
    );


  if (params?.success) {
    url.searchParams.set(
      "unitSuccess",
      params.success
    );
  }


  if (params?.error) {
    url.searchParams.set(
      "unitError",
      params.error
    );
  }


  return NextResponse.redirect(
    url,
    303
  );
}


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


  /* =======================================================
     ID
     ======================================================= */

  const {
    id,
  } =
    await params;


  const unitId =
    Number(
      id
    );


  if (
    !Number.isInteger(
      unitId
    ) ||
    unitId <= 0
  ) {
    return NextResponse.json(
      {
        error:
          "Unità non valida.",
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
    return redirectToUnit(
      request,
      id,
      {
        error:
          "Dati del modulo non validi.",
      }
    );
  }


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
    ).trim();


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
    ).trim();


  const notes =
    String(
      formData.get(
        "notes"
      ) ?? ""
    ).trim();


  if (
    !Number.isInteger(
      productId
    ) ||
    productId <= 0
  ) {
    return redirectToUnit(
      request,
      id,
      {
        error:
          "Prodotto non valido.",
      }
    );
  }


  if (!assetCode) {
    return redirectToUnit(
      request,
      id,
      {
        error:
          "Inserisci un asset code.",
      }
    );
  }


  if (
    ![
      "available",
      "maintenance",
      "retired",
    ].includes(
      status
    )
  ) {
    return redirectToUnit(
      request,
      id,
      {
        error:
          "Stato unità non valido.",
      }
    );
  }


  /* =======================================================
     SUPABASE
     ======================================================= */

  const supabase =
    getServerSupabase();


  if (!supabase) {
    return redirectToUnit(
      request,
      id,
      {
        error:
          "Servizio temporaneamente non disponibile.",
      }
    );
  }


  /* =======================================================
     SAFE UPDATE
     ======================================================= */

  const {
    data,
    error,
  } =
    await supabase.rpc(
      "update_product_unit_safe",
      {
        p_unit_id:
          unitId,

        p_product_id:
          productId,

        p_asset_code:
          assetCode,

        p_serial_number:
          serialNumber,

        p_status:
          status,

        p_notes:
          notes,
      }
    );


  if (error) {
    console.error(
      "Errore aggiornamento unità:",
      error
    );


    return redirectToUnit(
      request,
      id,
      {
        error:
          "Impossibile aggiornare l'unità.",
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
          reference?: string;
        }
      | null;


  if (!result?.ok) {
    return redirectToUnit(
      request,
      id,
      {
        error:
          result?.message ??
          "Impossibile modificare l'unità.",
      }
    );
  }


  return redirectToUnit(
    request,
    id,
    {
      success:
        result.message ??
        "Unità aggiornata.",
    }
  );
}