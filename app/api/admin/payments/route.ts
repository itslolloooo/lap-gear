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


const VALID_KINDS =
  new Set([
    "payment",
    "deposit",
    "refund",
    "adjustment",
  ]);

const VALID_METHODS =
  new Set([
    "cash",
    "card",
    "bank_transfer",
    "paypal",
    "other",
  ]);


function isMissingTableError(
  error:
    | {
        code?: string | null;
        message?: string | null;
      }
    | null
    | undefined
) {
  const message =
    String(
      error?.message ??
      ""
    ).toLowerCase();

  return (
    error?.code ===
      "42P01" ||
    message.includes(
      "reservation_payments"
    ) &&
      (
        message.includes(
          "does not exist"
        ) ||
        message.includes(
          "schema cache"
        )
      )
  );
}


export async function GET(
  request: Request
) {
  const access =
    await requireAdminAccess([
      "admin",
      "operator",
      "viewer",
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

  const url =
    new URL(
      request.url
    );

  const reservationId =
    url.searchParams.get(
      "reservation_id"
    );

  let query =
    supabase
      .from(
        "reservation_payments"
      )
      .select(
        `
          id,
          reservation_id,
          amount,
          kind,
          method,
          paid_at,
          notes,
          created_at,

          reservations (
            id,
            reference,
            quoted_total,

            customers (
              name
            )
          )
        `
      )
      .order(
        "paid_at",
        {
          ascending:
            false,
        }
      )
      .order(
        "id",
        {
          ascending:
            false,
        }
      );

  if (
    reservationId
  ) {
    query =
      query.eq(
        "reservation_id",
        reservationId
      );
  }

  const {
    data,
    error,
  } =
    await query;

  if (error) {
    if (
      isMissingTableError(
        error
      )
    ) {
      return NextResponse.json(
        {
          ok: false,
          setup_required:
            true,
          error:
            "Il registro pagamenti non è ancora stato attivato nel database.",
        },
        {
          status: 503,
        }
      );
    }

    return NextResponse.json(
      {
        ok: false,
        error:
          error.message,
      },
      {
        status: 500,
      }
    );
  }

  const payments =
    data ??
    [];

  const netTotal =
    payments.reduce(
      (
        sum,
        payment
      ) =>
        sum +
        Number(
          payment.amount
        ),
      0
    );

  const positiveTotal =
    payments.reduce(
      (
        sum,
        payment
      ) => {
        const amount =
          Number(
            payment.amount
          );

        return (
          sum +
          (
            amount > 0
              ? amount
              : 0
          )
        );
      },
      0
    );

  const refunds =
    payments.reduce(
      (
        sum,
        payment
      ) => {
        const amount =
          Number(
            payment.amount
          );

        return (
          sum +
          (
            amount < 0
              ? Math.abs(
                  amount
                )
              : 0
          )
        );
      },
      0
    );

  return NextResponse.json({
    ok: true,
    payments,
    summary: {
      count:
        payments.length,
      net_total:
        netTotal,
      positive_total:
        positiveTotal,
      refunds,
    },
  });
}


export async function POST(
  request: Request
) {
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

  let body:
    Record<
      string,
      unknown
    >;

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

  const reservationId =
    String(
      body.reservation_id ??
        ""
    ).trim();

  const rawAmount =
    Number(
      body.amount
    );

  const kind =
    String(
      body.kind ??
        "payment"
    ).trim();

  const method =
    String(
      body.method ??
        "other"
    ).trim();

  const paidAt =
    String(
      body.paid_at ??
        ""
    ).trim();

  const notes =
    String(
      body.notes ??
        ""
    ).trim();

  if (
    !reservationId ||
    !Number.isFinite(
      rawAmount
    ) ||
    rawAmount === 0 ||
    !VALID_KINDS.has(
      kind
    ) ||
    !VALID_METHODS.has(
      method
    )
  ) {
    return NextResponse.json(
      {
        ok: false,
        error:
          "Dati pagamento non validi.",
      },
      {
        status: 400,
      }
    );
  }

  const amount =
    kind ===
      "refund"
      ? -Math.abs(
          rawAmount
        )
      : rawAmount;

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
        "id"
      )
      .eq(
        "id",
        reservationId
      )
      .maybeSingle();

  if (
    reservationError
  ) {
    return NextResponse.json(
      {
        ok: false,
        error:
          reservationError.message,
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

  const {
    data,
    error,
  } =
    await supabase
      .from(
        "reservation_payments"
      )
      .insert({
        reservation_id:
          reservationId,
        amount,
        kind,
        method,
        paid_at:
          paidAt
            ? new Date(
                paidAt
              ).toISOString()
            : new Date().toISOString(),
        notes:
          notes ||
          null,
      })
      .select(
        "id"
      )
      .single();

  if (error) {
    if (
      isMissingTableError(
        error
      )
    ) {
      return NextResponse.json(
        {
          ok: false,
          setup_required:
            true,
          error:
            "Il registro pagamenti non è ancora stato attivato nel database.",
        },
        {
          status: 503,
        }
      );
    }

    return NextResponse.json(
      {
        ok: false,
        error:
          error.message,
      },
      {
        status: 500,
      }
    );
  }

  return NextResponse.json({
    ok: true,
    id:
      data.id,
    message:
      kind ===
      "refund"
        ? "Rimborso registrato."
        : "Pagamento registrato.",
  });
}
