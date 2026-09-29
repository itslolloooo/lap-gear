import {
  NextResponse,
} from "next/server";

import {
  getServerSupabase,
} from "@/lib/supabase-server";


export const dynamic =
  "force-dynamic";


type StatusBody = {
  reference?:
    string;

  email?:
    string;
};


const EMAIL_REGEX =
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/;


export async function POST(
  request: Request
) {

  let body:
    StatusBody;


  try {

    body =
      (await request.json()) as
        StatusBody;

  } catch {

    return NextResponse.json(
      {
        error:
          "Richiesta non valida.",
      },
      {
        status: 400,

        headers: {
          "Cache-Control":
            "no-store, max-age=0",
        },
      }
    );

  }


  const reference =
    String(
      body.reference ??
      ""
    )
      .trim()
      .toUpperCase();


  const email =
    String(
      body.email ??
      ""
    )
      .trim()
      .toLowerCase();


  if (
    !reference ||
    reference.length > 80
  ) {
    return NextResponse.json(
      {
        error:
          "Inserisci un riferimento valido.",
      },
      {
        status: 400,

        headers: {
          "Cache-Control":
            "no-store, max-age=0",
        },
      }
    );
  }


  if (
    !EMAIL_REGEX.test(
      email
    ) ||
    email.length > 200
  ) {
    return NextResponse.json(
      {
        error:
          "Inserisci l'email usata per la richiesta.",
      },
      {
        status: 400,

        headers: {
          "Cache-Control":
            "no-store, max-age=0",
        },
      }
    );
  }


  const supabase =
    getServerSupabase();


  if (!supabase) {
    return NextResponse.json(
      {
        error:
          "Servizio temporaneamente non disponibile.",
      },
      {
        status: 500,

        headers: {
          "Cache-Control":
            "no-store, max-age=0",
        },
      }
    );
  }


  const {
    data,
    error,
  } =
    await supabase
      .from(
        "reservations"
      )
      .select(
        `
          id,
          reference,
          start_date,
          end_date,
          status,
          created_at,
          quoted_total,
          quote_deposit,
          quote_payment_method,
          quote_payment_details,
          quote_valid_until,
          quote_logistics,
          quote_notes,
          quote_sent_at,
          quote_revision,

          customers!inner (
            name,
            email
          ),

          reservation_items (
            id,
            quantity,
            price_day,

            products (
              id,
              name,
              slug
            )
          )
        `
      )
      .eq(
        "reference",
        reference
      )
      .eq(
        "customers.email",
        email
      )
      .maybeSingle();


  if (error) {

    console.error(
      "Errore consultazione stato richiesta:",
      error
    );


    return NextResponse.json(
      {
        error:
          "Impossibile consultare la richiesta.",
      },
      {
        status: 500,

        headers: {
          "Cache-Control":
            "no-store, max-age=0",
        },
      }
    );

  }


  if (!data) {

    /*
     * Messaggio volutamente generico:
     * non riveliamo se esiste il riferimento
     * oppure se l'email è quella sbagliata.
     */

    return NextResponse.json(
      {
        error:
          "Richiesta non trovata. Controlla riferimento ed email.",
      },
      {
        status: 404,

        headers: {
          "Cache-Control":
            "no-store, max-age=0",
        },
      }
    );

  }


  const reservation =
    data as unknown as {
      reference:
        string;

      start_date:
        string;

      end_date:
        string;

      status:
        | "requested"
        | "confirmed"
        | "picked_up"
        | "returned"
        | "cancelled";

      created_at:
        string;

      quoted_total:
        | number
        | string
        | null;

      quote_deposit:
        | number
        | string
        | null;

      quote_payment_method:
        | string
        | null;

      quote_payment_details:
        | string
        | null;

      quote_valid_until:
        | string
        | null;

      quote_logistics:
        | string
        | null;

      quote_notes:
        | string
        | null;

      quote_sent_at:
        | string
        | null;

      quote_revision:
        | number
        | string
        | null;

      customers:
        | {
            name:
              string;

            email:
              string;
          }
        | {
            name:
              string;

            email:
              string;
          }[]
        | null;

      reservation_items:
        | {
            id:
              number;

            quantity:
              number;

            price_day:
              number
              | string;

            products:
              | {
                  id:
                    number;

                  name:
                    string;

                  slug:
                    string;
                }
              | {
                  id:
                    number;

                  name:
                    string;

                  slug:
                    string;
                }[]
              | null;
          }[]
        | null;
    };


  function first<T>(
    value:
      | T
      | T[]
      | null
  ) {

    if (!value) {
      return null;
    }


    if (
      Array.isArray(
        value
      )
    ) {
      return (
        value[0] ??
        null
      );
    }


    return value;
  }


  const customer =
    first(
      reservation.customers
    );


  const items =
    (
      reservation.reservation_items ??
      []
    ).map(
      (
        item
      ) => {

        const product =
          first(
            item.products
          );


        return {
          name:
            product?.name ??
            "Prodotto",

          slug:
            product?.slug ??
            null,

          quantity:
            item.quantity,

          priceDay:
            Number(
              item.price_day
            ),
        };
      }
    );


  const start =
    new Date(
      `${reservation.start_date}T00:00:00Z`
    );


  const end =
    new Date(
      `${reservation.end_date}T00:00:00Z`
    );


  const days =
    Math.max(
      1,
      Math.floor(
        (
          end.getTime() -
          start.getTime()
        ) /
          86400000
      ) + 1
    );


  const total =
    items.reduce(
      (
        sum,
        item
      ) =>
        sum +
        item.priceDay *
          item.quantity *
          days,
      0
    );


  return NextResponse.json(
    {
      ok: true,

      request: {
        reference:
          reservation.reference,

        status:
          reservation.status,

        startDate:
          reservation.start_date,

        endDate:
          reservation.end_date,

        createdAt:
          reservation.created_at,

        customerName:
          customer?.name ??
          "Cliente",

        days,

        total,

        quote:
          reservation.quote_sent_at &&
          reservation.quoted_total !==
            null
            ? {
                total:
                  Number(
                    reservation.quoted_total
                  ),

                deposit:
                  Number(
                    reservation.quote_deposit ??
                      0
                  ),

                paymentMethod:
                  reservation.quote_payment_method,

                paymentDetails:
                  reservation.quote_payment_details,

                validUntil:
                  reservation.quote_valid_until,

                logistics:
                  reservation.quote_logistics,

                notes:
                  reservation.quote_notes,

                sentAt:
                  reservation.quote_sent_at,

                revision:
                  Number(
                    reservation.quote_revision ??
                      0
                  ),
              }
            : null,

        items,
      },
    },
    {
      headers: {
        "Cache-Control":
          "no-store, max-age=0",
      },
    }
  );
}
