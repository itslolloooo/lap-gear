import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { ProductCard } from "@/components/ProductCard";
import { getCatalogProducts } from "@/lib/catalog-server";
import { CATEGORY_PAGES, getCategoryPage } from "@/lib/category-pages";
import { LOCAL_AREAS } from "@/lib/local-areas";

export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{ categoria: string }>;
};

function canonicalFor(slug: string) {
  return `https://lapgear.it/noleggio-attrezzatura/${slug}`;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { categoria } = await params;
  const page = getCategoryPage(categoria);

  if (!page) {
    return {};
  }

  const title = `Noleggio ${page.noun} a Roma e Palestrina`;
  const description = `Richiedi a noleggio ${page.noun} a Roma, Roma Est e Palestrina: ritiro su appuntamento, prezzi giornalieri IVA esclusa e richiesta online con LAP GEAR.`;
  const canonical = canonicalFor(page.slug);

  return {
    title,
    description,
    alternates: { canonical },
    openGraph: {
      title: `${title} | LAP GEAR`,
      description,
      url: canonical,
      type: "website",
    },
  };
}

export default async function CategoryRentalPage({ params }: PageProps) {
  const { categoria } = await params;
  const page = getCategoryPage(categoria);

  if (!page) {
    notFound();
  }

  const products = (await getCatalogProducts()).filter(
    (product) => product.category === page.slug
  );

  const canonical = canonicalFor(page.slug);

  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "LAP GEAR", item: "https://lapgear.it" },
          { "@type": "ListItem", position: 2, name: "Catalogo", item: "https://lapgear.it/catalogo" },
          { "@type": "ListItem", position: 3, name: page.label, item: canonical },
        ],
      },
      {
        "@type": "ItemList",
        itemListElement: products.map((product, index) => ({
          "@type": "ListItem",
          position: index + 1,
          url: `https://lapgear.it/prodotto/${product.slug}`,
          name: product.name,
        })),
      },
      {
        "@type": "FAQPage",
        mainEntity: page.faq.map((item) => ({
          "@type": "Question",
          name: item.question,
          acceptedAnswer: { "@type": "Answer", text: item.answer },
        })),
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
        <div className="mx-auto max-w-[1680px] overflow-hidden rounded-[32px] border border-black/10 bg-white p-7 shadow-[0_20px_70px_rgba(0,0,0,0.07)] sm:p-10 lg:p-14">
          <div className="text-[12px] font-bold uppercase tracking-[0.12em] text-[#ff5a1f]">
            {page.label} · Roma e Palestrina
          </div>

          <h1 className="mt-4 max-w-[1000px] text-[40px] font-semibold leading-[0.98] tracking-[-0.055em] sm:text-[56px] lg:text-[68px]">
            Noleggio {page.noun}
            <span className="text-[#ff5a1f]"> a Roma e Palestrina.</span>
          </h1>

          <p className="mt-6 max-w-[760px] text-[16px] leading-7 text-black/55">
            {page.intro}
          </p>

          <div className="mt-6 flex flex-wrap gap-2">
            {page.uses.map((use) => (
              <span
                key={use}
                className="rounded-full border border-black/10 px-4 py-2 text-[13px] font-semibold text-black/60"
              >
                {use}
              </span>
            ))}
          </div>
        </div>
      </section>

      <section className="px-5 pb-10 sm:px-8 lg:px-10 xl:px-14">
        <div className="mx-auto max-w-[1680px]">
          {products.length > 0 ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <p className="rounded-[20px] border border-black/10 bg-white p-6 text-[14px] text-black/55">
              Al momento non ci sono prodotti in questa categoria.{" "}
              <Link href="/catalogo" className="font-semibold text-[#ff5a1f]">
                Vai al catalogo →
              </Link>
            </p>
          )}
        </div>
      </section>

      <section className="px-5 pb-16 sm:px-8 lg:px-10 lg:pb-20 xl:px-14">
        <div className="mx-auto max-w-[1680px] rounded-[28px] border border-black/10 bg-white p-7 sm:p-9 lg:p-10">
          <h2 className="text-[30px] font-semibold tracking-[-0.045em]">
            Domande frequenti.
          </h2>

          <div className="mt-6 grid gap-4 lg:grid-cols-3">
            {page.faq.map((item) => (
              <article
                key={item.question}
                className="rounded-[20px] border border-black/10 bg-[#fbfaf7] p-5"
              >
                <h3 className="text-[17px] font-semibold tracking-[-0.025em]">
                  {item.question}
                </h3>
                <p className="mt-3 text-[14px] leading-7 text-black/52">
                  {item.answer}
                </p>
              </article>
            ))}
          </div>

          <div className="mt-8 flex flex-wrap items-center gap-3 text-[13px]">
            <span className="font-semibold text-black/40">Zone:</span>
            {LOCAL_AREAS.map((area) => (
              <Link
                key={area.href}
                href={area.href}
                className="rounded-full border border-black/10 px-4 py-2 font-semibold text-black/65 transition hover:border-[#ff5a1f] hover:text-[#ff5a1f]"
              >
                {area.label}
              </Link>
            ))}
            <span className="ml-2 font-semibold text-black/40">Altre categorie:</span>
            {CATEGORY_PAGES.filter((other) => other.slug !== page.slug).map((other) => (
              <Link
                key={other.slug}
                href={`/noleggio-attrezzatura/${other.slug}`}
                className="rounded-full border border-black/10 px-4 py-2 font-semibold text-black/65 transition hover:border-[#ff5a1f] hover:text-[#ff5a1f]"
              >
                {other.label}
              </Link>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
