import {
  NextResponse,
} from "next/server";

import {
  requireAdminAccess,
} from "@/lib/admin-auth";

import {
  getServerSupabase,
} from "@/lib/supabase-server";

import {
  buildQuotePdf,
} from "@/lib/quote-pdf";


export const dynamic =
  "force-dynamic";

export const runtime =
  "nodejs";


type QuoteAction =
  | "save"
  | "preview"
  | "send";


type QuoteBody = {
  action?: QuoteAction;
  quotedTotal?: number | string;
  quoteDeposit?: number | string;
  quotePaymentMethod?: string;
  quotePaymentDetails?: string;
  quoteValidUntil?: string;
  quoteLogistics?: string;
  quoteNotes?: string;
};


type Customer = {
  name: string;
  email: string;
  phone:
    | string
    | null;
};


type Product = {
  name: string;
};


type ReservationItem = {
  quantity: number;
  price_day:
    | number
    | string;
  products:
    | Product
    | Product[]
    | null;
};


type Reservation = {
  id: string;
  reference: string;
  start_date: string;
  end_date: string;
  status:
    | "requested"
    | "confirmed"
    | "picked_up"
    | "returned"
    | "cancelled";
  quote_revision:
    | number
    | string
    | null;
  customers:
    | Customer
    | Customer[]
    | null;
  reservation_items:
    | ReservationItem[]
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

  if (Array.isArray(value)) {
    return value[0] ?? null;
  }

  return value;
}


