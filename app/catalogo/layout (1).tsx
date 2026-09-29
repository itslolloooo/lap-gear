import type {
  Metadata,
} from "next";

import type {
  ReactNode,
} from "react";


export const metadata:
  Metadata = {
    title:
      "Catalogo attrezzatura | LAP GEAR",

    description:
      "Esplora il catalogo LAP GEAR: camere, ottiche, audio, luci, video, live e accessori disponibili per il noleggio.",

    alternates: {
      canonical:
        "/catalogo",
    },

    robots: {
      index:
        true,

      follow:
        true,
    },
  };


export default function CatalogLayout({
  children,
}: {
  children:
    ReactNode;
}) {

  return children;
}
