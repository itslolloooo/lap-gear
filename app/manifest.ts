import type {
  MetadataRoute,
} from "next";


export default function manifest():
  MetadataRoute.Manifest {

  return {
    name:
      "LAP GEAR",

    short_name:
      "LAP GEAR",

    description:
      "Noleggio attrezzatura video, audio, luci e live production a Palestrina, Roma Est e Roma.",

    start_url:
      "/",

    display:
      "standalone",

    background_color:
      "#ebeae4",

    theme_color:
      "#181818",

    lang:
      "it",

    categories: [
      "business",
      "photo",
      "video",
    ],
  };
}
