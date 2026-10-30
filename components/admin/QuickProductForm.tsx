"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

type Category = {
  id: number;
  name: string;
  slug: string;
};

export function QuickProductForm({
  categories,
}: {
  categories: Category[];
}) {
  const [name, setName] = useState("");
  const [brand, setBrand] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [priceDay, setPriceDay] = useState("");
  const [quantity, setQuantity] = useState("1");
  const [imageUrl, setImageUrl] = useState("");
  const [showAdvanced, setShowAdvanced] = useState(false);

  const selectedCategory = useMemo(
    () =>
      categories.find(
        (category) =>
          String(category.id) === categoryId
      ),
    [categories, categoryId]
  );

  const ready =
    name.trim() &&
    categoryId &&
    Number(priceDay) >= 0 &&
    Number(quantity) >= 0;

  return (
    <form
      action="/api/admin/products"
      method="post"
      className="grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_360px]"
    >
      <input type="hidden" name="slug" value="" />
      <input type="hidden" name="deposit" value="0" />
      <input type="hidden" name="attributes_json" value="{}" />
      <input type="hidden" name="active" value="false" />
      <input type="hidden" name="featured" value="false" />

      <div className="space-y-6">
        <section className="overflow-hidden rounded-[26px] border border-black/10 bg-white">
          <div className="border-b border-black/10 bg-[#fbfaf7] p-6 sm:p-7">
            <div className="text-[11px] font-bold uppercase tracking-[0.11em] text-[#ff5a1f]">
              Aggiungi gear
            </div>
            <h2 className="mt-1 text-[28px] font-semibold tracking-[-0.04em]">
              Le informazioni essenziali.
            </h2>
            <p className="mt-2 max-w-[720px] text-[14px] leading-6 text-black/45">
              Inserisci quello che serve per rendere subito utilizzabile il prodotto.
              Slug e unità di inventario vengono creati automaticamente.
            </p>
          </div>

          <div className="grid gap-5 p-6 sm:p-7 lg:grid-cols-2">
            <Field
              label="Nome prodotto"
              required
              className="lg:col-span-2"
            >
              <input
                name="name"
                required
                autoFocus
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="Es. Sony FX3"
                className={inputClass}
              />
            </Field>

            <Field label="Marca">
              <input
                name="brand"
                value={brand}
                onChange={(event) => setBrand(event.target.value)}
                placeholder="Es. Sony"
                className={inputClass}
              />
            </Field>

            <Field label="Categoria" required>
              <select
                name="category_id"
                required
                value={categoryId}
                onChange={(event) => setCategoryId(event.target.value)}
                className={inputClass}
              >
                <option value="">Seleziona categoria</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </Field>

            <Field
              label="Prezzo / giorno"
              hint="Visibile sul sito"
              required
            >
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 font-semibold text-black/35">
                  €
                </span>
                <input
                  name="price_day"
                  type="number"
                  step="0.01"
                  min="0"
                  required
                  value={priceDay}
                  onChange={(event) => setPriceDay(event.target.value)}
                  placeholder="0"
                  className={`${inputClass} pl-10`}
                />
              </div>
            </Field>

            <Field
              label="Quanti ne possiedi?"
              hint="Crea l'inventario"
              required
            >
              <input
                name="initial_quantity"
                type="number"
                min="0"
                max="99"
                step="1"
                required
                value={quantity}
                onChange={(event) => setQuantity(event.target.value)}
                className={inputClass}
              />
            </Field>

            <Field
              label="Immagine"
              hint="Facoltativa"
              className="lg:col-span-2"
            >
              <input
                name="image_url"
                type="url"
                value={imageUrl}
                onChange={(event) => setImageUrl(event.target.value)}
                placeholder="https://..."
                className={inputClass}
              />
            </Field>
          </div>
        </section>

        <section className="overflow-hidden rounded-[26px] border border-black/10 bg-white">
          <button
            type="button"
            onClick={() => setShowAdvanced((current) => !current)}
            className="flex w-full items-center justify-between gap-5 p-6 text-left sm:p-7"
          >
            <div>
              <div className="text-[11px] font-bold uppercase tracking-[0.11em] text-black/35">
                Opzionale
              </div>
              <div className="mt-1 text-[23px] font-semibold tracking-[-0.035em]">
                Aggiungi dettagli adesso
              </div>
              <p className="mt-2 text-[13px] leading-5 text-black/40">
                Puoi anche saltarli e completare la scheda in un secondo momento.
              </p>
            </div>
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#f3f2ed] text-[20px]">
              {showAdvanced ? "−" : "+"}
            </div>
          </button>

          {showAdvanced && (
            <div className="grid gap-5 border-t border-black/10 p-6 sm:p-7">
              <Field label="Descrizione breve">
                <input
                  name="short_description"
                  placeholder="Una riga che descrive il prodotto"
                  className={inputClass}
                />
              </Field>

              <Field label="Descrizione completa">
                <textarea
                  name="description"
                  rows={5}
                  placeholder="Utilizzo, caratteristiche, punti di forza..."
                  className={textareaClass}
                />
              </Field>

              <div className="grid gap-5 lg:grid-cols-2">
                <Field label="Specifiche" hint="Una per riga">
                  <textarea
                    name="specs"
                    rows={6}
                    placeholder={"4K 120p\nFull Frame\nHDMI"}
                    className={textareaClass}
                  />
                </Field>

                <Field label="Incluso nel kit" hint="Uno per riga">
                  <textarea
                    name="includes"
                    rows={6}
                    placeholder={"Batteria\nCaricatore\nCavo USB-C"}
                    className={textareaClass}
                  />
                </Field>
              </div>
            </div>
          )}
        </section>
      </div>

      <aside className="space-y-5 xl:sticky xl:top-[110px]">
        <div className="overflow-hidden rounded-[24px] bg-[#181818] p-6 text-white">
          <div className="text-[11px] font-bold uppercase tracking-[0.11em] text-[#ff7b4a]">
            Anteprima
          </div>

          <div className="mt-5 flex min-h-[190px] items-center justify-center overflow-hidden rounded-[18px] bg-white/[0.07] p-5">
            {imageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={imageUrl}
                alt=""
                className="max-h-[180px] w-full object-contain"
              />
            ) : (
              <div className="text-center text-white/25">
                <div className="text-[13px] font-black uppercase tracking-[0.12em]">
                  LAP GEAR
                </div>
                <div className="mt-2 text-[12px]">Nessuna immagine</div>
              </div>
            )}
          </div>

          <div className="mt-5">
            <div className="text-[10px] font-bold uppercase tracking-[0.1em] text-white/30">
              Prodotto
            </div>
            <div className="mt-1 text-[25px] font-semibold tracking-[-0.04em]">
              {name || "Nuovo gear"}
            </div>
            <div className="mt-2 text-[13px] text-white/45">
              {[brand, selectedCategory?.name].filter(Boolean).join(" · ") || "Completa i dati essenziali"}
            </div>
          </div>

          <div className="mt-6 grid grid-cols-2 gap-3">
            <MiniStat
              value={priceDay ? `€${priceDay}` : "—"}
              label="/ giorno"
            />
            <MiniStat
              value={quantity || "0"}
              label="unità"
            />
          </div>
        </div>

        <div className="rounded-[24px] border border-black/10 bg-white p-5">
          <div className="rounded-[16px] bg-[#f3f2ed] p-4">
            <div className="text-[12px] font-bold uppercase tracking-[0.08em] text-black/35">
              Cosa farà il sistema
            </div>
            <div className="mt-3 space-y-2 text-[13px] leading-5 text-black/52">
              <div>✓ genera automaticamente lo slug</div>
              <div>✓ crea la scheda prodotto come bozza</div>
              <div>✓ crea {quantity || "0"} unità di inventario</div>
              <div>✓ genera i codici asset
              <div>✓ non pubblica il prodotto sul sito</div></div>
            </div>
          </div>

          <button
            type="submit"
            disabled={!ready}
            className="mt-4 flex h-[62px] w-full items-center justify-center rounded-[17px] bg-[#ff5a1f] px-6 text-[16px] font-semibold text-white transition hover:bg-[#181818] disabled:cursor-not-allowed disabled:bg-black/20"
          >
            Crea gear →
          </button>

          <Link
            href="/admin/prodotti"
            className="mt-3 flex h-[52px] items-center justify-center rounded-[15px] border border-black/10 bg-[#f3f2ed] px-5 text-[14px] font-semibold text-black/55 transition hover:bg-white hover:text-black"
          >
            Annulla
          </Link>
        </div>
      </aside>
    </form>
  );
}

