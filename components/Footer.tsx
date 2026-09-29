import Link from "next/link";

function Footer() {
  const year =
    new Date().getFullYear();

  return (
    <footer className="bg-[#ebeae4] px-5 pb-6 pt-4 sm:px-8 lg:px-10 xl:px-14">
      <div className="mx-auto max-w-[1680px] overflow-hidden rounded-[30px] bg-[#181818] text-white">

        <div className="grid lg:grid-cols-[1.3fr_.7fr_.7fr]">

          {/* =====================================
              BRAND
              ===================================== */}

          <div className="relative overflow-hidden border-b border-white/10 p-8 sm:p-10 lg:border-b-0 lg:border-r lg:p-12">
            <div className="pointer-events-none absolute -bottom-28 -left-24 h-[240px] w-[240px] rounded-full bg-[#ff5a1f]/15" />

            <div className="relative">
              <Link
                href="/"
                className="inline-flex items-center gap-4"
              >
                <div className="flex h-[50px] w-[50px] items-center justify-center rounded-[15px] bg-[#ff5a1f] text-[15px] font-black text-white">
                  LAP
                </div>

                <div>
                  <div className="text-[22px] font-black leading-none tracking-[-0.045em]">
                    GEAR
                  </div>

                  <div className="mt-1.5 text-[11px] font-bold uppercase tracking-[0.13em] text-white/40">
                    Video Rental
                  </div>
                </div>
              </Link>

              <p className="mt-8 max-w-[520px] text-[16px] leading-7 text-white/55">
                Attrezzatura foto,
                video e live per
                produzioni, eventi
                e creator.
              </p>

              <div className="mt-8 inline-flex items-center gap-3 rounded-full border border-white/10 bg-white/[0.06] px-4 py-2.5">
                <span className="h-2.5 w-2.5 rounded-full bg-[#ff5a1f]" />

                <span className="text-[13px] font-semibold text-white/65">
                  Ritiro su appuntamento · Palestrina, RM
                </span>
              </div>
            </div>
          </div>


          {/* =====================================
              NAV
              ===================================== */}

          <div className="border-b border-white/10 p-8 sm:p-10 lg:border-b-0 lg:border-r lg:p-12">
            <div className="text-[12px] font-bold uppercase tracking-[0.13em] text-[#ff7b4a]">
              Esplora
            </div>

            <nav className="mt-7 grid gap-1">

              <FooterLink
                href="/catalogo"
                label="Catalogo"
              />

              <FooterLink
                href="/#come-funziona"
                label="Come funziona"
              />

              <FooterLink
                href="/noleggio"
                label="Il tuo kit"
              />

              <FooterLink
                href="/termini-noleggio"
                label="Termini di noleggio"
              />

            </nav>
          </div>


          {/* =====================================
              CONTACT
              ===================================== */}

          <div className="p-8 sm:p-10 lg:p-12">

            <div className="text-[12px] font-bold uppercase tracking-[0.13em] text-[#ff7b4a]">
              Contatti
            </div>

            <div className="mt-7">
              <div className="text-[13px] font-semibold uppercase tracking-[0.08em] text-white/35">
                Email
              </div>

              <a
                href="mailto:info@lapequipment.it"
                className="mt-2 block break-all text-[17px] font-semibold text-white transition hover:text-[#ff7b4a]"
              >
                info@lapequipment.it
              </a>
            </div>


            {/* INFO */}

            <div className="mt-7 border-t border-white/10 pt-6">
              <div className="text-[13px] leading-6 text-white/40">
                Hai dubbi sul materiale,
                sulle date o sulle
                condizioni di noleggio?
                Scrivici prima di inviare
                la richiesta.
              </div>
            </div>


            {/* CTA */}

            <Link
              href="/#contatti"
              className="mt-8 flex h-[54px] items-center justify-between rounded-[16px] bg-[#ff5a1f] px-5 text-[15px] font-semibold text-white transition hover:bg-white hover:text-[#181818]"
            >
              Parliamo del progetto

              <span className="text-[19px]">
                →
              </span>
            </Link>
          </div>
        </div>


        {/* =====================================
            BOTTOM
            ===================================== */}

        <div className="flex flex-col gap-4 border-t border-white/10 px-8 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-10 lg:px-12">

          <div className="text-[12px] font-medium text-white/30">
            © {year} LAP GEAR
          </div>

          <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-[12px] font-medium">

            <Link
              href="/termini-noleggio"
              className="text-white/30 transition hover:text-white"
            >
              Termini di noleggio
            </Link>

            <span className="hidden text-white/15 sm:inline">
              ·
            </span>

            <div className="text-white/30">
              Professional Video Rental
            </div>

          </div>
        </div>
      </div>
    </footer>
  );
}


function FooterLink({
  href,
  label,
}: {
  href: string;
  label: string;
}) {
  return (
    <Link
      href={href}
      className="group flex items-center justify-between border-b border-white/10 py-4 text-[16px] font-semibold text-white/70 transition last:border-b-0 hover:text-white"
    >
      <span>
        {label}
      </span>

      <span className="text-[#ff5a1f] transition group-hover:translate-x-1">
        →
      </span>
    </Link>
  );
}


export {
  Footer,
};

export default Footer;