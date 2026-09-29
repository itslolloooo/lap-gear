import {
  PDFDocument,
  StandardFonts,
  rgb,
  type PDFFont,
  type PDFPage,
} from "pdf-lib";


type QuoteBusiness = {
  brand: string;
  legalName: string;
  address: string;
  email: string;
  phone: string;
  taxId: string;
  fiscalNote: string;
};


export type QuotePdfItem = {
  name: string;
  quantity: number;
  priceDay: number;
  lineTotal: number;
};


export type QuotePdfData = {
  reference: string;
  revision: number;
  draft: boolean;
  issueDate: string;
  validUntil: string | null;

  customerName: string;
  customerEmail: string;
  customerPhone: string | null;

  startDate: string;
  endDate: string;
  days: number;

  items: QuotePdfItem[];
  estimateTotal: number;
  quotedTotal: number;
  deposit: number;

  paymentMethod: string;
  paymentDetails: string;
  logistics: string;
  notes: string;

  siteUrl: string;
  business?: Partial<QuoteBusiness>;
};


const PAGE_WIDTH = 595.28;
const PAGE_HEIGHT = 841.89;
const MARGIN = 42;


const COLORS = {
  ink: rgb(0.094, 0.094, 0.094),
  orange: rgb(1, 0.353, 0.122),
  orangeSoft: rgb(1, 0.941, 0.914),
  cream: rgb(0.922, 0.918, 0.894),
  soft: rgb(0.965, 0.961, 0.941),
  muted: rgb(0.38, 0.38, 0.38),
  line: rgb(0.86, 0.86, 0.84),
  white: rgb(1, 1, 1),
  green: rgb(0.09, 0.54, 0.31),
};


function cleanText(
  value: unknown
) {
  return String(
    value ?? ""
  )
    .replace(/[–—−]/g, "-")
    .replace(/→/g, "->")
    .replace(/×/g, "x")
    .replace(/[“”]/g, '"')
    .replace(/[‘’]/g, "'")
    .replace(/\u00a0/g, " ")
    .trim();
}


function formatMoney(
  value: number
) {
  return `EUR ${new Intl.NumberFormat(
    "it-IT",
    {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }
  ).format(value)}`;
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
      value.includes("T")
        ? value
        : `${value}T00:00:00.000Z`
    )
  );
}


function businessFromEnv(
  overrides?: Partial<QuoteBusiness>
): QuoteBusiness {
  const email =
    process.env.QUOTE_BUSINESS_EMAIL?.trim() ||
    process.env.RENTAL_NOTIFICATION_EMAIL?.trim() ||
    "";

  return {
    brand:
      overrides?.brand?.trim() ||
      process.env.QUOTE_BUSINESS_BRAND?.trim() ||
      "LAP GEAR",

    legalName:
      overrides?.legalName?.trim() ||
      process.env.QUOTE_BUSINESS_LEGAL_NAME?.trim() ||
      "Lorenzo Apolloni",

    address:
      overrides?.address?.trim() ||
      process.env.QUOTE_BUSINESS_ADDRESS?.trim() ||
      "Palestrina (RM), Italia",

    email:
      overrides?.email?.trim() ||
      email,

    phone:
      overrides?.phone?.trim() ||
      process.env.QUOTE_BUSINESS_PHONE?.trim() ||
      "",

    taxId:
      overrides?.taxId?.trim() ||
      process.env.QUOTE_BUSINESS_TAX_ID?.trim() ||
      "",

    fiscalNote:
      overrides?.fiscalNote?.trim() ||
      process.env.QUOTE_FISCAL_NOTE?.trim() ||
      "",
  };
}


function wrapText(
  text: string,
  font: PDFFont,
  size: number,
  maxWidth: number
) {
  const safe =
    cleanText(text);

  if (!safe) {
    return [""];
  }

  const words =
    safe.split(/\s+/);

  const lines: string[] = [];
  let current = "";

  for (const word of words) {
    const candidate =
      current
        ? `${current} ${word}`
        : word;

    if (
      font.widthOfTextAtSize(
        candidate,
        size
      ) <= maxWidth
    ) {
      current = candidate;
      continue;
    }

    if (current) {
      lines.push(current);
      current = "";
    }

    if (
      font.widthOfTextAtSize(
        word,
        size
      ) <= maxWidth
    ) {
      current = word;
      continue;
    }

    let fragment = "";

    for (const character of word) {
      const fragmentCandidate =
        fragment + character;

      if (
        font.widthOfTextAtSize(
          fragmentCandidate,
          size
        ) <= maxWidth
      ) {
        fragment =
          fragmentCandidate;
      } else {
        if (fragment) {
          lines.push(fragment);
        }

        fragment = character;
      }
    }

    current = fragment;
  }

  if (current) {
    lines.push(current);
  }

  return lines;
}


