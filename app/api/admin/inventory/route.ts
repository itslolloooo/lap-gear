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

  const requestedAssetCode =
    String(
      formData.get(
        "asset_code"
      ) ?? ""
    )
      .trim()
      .toUpperCase();

  const quantityRaw =
    formData.get(
      "quantity"
    );

  const quantity =
    quantityRaw === null
      ? 1
      : Number(
          quantityRaw
        );

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
    !allowedStatuses.includes(
      status
    ) ||
    !Number.isInteger(
      quantity
    ) ||
    quantity < 1 ||
    quantity > 99
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

  let unitsToInsert:
    Array<{
      product_id: number;
      asset_code: string;
      serial_number: string | null;
      status: string;
      notes: string | null;
    }>;

  if (
    requestedAssetCode
  ) {
    unitsToInsert = [
      {
        product_id:
          productId,

        asset_code:
          requestedAssetCode,

        serial_number:
          serialNumber ||
          null,

        status,

        notes:
          notes ||
          null,
      },
    ];
  } else {
    const {
      data:
        existingUnits,
      error:
        existingUnitsError,
    } =
      await supabase
        .from(
          "product_units"
        )
        .select(
          "asset_code"
        )
        .eq(
          "product_id",
          productId
        );

    if (
      existingUnitsError
    ) {
      return NextResponse.json(
        {
          error:
            existingUnitsError.message,
        },
        {
          status: 500,
        }
      );
    }

    const prefix =
      `LAP-${String(
        productId
      ).padStart(
        4,
        "0"
      )}-`;

    const usedNumbers =
      new Set(
        (
          existingUnits ??
          []
        )
          .map(
            (
              unit
            ) => {
              const code =
                String(
                  unit.asset_code ??
                  ""
                );

              if (
                !code.startsWith(
                  prefix
                )
              ) {
                return null;
              }

              const suffix =
                Number(
                  code.slice(
                    prefix.length
                  )
                );

              return Number.isInteger(
                suffix
              ) &&
                suffix > 0
                ? suffix
                : null;
            }
          )
          .filter(
            (
              value
            ): value is number =>
              value !== null
          )
      );

    const generatedCodes:
      string[] = [];

    let candidate =
      1;

    while (
      generatedCodes.length <
      quantity
    ) {
      if (
        !usedNumbers.has(
          candidate
        )
      ) {
        generatedCodes.push(
          `${prefix}${String(
            candidate
          ).padStart(
            2,
            "0"
          )}`
        );
      }

      candidate += 1;
    }

    unitsToInsert =
      generatedCodes.map(
        (
          assetCode,
          index
        ) => ({
          product_id:
            productId,

          asset_code:
            assetCode,

          serial_number:
            quantity === 1 &&
            index === 0 &&
            serialNumber
              ? serialNumber
              : null,

          status,

          notes:
            notes ||
            null,
        })
      );
  }

  const {
    error,
  } = await supabase
    .from("product_units")
    .insert(
      unitsToInsert
    );

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