function Field({
  label,
  hint,
  required = false,
  className = "",
  children,
}: {
  label: string;
  hint?: string;
  required?: boolean;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <label className={`block ${className}`}>
      <div className="mb-2 flex items-center justify-between gap-3">
        <span className="text-[13px] font-semibold text-black/60">
          {label}
          {required && <span className="ml-1 text-[#ff5a1f]">*</span>}
        </span>
        {hint && (
          <span className="text-[11px] font-medium text-black/30">
            {hint}
          </span>
        )}
      </div>
      {children}
    </label>
  );
}

function MiniStat({
  value,
  label,
}: {
  value: string;
  label: string;
}) {
  return (
    <div className="rounded-[15px] border border-white/10 bg-white/[0.05] p-4">
      <div className="text-[23px] font-semibold">{value}</div>
      <div className="mt-1 text-[10px] font-bold uppercase tracking-[0.08em] text-white/30">
        {label}
      </div>
    </div>
  );
}

const inputClass =
  "h-[58px] w-full rounded-[15px] border border-black/10 bg-[#f6f5f0] px-4 text-[15px] outline-none transition placeholder:text-black/25 focus:border-[#ff5a1f]/45 focus:bg-white focus:shadow-[0_0_0_4px_rgba(255,90,31,0.06)]";

const textareaClass =
  "w-full resize-y rounded-[15px] border border-black/10 bg-[#f6f5f0] px-4 py-4 text-[15px] leading-7 outline-none transition placeholder:text-black/25 focus:border-[#ff5a1f]/45 focus:bg-white focus:shadow-[0_0_0_4px_rgba(255,90,31,0.06)]";

export default QuickProductForm;
