"use client";

import { useRouter } from "next/navigation";

import {
  trackAnalyticsEvent,
  useRental,
} from "@/components/RentalProvider";

import type {
  Product,
} from "@/lib/types";

export type PreparedKit = {
  slug: string;
  name: string;
  eyebrow: string;
  description: string;
  idealFor: string[];
  products: {
    product: Product;
    quantity: number;
  }[];
};

function euro(
  value: number
) {
  return new Intl.NumberFormat(
    "it-IT",
    {
      style: "currency",
      currency: "EUR",
      maximumFractionDigits: 0,
    }
  ).format(value);
}

export function PreparedKits({
  kits,
}: {
  kits: PreparedKit[];
}) {
  const {
    addMany,
  } =
    useRental();

  const router =
    useRouter();

  function addKit(
    kit: PreparedKit
  ) {
    addMany(
      kit.products
    );

    const value =
      kit.products.reduce(
        (
          total,
          item
        ) =>
          total +
          item.product.priceDay *
            item.quantity,
        0
      );

    trackAnalyticsEvent(
      "add_to_cart",
      {
        currency: "EUR",
        value,
        kit_name:
          kit.name,
        items:
          kit.products.map(
            (
              item
            ) => ({
              item_id:
                String(
                  item.product.id
                ),
              item_name:
                item.product.name,
              price:
                item.product.priceDay,
              quantity:
                item.quantity,
            })
          ),
      }
    );

    router.push(
      "/noleggio"
    );
  }

  return (
    <div className="grid gap-5 lg:grid-cols-2">
      {kits.map(
        (
          kit,
          index
        ) => {
          const price =
            kit.products.reduce(
              (
                total,
                item
              ) =>
                total +
                item.product
                  .priceDay *
                  item.quantity,
              0
            );

          const ready =
            kit.products.every(
              (
                item
              ) =>
                item.product
                  .quantity >=
                item.quantity
            );

          return (
            <article
              key={
                kit.slug
              }
              className={`overflow-hidden rounded-[28px] border ${
                index === 0
                  ? "border-[#ff5a1f]/25 bg-[#fff4ee]"
                  : "border-black/10 bg-white"
              }`}
            >
              <div className="p-6 sm:p-8">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <div className="text-[11px] font-bold uppercase tracking-[0.12em] text-[#ff5a1f]">
                      {
                        kit.eyebrow
                      }
                    </div>

                    <h2 className="mt-2 text-[34px] font-semibold leading-[0.98] tracking-[-0.05em] sm:text-[42px]">
                      {
                        kit.name
                      }
                    </h2>
                  </div>

                  <div
                    className={`rounded-full px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.07em] ${
                      ready
                        ? "bg-[#e9f6ee] text-[#168a50]"
                        : "bg-[#fff2d5] text-[#8a650f]"
                    }`}
                  >
                    {ready
                      ? "Disponibile"
                      : "Da verificare"}
                  </div>
                </div>

                <p className="mt-5 max-w-[680px] text-[14px] leading-6 text-black/50">
                  {
                    kit.description
                  }
                </p>

                <div className="mt-6 flex flex-wrap gap-2">
                  {kit.idealFor.map(
                    (
                      use
                    ) => (
                      <span
                        key={
                          use
                        }
                        className="rounded-full bg-[#f0efea] px-3 py-1.5 text-[10px] font-semibold text-black/45"
                      >
                        {use}
                      </span>
                    )
                  )}
                </div>
              </div>

              <div className="border-y border-black/10 bg-[#fbfaf7]">
                {kit.products.map(
                  (
                    item
                  ) => (
                    <div
                      key={
                        item.product
                          .id
                      }
                      className="flex items-center justify-between gap-4 border-b border-black/10 px-6 py-3.5 last:border-b-0 sm:px-8"
                    >
                      <div className="min-w-0">
                        <div className="truncate text-[13px] font-semibold">
                          {item.quantity}×{" "}
                          {
                            item.product
                              .name
                          }
                        </div>

                        <div className="mt-0.5 text-[10px] text-black/30">
                          {
                            item.product
                              .categoryLabel
                          }
                        </div>
                      </div>

                      <div className="shrink-0 text-[12px] font-semibold text-black/45">
                        {euro(
                          item.product
                            .priceDay *
                            item.quantity
                        )}
                        /gg
                      </div>
                    </div>
                  )
                )}
              </div>

              <div className="flex flex-col gap-4 p-6 sm:flex-row sm:items-end sm:justify-between sm:p-8">
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-[0.08em] text-black/30">
                    Tariffa materiale
                  </div>

                  <div className="mt-1 text-[30px] font-semibold tracking-[-0.05em]">
                    {euro(
                      price
                    )}
                    <span className="ml-1 text-[12px] font-medium text-black/35">
                      / giorno
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    addKit(
                      kit
                    )
                  }
                  disabled={
                    !ready
                  }
                  className="h-[52px] rounded-[15px] bg-[#181818] px-6 text-[13px] font-semibold text-white transition hover:bg-[#ff5a1f] disabled:cursor-not-allowed disabled:bg-black/10 disabled:text-black/30"
                >
                  {ready
                    ? "Aggiungi tutto al kit →"
                    : "Quantità non disponibile"}
                </button>
              </div>
            </article>
          );
        }
      )}
    </div>
  );
}

export default PreparedKits;
