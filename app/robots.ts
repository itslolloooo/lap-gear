import type {
  MetadataRoute,
} from "next";


function getSiteUrl() {
  return (
    process.env.SITE_URL ??
    "http://localhost:3000"
  ).replace(
    /\/+$/,
    ""
  );
}


export default function robots():
  MetadataRoute.Robots {

  const siteUrl =
    getSiteUrl();


  return {
    rules: [
      {
        userAgent:
          "*",

        allow:
          "/",

        disallow: [
          "/admin",
          "/api",
          "/richiesta",
        ],
      },
    ],

    sitemap:
      `${siteUrl}/sitemap.xml`,

    host:
      siteUrl,
  };
}
