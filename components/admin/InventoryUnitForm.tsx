"use client";

import Link from "next/link";
import { useState } from "react";


export type InventoryFormProduct = {
  id: number;
  name: string;
  slug: string;

  image_url?:
    | string
    | null;

  active?:
    | boolean;
};


export type InventoryFormData = {
  product_id:
    | number
    | null;

  asset_code: string;

  serial_number:
    | string
    | null;

  status:
    | "available"
    | "maintenance"
    | "retired";

  notes:
    | string
    | null;
};


type Props = {
  products:
    InventoryFormProduct[];

  action: string;

  submitLabel: string;

  initialData?:
    InventoryFormData;
};


export function InventoryUnitForm({
  products,
  action,
  submitLabel,
  initialData,
}: Props) {
  const [
    productId,
    setProductId,
  ] =
    useState(
      initialData?.product_id
        ? String(
            initialData.product_id
          )
        : ""
    );

  const [
    status,
    setStatus,
  ] =
    useState<
      InventoryFormData["status"]
    >(
      initialData?.status ??
        "available"
    );


  const selectedProduct =
    products.find(
      (product) =>
        String(
          product.id
        ) ===
        productId
    ) ??
    null;


  return (
    <form
      action={action}
      method="post"
      className="grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_360px]"
    >

      {/* =====================================================
          MAIN
          ===================================================== */}

      <div className="space-y-6">

        {/* PRODUCT */}

        <FormPanel
          number="01"
          eyebrow="Equipment"
          title="Prodotto associato"
          description="Ogni unità fisica appartiene a una scheda del catalogo."
        >
          <Field
            label="Prodotto"
            required
          >
            <select
              name="product_id"
              required
              value={
                productId
              }
              onChange={(
                event
              ) =>
                setProductId(
                  event.target
                    .value
                )
              }
              className={
                inputClass
              }
            >
              <option value="">
                Seleziona prodotto
              </option>

              {products.map(
                (
                  product
                ) => (
                  <option
                    key={
                      product.id
                    }
                    value={
                      product.id
                    }
                  >
                    {
                      product.name
                    }
                    {product.active ===
                    false
                      ? " · non pubblicato"
                      : ""}
                  </option>
                )
              )}
            </select>
          </Field>
        </FormPanel>


        {/* IDENTIFICATION */}

        <FormPanel
          number="02"
          eyebrow="Asset"
          title="Identificazione"
          description="Asset code e seriale identificano il singolo pezzo fisico."
        >
          <div className="grid gap-5 sm:grid-cols-2">

            <Field
              label="Asset code"
              hint="Univoco"
              required
            >
              <input
                name="asset_code"
                required
                defaultValue={
                  initialData?.asset_code ??
                  ""
                }
                placeholder="Es. CAM-A7IV-01"
                className={`${inputClass} font-mono`}
              />
            </Field>


            <Field
              label="Numero seriale"
            >
              <input
                name="serial_number"
                defaultValue={
                  initialData?.serial_number ??
                  ""
                }
                placeholder="Seriale produttore"
                className={`${inputClass} font-mono`}
              />
            </Field>

          </div>
        </FormPanel>


        {/* NOTES */}

        <FormPanel
          number="03"
          eyebrow="Internal notes"
          title="Note interne"
          description="Informazioni visibili soltanto nell'area amministrativa."
        >
          <Field
            label="Note"
          >
            <textarea
              name="notes"
              rows={7}
              defaultValue={
                initialData?.notes ??
                ""
              }
              placeholder="Condizioni estetiche, accessori associati, interventi effettuati..."
              className={
                textareaClass
              }
            />
          </Field>
        </FormPanel>

      </div>


      {/* =====================================================
          SIDEBAR
          ===================================================== */}

      <aside className="space-y-5 xl:sticky xl:top-[110px]">

        {/* PREVIEW */}

        <div className="overflow-hidden rounded-[24px] border border-black/10 bg-white">

          <div className="border-b border-black/10 p-5">

            <div className="text-[11px] font-bold uppercase tracking-[0.11em] text-[#ff5a1f]">
              Unit preview
            </div>

            <div className="mt-1 text-[19px] font-semibold">
              Equipment asset
            </div>

          </div>


          <div className="flex aspect-[4/3] items-center justify-center bg-[#f1f0ea] p-6">

            {selectedProduct?.image_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={
                  selectedProduct.image_url
                }
                alt={
                  selectedProduct.name
                }
                className="h-full w-full object-contain"
              />
            ) : (
              <div className="text-center">
                <div className="text-[12px] font-black uppercase tracking-[0.13em] text-black/20">
                  LAP GEAR
                </div>

                <div className="mt-2 text-[13px] text-black/30">
                  Seleziona un prodotto
                </div>
              </div>
            )}

          </div>


          <div className="p-5">

            <div className="text-[11px] font-bold uppercase tracking-[0.09em] text-black/35">
              Prodotto
            </div>

            <div className="mt-1 text-[23px] font-semibold leading-tight tracking-[-0.035em]">
              {selectedProduct?.name ??
                "Nessun prodotto"}
            </div>

          </div>
        </div>


        {/* STATUS */}

        <div className="overflow-hidden rounded-[24px] bg-[#181818] p-6 text-white">

          <div className="text-[11px] font-bold uppercase tracking-[0.11em] text-[#ff7b4a]">
            Stato operativo
          </div>

          <h3 className="mt-2 text-[24px] font-semibold tracking-[-0.035em]">
            Stato unità.
          </h3>

          <input
            type="hidden"
            name="status"
            value={
              status
            }
          />


          <div className="mt-6 space-y-3">

            <StatusOption
              active={
                status ===
                "available"
              }
              title="Operativa"
              text="Utilizzabile per i noleggi"
              dotClass="bg-[#46c47c]"
              onClick={() =>
                setStatus(
                  "available"
                )
              }
            />

            <StatusOption
              active={
                status ===
                "maintenance"
              }
              title="Manutenzione"
              text="Esclusa temporaneamente"
              dotClass="bg-[#e4a02c]"
              onClick={() =>
                setStatus(
                  "maintenance"
                )
              }
            />

            <StatusOption
              active={
                status ===
                "retired"
              }
              title="Ritirata"
              text="Fuori servizio"
              dotClass="bg-white/30"
              onClick={() =>
                setStatus(
                  "retired"
                )
              }
            />

          </div>


          <p className="mt-5 border-t border-white/10 pt-5 text-[12px] leading-5 text-white/35">
            “Operativa” indica che
            l&apos;unità può essere usata.
            Le date effettivamente libere
            dipendono anche dalle richieste
            confermate e dai blocchi calendario.
          </p>

        </div>


        {/* SAVE */}

        <div className="rounded-[24px] border border-black/10 bg-white p-5">

          <button
            type="submit"
            className="flex h-[60px] w-full items-center justify-center rounded-[16px] bg-[#ff5a1f] px-6 text-[16px] font-semibold text-white transition hover:bg-[#181818]"
          >
            {submitLabel} →
          </button>


          <Link
            href="/admin/inventario"
            className="mt-3 flex h-[54px] w-full items-center justify-center rounded-[15px] border border-black/10 bg-[#f3f2ed] px-5 text-[14px] font-semibold text-black/55 transition hover:bg-white hover:text-black"
          >
            Annulla
          </Link>

        </div>

      </aside>

    </form>
  );
}


