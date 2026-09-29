import {

  NextResponse,

} from "next/server";

import {

  getServerSupabase,

} from "@/lib/supabase-server";

export const dynamic =

  "force-dynamic";

/* =========================================================

   TYPES

   ========================================================= */

type RequestItem = {

  productId:

    number;

  quantity:

    number;

  /*

   * Può ancora arrivare dal vecchio

   * frontend, ma NON verrà usato.

   */

  priceDay?:

    number;

};

type RequestBody = {

  customer?: {

    name?:

      string;

    email?:

      string;

    phone?:

      string;

  };

  from?:

    string;

  to?:

    string;

  notes?:

    string;

  items?:

    RequestItem[];

};

type NormalizedItem = {

  productId:

    number;

  quantity:

    number;

};

type DbProduct = {

  id:

    number;

  name:

    string;

  price_day:

    number

    | string;

};

type EmailLine = {
  name: string;
  quantity: number;
  priceDay: number;
  lineTotal: number;
};

type SendEmailInput = {
  to: string | string[];
  subject: string;
  html: string;
  idempotencyKey: string;
};

const DATE_REGEX =

  /^\d{4}-\d{2}-\d{2}$/;

const EMAIL_REGEX =

  /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function isValidIsoDate(

  value: string

) {

  if (

    !DATE_REGEX.test(

      value

    )

  ) {

    return false;

  }

  const date =

    new Date(

      `${value}T00:00:00.000Z`

    );

  return (

    !Number.isNaN(

      date.getTime()

    ) &&

    date

      .toISOString()

      .slice(

        0,

        10

      ) === value

  );

}

/* =========================================================

   HELPERS

   ========================================================= */

function createReference() {

  const date =

    new Date()

      .toISOString()

      .slice(

        2,

        10

      )

      .replaceAll(

        "-",

        ""

      );

  const random =

    crypto

      .randomUUID()

      .replaceAll(

        "-",

        ""

      )

      .slice(

        0,

        6

      )

      .toUpperCase();

  return `LAP-${date}-${random}`;

}

/* =========================================================
   EMAIL HELPERS
   ========================================================= */

