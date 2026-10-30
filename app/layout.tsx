import type { Metadata } from "next";
import "./globals.css";
import { RentalProvider } from "@/components/RentalProvider";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { LegalFooter } from "@/components/LegalFooter";


export const metadata: Metadata = {
  metadataBase: new URL("https://lapgear.it"),
  title: {
    default: "Noleggio attrezzatura video a Palestrina e Roma | LAP GEAR",
    template: "%s | LAP GEAR",
  },
  description:
    "Noleggio di videocamere, ottiche, audio, luci e attrezzatura professionale a Palestrina, Roma Est e Roma.",
  applicationName: "LAP GEAR",
  icons: {
    icon: [
      {
        url: "/favicon.ppm",
        type: "image/x-portable-pixmap",
        sizes: "96x96",
      },
      {
        url: "/icon.svg",
        type: "image/svg+xml",
      },
    ],
  },
  openGraph: {
    title: "Noleggio attrezzatura video a Palestrina e Roma | LAP GEAR",
    description:
      "Noleggio di videocamere, ottiche, audio, luci e attrezzatura professionale a Palestrina, Roma Est e Roma.",
    url: "https://lapgear.it",
    siteName: "LAP GEAR",
    type: "website",
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="it">
      <body>
        <RentalProvider>
          <Header />
          {children}
          <LegalFooter />
          <Footer />
        </RentalProvider>
      </body>
    </html>
  );
}