function escapeHtml(
  value: unknown
) {
  return String(
    value ?? ""
  ).replace(
    /[&<>"']/g,
    (character) => {
      const entities:
        Record<string, string> = {
          "&": "&amp;",
          "<": "&lt;",
          ">": "&gt;",
          "\"": "&quot;",
          "'": "&#039;",
        };

      return (
        entities[character] ??
        character
      );
    }
  );
}


function formatMoney(
  value: number
) {
  return new Intl.NumberFormat(
    "it-IT",
    {
      style: "currency",
      currency: "EUR",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }
  ).format(value);
}


function formatDate(
  value: string
) {
  return new Intl.DateTimeFormat(
    "it-IT",
    {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      timeZone: "UTC",
    }
  ).format(
    new Date(
      `${value}T00:00:00.000Z`
    )
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

  return Math.max(
    1,
    Math.floor(
      (
        end -
        start
      ) /
        86400000
    ) + 1
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


function isDateInput(
  value: string
) {
  if (!value) {
    return true;
  }

  if (
    !/^\d{4}-\d{2}-\d{2}$/.test(
      value
    )
  ) {
    return false;
  }

  const parsed =
    new Date(
      `${value}T00:00:00.000Z`
    );

  return (
    !Number.isNaN(
      parsed.getTime()
    ) &&
    parsed
      .toISOString()
      .slice(0, 10) ===
      value
  );
}


async function sendQuoteEmail({
  request,
  to,
  subject,
  html,
  pdfBytes,
  pdfFilename,
  idempotencyKey,
}: {
  request: Request;
  to: string;
  subject: string;
  html: string;
  pdfBytes: Uint8Array;
  pdfFilename: string;
  idempotencyKey: string;
}) {
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

  const replyTo =
    String(
      process.env.RENTAL_NOTIFICATION_EMAIL ??
        ""
    ).trim();

  if (!apiKey || !from) {
    throw new Error(
      "Email non configurata: controlla RESEND_API_KEY e RESEND_FROM_EMAIL."
    );
  }

  const payload:
    Record<string, unknown> = {
      from,
      to: [to],
      subject,
      html,
      attachments: [
        {
          filename:
            pdfFilename,
          content:
            Buffer.from(
              pdfBytes
            ).toString(
              "base64"
            ),
        },
      ],
    };

  if (replyTo) {
    payload.reply_to =
      replyTo;
  }

  const response =
    await fetch(
      "https://api.resend.com/emails",
      {
        method: "POST",
        headers: {
          "Content-Type":
            "application/json",
          Authorization:
            `Bearer ${apiKey}`,
          "Idempotency-Key":
            idempotencyKey,
        },
        body:
          JSON.stringify(
            payload
          ),
      }
    );

  if (!response.ok) {
    const details =
      await response.text();

    console.error(
      "Errore Resend preventivo:",
      response.status,
      details,
      absoluteSiteUrl(request)
    );

    throw new Error(
      `Invio email non riuscito (Resend ${response.status}).`
    );
  }
}


function quoteEmailHtml({
  customerName,
  reference,
  revision,
  startDate,
  endDate,
  quotedTotal,
  deposit,
  paymentMethod,
  validUntil,
  quoteNotes,
  statusUrl,
}: {
  customerName: string;
  reference: string;
  revision: number;
  startDate: string;
  endDate: string;
  quotedTotal: number;
  deposit: number;
  paymentMethod: string;
  validUntil: string | null;
  quoteNotes: string;
  statusUrl: string;
}) {
  const notesBlock =
    quoteNotes
      ? `
        <div style="margin-top:22px;border-left:4px solid #ff5a1f;background:#fff4ef;padding:16px 18px;border-radius:0 14px 14px 0;">
          <div style="margin-bottom:6px;color:#a93e18;font-size:11px;font-weight:800;text-transform:uppercase;letter-spacing:0.09em;">
            Note al preventivo
          </div>
          <div style="color:#5c3c30;font-size:14px;line-height:1.65;white-space:pre-wrap;">
            ${escapeHtml(quoteNotes)}
          </div>
        </div>
      `
      : "";

  return `
    <!doctype html>
    <html lang="it">
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body style="margin:0;padding:0;background:#ebeae4;font-family:Arial,Helvetica,sans-serif;color:#181818;">
        <div style="padding:32px 16px;">
          <div style="max-width:680px;margin:0 auto;overflow:hidden;border-radius:24px;background:#ffffff;border:1px solid rgba(0,0,0,0.08);">
            <div style="background:#181818;color:#ffffff;padding:30px;">
              <div style="display:inline-block;background:#ff5a1f;border-radius:10px;padding:8px 10px;font-size:13px;font-weight:800;letter-spacing:0.04em;">
                LAP GEAR
              </div>

              <div style="margin-top:22px;color:#ff8a5d;font-size:12px;font-weight:800;text-transform:uppercase;letter-spacing:0.12em;">
                Preventivo ${escapeHtml(reference)} · Rev. ${String(revision).padStart(2, "0")}
              </div>

              <h1 style="margin:8px 0 0;font-size:34px;line-height:1.06;letter-spacing:-0.035em;">
                Il preventivo e' in allegato.
              </h1>
            </div>

            <div style="padding:30px;">
              <p style="margin:0;color:#5e5e5e;font-size:16px;line-height:1.7;">
                Ciao ${escapeHtml(customerName)}, trovi in allegato il PDF completo del preventivo per la tua richiesta di noleggio LAP GEAR.
              </p>

              <div style="margin-top:24px;background:#f4f3ee;border-radius:16px;padding:18px;">
                <div style="color:#777777;font-size:11px;font-weight:800;text-transform:uppercase;letter-spacing:0.08em;">
                  Periodo
                </div>
                <div style="margin-top:6px;color:#181818;font-size:16px;font-weight:700;">
                  ${escapeHtml(formatDate(startDate))} - ${escapeHtml(formatDate(endDate))}
                </div>
              </div>

              <div style="margin-top:22px;display:grid;grid-template-columns:1fr 1fr;gap:12px;">
                <div style="background:#181818;color:#ffffff;border-radius:18px;padding:20px;">
                  <div style="color:#ff8a5d;font-size:11px;font-weight:800;text-transform:uppercase;letter-spacing:0.09em;">
                    Totale noleggio
                  </div>
                  <div style="margin-top:6px;font-size:30px;font-weight:800;letter-spacing:-0.04em;">
                    ${escapeHtml(formatMoney(quotedTotal))}
                  </div>
                </div>

                <div style="background:#fff0e9;color:#181818;border-radius:18px;padding:20px;">
                  <div style="color:#e94b12;font-size:11px;font-weight:800;text-transform:uppercase;letter-spacing:0.09em;">
                    Cauzione
                  </div>
                  <div style="margin-top:6px;font-size:25px;font-weight:800;letter-spacing:-0.04em;">
                    ${escapeHtml(formatMoney(deposit))}
                  </div>
                </div>
              </div>

              <div style="margin-top:18px;background:#f4f3ee;border-radius:16px;padding:18px;">
                <div style="color:#777777;font-size:11px;font-weight:800;text-transform:uppercase;letter-spacing:0.08em;">
                  Pagamento
                </div>
                <div style="margin-top:6px;color:#181818;font-size:15px;font-weight:700;">
                  ${escapeHtml(paymentMethod || "Da concordare")}
                </div>
                ${
                  validUntil
                    ? `<div style="margin-top:8px;color:#777777;font-size:13px;">Preventivo valido fino al ${escapeHtml(formatDate(validUntil))}</div>`
                    : ""
                }
              </div>

              ${notesBlock}

              <div style="margin-top:28px;">
                <a href="${escapeHtml(statusUrl)}" style="display:inline-block;background:#181818;color:#ffffff;text-decoration:none;font-weight:700;font-size:15px;padding:15px 22px;border-radius:14px;">
                  Segui la richiesta
                </a>
              </div>

              <div style="margin-top:30px;padding-top:22px;border-top:1px solid rgba(0,0,0,0.09);color:#777777;font-size:13px;line-height:1.6;">
                Il PDF allegato riporta materiale, cauzione, modalita' di pagamento e condizioni operative. Il preventivo non equivale ancora alla conferma del noleggio: la prenotazione viene confermata separatamente dopo la verifica finale della disponibilita'.
              </div>
            </div>
          </div>
        </div>
      </body>
    </html>
  `;
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
  const access =
    await requireAdminAccess([
      "admin",
      "operator",
    ]);

  if (!access) {
    return NextResponse.json(
      {
        ok: false,
        error: "Non autorizzato.",
      },
      {
        status: 401,
      }
    );
  }

  const {
    id,
  } = await params;

  if (!id) {
    return NextResponse.json(
      {
        ok: false,
        error:
          "ID richiesta non valido.",
      },
      {
        status: 400,
      }
    );
  }

  let body:
    QuoteBody;

  try {
    body =
      (await request.json()) as
        QuoteBody;
  } catch {
    return NextResponse.json(
      {
        ok: false,
        error:
          "Dati del preventivo non validi.",
      },
      {
        status: 400,
      }
    );
  }

  const action =
    body.action;

  if (
    action !== "save" &&
    action !== "preview" &&
    action !== "send"
  ) {
    return NextResponse.json(
      {
        ok: false,
        error:
          "Operazione preventivo non valida.",
      },
      {
        status: 400,
      }
    );
  }

  const quotedTotal =
    Number(
      body.quotedTotal
    );

  const quoteDeposit =
    Number(
      body.quoteDeposit ??
        0
    );

  if (
    !Number.isFinite(
      quotedTotal
    ) ||
    quotedTotal < 0 ||
    quotedTotal > 1000000
  ) {
    return NextResponse.json(
      {
        ok: false,
        error:
          "Prezzo preventivato non valido.",
      },
      {
        status: 400,
      }
    );
  }

  if (
    !Number.isFinite(
      quoteDeposit
    ) ||
    quoteDeposit < 0 ||
    quoteDeposit > 1000000
  ) {
    return NextResponse.json(
      {
        ok: false,
        error:
          "Cauzione non valida.",
      },
      {
        status: 400,
      }
    );
  }

  const quotePaymentMethod =
    String(
      body.quotePaymentMethod ??
        ""
    )
      .trim()
      .slice(0, 160);

  const quotePaymentDetails =
    String(
      body.quotePaymentDetails ??
        ""
    )
      .trim()
      .slice(0, 1200);

  const quoteValidUntil =
    String(
      body.quoteValidUntil ??
        ""
    ).trim();

  const quoteLogistics =
    String(
      body.quoteLogistics ??
        ""
    )
      .trim()
      .slice(0, 1600);

  const quoteNotes =
    String(
      body.quoteNotes ??
        ""
    )
      .trim()
      .slice(0, 3000);

  if (
    !isDateInput(
      quoteValidUntil
    )
  ) {
    return NextResponse.json(
      {
        ok: false,
        error:
          "Data di validita' non valida.",
      },
      {
        status: 400,
      }
    );
  }

  if (
    action === "send" &&
    !quotePaymentMethod
  ) {
    return NextResponse.json(
      {
        ok: false,
        error:
          "Indica il metodo di pagamento prima dell'invio.",
      },
      {
        status: 400,
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
          quote_revision,

          customers (
            name,
            email,
            phone
          ),

          reservation_items (
            quantity,
            price_day,

            products (
              name
            )
          )
        `
      )
      .eq(
        "id",
        id
      )
      .maybeSingle();

  if (error) {
    console.error(
      "Errore caricamento richiesta preventivo:",
      error
    );

    return NextResponse.json(
      {
        ok: false,
        error:
          "Impossibile caricare la richiesta.",
      },
      {
        status: 500,
      }
    );
  }

  if (!data) {
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

  const reservation =
    data as unknown as
      Reservation;

  if (
    reservation.status !==
      "requested" &&
    reservation.status !==
      "confirmed"
  ) {
    return NextResponse.json(
      {
        ok: false,
        error:
          "Il preventivo puo' essere modificato solo prima del ritiro del materiale.",
      },
      {
        status: 409,
      }
    );
  }

  const customer =
    first(
      reservation.customers
    );

  if (!customer?.email) {
    return NextResponse.json(
      {
        ok: false,
        error:
          "Email cliente non disponibile.",
      },
      {
        status: 409,
      }
    );
  }

  const days =
    rentalDays(
      reservation.start_date,
      reservation.end_date
    );

  const items =
    (
      reservation.reservation_items ??
      []
    ).map(
      (item) => {
        const product =
          first(
            item.products
          );

        const priceDay =
          Number(
            item.price_day
          );

        const quantity =
          Number(
            item.quantity
          );

        return {
          name:
            product?.name ??
            "Prodotto",
          quantity,
          priceDay,
          lineTotal:
            priceDay *
            quantity *
            days,
        };
      }
    );

  const estimateTotal =
    items.reduce(
      (
        total,
        item
      ) =>
        total +
        item.lineTotal,
      0
    );

  const siteUrl =
    absoluteSiteUrl(
      request
    );

  const statusUrl =
    `${siteUrl}/richiesta?reference=${encodeURIComponent(
      reservation.reference
    )}`;

  const currentRevision =
    Number(
      reservation.quote_revision ??
        0
    ) || 0;

  const nextRevision =
    currentRevision +
    1;

  const issueDate =
    new Date().toISOString();

  const pdfBytes =
    await buildQuotePdf({
      reference:
        reservation.reference,
      revision:
        nextRevision,
      draft:
        action === "preview",
      issueDate,
      validUntil:
        quoteValidUntil ||
        null,

      customerName:
        customer.name,
      customerEmail:
        customer.email,
      customerPhone:
        customer.phone,

      startDate:
        reservation.start_date,
      endDate:
        reservation.end_date,
      days,

      items,
      estimateTotal,
      quotedTotal,
      deposit:
        quoteDeposit,

      paymentMethod:
        quotePaymentMethod ||
        "Da concordare",
      paymentDetails:
        quotePaymentDetails,
      logistics:
        quoteLogistics,
      notes:
        quoteNotes,
      siteUrl,
    });

  const pdfFilename =
    `Preventivo-LAP-GEAR-${reservation.reference}-R${String(
      nextRevision
    ).padStart(
      2,
      "0"
    )}.pdf`;

  if (
    action === "preview"
  ) {
    return new Response(
      Buffer.from(
        pdfBytes
      ),
      {
        status: 200,
        headers: {
          "Content-Type":
            "application/pdf",
          "Content-Disposition":
            `inline; filename="${pdfFilename}"`,
          "Cache-Control":
            "no-store, max-age=0",
        },
      }
    );
  }

  const quoteUpdatedAt =
    new Date().toISOString();

  const {
    error:
      updateError,
  } =
    await supabase
      .from(
        "reservations"
      )
      .update({
        quoted_total:
          quotedTotal,
        quote_deposit:
          quoteDeposit,
        quote_payment_method:
          quotePaymentMethod ||
          null,
        quote_payment_details:
          quotePaymentDetails ||
          null,
        quote_valid_until:
          quoteValidUntil ||
          null,
        quote_logistics:
          quoteLogistics ||
          null,
        quote_notes:
          quoteNotes ||
          null,
        quote_updated_at:
          quoteUpdatedAt,
        quote_sent_at:
          null,
      })
      .eq(
        "id",
        id
      );

  if (updateError) {
    console.error(
      "Errore salvataggio preventivo:",
      updateError
    );

    return NextResponse.json(
      {
        ok: false,
        error:
          "Impossibile salvare il preventivo.",
      },
      {
        status: 500,
      }
    );
  }

  if (action === "save") {
    return NextResponse.json({
      ok: true,
      message:
        "Bozza preventivo salvata.",
      quote: {
        quotedTotal,
        quoteDeposit,
        quotePaymentMethod:
          quotePaymentMethod ||
          null,
        quotePaymentDetails:
          quotePaymentDetails ||
          null,
        quoteValidUntil:
          quoteValidUntil ||
          null,
        quoteLogistics:
          quoteLogistics ||
          null,
        quoteNotes:
          quoteNotes ||
          null,
        quoteSentAt:
          null,
        quoteRevision:
          currentRevision,
      },
    });
  }

  try {
    await sendQuoteEmail({
      request,
      to:
        customer.email,
      subject:
        `LAP GEAR · Preventivo ${reservation.reference}`,
      html:
        quoteEmailHtml({
          customerName:
            customer.name,
          reference:
            reservation.reference,
          revision:
            nextRevision,
          startDate:
            reservation.start_date,
          endDate:
            reservation.end_date,
          quotedTotal,
          deposit:
            quoteDeposit,
          paymentMethod:
            quotePaymentMethod ||
            "Da concordare",
          validUntil:
            quoteValidUntil ||
            null,
          quoteNotes,
          statusUrl,
        }),
      pdfBytes,
      pdfFilename,
      idempotencyKey:
        `rental-quote/${reservation.id}/r${nextRevision}/${quoteUpdatedAt.replace(
          /[^0-9A-Za-z]/g,
          ""
        )}`,
    });
  } catch (
    emailError
  ) {
    console.error(
      "Errore invio preventivo:",
      emailError
    );

    return NextResponse.json(
      {
        ok: false,
        saved: true,
        error:
          emailError instanceof Error
            ? `${emailError.message} Il preventivo e' stato comunque salvato come bozza.`
            : "Invio email non riuscito. Il preventivo e' stato comunque salvato come bozza.",
      },
      {
        status: 502,
      }
    );
  }

  const quoteSentAt =
    new Date().toISOString();

  const {
    error:
      sentUpdateError,
  } =
    await supabase
      .from(
        "reservations"
      )
      .update({
        quote_sent_at:
          quoteSentAt,
        quote_revision:
          nextRevision,
      })
      .eq(
        "id",
        id
      );

  if (sentUpdateError) {
    console.error(
      "Email preventivo inviata ma timestamp/revisione non salvati:",
      sentUpdateError
    );

    return NextResponse.json(
      {
        ok: false,
        emailSent: true,
        error:
          "L'email con PDF e' stata inviata, ma non e' stato possibile registrare la data di invio. Ricarica la pagina prima di reinviare.",
      },
      {
        status: 500,
      }
    );
  }

  return NextResponse.json({
    ok: true,
    message:
      `Preventivo PDF inviato a ${customer.email}.`,
    quote: {
      quotedTotal,
      quoteDeposit,
      quotePaymentMethod:
        quotePaymentMethod ||
        null,
      quotePaymentDetails:
        quotePaymentDetails ||
        null,
      quoteValidUntil:
        quoteValidUntil ||
        null,
      quoteLogistics:
        quoteLogistics ||
        null,
      quoteNotes:
        quoteNotes ||
        null,
      quoteSentAt,
      quoteRevision:
        nextRevision,
    },
  });
}
