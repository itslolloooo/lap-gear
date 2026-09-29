"use client";

import Link from "next/link";
import { useState } from "react";

import { useRental } from "@/components/RentalProvider";

import type { Product } from "@/lib/types";

export function ProductCard({
  product,
}: {
  product: Product;
}) {
  const { add } =
    useRental();

  const [added, setAdded] =
    useState(false);

  const price =
    Number(
      product.priceDay ?? 0
    );

  function addToKit() {
    add(product);

    setAdded(true);

    window.setTimeout(() => {
      setAdded(false);
    }, 1400);
  }

  return (
    <article className="group relative flex min-h-full flex-col overflow-hidden rounded-[27px] border border-black/10 bg-white transition duration-300 hover:-translate-y-1 hover:border-[#ff5a1f]/30 hover:shadow-[0_24px_65px_rgba(0,0,0,0.08)]">
      <div className="h-[5px] w-full bg-[#181818] transition duration-300 group-hover:bg-[#ff5a1f]" />

      {/* IMAGE */}

      <Link
        href={`/prodotto/${product.slug}`}
        className="relative block overflow-hidden bg-[#f0efe9]"
      >
        <div className="relative aspect-[4/3] overflow-hidden">
          {product.image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={product.image}
              alt={product.name}
              className="h-full w-full object-contain p-7 transition duration-500 group-hover:scale-[1.045]"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center">
              <div className="text-center">
                <div className="text-[13px] font-black uppercase tracking-[0.14em] text-black/20">
                  LAP GEAR
                </div>

                <div className="mt-2 text-[14px] text-black/25">
                  Immagine non disponibile
                </div>
              </div>
            </div>
          )}

          <div className="absolute left-5 top-5 rounded-full bg-white px-3.5 py-2 text-[12px] font-bold uppercase tracking-[0.08em] text-black/55 shadow-[0_5px_16px_rgba(0,0,0,0.06)]">
            {product.categoryLabel}
          </div>

          {product.brand && (
            <div className="absolute right-5 top-5 rounded-full bg-[#181818] px-3.5 py-2 text-[12px] font-bold uppercase tracking-[0.08em] text-white">
              {product.brand}
            </div>
          )}

          <div className="absolute bottom-5 right-5 flex h-11 w-11 items-center justify-center rounded-full bg-white text-[19px] text-[#181818] shadow-[0_5px_18px_rgba(0,0,0,0.08)] transition duration-300 group-hover:bg-[#ff5a1f] group-hover:text-white">
            ↗
          </div>
        </div>
      </Link>

      {/* BODY */}

      <div className="flex flex-1 flex-col p-6 sm:p-7">
        {product.brand && (
          <div className="text-[13px] font-bold uppercase tracking-[0.1em] text-[#ff5a1f]">
            {product.brand}
          </div>
        )}

        <div className="mt-2 flex items-start justify-between gap-5">
          <div className="min-w-0">
            <Link
              href={`/prodotto/${product.slug}`}
            >
              <h3 className="text-[29px] font-semibold leading-[1.03] tracking-[-0.048em] text-[#151515] transition group-hover:text-[#ff5a1f] sm:text-[31px]">
                {product.name}
              </h3>
            </Link>
          </div>

          <div className="shrink-0 text-right">
            <div className="text-[26px] font-semibold leading-none tracking-[-0.045em] text-[#151515]">
              €{price.toFixed(0)}
            </div>

            <div className="mt-1.5 text-[12px] font-semibold uppercase tracking-[0.06em] text-black/38">
              / giorno
            </div>
          </div>
        </div>

        {/* AVAILABILITY */}

        <div className="mt-6 flex items-start gap-3 rounded-[15px] bg-[#f3f2ed] px-4 py-3.5">
          <span className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full bg-[#168a50]" />

          <div>
            <div className="text-[14px] font-semibold text-black/65">
              Disponibilità su richiesta
            </div>

            <div className="mt-1 text-[13px] leading-5 text-black/42">
              Verificata sulle date e quantità indicate nel kit.
            </div>
          </div>
        </div>

        {/* ACTIONS */}

        <div className="mt-auto grid grid-cols-[1fr_auto] gap-3 border-t border-black/10 pt-6">
          <Link
            href={`/prodotto/${product.slug}`}
            className="flex h-[56px] items-center justify-center rounded-[16px] border border-black/10 bg-[#f1f0ea] px-5 text-[15px] font-semibold text-black/65 transition hover:border-black/25 hover:bg-white hover:text-black"
          >
            Dettagli
          </Link>

          <button
            type="button"
            onClick={addToKit}
            className={`
              flex
              h-[56px]
              min-w-[116px]
              items-center
              justify-center
              gap-2
              rounded-[16px]
              px-5
              text-[15px]
              font-semibold
              transition
              duration-200

              ${
                added
                  ? "bg-[#168a50] text-white"
                  : "bg-[#181818] text-white hover:bg-[#ff5a1f]"
              }
            `}
          >
            {added ? (
              <>
                <span>✓</span>
                <span>Aggiunto</span>
              </>
            ) : (
              <>
                <span className="text-[18px] leading-none">
                  +
                </span>

                <span>
                  Kit
                </span>
              </>
            )}
          </button>
        </div>
      </div>
    </article>
  );
}

export default ProductCard;