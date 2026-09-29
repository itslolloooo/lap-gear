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


const DATE_REGEX =
  /^\d{4}-\d{2}-\d{2}$/;


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
      "blockSuccess",
      params.success
    );
  }


  if (params?.error) {
    url.searchParams.set(
      "blockError",
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
     UNIT
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
          "Dati non validi.",
      }
    );
  }


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
    !DATE_REGEX.test(
      startDate
    ) ||
    !DATE_REGEX.test(
      endDate
    )
  ) {
    return redirectToUnit(
      request,
      id,
      {
        error:
          "Inserisci date valide.",
      }
    );
  }


  if (
    endDate <
    startDate
  ) {
    return redirectToUnit(
      request,
      id,
      {
        error:
          "La data finale non può precedere quella iniziale.",
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
     SAFE BLOCK
     ======================================================= */

  const {
    data,
    error,
  } =
    await supabase.rpc(
      "create_availability_block_safe",
      {
        p_product_unit_id:
          unitId,

        p_start_date:
          startDate,

        p_end_date:
          endDate,

        p_reason:
          reason,
      }
    );


  if (error) {
    console.error(
      "Errore blocco disponibilità:",
      error
    );


    return redirectToUnit(
      request,
      id,
      {
        error:
          "Impossibile aggiungere il blocco.",
      }
    );
  }


  const result =
    data as
      | {
          ok?: boolean;
          changed?: boolean;
          block_id?: number;
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
          "Non è possibile bloccare l'unità.",
      }
    );
  }


  return redirectToUnit(
    request,
    id,
    {
      success:
        result.message ??
        "Blocco calendario aggiunto.",
    }
  );
}