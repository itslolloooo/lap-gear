export type BusinessInfo = {
  brand: string;
  legalName: string;
  address: string;
  email: string;
  phone: string;
  vatId: string;
  rea: string;
  pec: string;
  siteUrl: string;
};


export function getBusinessInfo():
  BusinessInfo {

  return {
    brand:
      process.env.QUOTE_BUSINESS_BRAND?.trim() ||
      "LAP GEAR",

    legalName:
      process.env.QUOTE_BUSINESS_LEGAL_NAME?.trim() ||
      "APOLLONI LORENZO",

    address:
      process.env.QUOTE_BUSINESS_ADDRESS?.trim() ||
      "Via Prenestina Nuova 291, 00036 Palestrina (RM), Italia",

    email:
      process.env.QUOTE_BUSINESS_EMAIL?.trim() ||
      process.env.RENTAL_NOTIFICATION_EMAIL?.trim() ||
      "info@lapgear.it",

    phone:
      process.env.QUOTE_BUSINESS_PHONE?.trim() ||
      "",

    vatId:
      process.env.QUOTE_BUSINESS_TAX_ID?.trim() ||
      "17559381003",

    rea:
      process.env.BUSINESS_REA?.trim() ||
      "",

    pec:
      process.env.BUSINESS_PEC?.trim() ||
      "",

    siteUrl:
      (
        process.env.SITE_URL?.trim() ||
        ""
      ).replace(
        /\/+$/,
        ""
      ),
  };
}
