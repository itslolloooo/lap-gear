import Link from "next/link";

import { getBusinessInfo } from "@/lib/business-info";

function Footer() {
  const year = new Date().getFullYear();
  const business = getBusinessInfo();

  return (
    <footer
      id="contatti"
      className="bg-[#ebeae4] px-5 pb-6 pt-2 sm:px-8 lg:px-10 xl:px-14"
    >
      <div className="mx-auto max-w-[1680px] overflow-hidden rounded-[28px] bg-[#181818] text-white">
        <div className="grid border-b border-white/10 lg:grid-cols-[1.15fr_.85fr]">
          <div className="relative overflow-hidden p-7 sm:p-9 lg:p-10 xl:p-12">
            <div className="pointer-events-none absolute -left-24 -top-24 h-[240px] w-[240px] rounded-full bg-[#ff5a1f]/15" />

            <div className="relative">
              <div className="text-[11px] font-bold uppercase tracking-[0.13em] text-[#ff7b4a]">
                Hai un progetto?
              </div>

              <h2 className="mt-3 max-w-[760px] text-[36px] font-semibold leading-[0.96] tracking-[-0.05em] sm:text-[46px] lg:text-[54px]">
                Troviamo l’attrezzatura giusta.
                <span className="block text-white/35">
                  Per il tuo set, senza complicazioni.
                </span>
              </h2>

              <p className="mt-5 max-w-[640px] text-[14px] leading-6 text-white/45">
                Parti dal catalogo oppure scrivici cosa devi realizzare.
                Ti aiutiamo a costruire una configurazione sensata.
              </p>

              <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                <Link
                  href="/catalogo"
                  className="inline-flex h-[52px] items-center justify-center rounded-[14px] bg-[#ff5a1f] px-5 text-[14px] font-semibold text-white transition hover:bg-white hover:text-[#181818]"
                >
                  Vai al catalogo →
                </Link>

                <a
                  href={"mailto:" + business.email}
                  className="inline-flex h-[52px] items-center justify-center rounded-[14px] border border-white/10 bg-white/[0.06] px-5 text-[14px] font-semibold text-white transition hover:bg-white/[0.11]"
                >
                  Scrivici
                </a>
              </div>
            </div>
          </div>

          <div className="border-t border-white/10 p-7 sm:p-9 lg:border-l lg:border-t-0 lg:p-10 xl:p-12">
            <Link href="/" className="inline-flex items-center gap-4">
              <div className="flex h-[48px] w-[48px] items-center justify-center rounded-[14px] bg-[#ff5a1f] text-[14px] font-black">
                LAP
              </div>

              <div>
                <div className="text-[22px] font-black leading-none tracking-[-0.045em]">
                  GEAR
                </div>
                <div className="mt-1.5 text-[10px] font-bold uppercase tracking-[0.13em] text-white/35">
                  Video Rental
                </div>
              </div>
            </Link>

            <div className="mt-7 grid grid-cols-2 gap-x-6 gap-y-3 text-[13px] font-semibold text-white/55 sm:grid-cols-3 lg:grid-cols-2">
              <FooterNavLink href="/catalogo">Catalogo</FooterNavLink>
              <FooterNavLink href="/kit">Kit pronti</FooterNavLink>
              <FooterNavLink href="/#come-funziona">Come funziona</FooterNavLink>
              <FooterNavLink href="/richiesta">Stato richiesta</FooterNavLink>
              <FooterNavLink href="/noleggio">Il tuo kit</FooterNavLink>
              <FooterNavLink href="/termini-noleggio">Condizioni</FooterNavLink>
            </div>

            <div className="mt-7 border-t border-white/10 pt-6">
              <a
                href={"mailto:" + business.email}
                className="text-[15px] font-semibold text-white transition hover:text-[#ff7b4a]"
              >
                {business.email}
              </a>

              <div className="mt-2 text-[12px] leading-5 text-white/35">
                Ritiro su appuntamento · Palestrina, RM
              </div>
            </div>
          </div>
        </div>

        <div className="grid gap-5 px-7 py-5 sm:px-9 lg:grid-cols-[1fr_auto] lg:items-center lg:px-10 xl:px-12">
          <div className="text-[11px] leading-5 text-white/30">
            <span className="font-medium text-white/45">
              {business.legalName}
            </span>
            {" · "}
            {business.address}
            {business.vatId && (
              <>
                {" · P. IVA "}
                {business.vatId}
              </>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-[11px] font-semibold text-white/35">
            <Link href="/privacy" className="transition hover:text-white">
              Privacy
            </Link>
            <Link href="/termini-noleggio" className="transition hover:text-white">
              Condizioni
            </Link>
            <Link href="/note-legali" className="transition hover:text-white">
              Note legali
            </Link>
            <span className="text-white/20">
              © {year} LAP GEAR
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}

function FooterNavLink({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="transition hover:text-white"
    >
      {children}
    </Link>
  );
}

export { Footer };
export default Footer;
