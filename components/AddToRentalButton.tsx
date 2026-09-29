"use client";

import {
  useState,
} from "react";

import {
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