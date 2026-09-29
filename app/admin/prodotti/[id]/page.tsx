import Link from "next/link";

import {
  notFound,
  redirect,
} from "next/navigation";

import {
  ProductForm,
} from "@/components/admin/ProductForm";

import {
  createSupabaseAuthServerClient,
} from "@/lib/supabase-auth-server";

import {
  getServerSupabase,
} from "@/lib/supabase-server";


export const dynamic =
  "force-dynamic";


export default async function EditProductPage({
  params,
}: {
  params: Promise<{
    id: string;
  }>;
}) {

  /* =======================================================
     AUTH
     ======================================================= */

  const auth =
    await createSupabaseAuthServerClient();

  const {
    data: {
      user,
    },
  } =
    await auth.auth.getUser();

  const adminUserId =
    process.env.ADMIN_USER_ID;

  if (
    !user ||
    !adminUserId ||
    user.id !==
      adminUserId
  ) {
    redirect(
      "/admin/login"
    );
  }


  /* =======================================================
     ID
     ======================================================= */

  const {
    id,
  } =
    await params;

  const productId =
    Number(
      id
    );

  if (
    !Number.isFinite(
      productId
    )
  ) {
    notFound();
  }


  /* =======================================================
     SUPABASE
     ======================================================= */

  const supabase =
    getServerSupabase();

  if (!supabase) {
    throw new Error(
      "Supabase non configurato."
    );
  }


  /* =======================================================
     PRODUCT
     ======================================================= */

  const {
    data:
      product,
    error:
      productError,
  } =
    await supabase
      .from(
        "products"
      )
      .select(
        `
          id,
          name,
          slug,
          category_id,
          brand,
          short_description,
          description,
          price_day,
          deposit,
          image_url,
          active,
          featured,
          specs,
          includes,
          attributes
        `
      )
      .eq(
        "id",
        productId
      )
      .maybeSingle();

  if (
    productError
  ) {
    throw new Error(
      productError.message
    );
  }

  if (!product) {
    notFound();
  }


  /* =======================================================
     CATEGORIES
     ======================================================= */

  const {
    data:
      categories,
    error:
      categoriesError,
  } =
    await supabase
      .from(
        "categories"
      )
      .select(
        `
          id,
          name,
          slug
        `
      )
      .eq(
        "active",
        true
      )
      .order(
        "position",
        {
          ascending:
            true,
        }
      );

  if (
    categoriesError
  ) {
    throw new Error(
      categoriesError.message
    );
  }


  return (
    <main className="min-h-screen bg-[#ebeae4] px-5 pb-16 pt-6 text-[#111111] sm:px-8 lg:px-10 lg:pb-20 xl:px-14">

      <div className="mx-auto max-w-[1500px]">

        {/* =================================================
            BREADCRUMB
            ================================================= */}

        <div className="mb-5 flex items-center gap-2 overflow-hidden text-[13px] font-semibold text-black/40">

          <Link
            href="/admin"
            className="shrink-0 transition hover:text-[#ff5a1f]"
          >
            Admin
          </Link>

          <span>
            /
          </span>

          <Link
            href="/admin/prodotti"
            className="shrink-0 transition hover:text-[#ff5a1f]"
          >
            Prodotti
          </Link>

          <span>
            /
          </span>

          <span className="truncate text-black/65">
            {
              product.name
            }
          </span>

        </div>


        {/* =================================================
            HERO
            ================================================= */}

        <section className="mb-7 overflow-hidden rounded-[30px] border border-black/10 bg-white shadow-[0_18px_60px_rgba(0,0,0,0.055)]">

          <div className="grid lg:grid-cols-[1fr_330px]">

            {/* LEFT */}

            <div className="relative overflow-hidden p-8 sm:p-10">

              <div className="pointer-events-none absolute -right-28 -top-32 h-[330px] w-[330px] rounded-full bg-[#ff5a1f]/[0.07]" />

              <div className="relative">

                <div className="text-[13px] font-bold uppercase tracking-[0.13em] text-[#ff5a1f]">
                  Catalog Control
                </div>

                <h1 className="mt-3 max-w-[850px] text-[45px] font-semibold leading-[0.93] tracking-[-0.058em] sm:text-[58px]">
                  Modifica
                  <br />

                  <span className="text-[#ff5a1f]">
                    {
                      product.name
                    }
                  </span>
                </h1>


                <div className="mt-7 flex flex-wrap gap-3">

                  <Link
                    href="/admin/prodotti"
                    className="flex h-[52px] items-center justify-center rounded-[15px] border border-black/10 bg-[#f1f0ea] px-5 text-[14px] font-semibold text-black/55 transition hover:border-black/25 hover:bg-white hover:text-black"
                  >
                    ← Prodotti
                  </Link>

                  <Link
                    href={`/prodotto/${product.slug}`}
                    target="_blank"
                    className="flex h-[52px] items-center justify-center rounded-[15px] bg-[#181818] px-5 text-[14px] font-semibold text-white transition hover:bg-[#ff5a1f]"
                  >
                    Vedi pagina ↗
                  </Link>

                </div>
              </div>
            </div>


            {/* RIGHT */}

            <div className="relative overflow-hidden bg-[#181818] p-8 text-white">

              <div className="pointer-events-none absolute -right-20 -top-20 h-[210px] w-[210px] rounded-full bg-[#ff5a1f]/20" />

              <div className="relative">

                <div className="text-[11px] font-bold uppercase tracking-[0.12em] text-[#ff7b4a]">
                  Product ID
                </div>

                <div className="mt-2 text-[34px] font-semibold tracking-[-0.05em]">
                  #
                  {
                    product.id
                  }
                </div>


                <div className="mt-8 space-y-3">

                  <InfoLine
                    label="Stato"
                    value={
                      product.active
                        ? "Pubblicato"
                        : "Nascosto"
                    }
                  />

                  <InfoLine
                    label="Home"
                    value={
                      product.featured
                        ? "In evidenza"
                        : "Standard"
                    }
                  />

                  <InfoLine
                    label="Slug"
                    value={
                      product.slug
                    }
                  />

                </div>
              </div>
            </div>
          </div>
        </section>


        {/* =================================================
            FORM
            ================================================= */}

        <ProductForm
          mode="edit"
          categories={
            categories ??
            []
          }
          action={`/api/admin/products/${product.id}`}
          submitLabel="Salva modifiche"
          product={{
            id:
              product.id,

            name:
              product.name,

            slug:
              product.slug,

            category_id:
              product.category_id,

            brand:
              product.brand,

            short_description:
              product.short_description,

            description:
              product.description,

            price_day:
              product.price_day,

            deposit:
              product.deposit,

            image_url:
              product.image_url,

            active:
              product.active,

            featured:
              product.featured,

            specs:
              product.specs ??
              [],

            includes:
              product.includes ??
              [],

            attributes:
              product.attributes ??
              {},
          }}
        />

      </div>
    </main>
  );
}


/* =========================================================
   INFO LINE
   ========================================================= */

function InfoLine({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="border-b border-white/10 pb-3 last:border-b-0 last:pb-0">

      <div className="text-[10px] font-bold uppercase tracking-[0.09em] text-white/30">
        {
          label
        }
      </div>

      <div className="mt-1 break-words text-[14px] font-semibold text-white/75">
        {
          value
        }
      </div>

    </div>
  );
}