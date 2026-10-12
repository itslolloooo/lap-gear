"use client";

import {
  FormEvent,
  useMemo,
  useState,
} from "react";

import {
  useRouter,
} from "next/navigation";


type Category = {
  id: number;
  name: string;
  slug: string;
  position: number;
  active: boolean;
};


type Props = {
  categories: Category[];
};


function slugPreview(
  value: string
) {
  return value
    .normalize("NFD")
    .replace(
      /[\u0300-\u036f]/g,
      ""
    )
    .toLowerCase()
    .trim()
    .replace(
      /[^a-z0-9]+/g,
      "-"
    )
    .replace(
      /^-+|-+$/g,
      ""
    );
}


export function CategoryManager({
  categories,
}: Props) {
  const router =
    useRouter();

  const [
    name,
    setName,
  ] = useState("");

  const [
    loading,
    setLoading,
  ] = useState(false);

  const [
    error,
    setError,
  ] = useState("");

  const [
    message,
    setMessage,
  ] = useState("");

  const preview =
    useMemo(
      () =>
        slugPreview(
          name
        ),
      [name]
    );


  async function submit(
    event:
      FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    const cleaned =
      name.trim();

    if (
      cleaned.length < 2
    ) {
      setError(
        "Inserisci un nome categoria valido."
      );
      return;
    }

    setLoading(true);
    setError("");
    setMessage("");

    try {
      const response =
        await fetch(
          "/api/admin/categories",
          {
            method: "POST",
            headers: {
              "Content-Type":
                "application/json",
              Accept:
                "application/json",
            },
            cache:
              "no-store",
            body:
              JSON.stringify({
                name:
                  cleaned,
              }),
          }
        );

      const result =
        await response.json();

      if (
        !response.ok ||
        !result?.ok
      ) {
        throw new Error(
          result?.error ??
            "Impossibile creare la categoria."
        );
      }

      setName("");
      setMessage(
        `Categoria “${result.category?.name ?? cleaned}” creata.`
      );

      router.refresh();
    } catch (
      submitError
    ) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Impossibile creare la categoria."
      );
    } finally {
      setLoading(false);
    }
  }


  return (
    <div className="grid gap-6 lg:grid-cols-[420px_minmax(0,1fr)]">
      <section className="rounded-[26px] border border-black/10 bg-white p-6 sm:p-7">
        <div className="text-[11px] font-bold uppercase tracking-[0.11em] text-[#ff5a1f]">
          Nuova categoria
        </div>

        <h2 className="mt-2 text-[29px] font-semibold tracking-[-0.045em]">
          Aggiungila al catalogo.
        </h2>

        <p className="mt-2 text-[14px] leading-6 text-black/45">
          Dopo il salvataggio comparirà automaticamente tra le categorie disponibili quando crei o modifichi un prodotto.
        </p>

        <form
          onSubmit={submit}
          className="mt-6"
        >
          <label className="block">
            <span className="text-[11px] font-bold uppercase tracking-[0.1em] text-black/35">
              Nome categoria
            </span>

            <input
              value={name}
              onChange={(event) =>
                setName(
                  event.target.value
                )
              }
              maxLength={60}
              placeholder="Es. Stabilizzatori"
              className="mt-2 h-[58px] w-full rounded-[15px] border border-black/10 bg-[#f6f5f0] px-4 text-[15px] font-semibold outline-none transition placeholder:text-black/25 focus:border-[#ff5a1f]/45 focus:bg-white"
            />
          </label>

          <div className="mt-3 rounded-[14px] bg-[#f3f2ed] px-4 py-3 text-[12px] text-black/40">
            Slug generato: <span className="font-mono font-semibold text-black/60">{preview || "—"}</span>
          </div>

          <button
            type="submit"
            disabled={
              loading ||
              name.trim().length < 2
            }
            className="mt-5 flex h-[56px] w-full items-center justify-center rounded-[15px] bg-[#181818] px-5 text-[14px] font-semibold text-white transition hover:bg-[#ff5a1f] disabled:cursor-not-allowed disabled:opacity-40"
          >
            {loading
              ? "Creo..."
              : "+ Aggiungi categoria"}
          </button>
        </form>

        {message && (
          <div className="mt-4 rounded-[14px] border border-[#168a50]/15 bg-[#e9f6ee] px-4 py-3 text-[13px] font-semibold text-[#168a50]">
            ✓ {message}
          </div>
        )}

        {error && (
          <div className="mt-4 rounded-[14px] border border-[#cf3d32]/15 bg-[#fff0ee] px-4 py-3 text-[13px] font-medium leading-6 text-[#9d352c]">
            {error}
          </div>
        )}
      </section>

      <section className="overflow-hidden rounded-[26px] border border-black/10 bg-white">
        <div className="border-b border-black/10 bg-[#fbfaf7] p-6 sm:p-7">
          <div className="flex items-end justify-between gap-4">
            <div>
              <div className="text-[11px] font-bold uppercase tracking-[0.11em] text-[#ff5a1f]">
                Catalogo
              </div>

              <h2 className="mt-2 text-[29px] font-semibold tracking-[-0.045em]">
                Categorie attive.
              </h2>
            </div>

            <div className="rounded-full bg-[#f1f0ea] px-4 py-2 text-[12px] font-semibold text-black/45">
              {categories.length}
            </div>
          </div>
        </div>

        {categories.length > 0 ? (
          <div className="divide-y divide-black/10">
            {categories.map(
              (
                category,
                index
              ) => (
                <div
                  key={
                    category.id
                  }
                  className="grid gap-3 p-5 sm:grid-cols-[54px_minmax(0,1fr)_auto] sm:items-center sm:px-6"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-[12px] bg-[#f1f0ea] text-[12px] font-bold text-black/35">
                    {String(
                      index + 1
                    ).padStart(
                      2,
                      "0"
                    )}
                  </div>

                  <div className="min-w-0">
                    <div className="truncate text-[16px] font-semibold">
                      {category.name}
                    </div>

                    <div className="mt-1 truncate font-mono text-[11px] text-black/35">
                      /{category.slug}
                    </div>
                  </div>

                  <div className="rounded-full bg-[#e9f6ee] px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.07em] text-[#168a50]">
                    Attiva
                  </div>
                </div>
              )
            )}
          </div>
        ) : (
          <div className="p-8 text-[14px] text-black/40">
            Nessuna categoria presente.
          </div>
        )}
      </section>
    </div>
  );
}


export default CategoryManager;
