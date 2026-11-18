import type { Metadata } from "next";
import Link from "next/link";

import { GUIDE_POSTS, formatGuideDate } from "@/lib/guide-posts";

const canonical = "https://lapgear.it/guide";

export const metadata: Metadata = {
  title: "Guide al noleggio video",
  description:
    "Guide pratiche di LAP GEAR per scegliere camere, ottiche, audio e luci a noleggio a Roma e Palestrina.",
  alternates: { canonical },
};

export default function GuideIndexPage() {
  return (
    <main className="min-h-screen bg-[#ebeae4] text-[#111111]">
      <section className="px-5 pb-8 pt-5 sm:px-8 lg:px-10 lg:pt-8 xl:px-14">
        <div className="mx-auto max-w-[1680px] rounded-[32px] border border-black/10 bg-white p-7 shadow-[0_20px_70px_rgba(0,0,0,0.07)] sm:p-10 lg:p-14">
          <div className="text-[12px] font-bold uppercase tracking-[0.12em] text-[#ff5a1f]">
            Guide
          </div>
          <h1 className="mt-4 text-[40px] font-semibold leading-[0.98] tracking-[-0.055em] sm:text-[56px]">
            Guide al noleggio
            <span className="text-[#ff5a1f]"> video.</span>
          </h1>
          <p className="mt-6 max-w-[700px] text-[16px] leading-7 text-black/55">
            Consigli pratici per scegliere l&apos;attrezzatura giusta per il tuo set.
          </p>
        </div>
      </section>

      <section className="px-5 pb-16 sm:px-8 lg:px-10 xl:px-14">
        <div className="mx-auto grid max-w-[1680px] gap-4 md:grid-cols-2 xl:grid-cols-3">
          {GUIDE_POSTS.map((post) => (
            <Link
              key={post.slug}
              href={`/guide/${post.slug}`}
              className="rounded-[24px] border border-black/10 bg-white p-6 transition hover:border-[#ff5a1f]"
            >
              <div className="text-[12px] font-semibold text-black/40">
                {formatGuideDate(post.date)}
              </div>
              <h2 className="mt-2 text-[22px] font-semibold tracking-[-0.03em]">
                {post.title}
              </h2>
              <p className="mt-3 text-[14px] leading-6 text-black/55">
                {post.description}
              </p>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
