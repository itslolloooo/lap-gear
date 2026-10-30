import type { MetadataRoute } from "next";

import {
  getServerSupabase,
} from "@/lib/supabase-server";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = "https://lapgear.it";

  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${baseUrl}/catalogo`,
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/noleggio`,
      changeFrequency: "weekly",
      priority: 0.7,
    },
    {
      url: `${baseUrl}/privacy`,
      changeFrequency: "yearly",
      priority: 0.2,
    },
    {
      url: `${baseUrl}/termini-noleggio`,
      changeFrequency: "monthly",
      priority: 0.3,
    },
    {
      url: `${baseUrl}/recesso`,
      changeFrequency: "yearly",
      priority: 0.2,
    },
    {
      url: `${baseUrl}/note-legali`,
      changeFrequency: "yearly",
      priority: 0.2,
    },
  ];

  const supabase = getServerSupabase();

  if (!supabase) {
    return staticPages;
  }

  const {
    data: products,
    error,
  } = await supabase
    .from("products")
    .select("slug")
    .eq("active", true);

  if (error) {
    console.error(
      "Errore generazione sitemap:",
      error.message
    );

    return staticPages;
  }

  const productPages: MetadataRoute.Sitemap =
    (products ?? [])
      .filter(
        (product) =>
          typeof product.slug === "string" &&
          product.slug.trim() !== ""
      )
      .map((product) => ({
        url: `${baseUrl}/prodotto/${encodeURIComponent(
          product.slug
        )}`,
        changeFrequency: "weekly",
        priority: 0.8,
      }));

  return [
    ...staticPages,
    ...productPages,
  ];
}