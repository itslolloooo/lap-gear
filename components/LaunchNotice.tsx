"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

/*
 * Avviso "servizio in avvio".
 *
 * Il sito è in fase di lancio: le richieste sono non vincolanti e i noleggi
 * non sono ancora attivi. Quando il servizio partirà, basta togliere
 * <LaunchNotice /> da app/layout.tsx.
 */

export function LaunchNotice() {
  const pathname = usePathname();

  if (pathname.startsWith("/admin")) {
    return null;
  }

  return (
    <div className="bg-[#181818] px-5 py-2.5 text-center text-[12px] leading-5 text-white/75 sm:px-8 lg:px-10">
      <span className="font-semibold text-[#ff8b60]">Servizio in avvio.</span>{" "}
      I noleggi non sono ancora attivi: le richieste inviate sono non vincolanti
      e non comportano pagamenti.{" "}
      <Link
        href="/note-legali"
        className="font-semibold text-white underline underline-offset-4 transition hover:text-[#ff8b60]"
      >
        Dettagli
      </Link>
    </div>
  );
}
