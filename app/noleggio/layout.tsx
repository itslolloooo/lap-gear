import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Richiedi noleggio attrezzatura video",
  description:
    "Componi il tuo kit LAP GEAR, scegli le date e invia una richiesta di noleggio per videocamere, ottiche, audio e luci a Palestrina, Roma Est e Roma.",
  alternates: {
    canonical: "https://lapgear.it/noleggio",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RentalLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