function drawWrappedText({
  page,
  text,
  x,
  y,
  width,
  font,
  size,
  lineHeight,
  color = COLORS.ink,
}: {
  page: PDFPage;
  text: string;
  x: number;
  y: number;
  width: number;
  font: PDFFont;
  size: number;
  lineHeight: number;
  color?: ReturnType<typeof rgb>;
}) {
  const lines =
    wrapText(
      text,
      font,
      size,
      width
    );

  let currentY = y;

  for (const line of lines) {
    page.drawText(
      line,
      {
        x,
        y: currentY,
        size,
        font,
        color,
      }
    );

    currentY -=
      lineHeight;
  }

  return currentY;
}


function drawLabel(
  page: PDFPage,
  text: string,
  x: number,
  y: number,
  font: PDFFont,
  color = COLORS.muted
) {
  page.drawText(
    cleanText(text).toUpperCase(),
    {
      x,
      y,
      size: 7.5,
      font,
      color,
    }
  );
}


function drawFooter({
  page,
  pageIndex,
  pageCount,
  regular,
  bold,
  siteUrl,
}: {
  page: PDFPage;
  pageIndex: number;
  pageCount: number;
  regular: PDFFont;
  bold: PDFFont;
  siteUrl: string;
}) {
  page.drawLine({
    start: {
      x: MARGIN,
      y: 31,
    },
    end: {
      x:
        PAGE_WIDTH -
        MARGIN,
      y: 31,
    },
    thickness: 0.7,
    color: COLORS.line,
  });

  page.drawText(
    "LAP GEAR - VIDEO RENTAL",
    {
      x: MARGIN,
      y: 17,
      size: 7.5,
      font: bold,
      color: COLORS.muted,
    }
  );

  const normalizedSite =
    cleanText(siteUrl)
      .replace(/^https?:\/\//, "")
      .replace(/\/+$/, "");

  if (normalizedSite) {
    const siteWidth =
      regular.widthOfTextAtSize(
        normalizedSite,
        7.5
      );

    page.drawText(
      normalizedSite,
      {
        x:
          PAGE_WIDTH / 2 -
          siteWidth / 2,
        y: 17,
        size: 7.5,
        font: regular,
        color: COLORS.muted,
      }
    );
  }

  const pageText =
    `${pageIndex + 1}/${pageCount}`;

  const pageTextWidth =
    regular.widthOfTextAtSize(
      pageText,
      7.5
    );

  page.drawText(
    pageText,
    {
      x:
        PAGE_WIDTH -
        MARGIN -
        pageTextWidth,
      y: 17,
      size: 7.5,
      font: regular,
      color: COLORS.muted,
    }
  );
}


export async function buildQuotePdf(
  data: QuotePdfData
) {
  const pdf =
    await PDFDocument.create();

  const regular =
    await pdf.embedFont(
      StandardFonts.Helvetica
    );

  const bold =
    await pdf.embedFont(
      StandardFonts.HelveticaBold
    );

  const italic =
    await pdf.embedFont(
      StandardFonts.HelveticaOblique
    );

  const business =
    businessFromEnv(
      data.business
    );

  pdf.setTitle(
    `Preventivo LAP GEAR ${cleanText(
      data.reference
    )}`
  );
  pdf.setAuthor(
    business.legalName ||
      business.brand
  );
  pdf.setSubject(
    "Preventivo noleggio attrezzatura foto, video, audio e live"
  );
  pdf.setCreator(
    "LAP GEAR"
  );
  pdf.setProducer(
    "LAP GEAR"
  );

  const page =
    pdf.addPage([
      PAGE_WIDTH,
      PAGE_HEIGHT,
    ]);

  /* =====================================================
     HEADER
     ===================================================== */

  page.drawRectangle({
    x: 0,
    y:
      PAGE_HEIGHT -
      132,
    width:
      PAGE_WIDTH,
    height: 132,
    color: COLORS.ink,
  });

  page.drawRectangle({
    x: MARGIN,
    y:
      PAGE_HEIGHT -
      77,
    width: 84,
    height: 31,
    color: COLORS.orange,
  });

  page.drawText(
    business.brand,
    {
      x:
        MARGIN +
        10,
      y:
        PAGE_HEIGHT -
        66,
      size: 13,
      font: bold,
      color: COLORS.white,
    }
  );

  page.drawText(
    "VIDEO RENTAL",
    {
      x: MARGIN,
      y:
        PAGE_HEIGHT -
        94,
      size: 7.5,
      font: bold,
      color:
        rgb(
          0.72,
          0.72,
          0.72
        ),
    }
  );

  page.drawText(
    "PREVENTIVO NOLEGGIO",
    {
      x: MARGIN,
      y:
        PAGE_HEIGHT -
        119,
      size: 22,
      font: bold,
      color: COLORS.white,
    }
  );

  const statusText =
    data.draft
      ? "BOZZA"
      : `REV. ${String(
          Math.max(
            1,
            data.revision
          )
        ).padStart(
          2,
          "0"
        )}`;

  const statusWidth =
    bold.widthOfTextAtSize(
      statusText,
      8
    ) + 20;

  page.drawRectangle({
    x:
      PAGE_WIDTH -
      MARGIN -
      statusWidth,
    y:
      PAGE_HEIGHT -
      67,
    width:
      statusWidth,
    height: 24,
    color:
      data.draft
        ? rgb(
            0.24,
            0.24,
            0.24
          )
        : COLORS.orange,
  });

  page.drawText(
    statusText,
    {
      x:
        PAGE_WIDTH -
        MARGIN -
        statusWidth +
        10,
      y:
        PAGE_HEIGHT -
        59,
      size: 8,
      font: bold,
      color: COLORS.white,
    }
  );

  const metaX =
    PAGE_WIDTH -
    215;

  drawLabel(
    page,
    "Riferimento",
    metaX,
    PAGE_HEIGHT -
      86,
    bold,
    rgb(
      0.65,
      0.65,
      0.65
    )
  );

  page.drawText(
    cleanText(
      data.reference
    ),
    {
      x: metaX,
      y:
        PAGE_HEIGHT -
        100,
      size: 10.5,
      font: bold,
      color: COLORS.white,
    }
  );

  drawLabel(
    page,
    "Emissione",
    metaX + 96,
    PAGE_HEIGHT -
      86,
    bold,
    rgb(
      0.65,
      0.65,
      0.65
    )
  );

  page.drawText(
    formatDate(
      data.issueDate
    ),
    {
      x:
        metaX +
        96,
      y:
        PAGE_HEIGHT -
        100,
      size: 10.5,
      font: bold,
      color: COLORS.white,
    }
  );

  /* =====================================================
     BUSINESS / CLIENT
     ===================================================== */

  let y =
    PAGE_HEIGHT -
    166;

  page.drawRectangle({
    x: MARGIN,
    y:
      y -
      92,
    width: 246,
    height: 92,
    color: COLORS.soft,
  });

  page.drawRectangle({
    x:
      MARGIN +
      258,
    y:
      y -
      92,
    width:
      PAGE_WIDTH -
      MARGIN * 2 -
      258,
    height: 92,
    color: COLORS.orangeSoft,
  });

  drawLabel(
    page,
    "Fornitore",
    MARGIN +
      14,
    y -
      18,
    bold
  );

  page.drawText(
    cleanText(
      business.legalName ||
        business.brand
    ),
    {
      x:
        MARGIN +
        14,
      y:
        y -
        36,
      size: 12,
      font: bold,
      color: COLORS.ink,
    }
  );

  const businessLines = [
    business.address,
    business.email,
    business.phone,
    business.taxId,
  ]
    .map(cleanText)
    .filter(Boolean);

  let businessY =
    y -
    51;

  for (
    const line of
    businessLines.slice(
      0,
      4
    )
  ) {
    page.drawText(
      line,
      {
        x:
          MARGIN +
          14,
        y:
          businessY,
        size: 8.3,
        font: regular,
        color: COLORS.muted,
      }
    );

    businessY -=
      12;
  }

  drawLabel(
    page,
    "Cliente",
    MARGIN +
      272,
    y -
      18,
    bold,
    COLORS.orange
  );

  page.drawText(
    cleanText(
      data.customerName
    ),
    {
      x:
        MARGIN +
        272,
      y:
        y -
        36,
      size: 12,
      font: bold,
      color: COLORS.ink,
    }
  );

  let customerY =
    y -
    52;

  for (
    const line of [
      data.customerEmail,
      data.customerPhone ??
        "",
    ]
      .map(cleanText)
      .filter(Boolean)
  ) {
    page.drawText(
      line,
      {
        x:
          MARGIN +
          272,
        y:
          customerY,
        size: 8.3,
        font: regular,
        color: COLORS.muted,
      }
    );

    customerY -=
      12;
  }

  y -= 118;

  /* =====================================================
     RENTAL OVERVIEW
     ===================================================== */

  const cardWidth =
    (
      PAGE_WIDTH -
      MARGIN * 2 -
      20
    ) /
    3;

  const overview = [
    {
      label: "Ritiro",
      value:
        formatDate(
          data.startDate
        ),
    },
    {
      label: "Riconsegna",
      value:
        formatDate(
          data.endDate
        ),
    },
    {
      label: "Durata",
      value:
        `${data.days} ${
          data.days === 1
            ? "giorno"
            : "giorni"
        }`,
    },
  ];

  overview.forEach(
    (item, index) => {
      const x =
        MARGIN +
        index *
          (
            cardWidth +
            10
          );

      page.drawRectangle({
        x,
        y:
          y -
          50,
        width:
          cardWidth,
        height: 50,
        color: COLORS.white,
        borderColor: COLORS.line,
        borderWidth: 0.8,
      });

      drawLabel(
        page,
        item.label,
        x + 12,
        y - 16,
        bold
      );

      page.drawText(
        cleanText(
          item.value
        ),
        {
          x:
            x +
            12,
          y:
            y -
            35,
          size: 11,
          font: bold,
          color: COLORS.ink,
        }
      );
    }
  );

  y -= 76;

  /* =====================================================
     ITEMS TABLE + QUOTE DETAILS
     ===================================================== */

  let quotePage =
    page;

  let quoteY =
    y;

  const columns = {
    itemX:
      MARGIN +
      12,
    qtyX: 338,
    dayX: 390,
    totalX: 478,
  };


  function addQuoteContinuationPage(
    title: string
  ) {
    const nextPage =
      pdf.addPage([
        PAGE_WIDTH,
        PAGE_HEIGHT,
      ]);

    nextPage.drawRectangle({
      x: 0,
      y:
        PAGE_HEIGHT -
        88,
      width:
        PAGE_WIDTH,
      height: 88,
      color: COLORS.ink,
    });

    nextPage.drawRectangle({
      x: MARGIN,
      y:
        PAGE_HEIGHT -
        61,
      width: 82,
      height: 28,
      color: COLORS.orange,
    });

    nextPage.drawText(
      business.brand,
      {
        x:
          MARGIN +
          10,
        y:
          PAGE_HEIGHT -
          52,
        size: 12,
        font: bold,
        color: COLORS.white,
      }
    );

    nextPage.drawText(
      cleanText(title),
      {
        x: MARGIN,
        y:
          PAGE_HEIGHT -
          79,
        size: 16,
        font: bold,
        color: COLORS.white,
      }
    );

    const refText =
      cleanText(
        data.reference
      );

    const refWidth =
      regular.widthOfTextAtSize(
        refText,
        8.5
      );

    nextPage.drawText(
      refText,
      {
        x:
          PAGE_WIDTH -
          MARGIN -
          refWidth,
        y:
          PAGE_HEIGHT -
          53,
        size: 8.5,
        font: regular,
        color:
          rgb(
            0.75,
            0.75,
            0.75
          ),
      }
    );

    return nextPage;
  }


  function drawEquipmentHeader(
    targetPage: PDFPage,
    startY: number
  ) {
    targetPage.drawText(
      "ATTREZZATURA",
      {
        x: MARGIN,
        y:
          startY,
        size: 8.5,
        font: bold,
        color: COLORS.orange,
      }
    );

    const headerY =
      startY -
      18;

    targetPage.drawRectangle({
      x: MARGIN,
      y:
        headerY -
        24,
      width:
        PAGE_WIDTH -
        MARGIN * 2,
      height: 24,
      color: COLORS.ink,
    });

    targetPage.drawText(
      "ARTICOLO",
      {
        x:
          columns.itemX,
        y:
          headerY -
          16,
        size: 7.5,
        font: bold,
        color: COLORS.white,
      }
    );

    targetPage.drawText(
      "QTA",
      {
        x:
          columns.qtyX,
        y:
          headerY -
          16,
        size: 7.5,
        font: bold,
        color: COLORS.white,
      }
    );

    targetPage.drawText(
      "EUR/GG",
      {
        x:
          columns.dayX,
        y:
          headerY -
          16,
        size: 7.5,
        font: bold,
        color: COLORS.white,
      }
    );

    targetPage.drawText(
      "SUBTOTALE",
      {
        x:
          columns.totalX,
        y:
          headerY -
          16,
        size: 7.5,
        font: bold,
        color: COLORS.white,
      }
    );

    return (
      headerY -
      24
    );
  }


  quoteY =
    drawEquipmentHeader(
      quotePage,
      quoteY
    );


  for (
    let itemIndex = 0;
    itemIndex <
    data.items.length;
    itemIndex +=
      1
  ) {
    const item =
      data.items[
        itemIndex
      ];

    const nameLines =
      wrapText(
        item.name,
        bold,
        9.5,
        270
      );

    const rowHeight =
      Math.max(
        31,
        nameLines.length *
          12 +
          11
      );

    if (
      quoteY -
        rowHeight <
      62
    ) {
      quotePage =
        addQuoteContinuationPage(
          "DETTAGLIO ATTREZZATURA"
        );

      quoteY =
        drawEquipmentHeader(
          quotePage,
          PAGE_HEIGHT -
            122
        );
    }

    quotePage.drawRectangle({
      x: MARGIN,
      y:
        quoteY -
        rowHeight,
      width:
        PAGE_WIDTH -
        MARGIN * 2,
      height:
        rowHeight,
      color:
        itemIndex %
          2 ===
        0
          ? COLORS.white
          : COLORS.soft,
      borderColor: COLORS.line,
      borderWidth: 0.4,
    });

    let lineY =
      quoteY -
      18;

    for (
      const line of
      nameLines
    ) {
      quotePage.drawText(
        line,
        {
          x:
            columns.itemX,
          y:
            lineY,
          size: 9.5,
          font: bold,
          color: COLORS.ink,
        }
      );

      lineY -=
        12;
    }

    quotePage.drawText(
      String(
        item.quantity
      ),
      {
        x:
          columns.qtyX,
        y:
          quoteY -
          19,
        size: 9.5,
        font: regular,
        color: COLORS.ink,
      }
    );

    quotePage.drawText(
      new Intl.NumberFormat(
        "it-IT",
        {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        }
      ).format(
        item.priceDay
      ),
      {
        x:
          columns.dayX,
        y:
          quoteY -
          19,
        size: 9.2,
        font: regular,
        color: COLORS.ink,
      }
    );

    quotePage.drawText(
      new Intl.NumberFormat(
        "it-IT",
        {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        }
      ).format(
        item.lineTotal
      ),
      {
        x:
          columns.totalX,
        y:
          quoteY -
          19,
        size: 9.2,
        font: bold,
        color: COLORS.ink,
      }
    );

    quoteY -=
      rowHeight;
  }

  quoteY -= 18;


  /* =====================================================
     TOTALS
     ===================================================== */

  if (
    quoteY <
    305
  ) {
    quotePage =
      addQuoteContinuationPage(
        "RIEPILOGO PREVENTIVO"
      );

    quoteY =
      PAGE_HEIGHT -
      126;
  }

  const totalBoxX =
    PAGE_WIDTH -
    MARGIN -
    235;

  quotePage.drawRectangle({
    x:
      totalBoxX,
    y:
      quoteY -
      100,
    width: 235,
    height: 100,
    color: COLORS.ink,
  });

  drawLabel(
    quotePage,
    "Totale listino",
    totalBoxX +
      16,
    quoteY -
      19,
    bold,
    rgb(
      0.62,
      0.62,
      0.62
    )
  );

  const estimateText =
    formatMoney(
      data.estimateTotal
    );

  quotePage.drawText(
    estimateText,
    {
      x:
        totalBoxX +
        219 -
        regular.widthOfTextAtSize(
          estimateText,
          9
        ),
      y:
        quoteY -
        20,
      size: 9,
      font: regular,
      color:
        rgb(
          0.78,
          0.78,
          0.78
        ),
    }
  );

  const adjustment =
    data.quotedTotal -
    data.estimateTotal;

  if (
    Math.abs(
      adjustment
    ) >= 0.01
  ) {
    drawLabel(
      quotePage,
      "Adeguamento",
      totalBoxX +
        16,
      quoteY -
        40,
      bold,
      rgb(
        0.62,
        0.62,
        0.62
      )
    );

    const adjustmentText =
      formatMoney(
        adjustment
      );

    quotePage.drawText(
      adjustmentText,
      {
        x:
          totalBoxX +
          219 -
          regular.widthOfTextAtSize(
            adjustmentText,
            9
          ),
        y:
          quoteY -
          41,
        size: 9,
        font: regular,
        color:
          rgb(
            0.78,
            0.78,
            0.78
          ),
      }
    );
  }

  drawLabel(
    quotePage,
    "Totale noleggio",
    totalBoxX +
      16,
    quoteY -
      65,
    bold,
    COLORS.orange
  );

  const quoteText =
    formatMoney(
      data.quotedTotal
    );

  quotePage.drawText(
    quoteText,
    {
      x:
        totalBoxX +
        16,
      y:
        quoteY -
        89,
      size: 20,
      font: bold,
      color: COLORS.white,
    }
  );

  quotePage.drawRectangle({
    x: MARGIN,
    y:
      quoteY -
      100,
    width:
      totalBoxX -
      MARGIN -
      12,
    height: 100,
    color: COLORS.orangeSoft,
  });

  drawLabel(
    quotePage,
    "Cauzione",
    MARGIN +
      16,
    quoteY -
      21,
    bold,
    COLORS.orange
  );

  quotePage.drawText(
    formatMoney(
      data.deposit
    ),
    {
      x:
        MARGIN +
        16,
      y:
        quoteY -
        48,
      size: 18,
      font: bold,
      color: COLORS.ink,
    }
  );

  drawWrappedText({
    page:
      quotePage,
    text:
      "La cauzione non e' inclusa nel totale del noleggio. Viene gestita separatamente e restituita dopo la verifica del materiale, salvo importi dovuti secondo le condizioni di noleggio.",
    x:
      MARGIN +
      16,
    y:
      quoteY -
      65,
    width:
      totalBoxX -
      MARGIN -
      44,
    font: regular,
    size: 7.8,
    lineHeight: 10,
    color: COLORS.muted,
  });

  quoteY -= 122;


  /* =====================================================
     PAYMENT / VALIDITY / LOGISTICS
     ===================================================== */

  const paymentDetailsLines =
    wrapText(
      data.paymentDetails,
      regular,
      8,
      203
    );

  const logisticsLines =
    wrapText(
      data.logistics ||
        "Modalita' da concordare con LAP GEAR.",
      regular,
      8.2,
      235
    );

  const detailBoxHeight =
    Math.max(
      100,
      66 +
        Math.max(
          paymentDetailsLines.filter(Boolean).length,
          logisticsLines.filter(Boolean).length
        ) *
          10
    );

  if (
    quoteY -
      detailBoxHeight <
    75
  ) {
    quotePage =
      addQuoteContinuationPage(
        "CONDIZIONI ECONOMICHE"
      );

    quoteY =
      PAGE_HEIGHT -
      126;
  }

  quotePage.drawRectangle({
    x: MARGIN,
    y:
      quoteY -
      detailBoxHeight,
    width:
      PAGE_WIDTH -
      MARGIN * 2,
    height:
      detailBoxHeight,
    color: COLORS.soft,
  });

  const leftWidth = 235;

  drawLabel(
    quotePage,
    "Pagamento",
    MARGIN +
      16,
    quoteY -
      18,
    bold,
    COLORS.orange
  );

  let paymentY =
    drawWrappedText({
      page:
        quotePage,
      text:
        data.paymentMethod ||
        "Da concordare",
      x:
        MARGIN +
        16,
      y:
        quoteY -
        37,
      width:
        leftWidth -
        32,
      font: bold,
      size: 10.5,
      lineHeight: 13,
      color: COLORS.ink,
    });

  if (
    cleanText(
      data.paymentDetails
    )
  ) {
    drawWrappedText({
      page:
        quotePage,
      text:
        data.paymentDetails,
      x:
        MARGIN +
        16,
      y:
        paymentY -
        3,
      width:
        leftWidth -
        32,
      font: regular,
      size: 8,
      lineHeight: 10,
      color: COLORS.muted,
    });
  }

  const middleX =
    MARGIN +
    leftWidth +
    18;

  drawLabel(
    quotePage,
    "Validita'",
    middleX,
    quoteY -
      18,
    bold
  );

  quotePage.drawText(
    data.validUntil
      ? `Fino al ${formatDate(
          data.validUntil
        )}`
      : "Da confermare",
    {
      x:
        middleX,
      y:
        quoteY -
        37,
      size: 10.5,
      font: bold,
      color: COLORS.ink,
    }
  );

  drawLabel(
    quotePage,
    "Ritiro / riconsegna",
    middleX,
    quoteY -
      60,
    bold
  );

  drawWrappedText({
    page:
      quotePage,
    text:
      data.logistics ||
      "Modalita' da concordare con LAP GEAR.",
    x:
      middleX,
    y:
      quoteY -
      77,
    width:
      PAGE_WIDTH -
      MARGIN -
      middleX -
      16,
    font: regular,
    size: 8.2,
    lineHeight: 10,
    color: COLORS.muted,
  });

  quoteY -=
    detailBoxHeight +
    18;


  /* =====================================================
     NOTES - can continue on additional pages
     ===================================================== */

  if (
    cleanText(
      data.notes
    )
  ) {
    const noteLines =
      wrapText(
        data.notes,
        regular,
        8.7,
        PAGE_WIDTH -
          MARGIN * 2
      );

    if (
      quoteY <
      105
    ) {
      quotePage =
        addQuoteContinuationPage(
          "NOTE AL PREVENTIVO"
        );

      quoteY =
        PAGE_HEIGHT -
        126;
    }

    drawLabel(
      quotePage,
      "Note al preventivo",
      MARGIN,
      quoteY,
      bold,
      COLORS.orange
    );

    quoteY -= 18;

    for (
      const line of
      noteLines
    ) {
      if (
        quoteY <
        62
      ) {
        quotePage =
          addQuoteContinuationPage(
            "NOTE AL PREVENTIVO"
          );

        quoteY =
          PAGE_HEIGHT -
          126;
      }

      quotePage.drawText(
        line,
        {
          x: MARGIN,
          y:
            quoteY,
          size: 8.7,
          font: regular,
          color: COLORS.muted,
        }
      );

      quoteY -= 12;
    }
  }

  const documentFooterNote =
    [
      business.fiscalNote,
      "Documento di preventivo - non costituisce fattura. La disponibilita' del materiale viene confermata separatamente.",
    ]
      .map(cleanText)
      .filter(Boolean)
      .join(" ");

  drawWrappedText({
    page:
      quotePage,
    text:
      documentFooterNote,
    x: MARGIN,
    y: 50,
    width:
      PAGE_WIDTH -
      MARGIN * 2,
    font: italic,
    size: 7.1,
    lineHeight: 8.5,
    color: COLORS.muted,
  });


  /* =====================================================
     TERMS PAGE
     ===================================================== */

  const termsPage =
    pdf.addPage([
      PAGE_WIDTH,
      PAGE_HEIGHT,
    ]);

  termsPage.drawRectangle({
    x: 0,
    y:
      PAGE_HEIGHT -
      104,
    width:
      PAGE_WIDTH,
    height: 104,
    color: COLORS.ink,
  });

  termsPage.drawRectangle({
    x: MARGIN,
    y:
      PAGE_HEIGHT -
      69,
    width: 82,
    height: 28,
    color: COLORS.orange,
  });

  termsPage.drawText(
    business.brand,
    {
      x:
        MARGIN +
        10,
      y:
        PAGE_HEIGHT -
        60,
      size: 12,
      font: bold,
      color: COLORS.white,
    }
  );

  termsPage.drawText(
    "CONDIZIONI OPERATIVE DI NOLEGGIO",
    {
      x: MARGIN,
      y:
        PAGE_HEIGHT -
        90,
      size: 20,
      font: bold,
      color: COLORS.white,
    }
  );

  let termsY =
    PAGE_HEIGHT -
    135;

  termsPage.drawText(
    `Preventivo ${cleanText(
      data.reference
    )}`,
    {
      x: MARGIN,
      y:
        termsY,
      size: 9,
      font: bold,
      color: COLORS.orange,
    }
  );

  termsY -= 26;

  /*
   * Condizioni operative sintetiche.
   * Mantienile coerenti con /termini-noleggio e con il contratto
   * effettivamente usato da LAP GEAR. Prima del go-live definitivo
   * e' consigliata una revisione professionale del testo contrattuale.
   */
  const terms = [
    "La disponibilita' indicata nella richiesta non blocca automaticamente l'attrezzatura. Il noleggio diventa effettivo solo dopo la conferma di LAP GEAR.",
    "Il cliente deve fornire dati corretti e, quando richiesto, un documento di identita' valido prima della consegna del materiale.",
    "Il pagamento segue metodo, scadenze e importi indicati nel presente preventivo. La consegna puo' essere subordinata all'avvenuto pagamento concordato.",
    "La cauzione e' separata dal prezzo di noleggio. Viene restituita dopo il controllo di rientro, salvo importi dovuti per danni, mancanze o altri costi previsti dalle condizioni di noleggio.",
    "Stato, accessori e dotazioni vengono verificati alla consegna e alla riconsegna. Eventuali anomalie devono essere segnalate subito.",
    "Durante il periodo di noleggio il cliente e' responsabile della custodia e dell'uso corretto dell'attrezzatura. Furto, smarrimento, danni o malfunzionamenti devono essere comunicati tempestivamente.",
    "La riconsegna oltre l'orario o la data concordati puo' comportare costi aggiuntivi e deve essere concordata appena possibile.",
    "Modifiche a date, quantita', materiale o modalita' di consegna possono richiedere una nuova verifica di disponibilita' e un aggiornamento del preventivo.",
    "L'attrezzatura non deve essere ceduta o subnoleggiata a terzi senza autorizzazione. L'utilizzo deve rispettare le norme applicabili e gli eventuali permessi richiesti.",
    "Il presente riepilogo accompagna le condizioni complete di noleggio e il verbale di consegna/rientro. In caso di dubbi, contattare LAP GEAR prima della conferma.",
  ];

  terms.forEach(
    (term, index) => {
      const number =
        String(
          index + 1
        ).padStart(
          2,
          "0"
        );

      termsPage.drawRectangle({
        x: MARGIN,
        y:
          termsY -
          2,
        width: 24,
        height: 24,
        color:
          index % 2 === 0
            ? COLORS.orangeSoft
            : COLORS.soft,
      });

      termsPage.drawText(
        number,
        {
          x:
            MARGIN +
            6,
          y:
            termsY +
            6,
          size: 8,
          font: bold,
          color:
            index % 2 === 0
              ? COLORS.orange
              : COLORS.muted,
        }
      );

      const nextY =
        drawWrappedText({
          page:
            termsPage,
          text: term,
          x:
            MARGIN +
            36,
          y:
            termsY +
            8,
          width:
            PAGE_WIDTH -
            MARGIN * 2 -
            36,
          font: regular,
          size: 8.7,
          lineHeight: 11.2,
          color: COLORS.ink,
        });

      termsY =
        Math.min(
          termsY -
            36,
          nextY -
            12
        );
    }
  );

  if (
    cleanText(
      data.siteUrl
    )
  ) {
    const termsUrl =
      `${cleanText(
        data.siteUrl
      ).replace(/\/+$/, "")}/termini-noleggio`;

    termsPage.drawRectangle({
      x: MARGIN,
      y: 95,
      width:
        PAGE_WIDTH -
        MARGIN * 2,
      height: 48,
      color: COLORS.soft,
    });

    drawLabel(
      termsPage,
      "Termini completi",
      MARGIN +
        14,
      127,
      bold,
      COLORS.orange
    );

    termsPage.drawText(
      termsUrl,
      {
        x:
          MARGIN +
          14,
        y: 108,
        size: 8.3,
        font: regular,
        color: COLORS.ink,
      }
    );
  }

  termsPage.drawLine({
    start: {
      x: MARGIN,
      y: 67,
    },
    end: {
      x: 260,
      y: 67,
    },
    thickness: 0.6,
    color: COLORS.line,
  });

  termsPage.drawLine({
    start: {
      x: 330,
      y: 67,
    },
    end: {
      x:
        PAGE_WIDTH -
        MARGIN,
      y: 67,
    },
    thickness: 0.6,
    color: COLORS.line,
  });

  termsPage.drawText(
    "Data / firma cliente per accettazione",
    {
      x: MARGIN,
      y: 55,
      size: 7.2,
      font: regular,
      color: COLORS.muted,
    }
  );

  termsPage.drawText(
    "LAP GEAR",
    {
      x: 330,
      y: 55,
      size: 7.2,
      font: bold,
      color: COLORS.muted,
    }
  );

  /* =====================================================
     FOOTERS
     ===================================================== */

  const pages =
    pdf.getPages();

  pages.forEach(
    (
      currentPage,
      index
    ) => {
      drawFooter({
        page:
          currentPage,
        pageIndex:
          index,
        pageCount:
          pages.length,
        regular,
        bold,
        siteUrl:
          data.siteUrl,
      });
    }
  );

  return pdf.save();
}