function escapeHtml(
  value: unknown
) {
  return String(
    value ??
      ""
  ).replace(
    /[&<>"']/g,
    (
      character
    ) => {
      const entities:
        Record<
          string,
          string
        > = {
          "&":
            "&amp;",
          "<":
            "&lt;",
          ">":
            "&gt;",
          "\"":
            "&quot;",
          "'":
            "&#039;",
        };

      return (
        entities[
          character
        ] ??
        character
      );
    }
  );
}

function rentalDays(
  from: string,
  to: string
) {
  const start =
    Date.parse(
      `${from}T00:00:00.000Z`
    );

  const end =
    Date.parse(
      `${to}T00:00:00.000Z`
    );

  return (
    Math.floor(
      (
        end -
        start
      ) /
        86400000
    ) + 1
  );
}

function formatDate(
  value: string
) {
  return new Intl.DateTimeFormat(
    "it-IT",
    {
      day:
        "2-digit",

      month:
        "2-digit",

      year:
        "numeric",

      timeZone:
        "UTC",
    }
  ).format(
    new Date(
      `${value}T00:00:00.000Z`
    )
  );
}

function formatMoney(
  value: number
) {
  return new Intl.NumberFormat(
    "it-IT",
    {
      style:
        "currency",

      currency:
        "EUR",

      minimumFractionDigits:
        2,

      maximumFractionDigits:
        2,
    }
  ).format(
    value
  );
}

function absoluteSiteUrl(
  request: Request
) {
  const configured =
    String(
      process.env.SITE_URL ??
        ""
    )
      .trim()
      .replace(
        /\/+$/,
        ""
      );

  if (configured) {
    return configured;
  }

  return new URL(
    request.url
  ).origin;
}

async function sendEmail({
  to,
  subject,
  html,
  idempotencyKey,
}: SendEmailInput) {
  const apiKey =
    String(
      process.env.RESEND_API_KEY ??
        ""
    ).trim();

  const from =
    String(
      process.env.RESEND_FROM_EMAIL ??
        ""
    ).trim();

  if (
    !apiKey ||
    !from
  ) {
    console.warn(
      "Email non inviata: RESEND_API_KEY o RESEND_FROM_EMAIL non configurati."
    );

    return {
      ok: false,
      skipped: true,
    };
  }

  const recipients =
    Array.isArray(
      to
    )
      ? to
      : [to];

  const response =
    await fetch(
      "https://api.resend.com/emails",
      {
        method:
          "POST",

        headers: {
          "Content-Type":
            "application/json",

          Authorization:
            `Bearer ${apiKey}`,

          "Idempotency-Key":
            idempotencyKey,
        },

        body:
          JSON.stringify({
            from,
            to:
              recipients,
            subject,
            html,
          }),
      }
    );

  if (
    !response.ok
  ) {
    const details =
      await response.text();

    throw new Error(
      `Resend ${response.status}: ${details}`
    );
  }

  return {
    ok: true,
  };
}

function emailLayout({
  eyebrow,
  title,
  intro,
  body,
  actionLabel,
  actionUrl,
  footer,
}: {
  eyebrow: string;
  title: string;
  intro: string;
  body: string;
  actionLabel?: string;
  actionUrl?: string;
  footer?: string;
}) {
  const action =
    actionLabel &&
    actionUrl
      ? `
        <div style="margin-top:30px;">
          <a
            href="${escapeHtml(
              actionUrl
            )}"
            style="
              display:inline-block;
              background:#181818;
              color:#ffffff;
              text-decoration:none;
              font-weight:700;
              font-size:15px;
              padding:15px 22px;
              border-radius:14px;
            "
          >
            ${escapeHtml(
              actionLabel
            )}
          </a>
        </div>
      `
      : "";

  return `
    <!doctype html>
    <html lang="it">
      <head>
        <meta charset="utf-8" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1"
        />
      </head>

      <body
        style="
          margin:0;
          padding:0;
          background:#ebeae4;
          font-family:Arial,Helvetica,sans-serif;
          color:#181818;
        "
      >
        <div style="padding:32px 16px;">
          <div
            style="
              max-width:680px;
              margin:0 auto;
              overflow:hidden;
              border-radius:24px;
              background:#ffffff;
              border:1px solid rgba(0,0,0,0.08);
            "
          >
            <div
              style="
                background:#181818;
                color:#ffffff;
                padding:30px;
              "
            >
              <div
                style="
                  display:inline-block;
                  background:#ff5a1f;
                  border-radius:10px;
                  padding:8px 10px;
                  font-size:13px;
                  font-weight:800;
                  letter-spacing:0.04em;
                "
              >
                LAP GEAR
              </div>

              <div
                style="
                  margin-top:22px;
                  color:#ff8a5d;
                  font-size:12px;
                  font-weight:800;
                  text-transform:uppercase;
                  letter-spacing:0.12em;
                "
              >
                ${escapeHtml(
                  eyebrow
                )}
              </div>

              <h1
                style="
                  margin:8px 0 0;
                  font-size:34px;
                  line-height:1.06;
                  letter-spacing:-0.035em;
                "
              >
                ${escapeHtml(
                  title
                )}
              </h1>
            </div>

            <div style="padding:30px;">
              <p
                style="
                  margin:0;
                  color:#5e5e5e;
                  font-size:16px;
                  line-height:1.7;
                "
              >
                ${escapeHtml(
                  intro
                )}
              </p>

              ${body}

              ${action}

              ${
                footer
                  ? `
                    <div
                      style="
                        margin-top:30px;
                        padding-top:22px;
                        border-top:1px solid rgba(0,0,0,0.09);
                        color:#777777;
                        font-size:13px;
                        line-height:1.6;
                      "
                    >
                      ${escapeHtml(
                        footer
                      )}
                    </div>
                  `
                  : ""
              }
            </div>
          </div>
        </div>
      </body>
    </html>
  `;
}

/* =========================================================
   POST /api/request
   ========================================================= */

export async function POST(

  request: Request

) {

  /* =======================================================

     BODY

     ======================================================= */

  let body:

    RequestBody;

  try {

    body =

      (await request.json()) as

        RequestBody;

  } catch {

    return NextResponse.json(

      {

        error:

          "Richiesta non valida.",

      },

      {

        status: 400,

      }

    );

  }

  /* =======================================================

     CUSTOMER

     ======================================================= */

  const name =

    String(

      body.customer?.name ??

        ""

    ).trim();

  const email =

    String(

      body.customer?.email ??

        ""

    )

      .trim()

      .toLowerCase();

  const phone =

    String(

      body.customer?.phone ??

        ""

    ).trim();

  if (

    !name ||

    name.length >

      150

  ) {

    return NextResponse.json(

      {

        error:

          "Inserisci un nome valido.",

      },

      {

        status: 400,

      }

    );

  }

  if (

    !EMAIL_REGEX.test(

      email

    ) ||

    email.length >

      200

  ) {

    return NextResponse.json(

      {

        error:

          "Inserisci un indirizzo email valido.",

      },

      {

        status: 400,

      }

    );

  }

  if (

    !phone ||

    phone.length >

      60

  ) {

    return NextResponse.json(

      {

        error:

          "Inserisci un numero di telefono valido.",

      },

      {

        status: 400,

      }

    );

  }

  /* =======================================================

     DATES

     ======================================================= */

  const from =

    String(

      body.from ??

        ""

    );

  const to =

    String(

      body.to ??

        ""

    );

  if (

    !isValidIsoDate(

      from

    ) ||

    !isValidIsoDate(

      to

    )

  ) {

    return NextResponse.json(

      {

        error:

          "Seleziona date valide.",

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

     NOTES

     ======================================================= */

  const notes =

    String(

      body.notes ??

        ""

    )

      .trim()

      .slice(

        0,

        3000

      );

  /* =======================================================

     ITEMS

     ======================================================= */

  if (

    !Array.isArray(

      body.items

    ) ||

    body.items.length ===

      0 ||

    body.items.length >

      50

  ) {

    return NextResponse.json(

      {

        error:

          "Il kit non è valido.",

      },

      {

        status: 400,

      }

    );

  }

  /*

   * Non ci fidiamo neppure del fatto

   * che il browser invii una sola riga

   * per prodotto.

   *

   * Se qualcuno manda:

   *

   * Sony x1

   * Sony x2

   *

   * il server lo normalizza in Sony x3.

   */

  const itemMap =

    new Map<

      number,

      number

    >();

  for (

    const item of

      body.items

  ) {

    const productId =

      Number(

        item.productId

      );

    const quantity =

      Number(

        item.quantity

      );

    if (

      !Number.isInteger(

        productId

      ) ||

      productId <= 0 ||

      !Number.isInteger(

        quantity

      ) ||

      quantity <= 0 ||

      quantity > 99

    ) {

      return NextResponse.json(

        {

          error:

            "Uno o più articoli del kit non sono validi.",

        },

        {

          status: 400,

        }

      );

    }

    itemMap.set(

      productId,

      (

        itemMap.get(

          productId

        ) ?? 0

      ) + quantity

    );

  }

  const normalizedItems:

    NormalizedItem[] =

      Array.from(

        itemMap.entries()

      ).map(

        ([

          productId,

          quantity,

        ]) => ({

          productId,

          quantity,

        })

      );

  if (

    normalizedItems.some(

      (item) =>

        item.quantity >

        99

    )

  ) {

    return NextResponse.json(

      {

        error:

          "Quantità richiesta non valida.",

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

          "Servizio temporaneamente non disponibile.",

      },

      {

        status: 500,

      }

    );

  }

  /* =======================================================

     LOAD PRODUCTS FROM DATABASE

     ======================================================= */

  const productIds =

    normalizedItems.map(

      (item) =>

        item.productId

    );

  const {

    data:

      productsData,

    error:

      productsError,

  } =

    await supabase

      .from(

        "products"

      )

      .select(

        `

          id,

          name,

          price_day

        `

      )

      .in(

        "id",

        productIds

      )

      .eq(

        "active",

        true

      );

  if (

    productsError

  ) {

    console.error(

      "Errore caricamento prodotti:",

      productsError

    );

    return NextResponse.json(

      {

        error:

          "Impossibile verificare il kit.",

      },

      {

        status: 500,

      }

    );

  }

  const products =

    (

      productsData ??

      []

    ) as DbProduct[];

  /*

   * Se un ID è inventato oppure il

   * prodotto nel frattempo è stato

   * disattivato, rifiutiamo.

   */

  if (

    products.length !==

    productIds.length

  ) {

    return NextResponse.json(

      {

        error:

          "Uno o più prodotti non sono più disponibili nel catalogo.",

      },

      {

        status: 400,

      }

    );

  }

  const productMap =

    new Map(

      products.map(

        (product) => [

          Number(

            product.id

          ),

          product,

        ]

      )

    );

  /* =======================================================

     SERVER-SIDE AVAILABILITY CHECK

     ======================================================= */

  for (

    const item of

      normalizedItems

  ) {

    const product =

      productMap.get(

        item.productId

      );

    if (!product) {

      return NextResponse.json(

        {

          error:

            "Prodotto non trovato.",

        },

        {

          status: 400,

        }

      );

    }

    const {

      data:

        availability,

      error:

        availabilityError,

    } =

      await supabase.rpc(

        "get_product_availability",

        {

          p_product_id:

            item.productId,

          p_start_date:

            from,

          p_end_date:

            to,

        }

      );

    if (

      availabilityError

    ) {

      console.error(

        "Errore verifica disponibilità:",

        availabilityError

      );

      return NextResponse.json(

        {

          error:

            "Impossibile verificare la disponibilità del materiale.",

        },

        {

          status: 500,

        }

      );

    }

    const availableUnits =

      Number(

        availability ??

          0

      );

    if (

      availableUnits <

      item.quantity

    ) {

      return NextResponse.json(

        {

          error:

            `La quantità richiesta di ${product.name} non è disponibile per le date selezionate.`,

        },

        {

          status: 409,

        }

      );

    }

  }

  /* =======================================================

     CREATE CUSTOMER

     ======================================================= */

  const {

    data:

      customer,

    error:

      customerError,

  } =

    await supabase

      .from(

        "customers"

      )

      .insert({

        name,

        email,

        phone,

      })

      .select(

        "id"

      )

      .single();

  if (

    customerError ||

    !customer

  ) {

    console.error(

      "Errore creazione cliente:",

      customerError

    );

    return NextResponse.json(

      {

        error:

          "Impossibile salvare la richiesta.",

      },

      {

        status: 500,

      }

    );

  }

  /* =======================================================

     CREATE RESERVATION

     ======================================================= */

  const reference =

    createReference();

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

      .insert({

        reference,

        customer_id:

          customer.id,

        start_date:

          from,

        end_date:

          to,

        status:

          "requested",

        notes:

          notes ||

          null,

      })

      .select(

        `

          id,

          reference

        `

      )

      .single();

  if (

    reservationError ||

    !reservation

  ) {

    console.error(

      "Errore creazione richiesta:",

      reservationError

    );

    /*

     * Evitiamo di lasciare un cliente

     * orfano se la reservation fallisce.

     */

    await supabase

      .from(

        "customers"

      )

      .delete()

      .eq(

        "id",

        customer.id

      );

    return NextResponse.json(

      {

        error:

          "Impossibile salvare la richiesta.",

      },

      {

        status: 500,

      }

    );

  }

  /* =======================================================

     CREATE RESERVATION ITEMS

     ======================================================= */

  const reservationItems =

    normalizedItems.map(

      (item) => {

        const product =

          productMap.get(

            item.productId

          )!;

        return {

          reservation_id:

            reservation.id,

          product_id:

            item.productId,

          quantity:

            item.quantity,

          /*

           * IMPORTANTISSIMO:

           * il prezzo arriva dal DB,

           * NON dal browser.

           */

          price_day:

            Number(

              product.price_day

            ),

        };

      }

    );

  const {

    error:

      itemsError,

  } =

    await supabase

      .from(

        "reservation_items"

      )

      .insert(

        reservationItems

      );

  if (

    itemsError

  ) {

    console.error(

      "Errore salvataggio articoli:",

      itemsError

    );

    /*

     * reservation_items è ON DELETE

     * CASCADE rispetto alla reservation.

     */

    await supabase

      .from(

        "reservations"

      )

      .delete()

      .eq(

        "id",

        reservation.id

      );

    await supabase

      .from(

        "customers"

      )

      .delete()

      .eq(

        "id",

        customer.id

      );

    return NextResponse.json(

      {

        error:

          "Impossibile completare la richiesta.",

      },

      {

        status: 500,

      }

    );

  }

  /* =======================================================
     EMAIL NOTIFICATIONS
     ======================================================= */

  const siteUrl =
    absoluteSiteUrl(
      request
    );

  const statusPath =
    `/richiesta?reference=${encodeURIComponent(
      reservation.reference
    )}`;

  const statusUrl =
    `${siteUrl}${statusPath}`;

  const adminUrl =
    `${siteUrl}/admin/richieste/${encodeURIComponent(
      String(
        reservation.id
      )
    )}`;

  const days =
    rentalDays(
      from,
      to
    );

  const emailLines:
    EmailLine[] =
      normalizedItems.map(
        (
          item
        ) => {
          const product =
            productMap.get(
              item.productId
            )!;

          const priceDay =
            Number(
              product.price_day
            );

          return {
            name:
              product.name,

            quantity:
              item.quantity,

            priceDay,

            lineTotal:
              priceDay *
              item.quantity *
              days,
          };
        }
      );

  const estimatedTotal =
    emailLines.reduce(
      (
        total,
        line
      ) =>
        total +
        line.lineTotal,
      0
    );

  const itemsHtml =
    emailLines
      .map(
        (
          line
        ) => `
          <tr>
            <td
              style="
                padding:12px 0;
                border-bottom:1px solid rgba(0,0,0,0.08);
                font-size:14px;
                line-height:1.5;
              "
            >
              <strong>
                ${escapeHtml(
                  line.name
                )}
              </strong>

              <div
                style="
                  margin-top:3px;
                  color:#777777;
                  font-size:12px;
                "
              >
                ${line.quantity}
                ×
                ${escapeHtml(
                  formatMoney(
                    line.priceDay
                  )
                )}
                / giorno
              </div>
            </td>

            <td
              align="right"
              style="
                padding:12px 0;
                border-bottom:1px solid rgba(0,0,0,0.08);
                font-size:14px;
                font-weight:700;
                white-space:nowrap;
              "
            >
              ${escapeHtml(
                formatMoney(
                  line.lineTotal
                )
              )}
            </td>
          </tr>
        `
      )
      .join("");

  const summaryHtml = `
    <div
      style="
        margin-top:26px;
        border-radius:18px;
        background:#f5f4ef;
        padding:20px;
      "
    >
      <table
        role="presentation"
        width="100%"
        cellspacing="0"
        cellpadding="0"
      >
        <tr>
          <td
            style="
              padding-bottom:8px;
              color:#777777;
              font-size:13px;
            "
          >
            Periodo
          </td>

          <td
            align="right"
            style="
              padding-bottom:8px;
              font-size:14px;
              font-weight:700;
            "
          >
            ${escapeHtml(
              formatDate(
                from
              )
            )}
            →
            ${escapeHtml(
              formatDate(
                to
              )
            )}
          </td>
        </tr>

        <tr>
          <td
            style="
              color:#777777;
              font-size:13px;
            "
          >
            Durata
          </td>

          <td
            align="right"
            style="
              font-size:14px;
              font-weight:700;
            "
          >
            ${days}
            ${
              days === 1
                ? "giorno"
                : "giorni"
            }
          </td>
        </tr>
      </table>
    </div>

    <div style="margin-top:22px;">
      <table
        role="presentation"
        width="100%"
        cellspacing="0"
        cellpadding="0"
      >
        ${itemsHtml}

        <tr>
          <td
            style="
              padding-top:18px;
              font-size:15px;
              font-weight:800;
            "
          >
            Totale stimato
          </td>

          <td
            align="right"
            style="
              padding-top:18px;
              color:#ff5a1f;
              font-size:20px;
              font-weight:800;
              white-space:nowrap;
            "
          >
            ${escapeHtml(
              formatMoney(
                estimatedTotal
              )
            )}
          </td>
        </tr>
      </table>
    </div>
  `;

  const customerHtml =
    emailLayout({
      eyebrow:
        `Richiesta ${reservation.reference}`,

      title:
        "Richiesta ricevuta.",

      intro:
        `Ciao ${name}, abbiamo ricevuto la tua richiesta di noleggio. Non è ancora una prenotazione confermata: verificheremo disponibilità e dettagli prima della conferma.`,

      body:
        summaryHtml,

      actionLabel:
        "Segui la richiesta",

      actionUrl:
        statusUrl,

      footer:
        "Conserva il riferimento della richiesta. Per controllarne lo stato ti verranno richiesti il riferimento e l'indirizzo email usato durante l'invio.",
    });

  const adminNotesHtml =
    notes
      ? `
        <div
          style="
            margin-top:22px;
            border-left:4px solid #ff5a1f;
            background:#fff4ef;
            padding:16px 18px;
            border-radius:0 14px 14px 0;
          "
        >
          <div
            style="
              margin-bottom:6px;
              color:#a93e18;
              font-size:11px;
              font-weight:800;
              text-transform:uppercase;
              letter-spacing:0.09em;
            "
          >
            Note cliente
          </div>

          <div
            style="
              color:#5c3c30;
              font-size:14px;
              line-height:1.6;
              white-space:pre-wrap;
            "
          >
            ${escapeHtml(
              notes
            )}
          </div>
        </div>
      `
      : "";

  const adminHtml =
    emailLayout({
      eyebrow:
        "Nuova richiesta rental",

      title:
        `${reservation.reference} · ${name}`,

      intro:
        `È arrivata una nuova richiesta da ${name}. Email: ${email} · Telefono: ${phone}.`,

      body:
        `${summaryHtml}${adminNotesHtml}`,

      actionLabel:
        "Apri nell'admin",

      actionUrl:
        adminUrl,

      footer:
        "La richiesta è stata salvata con stato Da gestire. L'invio di questa email è soltanto una notifica e non modifica lo stato del noleggio.",
    });

  const notificationEmail =
    String(
      process.env
        .RENTAL_NOTIFICATION_EMAIL ??
        ""
    ).trim();

  const emailTasks:
    Promise<unknown>[] = [
      sendEmail({
        to:
          email,

        subject:
          `LAP GEAR · Richiesta ricevuta ${reservation.reference}`,

        html:
          customerHtml,

        idempotencyKey:
          `rental-customer/${reservation.id}`,
      }),
    ];

  if (
    notificationEmail
  ) {
    emailTasks.push(
      sendEmail({
        to:
          notificationEmail,

        subject:
          `Nuova richiesta ${reservation.reference} · ${name}`,

        html:
          adminHtml,

        idempotencyKey:
          `rental-admin/${reservation.id}`,
      })
    );
  } else {
    console.warn(
      "Email admin non inviata: RENTAL_NOTIFICATION_EMAIL non configurata."
    );
  }

  const emailResults =
    await Promise.allSettled(
      emailTasks
    );

  emailResults.forEach(
    (
      result
    ) => {
      if (
        result.status ===
        "rejected"
      ) {
        console.error(
          "Errore invio email richiesta:",
          result.reason
        );
      }
    }
  );

  /* =======================================================
     SUCCESS
     ======================================================= */

  return NextResponse.json(

    {

      ok: true,

      reference:

        reservation.reference,

      statusPath,

    },

    {

      status: 201,

      headers: {

        "Cache-Control":

          "no-store, max-age=0",

      },

    }

  );

}