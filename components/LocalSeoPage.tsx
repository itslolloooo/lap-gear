import Link from "next/link";

type LocalFaq = {
  question: string;
  answer: string;
};

type LocalSeoPageProps = {
  eyebrow: string;
  title: string;
  accent: string;
  intro: string;
  areaLabel: string;
  areaDescription: string;
  practicalTitle: string;
  practicalPoints: string[];
  useCases: string[];
  faq: LocalFaq[];
  canonical: string;
  breadcrumbLabel: string;
};

export function LocalSeoPage({
  eyebrow,
  title,
  accent,
  intro,
  areaLabel,
  areaDescription,
  practicalTitle,
  practicalPoints,
  useCases,
  faq,
  canonical,
  breadcrumbLabel,
}: LocalSeoPageProps) {
  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Service",
        "@id": `${canonical}#service`,
        name: title,
        url: canonical,
        description: intro,
        provider: {
          "@type": "LocalBusiness",
          "@id": "https://lapgear.it/#business",
          name: "LAP GEAR",
          url: "https://lapgear.it",
        },
        areaServed: {
          "@type": "Place",
          name: areaLabel,
        },
        serviceType: "Noleggio attrezzatura video professionale",
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: "LAP GEAR",
            item: "https://lapgear.it",
          },
          {
            "@type": "ListItem",
            position: 2,
            name: breadcrumbLabel,
            item: canonical,
          },
        ],
      },
    ],
  };

  return (
    <main className="min-h-screen bg-[#ebeae4] text-[#111111]">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(structuredData).replace(/</g, "\\u003c"),
        }}
      />

      <section className="px-5 pb-8 pt-5 sm:px-8 lg:px-10 lg:pb-10 lg:pt-8 xl:px-14">
        <div className="mx-auto max-w-[1680px] overflow-hidden rounded-[32px] border border-black/10 bg-white shadow-[0_20px_70px_rgba(0,0,0,0.07)]">
          <div className="grid lg:grid-cols-[1.12fr_.88fr]">
            <div className="relative overflow-hidden p-7 sm:p-10 lg:p-14 xl:p-16">
              <div className="pointer-events-none absolute -right-32 -top-36 h-[380px] w-[380px] rounded-full bg-[#ff5a1f]/[0.075]" />

              <div className="relative">
                <div className="inline-flex items-center gap-2.5 rounded-full bg-[#fff0e9] px-4 py-2 text-[13px] font-bold uppercase tracking-[0.12em] text-[#e94b12]">
                  <span className="h-2 w-2 rounded-full bg-[#ff5a1f]" />
                  {eyebrow}
                </div>

                <h1 className="mt-8 max-w-[980px] text-[54px] font-semibold leading-[0.9] tracking-[-0.06em] sm:text-[70px] lg:text-[82px]">
                  {title}
                  <span className="mt-1 block text-[#ff5a1f]">{accent}</span>
                </h1>

                <p className="mt-8 max-w-[760px] text-[18px] leading-8 text-black/58">
                  {intro}
                </p>

                <div className="mt-9 flex flex-col gap-3 sm:flex-row">
                  <Link
                    href="/catalogo"
                    className="inline-flex h-[58px] items-center justify-center rounded-[16px] bg-[#181818] px-7 text-[15px] font-semibold text-white transition hover:bg-[#ff5a1f]"
                  >
                    Esplora il catalogo →
                  </Link>

                  <Link
                    href="/noleggio"
                    className="inline-flex h-[58px] items-center justify-center rounded-[16px] border border-black/10 bg-[#f3f2ed] px-7 text-[15px] font-semibold text-black/65 transition hover:border-black/25 hover:bg-white"
                  >
                    Componi il kit
                  </Link>
                </div>
              </div>
            </div>

            <aside className="bg-[#181818] p-8 text-white sm:p-10 lg:p-12">
              <div className="text-[12px] font-bold uppercase tracking-[0.13em] text-[#ff7b4a]">
                Area servita
              </div>

              <div className="mt-4 text-[38px] font-semibold tracking-[-0.045em]">
                {areaLabel}
              </div>

              <p className="mt-5 text-[15px] leading-7 text-white/52">
                {areaDescription}
              </p>

              <div className="mt-8 rounded-[20px] border border-white/10 bg-white/[0.06] p-5">
                <div className="text-[11px] font-bold uppercase tracking-[0.1em] text-white/35">
                  Ritiro
                </div>
                <div className="mt-2 text-[17px] font-semibold">
                  Su appuntamento · Palestrina, RM
                </div>
                <div className="mt-2 text-[13px] leading-6 text-white/42">
                  La disponibilità viene verificata sulle date e sulle quantità indicate nella richiesta.
                </div>
              </div>
            </aside>
          </div>
        </div>
      </section>

      <section className="px-5 py-10 sm:px-8 lg:px-10 lg:py-14 xl:px-14">
        <div className="mx-auto grid max-w-[1680px] gap-5 lg:grid-cols-2">
          <article className="rounded-[28px] border border-black/10 bg-white p-7 sm:p-9">
            <div className="text-[12px] font-bold uppercase tracking-[0.12em] text-[#ff5a1f]">
              Come funziona
            </div>

            <h2 className="mt-3 text-[36px] font-semibold tracking-[-0.045em]">
              {practicalTitle}
            </h2>

            <div className="mt-7 space-y-4">
              {practicalPoints.map((point, index) => (
                <div
                  key={point}
                  className="flex gap-4 rounded-[17px] bg-[#f3f2ed] p-4"
                >
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#181818] text-[11px] font-bold text-white">
                    {String(index + 1).padStart(2, "0")}
                  </div>
                  <p className="pt-1 text-[14px] leading-6 text-black/58">
                    {point}
                  </p>
                </div>
              ))}
            </div>
          </article>

          <article className="rounded-[28px] bg-[#181818] p-7 text-white sm:p-9">
            <div className="text-[12px] font-bold uppercase tracking-[0.12em] text-[#ff7b4a]">
              Per cosa viene usato
            </div>

            <h2 className="mt-3 text-[36px] font-semibold tracking-[-0.045em]">
              Kit per produzioni reali.
            </h2>

            <div className="mt-7 grid gap-3 sm:grid-cols-2">
              {useCases.map((item) => (
                <div
                  key={item}
                  className="rounded-[17px] border border-white/10 bg-white/[0.06] p-4 text-[14px] font-semibold leading-6 text-white/70"
                >
                  {item}
                </div>
              ))}
            </div>
          </article>
        </div>
      </section>

      <section className="px-5 pb-16 sm:px-8 lg:px-10 lg:pb-20 xl:px-14">
        <div className="mx-auto max-w-[1680px] rounded-[28px] border border-black/10 bg-white p-7 sm:p-9 lg:p-10">
          <div className="text-[12px] font-bold uppercase tracking-[0.12em] text-[#ff5a1f]">
            Domande frequenti
          </div>

          <h2 className="mt-3 text-[38px] font-semibold tracking-[-0.045em]">
            Prima di inviare la richiesta.
          </h2>

          <div className="mt-8 grid gap-4 lg:grid-cols-2">
            {faq.map((item) => (
              <article
                key={item.question}
                className="rounded-[20px] border border-black/10 bg-[#fbfaf7] p-5"
              >
                <h3 className="text-[18px] font-semibold tracking-[-0.025em]">
                  {item.question}
                </h3>
                <p className="mt-3 text-[14px] leading-7 text-black/52">
                  {item.answer}
                </p>
              </article>
            ))}
          </div>

          <div className="mt-9 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/catalogo"
              className="inline-flex h-[56px] items-center justify-center rounded-[16px] bg-[#181818] px-6 text-[15px] font-semibold text-white transition hover:bg-[#ff5a1f]"
            >
              Vedi il gear disponibile
            </Link>
            <Link
              href="/noleggio"
              className="inline-flex h-[56px] items-center justify-center rounded-[16px] bg-[#ff5a1f] px-6 text-[15px] font-semibold text-white transition hover:bg-[#181818]"
            >
              Invia una richiesta →
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
