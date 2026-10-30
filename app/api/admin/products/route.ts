import {
  NextRequest,
  NextResponse,
} from "next/server";

import {
  createSupabaseAuthServerClient,
} from "@/lib/supabase-auth-server";

import {
  getServerSupabase,
} from "@/lib/supabase-server";

import type {
  ProductAttributes,
} from "@/lib/types";

export async function POST(
  request: NextRequest
) {
  /*
   * ==========================================
   * ADMIN
   * ==========================================
   */

  const auth =
    await createSupabaseAuthServerClient();

  const {
    data: { user },
  } =
    await auth.auth.getUser();

  const adminUserId =
    process.env.ADMIN_USER_ID;

  if (
    !user ||
    !adminUserId ||
    user.id !== adminUserId
  ) {
    return NextResponse.redirect(
      new URL(
        "/admin/login",
        request.url
      ),
      303
    );
  }

  /*
   * ==========================================
   * FORM
   * ==========================================
   */

  const formData =
    await request.formData();

  const name =
    text(
      formData,
      "name"
    );

  const requestedSlug =
    normalizeSlug(
      text(
        formData,
        "slug"
      )
    );

  const brand =
    text(
      formData,
      "brand"
    );

  const categoryId =
    Number(
      formData.get(
        "category_id"
      )
    );

  const shortDescription =
    text(
      formData,
      "short_description"
    );

  const description =
    text(
      formData,
      "description"
    );

  const priceDay =
    Number(
      formData.get(
        "price_day"
      )
    );

  const deposit =
    Number(
      formData.get(
        "deposit"
      )
    );

  const initialQuantityRaw =
    formData.get(
      "initial_quantity"
    );

  const initialQuantity =
    initialQuantityRaw === null
      ? 0
      : Number(
          initialQuantityRaw
        );

  const imageUrl =
    text(
      formData,
      "image_url"
    );

  const featured =
    checkbox(
      formData,
      "featured"
    );

  const active =
    checkbox(
      formData,
      "active"
    );

  const specs =
    parseMultiline(
      formData.get(
        "specs"
      )
    );

  const includes =
    parseMultiline(
      formData.get(
        "includes"
      )
    );

  const attributes =
    parseAttributes(
      formData.get(
        "attributes_json"
      )
    );

  /*
   * ==========================================
   * VALIDATION
   * ==========================================
   */

  const baseSlug =
    requestedSlug ||
    normalizeSlug(
      name
    );

  if (
    !name ||
    !baseSlug ||
    !Number.isInteger(
      categoryId
    ) ||
    categoryId <= 0 ||
    !Number.isFinite(
      priceDay
    ) ||
    !Number.isFinite(
      deposit
    ) ||
    priceDay < 0 ||
    deposit < 0 ||
    !Number.isInteger(
      initialQuantity
    ) ||
    initialQuantity < 0 ||
    initialQuantity > 99
  ) {
    return NextResponse.json(
      {
        error:
          "Dati prodotto non validi.",
      },
      {
        status: 400,
      }
    );
  }

  /*
   * ==========================================
   * DATABASE
   * ==========================================
   */

  const supabase =
    getServerSupabase();

  if (!supabase) {
    return NextResponse.json(
      {
        error:
          "Supabase non configurato.",
      },
      {
        status: 500,
      }
    );
  }

  /*
   * Verifichiamo che la categoria
   * esista realmente.
   */

  const {
    data: category,
    error:
      categoryError,
  } = await supabase
    .from("categories")
    .select(
      "id"
    )
    .eq(
      "id",
      categoryId
    )
    .maybeSingle();

  if (
    categoryError ||
    !category
  ) {
    return NextResponse.json(
      {
        error:
          "Categoria non valida.",
      },
      {
        status: 400,
      }
    );
  }

  let slug =
    baseSlug;

  if (!requestedSlug) {
    let suffix = 2;

    while (true) {
      const {
        data: existing,
        error:
          slugLookupError,
      } =
        await supabase
          .from(
            "products"
          )
          .select(
            "id"
          )
          .eq(
            "slug",
            slug
          )
          .maybeSingle();

      if (slugLookupError) {
        return NextResponse.json(
          {
            error:
              slugLookupError.message,
          },
          {
            status: 500,
          }
        );
      }

      if (!existing) {
        break;
      }

      slug =
        `${baseSlug}-${suffix}`;

      suffix += 1;
    }
  }

  const {
    data:
      createdProduct,
    error,
  } = await supabase
    .from("products")
    .insert({
      name,
      slug,

      category_id:
        categoryId,

      brand:
        brand ||
        null,

      short_description:
        shortDescription ||
        null,

      description:
        description ||
        null,

      price_day:
        priceDay,

      deposit,

      image_url:
        imageUrl ||
        null,

      featured,

      active,

      specs,

      includes,

      attributes,
    })
    .select(
      "id, slug"
    )
    .single();

  if (
    error ||
    !createdProduct
  ) {
    console.error(
      "Errore creazione prodotto:",
      error
    );

    return NextResponse.json(
      {
        error:
          error?.code ===
          "23505"
            ? "Esiste già un prodotto con questo slug."
            : error?.message ||
              "Impossibile creare il prodotto.",
      },
      {
        status:
          error?.code ===
          "23505"
            ? 409
            : 500,
      }
    );
  }

  if (
    initialQuantity >
    0
  ) {
    const units =
      Array.from(
        {
          length:
            initialQuantity,
        },
        (
          _,
          index
        ) => ({
          product_id:
            createdProduct.id,

          asset_code:
            `LAP-${String(
              createdProduct.id
            ).padStart(
              4,
              "0"
            )}-${String(
              index + 1
            ).padStart(
              2,
              "0"
            )}`,

          serial_number:
            null,

          status:
            "available",

          notes:
            null,
        })
      );

    const {
      error:
        unitsError,
    } =
      await supabase
        .from(
          "product_units"
        )
        .insert(
          units
        );

    if (unitsError) {
      console.error(
        "Errore creazione inventario iniziale:",
        unitsError
      );

      await supabase
        .from(
          "products"
        )
        .delete()
        .eq(
          "id",
          createdProduct.id
        );

      return NextResponse.json(
        {
          error:
            "Prodotto non creato: impossibile generare le unità di inventario.",
        },
        {
          status: 500,
        }
      );
    }
  }

  return NextResponse.redirect(
    new URL(
      `/admin/prodotti/${createdProduct.id}?created=1`,
      request.url
    ),
    303
  );
}


