import type { Metadata } from "next";
import "./globals.css";
import "./globals.css";
import { RentalProvider } from "@/components/RentalProvider";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

export const metadata: Metadata = {
  title: "LAP equipment · Noleggio attrezzatura foto video live",
  description: "Noleggio attrezzatura professionale per foto, video, audio e produzioni live."
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="it">
      <body>
        <RentalProvider>
          <Header />
          {children}
          <Footer />
        </RentalProvider>
      </body>
    </html>
  );
}
