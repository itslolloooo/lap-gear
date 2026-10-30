"use client";

import {
  useState,
} from "react";

import {
  trackAnalyticsEvent,
  useRental,
} from "@/components/RentalProvider";

import type {
  Product,
} from "@/lib/types";

export function AddToRentalButton({
  product,
}: {
  product: Product;
}) {
  const {
    add,
  } =
    useRental();

  const [
    added,
    setAdded,
  ] =
    useState(false);

  function handleAdd() {
    add(product);

    trackAnalyticsEvent(
      "add_to_cart",
      {
        currency:
          "EUR",
        value:
          Number(
            product.priceDay ||
              0
          ),
        items: [
          {
            item_id:
              String(
                product.id
              ),
            item_name:
              product.name,
            item_brand:
              product.brand ||
              undefined,
            item_category:
              product.categoryLabel,
            price:
              Number(
                product.priceDay ||
                  0
              ),
            quantity:
              1,
          },
        ],
      }
    );

    setAdded(true);

    window.setTimeout(
      () => {
        setAdded(false);
      },
      1500
    );
  }

  return (
    <button
      type="button"
      onClick={
        handleAdd
      }
      className={`
        flex
        h-[62px]
        w-full
        items-center
        justify-center
        gap-3
        rounded-[17px]
        px-7
        text-[16px]
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
          <span className="text-[19px]">
            ✓
          </span>

          Aggiunto al kit
        </>
      ) : (
        <>
          <span className="text-[22px] leading-none">
            +
          </span>

          Aggiungi al kit
        </>
      )}
    </button>
  );
}

export default AddToRentalButton;