import {
  getServerSupabase,
} from "@/lib/supabase-server";

import type {
  CategorySlug,
  Product,
  ProductAttributes,
} from "@/lib/types";

type DatabaseCategory = {
  id: number;
  slug: string;
  name: string;
};

type DatabaseProduct = {
  id: number;

  slug: string;

  name: string;

  short_description:
    | string
    | null;

  description:
    | string
    | null;

  price_day:
    | number
    | string;

  deposit:
    | number
    | string;

  image_url:
    | string
    | null;

  category_id:
    | number
    | null;

  featured: boolean;

  specs:
    | string[]
    | null;

  includes:
    | string[]
    | null;

  brand:
    | string
    | null;

  attributes:
    | ProductAttributes
    | null;

  categories:
    | DatabaseCategory
    | DatabaseCategory[]
    | null;
};

const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1492619375914-88005aa9e8fb?auto=format&fit=crop&w=1400&q=85";

const CATEGORY_SLUGS:
  CategorySlug[] = [
    "camere",
    "ottiche",
    "audio",
    "luci",
    "video",
    "live",
    "accessori",
  ];

function getCategory(
  value:
    | DatabaseCategory
    | DatabaseCategory[]
    | null
) {
  if (!value) {
    return null;
  }

  if (
    Array.isArray(value)
  ) {
    return (
      value[0] ??
      null
    );
  }

  return value;
}

function normalizeCategorySlug(
  value:
    | string
    | null
    | undefined
): CategorySlug {
  if (
    value &&
    CATEGORY_SLUGS.includes(
      value as CategorySlug
    )
  ) {
    return value as CategorySlug;
  }

  return "accessori";
}

function normalizeAttributes(
  value:
    | ProductAttributes
    | null
    | undefined
): ProductAttributes {
  if (
    !value ||
    typeof value !==
      "object" ||
    Array.isArray(value)
  ) {
    return {};
  }

  return value;
}

async function getAvailableUnitCount(
  productId: number
) {
  const supabase =
    getServerSupabase();

  if (!supabase) {
    return 0;
  }

  const {
    count,
    error,
  } = await supabase
    .from(
      "product_units"
    )
    .select(
      "id",
      {
        count: "exact",
        head: true,
      }
    )
    .eq(
      "product_id",
      productId
    )
    .eq(
      "status",
      "available"
    );

  if (error) {
    console.error(
      `Errore conteggio unità prodotto ${productId}:`,
      error
    );

    return 0;
  }

  return count ?? 0;
}

async function mapDatabaseProduct(
  row: DatabaseProduct
): Promise<Product> {
  const category =
    getCategory(
      row.categories
    );

  const quantity =
    await getAvailableUnitCount(
      row.id
    );

  return {
    id: Number(
      row.id
    ),

    slug:
      row.slug,

    name:
      row.name,

    category:
      normalizeCategorySlug(
        category?.slug
      ),

    categoryLabel:
      category?.name ??
      "Accessori",

    shortDescription:
      row.short_description ??
      "",

    description:
      row.description ??
      "",

    priceDay:
      Number(
        row.price_day
      ),

    deposit:
      Number(
        row.deposit
      ),

    quantity,

    image:
      row.image_url ||
      FALLBACK_IMAGE,

    featured:
      row.featured ??
      false,

    specs:
      row.specs ??
      [],

    includes:
      row.includes ??
      [],

    brand:
      row.brand?.trim() ||
      null,

    attributes:
      normalizeAttributes(
        row.attributes
      ),
  };
}


/*
 * ==========================================
 * TUTTI I PRODOTTI
 * ==========================================
 */

export async function getCatalogProducts(): Promise<
  Product[]
> {
  const supabase =
    getServerSupabase();

  if (!supabase) {
    return [];
  }

  const {
    data,
    error,
  } = await supabase
    .from(
      "products"
    )
    .select(
      `
        id,
        slug,
        name,
        short_description,
        description,
        price_day,
        deposit,
        image_url,
        category_id,
        featured,
        specs,
        includes,
        brand,
        attributes,
        categories (
          id,
          slug,
          name
        )
      `
    )
    .eq(
      "active",
      true
    )
    .order(
      "name",
      {
        ascending: true,
      }
    );

  if (error) {
    console.error(
      "Errore caricamento catalogo:",
      error
    );

    return [];
  }

  const rows =
    (data ??
      []) as unknown as DatabaseProduct[];

  return Promise.all(
    rows.map(
      mapDatabaseProduct
    )
  );
}


/*
 * ==========================================
 * SINGOLO PRODOTTO
 * ==========================================
 */

export async function getCatalogProduct(
  slug: string
): Promise<
  Product | null
> {
  const supabase =
    getServerSupabase();

  if (!supabase) {
    return null;
  }

  const {
    data,
    error,
  } = await supabase
    .from(
      "products"
    )
    .select(
      `
        id,
        slug,
        name,
        short_description,
        description,
        price_day,
        deposit,
        image_url,
        category_id,
        featured,
        specs,
        includes,
        brand,
        attributes,
        categories (
          id,
          slug,
          name
        )
      `
    )
    .eq(
      "slug",
      slug
    )
    .eq(
      "active",
      true
    )
    .maybeSingle();

  if (error) {
    console.error(
      `Errore caricamento prodotto ${slug}:`,
      error
    );

    return null;
  }

  if (!data) {
    return null;
  }

  return mapDatabaseProduct(
    data as unknown as DatabaseProduct
  );
}


/*
 * ==========================================
 * CATEGORIE
 * ==========================================
 */

export async function getCatalogCategories() {
  const supabase =
    getServerSupabase();

  if (!supabase) {
    return [];
  }

  const {
    data,
    error,
  } = await supabase
    .from(
      "categories"
    )
    .select(
      `
        id,
        slug,
        name,
        position
      `
    )
    .eq(
      "active",
      true
    )
    .order(
      "position",
      {
        ascending: true,
      }
    );

  if (error) {
    console.error(
      "Errore caricamento categorie:",
      error
    );

    return [];
  }

  return data ?? [];
}