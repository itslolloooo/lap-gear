import {
  NextResponse,
} from "next/server";

import {
  getServerSupabase,
} from "@/lib/supabase-server";


export const dynamic =
  "force-dynamic";


const DATE_REGEX =
  /^\d{4}-\d{2}-\d{2}$/;


/* =========================================================
   GET /api/availability
   ========================================================= */

export async function GET(
  request: Request
) {
  const url =
    new URL(
      request.url
    );


  /* =======================================================
     PARAMS
     ======================================================= */

  const productId =
    Number(
      url.searchParams.get(
        "productId"
      )
    );


  const quantity =
    Number(
      url.searchParams.get(
        "quantity"
      ) ?? "1"
    );


  const from =
    String(
      url.searchParams.get(
        "from"
      ) ?? ""
    );


  const to =
    String(
      url.searchParams.get(
        "to"
      ) ?? ""
    );


  /* =======================================================
     VALIDATION
     ======================================================= */

  if (
    !Number.isInteger(
      productId
    ) ||
    productId <= 0
  ) {
    return NextResponse.json(
      {
        error:
          "Prodotto non valido.",
      },
      {
        status: 400,
      }
    );
  }


  if (
    !Number.isInteger(
      quantity
    ) ||
    quantity <= 0 ||
    quantity > 99
  ) {
    return NextResponse.json(
      {
        error:
          "Quantità non valida.",
      },
      {
        status: 400,
      }
    );
  }


  if (
    !DATE_REGEX.test(
      from
    ) ||
    !DATE_REGEX.test(
      to
    )
  ) {
    return NextResponse.json(
      {
        error:
          "Date non valide.",
      },
      {
        status: 400,
      }
    );
  }


  if (
    to < from
  ) {
    return NextResponse.json(
      {
        error:
          "La riconsegna non può precedere il ritiro.",
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
        error:
          "Servizio non disponibile.",
      },
      {
        status: 500,
      }
    );
  }


  /* =======================================================
     ACTIVE PRODUCT
     ======================================================= */

  const {
    data:
      product,
    error:
      productError,
  } =
    await supabase
      .from(
        "products"
      )
      .select(
        "id"
      )
      .eq(
        "id",
        productId
      )
      .eq(
        "active",
        true
      )
      .maybeSingle();


  if (
    productError
  ) {
    console.error(
      "Errore controllo prodotto:",
      productError
    );

    return NextResponse.json(
      {
        error:
          "Impossibile verificare la disponibilità.",
      },
      {
        status: 500,
      }
    );
  }


  if (!product) {
    return NextResponse.json(
      {
        error:
          "Prodotto non disponibile.",
      },
      {
        status: 404,
      }
    );
  }


  /* =======================================================
     REAL AVAILABILITY
     ======================================================= */

  const {
    data,
    error,
  } =
    await supabase.rpc(
      "get_product_availability",
      {
        p_product_id:
          productId,

        p_start_date:
          from,

        p_end_date:
          to,
      }
    );


  if (error) {
    console.error(
      "Errore RPC disponibilità:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Impossibile verificare la disponibilità.",
      },
      {
        status: 500,
      }
    );
  }


  /*
   * Il numero reale resta sul server.
   * Al browser arriva SOLO true / false.
   */

  const availableUnits =
    Number(
      data ?? 0
    );


  return NextResponse.json(
    {
      available:
        availableUnits >=
        quantity,
    },
    {
      headers: {
        "Cache-Control":
          "no-store, max-age=0",
      },
    }
  );
}