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
  request: NextRequest,
  {
    params,
  }: {
    params: Promise<{
      id: string;
    }>;
  }
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
   * PRODUCT ID
   * ==========================================
   */

  const { id } =
    await params;

  const productId =
    Number(id);

  if (
    !Number.isInteger(
      productId
    ) ||
    productId <= 0
  ) {
    return NextResponse.json(
      {
        error:
          "ID prodotto non valido.",
      },
      {
        status: 400,
      }
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

  const slug =
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

  if (
    !name ||
    !slug ||
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
    deposit < 0
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

  const {
    error,
  } = await supabase
    .from("products")
    .update({
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
    .eq(
      "id",
      productId
    );

  if (error) {
    console.error(
      "Errore modifica prodotto:",
      error
    );

    return NextResponse.json(
      {
        error:
          error.code ===
          "23505"
            ? "Esiste già un prodotto con questo slug."
            : error.message,
      },
      {
        status:
          error.code ===
          "23505"
            ? 409
            : 500,
      }
    );
  }

  return NextResponse.redirect(
    new URL(
      "/admin/prodotti",
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