/* =========================================================
   HELPERS
   ========================================================= */

function text(
  formData: FormData,
  key: string
) {
  return String(
    formData.get(key) ??
      ""
  ).trim();
}

function checkbox(
  formData: FormData,
  key: string
) {
  return (
    formData.get(
      key
    ) === "true"
  );
}

function parseMultiline(
  value:
    FormDataEntryValue
    | null
) {
  return String(
    value ?? ""
  )
    .split("\n")
    .map(
      (item) =>
        item.trim()
    )
    .filter(Boolean);
}

function normalizeSlug(
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

function parseAttributes(
  value:
    FormDataEntryValue
    | null
): ProductAttributes {
  if (!value) {
    return {};
  }

  try {
    const parsed =
      JSON.parse(
        String(value)
      );

    if (
      !parsed ||
      typeof parsed !==
        "object" ||
      Array.isArray(
        parsed
      )
    ) {
      return {};
    }

    const result:
      ProductAttributes =
      {};

    for (
      const [
        key,
        raw,
      ] of Object.entries(
        parsed
      )
    ) {
      if (
        !/^[a-z0-9_]+$/.test(
          key
        )
      ) {
        continue;
      }

      if (
        typeof raw ===
        "string"
      ) {
        const clean =
          raw.trim();

        if (clean) {
          result[key] =
            clean;
        }

        continue;
      }

      if (
        typeof raw ===
          "number" &&
        Number.isFinite(
          raw
        )
      ) {
        result[key] =
          raw;

        continue;
      }

      if (
        typeof raw ===
        "boolean"
      ) {
        result[key] =
          raw;

        continue;
      }

      if (
        Array.isArray(raw)
      ) {
        if (
          raw.every(
            (item) =>
              typeof item ===
              "string"
          )
        ) {
          const values =
            raw
              .map(
                (item) =>
                  item.trim()
              )
              .filter(
                Boolean
              );

          if (
            values.length >
            0
          ) {
            result[key] =
              values;
          }
        } else if (
          raw.every(
            (item) =>
              typeof item ===
                "number" &&
              Number.isFinite(
                item
              )
          )
        ) {
          result[key] =
            raw;
        }
      }
    }

    return result;
  } catch {
    return {};
  }
}