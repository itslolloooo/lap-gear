import type {
  Metadata,
} from "next";

import type {
  ReactNode,
} from "react";


export const metadata:
  Metadata = {
    title:
      "Richiesta noleggio | LAP GEAR",

    description:
      "Costruisci il tuo kit LAP GEAR, scegli le date e invia una richiesta di noleggio attrezzatura foto, video, audio e live.",

    alternates: {
      canonical:
        "/noleggio",
    },

    robots: {
      index:
        true,

      follow:
        true,
    },
  };


export default function RentalLayout({
  children,
}: {
  children:
    ReactNode;
}) {

  return children;
}
