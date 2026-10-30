"use client";

import { useMemo, useState } from "react";

type ProductOption = {
  id: number;
  name: string;
  priceDay: number;
  categoryLabel: string;
};

type ItemRow = {
  productId: number | "";
  quantity: number;
};

export type KitFormValue = {
  id?: number;
  name: string;
  slug: string;
  eyebrow: string;
  description: string;
  idealFor: string[];
  active: boolean;
  position: number;
  items: {
    productId: number;
    quantity: number;
  }[];
};

function normalizeSlug(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function KitForm({
  products,
  initialValue,
}: {
  products: ProductOption[];
  initialValue?: KitFormValue;
}) {
  const [name, setName] = useState(initialValue?.name ?? "");
  const [slug, setSlug] = useState(initialValue?.slug ?? "");
  const [slugTouched, setSlugTouched] = useState(Boolean(initialValue?.slug));
  const [items, setItems] = useState<ItemRow[]>(
    initialValue?.items?.length
      ? initialValue.items.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
        }))
      : [{ productId: "", quantity: 1 }]
  );

  const selectedIds = useMemo(
    () =>
      new Set(
        items
          .map((item) => item.productId)
          .filter((value): value is number => typeof value === "number")
      ),
    [items]
  );

  const endpoint = initialValue?.id
    ? `/api/admin/kits/${initialValue.id}`
    : "/api/admin/kits";

  function updateItem(index: number, patch: Partial<ItemRow>) {
    setItems((current) =>
      current.map((item, itemIndex) =>
        itemIndex === index ? { ...item, ...patch } : item
      )
    );
  }

  function removeItem(index: number) {
    setItems((current) => current.filter((_, itemIndex) => itemIndex !== index));
  }

  const cleanItems = items
    .filter((item): item is { productId: number; quantity: number } =>
      typeof item.productId === "number" &&
      Number.isInteger(item.quantity) &&
      item.quantity > 0
    )
    .map((item) => ({
      productId: item.productId,
      quantity: item.quantity,
    }));

  const totalPerDay = cleanItems.reduce((sum, item) => {
    const product = products.find((candidate) => candidate.id === item.productId);
    return sum + (product?.priceDay ?? 0) * item.quantity;
  }, 0);

  return (
    <form action={endpoint} method="post" className="space-y-5">
      <input
        type="hidden"
        name="items_json"
        value={JSON.stringify(cleanItems)}
      />

      <section className="grid gap-5 rounded-[24px] border border-black/10 bg-white p-5 sm:p-7 xl:grid-cols-2">
        <div>
          <label className="text-[11px] font-bold uppercase tracking-[0.1em] text-black/35">
            Nome kit
          </label>
          <input
            required
            name="name"
            value={name}
            onChange={(event) => {
              const next = event.target.value;
              setName(next);
              if (!slugTouched) {
                setSlug(normalizeSlug(next));
              }
            }}
            className="mt-2 h-[54px] w-full rounded-[15px] border border-black/10 bg-[#f5f4ef] px-4 text-[15px] outline-none focus:border-[#ff5a1f]/45 focus:bg-white"
            placeholder="Es. Kit intervista 2 camere"
          />
        </div>

        <div>
          <label className="text-[11px] font-bold uppercase tracking-[0.1em] text-black/35">
            Slug
          </label>
          <input
            required
            name="slug"
            value={slug}
            onChange={(event) => {
              setSlugTouched(true);
              setSlug(normalizeSlug(event.target.value));
            }}
            className="mt-2 h-[54px] w-full rounded-[15px] border border-black/10 bg-[#f5f4ef] px-4 text-[15px] outline-none focus:border-[#ff5a1f]/45 focus:bg-white"
          />
        </div>

        <div>
          <label className="text-[11px] font-bold uppercase tracking-[0.1em] text-black/35">
            Etichetta
          </label>
          <input
            name="eyebrow"
            defaultValue={initialValue?.eyebrow ?? ""}
            className="mt-2 h-[54px] w-full rounded-[15px] border border-black/10 bg-[#f5f4ef] px-4 text-[15px] outline-none focus:border-[#ff5a1f]/45 focus:bg-white"
            placeholder="Es. Video / Interview"
          />
        </div>

        <div>
          <label className="text-[11px] font-bold uppercase tracking-[0.1em] text-black/35">
            Ordine
          </label>
          <input
            type="number"
            name="position"
            defaultValue={initialValue?.position ?? 0}
            className="mt-2 h-[54px] w-full rounded-[15px] border border-black/10 bg-[#f5f4ef] px-4 text-[15px] outline-none focus:border-[#ff5a1f]/45 focus:bg-white"
          />
        </div>

        <div className="xl:col-span-2">
          <label className="text-[11px] font-bold uppercase tracking-[0.1em] text-black/35">
            Descrizione
          </label>
          <textarea
            name="description"
            defaultValue={initialValue?.description ?? ""}
            rows={4}
            className="mt-2 w-full rounded-[15px] border border-black/10 bg-[#f5f4ef] px-4 py-3 text-[15px] leading-6 outline-none focus:border-[#ff5a1f]/45 focus:bg-white"
          />
        </div>

        <div className="xl:col-span-2">
          <label className="text-[11px] font-bold uppercase tracking-[0.1em] text-black/35">
            Ideale per
          </label>
          <input
            name="ideal_for"
            defaultValue={(initialValue?.idealFor ?? []).join(", ")}
            className="mt-2 h-[54px] w-full rounded-[15px] border border-black/10 bg-[#f5f4ef] px-4 text-[15px] outline-none focus:border-[#ff5a1f]/45 focus:bg-white"
            placeholder="Interviste, Corporate, YouTube"
          />
          <p className="mt-2 text-[11px] text-black/35">
            Separa le voci con una virgola.
          </p>
        </div>

        <label className="xl:col-span-2 flex cursor-pointer items-center gap-3 rounded-[15px] border border-black/10 bg-[#f5f4ef] px-4 py-4">
          <input
            type="checkbox"
            name="active"
            value="true"
            defaultChecked={initialValue?.active ?? true}
            className="h-4 w-4 accent-[#ff5a1f]"
          />
          <div>
            <div className="text-[14px] font-semibold">Pubblicato</div>
            <div className="mt-0.5 text-[11px] text-black/35">
              Se disattivato, il kit resta in admin ma non appare sul sito.
            </div>
          </div>
        </label>
      </section>

      <section className="overflow-hidden rounded-[24px] border border-black/10 bg-white">
        <div className="flex flex-col gap-3 border-b border-black/10 bg-[#fbfaf7] p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
          <div>
            <div className="text-[11px] font-bold uppercase tracking-[0.1em] text-[#ff5a1f]">
              Composizione
            </div>
            <h2 className="mt-1 text-[26px] font-semibold tracking-[-0.04em]">
              Prodotti nel kit
            </h2>
          </div>

          <div className="text-[13px] font-semibold text-black/45">
            €{totalPerDay.toFixed(0)} / giorno
          </div>
        </div>

        <div className="divide-y divide-black/10">
          {items.map((item, index) => (
            <div
              key={index}
              className="grid gap-3 p-4 sm:grid-cols-[minmax(0,1fr)_120px_auto] sm:items-center sm:p-5"
            >
              <select
                value={item.productId}
                onChange={(event) =>
                  updateItem(index, {
                    productId: event.target.value
                      ? Number(event.target.value)
                      : "",
                  })
                }
                className="h-[52px] min-w-0 rounded-[14px] border border-black/10 bg-[#f5f4ef] px-4 text-[14px] font-semibold outline-none"
              >
                <option value="">Seleziona prodotto</option>
                {products.map((product) => (
                  <option
                    key={product.id}
                    value={product.id}
                    disabled={
                      selectedIds.has(product.id) &&
                      item.productId !== product.id
                    }
                  >
                    {product.name} · €{product.priceDay.toFixed(0)}
                  </option>
                ))}
              </select>

              <input
                type="number"
                min={1}
                max={99}
                value={item.quantity}
                onChange={(event) =>
                  updateItem(index, {
                    quantity: Math.max(1, Number(event.target.value) || 1),
                  })
                }
                className="h-[52px] rounded-[14px] border border-black/10 bg-[#f5f4ef] px-4 text-[14px] font-semibold outline-none"
                aria-label="Quantità"
              />

              <button
                type="button"
                onClick={() => removeItem(index)}
                disabled={items.length === 1}
                className="h-[46px] rounded-[13px] border border-black/10 px-4 text-[12px] font-semibold text-black/45 transition hover:bg-[#181818] hover:text-white disabled:cursor-not-allowed disabled:opacity-30"
              >
                Rimuovi
              </button>
            </div>
          ))}
        </div>

        <div className="border-t border-black/10 bg-[#fbfaf7] p-4 sm:p-5">
          <button
            type="button"
            onClick={() => setItems((current) => [...current, { productId: "", quantity: 1 }])}
            className="h-[46px] rounded-[13px] border border-black/10 bg-white px-4 text-[13px] font-semibold transition hover:border-[#ff5a1f]/30 hover:text-[#ff5a1f]"
          >
            + Aggiungi prodotto
          </button>
        </div>
      </section>

      <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
        <button
          type="submit"
          disabled={cleanItems.length === 0}
          className="h-[54px] rounded-[15px] bg-[#181818] px-7 text-[14px] font-semibold text-white transition hover:bg-[#ff5a1f] disabled:cursor-not-allowed disabled:opacity-40"
        >
          {initialValue?.id ? "Salva modifiche" : "Crea kit"}
        </button>
      </div>
    </form>
  );
}

export default KitForm;
