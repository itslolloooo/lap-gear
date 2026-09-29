import type {
  MetadataRoute,
} from "next";

import {
  getServerSupabase,
} from "@/lib/supabase-server";


export const dynamic =
  "force-dynamic";


function getSiteUrl() {
  return (
    process.env.SITE_URL ??
    "http://localhost:3000"
  ).replace(
    /\/+$/,
    ""
  );
}


export default async function sitemap():
  Promise<MetadataRoute.Sitemap> {

  const siteUrl =
    getSiteUrl();

  const now =
    new Date();


  const staticPages:
    MetadataRoute.Sitemap = [
      {
        url:
          `${siteUrl}/`,

        lastModified:
          now,

        changeFrequency:
          "weekly",

        priority:
          1,
      },

      {
        url:
          `${siteUrl}/catalogo`,

        lastModified:
          now,

        changeFrequency:
          "daily",

        priority:
          0.9,
      },

      {
        url:
          `${siteUrl}/noleggio`,

        lastModified:
          now,

        changeFrequency:
          "weekly",

        priority:
          0.8,
      },

      {
        url:
          `${siteUrl}/termini-noleggio`,

        lastModified:
          now,

        changeFrequency:
          "monthly",

        priority:
          0.3,
      },

      {
        url:
          `${siteUrl}/privacy`,

        lastModified:
          now,

        changeFrequency:
          "monthly",

        priority:
          0.3,
      },
    ];


  const supabase =
    getServerSupabase();


  if (!supabase) {
    return staticPages;
  }


  const {
    data:
      products,
    error,
  } =
    await supabase
      .from(
        "products"
      )
      .select(
        "slug"
      )
      .eq(
        "active",
        true
      )
      .order(
        "id",
        {
          ascending:
            true,
        }
      );


  if (error) {
    console.error(
      "Errore generazione sitemap prodotti:",
      error
    );

    return staticPages;
  }


  const productPages:
    MetadataRoute.Sitemap =
      (
        products ??
        []
      )
        .filter(
          (
            product
          ) =>
            Boolean(
              product.slug
            )
        )
        .map(
          (
            product
          ) => ({
            url:
              `${siteUrl}/prodotto/${encodeURIComponent(
                product.slug
              )}`,

            lastModified:
              now,

            changeFrequency:
              "weekly",

            priority:
              0.7,
          })
        );


  return [
    ...staticPages,
    ...productPages,
  ];
}
