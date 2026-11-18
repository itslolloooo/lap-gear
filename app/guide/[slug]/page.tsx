import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { getCategoryPage } from "@/lib/category-pages";
import {
  GUIDE_POSTS,
  formatGuideDate,
  getGuidePost,
} from "@/lib/guide-posts";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return GUIDE_POSTS.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = getGuidePost(slug);
  if (!post) return {};

  const canonical = `https://lapgear.it/guide/${post.slug}`;
  return {
    title: post.title,
    description: post.description,
    alternates: { canonical },
    openGraph: {
      title: `${post.title} | LAP GEAR`,
      description: post.description,
      url: canonical,
      type: "article",
      publishedTime: post.date,
    },
  };
}

export default async function GuidePostPage({ params }: PageProps) {
  const { slug } = await params;
  const post = getGuidePost(slug);
  if (!post) notFound();

  const canonical = `https://lapgear.it/guide/${post.slug}`;
  const related = post.relatedCategories
    .map((categorySlug) => getCategoryPage(categorySlug))
    .filter((page): page is NonNullable<typeof page> => Boolean(page));

  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "BlogPosting",
        headline: post.title,
        description: post.description,
        datePublished: post.date,
        mainEntityOfPage: canonical,
        author: { "@type": "Organization", name: "LAP GEAR" },
        publisher: { "@type": "Organization", name: "LAP GEAR", url: "https://lapgear.it" },
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "LAP GEAR", item: "https://lapgear.it" },
          { "@type": "ListItem", position: 2, name: "Guide", item: "https://lapgear.it/guide" },
          { "@type": "ListItem", position: 3, name: post.title, item: canonical },
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

      <article className="px-5 pb-10 pt-5 sm:px-8 lg:px-10 lg:pt-8 xl:px-14">
        <div className="mx-auto max-w-[900px] rounded-[32px] border border-black/10 bg-white p-7 shadow-[0_20px_70px_rgba(0,0,0,0.07)] sm:p-10 lg:p-14">
          <Link href="/guide" className="text-[13px] font-semibold text-[#ff5a1f]">
            ← Tutte le guide
          </Link>
          <div className="mt-6 text-[12px] font-semibold text-black/40">
            {formatGuideDate(post.date)}
          </div>
          <h1 className="mt-2 text-[34px] font-semibold leading-[1.02] tracking-[-0.05em] sm:text-[46px]">
            {post.title}
          </h1>
          <p className="mt-6 text-[17px] leading-8 text-black/65">{post.intro}</p>

          {post.sections.map((section) => (
            <section key={section.heading} className="mt-9">
              <h2 className="text-[24px] font-semibold tracking-[-0.035em]">
                {section.heading}
              </h2>
              {section.paragraphs.map((paragraph) => (
                <p key={paragraph} className="mt-3 text-[16px] leading-8 text-black/60">
                  {paragraph}
                </p>
              ))}
            </section>
          ))}

          <div className="mt-10 rounded-[20px] border border-black/10 bg-[#fbfaf7] p-6">
            <div className="text-[14px] font-semibold">Vedi l&apos;attrezzatura a noleggio</div>
            <div className="mt-3 flex flex-wrap gap-2">
              {related.map((page) => (
                <Link
                  key={page.slug}
                  href={`/noleggio-attrezzatura/${page.slug}`}
                  className="rounded-full border border-black/10 px-4 py-2 text-[13px] font-semibold text-black/65 transition hover:border-[#ff5a1f] hover:text-[#ff5a1f]"
                >
                  Noleggio {page.label.toLowerCase()}
                </Link>
              ))}
              <Link
                href="/catalogo"
                className="rounded-full bg-[#ff5a1f] px-4 py-2 text-[13px] font-semibold text-white"
              >
                Catalogo completo →
              </Link>
            </div>
          </div>
        </div>
      </article>
    </main>
  );
}