/* =========================================================
   PANEL
   ========================================================= */

function FormPanel({
  number,
  eyebrow,
  title,
  description,
  children,
}: {
  number: string;
  eyebrow: string;
  title: string;
  description: string;
  children:
    React.ReactNode;
}) {
  return (
    <section className="overflow-hidden rounded-[25px] border border-black/10 bg-white">

      <div className="flex gap-4 border-b border-black/10 bg-[#fbfaf7] p-6 sm:p-7">

        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#fff0e9] text-[12px] font-bold text-[#ff5a1f]">
          {number}
        </div>

        <div>

          <div className="text-[11px] font-bold uppercase tracking-[0.11em] text-[#ff5a1f]">
            {eyebrow}
          </div>

          <h2 className="mt-1 text-[25px] font-semibold tracking-[-0.04em]">
            {title}
          </h2>

          <p className="mt-2 text-[14px] leading-6 text-black/45">
            {description}
          </p>

        </div>

      </div>


      <div className="p-6 sm:p-7">
        {children}
      </div>

    </section>
  );
}


/* =========================================================
   FIELD
   ========================================================= */

function Field({
  label,
  hint,
  required = false,
  children,
}: {
  label: string;
  hint?: string;
  required?: boolean;
  children:
    React.ReactNode;
}) {
  return (
    <label className="block">

      <div className="mb-2 flex items-center justify-between gap-3">

        <span className="text-[13px] font-semibold text-black/60">
          {label}

          {required && (
            <span className="ml-1 text-[#ff5a1f]">
              *
            </span>
          )}
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


/* =========================================================
   STATUS
   ========================================================= */

function StatusOption({
  active,
  title,
  text,
  dotClass,
  onClick,
}: {
  active: boolean;
  title: string;
  text: string;
  dotClass: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={
        onClick
      }
      className={`flex w-full items-center gap-4 rounded-[16px] border p-4 text-left transition ${
        active
          ? "border-[#ff5a1f]/50 bg-[#ff5a1f]/10"
          : "border-white/10 bg-white/[0.05] hover:bg-white/[0.08]"
      }`}
    >

      <span
        className={`h-3 w-3 shrink-0 rounded-full ${dotClass}`}
      />

      <div className="min-w-0 flex-1">

        <div className="text-[14px] font-semibold">
          {title}
        </div>

        <div className="mt-0.5 text-[12px] text-white/38">
          {text}
        </div>

      </div>


      {active && (
        <span className="text-[14px] font-bold text-[#ff7b4a]">
          ✓
        </span>
      )}

    </button>
  );
}


const inputClass =
  "h-[58px] w-full rounded-[15px] border border-black/10 bg-[#f6f5f0] px-4 text-[15px] outline-none transition placeholder:text-black/25 focus:border-[#ff5a1f]/45 focus:bg-white focus:shadow-[0_0_0_4px_rgba(255,90,31,0.06)]";


const textareaClass =
  "min-h-[150px] w-full resize-y rounded-[15px] border border-black/10 bg-[#f6f5f0] px-4 py-4 text-[15px] leading-7 outline-none transition placeholder:text-black/25 focus:border-[#ff5a1f]/45 focus:bg-white focus:shadow-[0_0_0_4px_rgba(255,90,31,0.06)]";


export default InventoryUnitForm;