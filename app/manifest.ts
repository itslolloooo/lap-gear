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
      "Noleggio attrezzatura foto, video, audio e live production.",

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
