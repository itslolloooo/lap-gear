"use client";

import {
  useMemo,
  useState,
} from "react";

import type {
  ReactNode,
} from "react";

import {
  usePathname,
  useRouter,
  useSearchParams,
} from "next/navigation";

import {
  ProductCard,
} from "@/components/ProductCard";

import {
  getCategoryFacets,
  getFacetOptions,
  getProductSearchText,
} from "@/lib/catalog-filters";

import type {
  Product,
} from "@/lib/types";


type CatalogCategory = {
  id: number;
  slug: string;
  name: string;
  position: number;
};

type CatalogClientProps = {
  products: Product[];
  categories: CatalogCategory[];
};

type SortMode =
  | "featured"
  | "price-asc"
  | "price-desc"
  | "name";

type SelectedFacets =
  Record<
    string,
    string[]
  >;

type NormalizedFacet = {
  key: string;
  label: string;
};

type NormalizedOption = {
  value: string;
  label: string;
};


/* =========================================================
   TYPED ADAPTERS
   ========================================================= */

const readCategoryFacets =
  getCategoryFacets as unknown as (
    category: string
  ) => unknown[];

const readFacetOptions =
  getFacetOptions as unknown as (
    products: Product[],
    key: string
  ) => unknown[];

const readSearchText =
  getProductSearchText as unknown as (
    product: Product
  ) => string;


/* =========================================================
   COMPONENT
   ========================================================= */

export function CatalogClient({
  products,
  categories,
}: CatalogClientProps) {
  const searchParams =
    useSearchParams();

  const router =
    useRouter();

  const pathname =
    usePathname();

  /*
   * ==========================================
   * INITIAL CATEGORY
   * ==========================================
   */

  const requestedCategory =
    searchParams.get(
      "categoria"
    );

  const validCategory =
    requestedCategory &&
    categories.some(
      (item) =>
        item.slug ===
        requestedCategory
    )
      ? requestedCategory
      : "tutti";

  const [
    category,
    setCategory,
  ] =
    useState(
      validCategory
    );

  /*
   * Header search uses ?q=
   */

  const [
    search,
    setSearch,
  ] =
    useState(
      searchParams.get(
        "q"
      ) ?? ""
    );

  const [
    selectedBrands,
    setSelectedBrands,
  ] =
    useState<string[]>(
      []
    );

  const [
    selectedFacets,
    setSelectedFacets,
  ] =
    useState<SelectedFacets>(
      {}
    );

  const [
    sort,
    setSort,
  ] =
    useState<SortMode>(
      "featured"
    );

  const [
    showFilters,
    setShowFilters,
  ] =
    useState(false);


  /* =========================================================
     PRICE
     ========================================================= */

  const catalogMaxPrice =
    useMemo(() => {
      return Math.max(
        0,
        ...products.map(
          (product) =>
            Number(
              product.priceDay
            ) || 0
        )
      );
    }, [products]);

  const rangeMax =
    Math.max(
      5,
      Math.ceil(
        catalogMaxPrice /
          5
      ) * 5
    );

  const [
    maxPrice,
    setMaxPrice,
  ] =
    useState(
      rangeMax
    );


  /* =========================================================
     PRODUCTS FOR CURRENT CATEGORY
     ========================================================= */

  const categoryProducts =
    useMemo(() => {
      if (
        category ===
        "tutti"
      ) {
        return products;
      }

      return products.filter(
        (product) =>
          product.category ===
          category
      );
    }, [
      products,
      category,
    ]);


  /* =========================================================
     BRANDS
     ========================================================= */

  const brands =
    useMemo(() => {
      return Array.from(
        new Set(
          categoryProducts
            .map(
              (product) =>
                product.brand
                  ?.trim()
            )
            .filter(
              (
                value
              ): value is string =>
                Boolean(
                  value
                )
            )
        )
      ).sort(
        (a, b) =>
          a.localeCompare(
            b,
            "it"
          )
      );
    }, [
      categoryProducts,
    ]);


  /* =========================================================
     CATEGORY FACETS
     ========================================================= */

  const categoryFacets =
    useMemo<
      NormalizedFacet[]
    >(() => {
      if (
        category ===
        "tutti"
      ) {
        return [];
      }

      const raw =
        readCategoryFacets(
          category
        );

      return raw
        .map(
          (
            facet
          ): NormalizedFacet | null => {
            if (
              !facet ||
              typeof facet !==
                "object"
            ) {
              return null;
            }

            const record =
              facet as Record<
                string,
                unknown
              >;

            const key =
              String(
                record.key ??
                  record.id ??
                  ""
              );

            if (!key) {
              return null;
            }

            return {
              key,

              label:
                String(
                  record.label ??
                    record.title ??
                    humanize(
                      key
                    )
                ),
            };
          }
        )
        .filter(
          (
            facet
          ): facet is NormalizedFacet =>
            Boolean(
              facet
            )
        );
    }, [
      category,
    ]);


  /* =========================================================
     CATEGORY COUNTS
     ========================================================= */

  const categoryCounts =
    useMemo(() => {
      const counts:
        Record<
          string,
          number
        > = {};

      products.forEach(
        (product) => {
          counts[
            product.category
          ] =
            (
              counts[
                product.category
              ] ?? 0
            ) + 1;
        }
      );

      return counts;
    }, [products]);


  /* =========================================================
     FILTERING
     ========================================================= */

  const filteredProducts =
    useMemo(() => {
      const term =
        search
          .trim()
          .toLowerCase();

      let result =
        products.filter(
          (product) => {
            /*
             * Categoria
             */

            const categoryOk =
              category ===
                "tutti" ||
              product.category ===
                category;

            /*
             * Ricerca
             */

            const searchable =
              String(
                readSearchText(
                  product
                ) ?? ""
              ).toLowerCase();

            const searchOk =
              !term ||
              searchable.includes(
                term
              );

            /*
             * Brand
             */

            const brand =
              product.brand
                ?.trim() ??
              "";

            const brandOk =
              selectedBrands.length ===
                0 ||
              selectedBrands.includes(
                brand
              );

            /*
             * Price
             */

            const priceOk =
              Number(
                product.priceDay
              ) <= maxPrice;

            /*
             * Structured attributes
             */

            const facetsOk =
              categoryFacets.every(
                (facet) => {
                  const selected =
                    selectedFacets[
                      facet.key
                    ] ?? [];

                  if (
                    selected.length ===
                    0
                  ) {
                    return true;
                  }

                  const values =
                    getAttributeValues(
                      product,
                      facet.key
                    );

                  return selected.some(
                    (
                      selectedValue
                    ) =>
                      values.includes(
                        normalizeValue(
                          selectedValue
                        )
                      )
                  );
                }
              );

            return (
              categoryOk &&
              searchOk &&
              brandOk &&
              priceOk &&
              facetsOk
            );
          }
        );

      result = [
        ...result,
      ];

      switch (sort) {
        case "price-asc":
          result.sort(
            (a, b) =>
              Number(
                a.priceDay
              ) -
              Number(
                b.priceDay
              )
          );

          break;

        case "price-desc":
          result.sort(
            (a, b) =>
              Number(
                b.priceDay
              ) -
              Number(
                a.priceDay
              )
          );

          break;

        case "name":
          result.sort(
            (a, b) =>
              a.name.localeCompare(
                b.name,
                "it"
              )
          );

          break;

        case "featured":
        default:
          result.sort(
            (a, b) => {
              const featuredDiff =
                Number(
                  Boolean(
                    b.featured
                  )
                ) -
                Number(
                  Boolean(
                    a.featured
                  )
                );

              if (
                featuredDiff !==
                0
              ) {
                return featuredDiff;
              }

              return (
                a.name.localeCompare(
                  b.name,
                  "it"
                )
              );
            }
          );

          break;
      }

      return result;
    }, [
      products,
      search,
      category,
      selectedBrands,
      selectedFacets,
      maxPrice,
      sort,
      categoryFacets,
    ]);


  /* =========================================================
     ACTIVE FILTER COUNT
     ========================================================= */

  const selectedFacetCount =
    Object.values(
      selectedFacets
    ).reduce(
      (
        total,
        values
      ) =>
        total +
        values.length,
      0
    );

  const activeFilters =
    selectedBrands.length +
    selectedFacetCount +
    (
      maxPrice <
      rangeMax
        ? 1
        : 0
    );


  /* =========================================================
     ACTIVE CATEGORY
     ========================================================= */

  const activeCategory =
    categories.find(
      (item) =>
        item.slug ===
        category
    );

  const activeCategoryName =
    category ===
    "tutti"
      ? "Tutto il catalogo"
      : activeCategory
          ?.name ??
        "Catalogo";


  /* =========================================================
     ACTIONS
     ========================================================= */

  function changeCategory(
    nextCategory: string
  ) {
    setCategory(
      nextCategory
    );

    setSelectedBrands(
      []
    );

    setSelectedFacets(
      {}
    );

    setMaxPrice(
      rangeMax
    );

    const params =
      new URLSearchParams(
        searchParams.toString()
      );

    if (
      nextCategory ===
      "tutti"
    ) {
      params.delete(
        "categoria"
      );
    } else {
      params.set(
        "categoria",
        nextCategory
      );
    }

    const query =
      params.toString();

    router.replace(
      query
        ? `${pathname}?${query}`
        : pathname,
      {
        scroll: false,
      }
    );
  }


  function toggleBrand(
    brand: string
  ) {
    setSelectedBrands(
      (current) =>
        current.includes(
          brand
        )
          ? current.filter(
              (item) =>
                item !==
                brand
            )
          : [
              ...current,
              brand,
            ]
    );
  }


  function toggleFacet(
    key: string,
    value: string
  ) {
    setSelectedFacets(
      (current) => {
        const values =
          current[
            key
          ] ?? [];

        const next =
          values.includes(
            value
          )
            ? values.filter(
                (item) =>
                  item !==
                  value
              )
            : [
                ...values,
                value,
              ];

        return {
          ...current,
          [key]:
            next,
        };
      }
    );
  }


  function clearFilters() {
    setSelectedBrands(
      []
    );

    setSelectedFacets(
      {}
    );

    setMaxPrice(
      rangeMax
    );

    setSort(
      "featured"
    );
  }


  function clearEverything() {
    setSearch("");

    clearFilters();

    const params =
      new URLSearchParams(
        searchParams.toString()
      );

    params.delete(
      "q"
    );

    const query =
      params.toString();

    router.replace(
      query
        ? `${pathname}?${query}`
        : pathname,
      {
        scroll: false,
      }
    );
  }


  /* =========================================================
     UI
     ========================================================= */

  return (
    <>

      {/* =====================================================
          CONTROL PANEL
          ===================================================== */}

      <section className="sticky top-[78px] z-30 overflow-hidden rounded-[26px] border border-black/10 bg-[#ebeae4]/95 shadow-[0_15px_45px_rgba(0,0,0,0.055)] backdrop-blur-xl lg:top-[88px]">

        {/* SEARCH ROW */}

        <div className="p-4 sm:p-5 lg:p-6">
          <div className="flex flex-col gap-3 xl:flex-row">

            {/* SEARCH */}

            <div className="relative min-w-0 flex-1">
              <span className="pointer-events-none absolute left-5 top-1/2 -translate-y-1/2 text-black/35">
                <SearchIcon />
              </span>

              <input
                type="search"
                value={
                  search
                }
                onChange={(
                  event
                ) =>
                  setSearch(
                    event.target
                      .value
                  )
                }
                placeholder={getSearchPlaceholder(
                  category
                )}
                className="h-[64px] w-full rounded-[18px] border border-black/10 bg-white pl-14 pr-14 text-[17px] font-medium outline-none transition placeholder:text-black/30 focus:border-[#ff5a1f]/50 focus:shadow-[0_0_0_4px_rgba(255,90,31,0.07)] lg:h-[68px]"
              />

              {search && (
                <button
                  type="button"
                  aria-label="Cancella ricerca"
                  onClick={() =>
                    setSearch(
                      ""
                    )
                  }
                  className="absolute right-4 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-[#efeee8] text-[20px] text-black/45 transition hover:bg-[#181818] hover:text-white"
                >
                  ×
                </button>
              )}
            </div>

            {/* FILTERS */}

            <button
              type="button"
              onClick={() =>
                setShowFilters(
                  (
                    current
                  ) =>
                    !current
                )
              }
              className={`
                flex
                h-[64px]
                shrink-0
                items-center
                justify-between
                gap-5
                rounded-[18px]
                border
                px-6
                text-[16px]
                font-semibold
                transition
                lg:h-[68px]

                ${
                  showFilters ||
                  activeFilters >
                    0
                    ? "border-[#181818] bg-[#181818] text-white"
                    : "border-black/10 bg-white text-[#181818] hover:border-black/25"
                }
              `}
            >
              <span className="flex items-center gap-3">
                <FilterIcon />

                Filtri
              </span>

              {activeFilters >
                0 && (
                <span className="flex h-7 min-w-7 items-center justify-center rounded-full bg-[#ff5a1f] px-2 text-[12px] font-bold text-white">
                  {
                    activeFilters
                  }
                </span>
              )}
            </button>

            {/* SORT */}

            <div className="relative shrink-0">
              <select
                value={
                  sort
                }
                onChange={(
                  event
                ) =>
                  setSort(
                    event.target
                      .value as SortMode
                  )
                }
                className="h-[64px] w-full min-w-[220px] appearance-none rounded-[18px] border border-black/10 bg-white px-5 pr-12 text-[15px] font-semibold outline-none transition hover:border-black/25 lg:h-[68px]"
              >
                <option value="featured">
                  In evidenza
                </option>

                <option value="price-asc">
                  Prezzo crescente
                </option>

                <option value="price-desc">
                  Prezzo decrescente
                </option>

                <option value="name">
                  Nome A–Z
                </option>
              </select>

              <span className="pointer-events-none absolute right-5 top-1/2 -translate-y-1/2 text-[13px] text-black/40">
                ↓
              </span>
            </div>
          </div>
        </div>


        {/* =====================================================
            CATEGORIES
            ===================================================== */}

        <div className="border-t border-black/10 bg-white px-4 py-4 sm:px-5 lg:px-6">
          <div className="flex gap-2.5 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">

            <CategoryButton
              active={
                category ===
                "tutti"
              }
              count={
                products.length
              }
              onClick={() =>
                changeCategory(
                  "tutti"
                )
              }
            >
              Tutto
            </CategoryButton>

            {categories.map(
              (item) => (
                <CategoryButton
                  key={
                    item.slug
                  }
                  active={
                    category ===
                    item.slug
                  }
                  count={
                    categoryCounts[
                      item.slug
                    ] ?? 0
                  }
                  onClick={() =>
                    changeCategory(
                      item.slug
                    )
                  }
                >
                  {
                    item.name
                  }
                </CategoryButton>
              )
            )}
          </div>
        </div>


        {/* =====================================================
            FILTER PANEL
            ===================================================== */}

        {showFilters && (
          <div className="border-t border-black/10 bg-[#f2f1eb] p-5 sm:p-6 lg:p-7">

            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <div className="text-[12px] font-bold uppercase tracking-[0.13em] text-[#ff5a1f]">
                  Filtri catalogo
                </div>

                <h3 className="mt-2 text-[30px] font-semibold tracking-[-0.045em]">
                  {
                    activeCategoryName
                  }
                </h3>
              </div>

              {activeFilters >
                0 && (
                <button
                  type="button"
                  onClick={
                    clearFilters
                  }
                  className="self-start rounded-[14px] border border-black/10 bg-white px-4 py-3 text-[14px] font-semibold text-black/55 transition hover:border-black/25 hover:text-black sm:self-auto"
                >
                  Reset filtri
                </button>
              )}
            </div>


            <div className="mt-7 grid gap-4 lg:grid-cols-2 xl:grid-cols-3">

              {/* BRAND */}

              {brands.length >
                0 && (
                <FilterSection
                  eyebrow="01"
                  title="Marca"
                >
                  <div className="flex flex-wrap gap-2">
                    {brands.map(
                      (
                        brand
                      ) => (
                        <FilterPill
                          key={
                            brand
                          }
                          active={selectedBrands.includes(
                            brand
                          )}
                          onClick={() =>
                            toggleBrand(
                              brand
                            )
                          }
                        >
                          {
                            brand
                          }
                        </FilterPill>
                      )
                    )}
                  </div>
                </FilterSection>
              )}


              {/* STRUCTURED FACETS */}

              {categoryFacets.map(
                (
                  facet,
                  index
                ) => {
                  const rawOptions =
                    readFacetOptions(
                      categoryProducts,
                      facet.key
                    );

                  const options =
                    rawOptions
                      .map(
                        normalizeFacetOption
                      )
                      .filter(
                        (
                          option
                        ): option is NormalizedOption =>
                          Boolean(
                            option
                          )
                      );

                  if (
                    options.length ===
                    0
                  ) {
                    return null;
                  }

                  return (
                    <FilterSection
                      key={
                        facet.key
                      }
                      eyebrow={String(
                        index +
                          2
                      ).padStart(
                        2,
                        "0"
                      )}
                      title={
                        facet.label
                      }
                    >
                      <div className="flex flex-wrap gap-2">
                        {options.map(
                          (
                            option
                          ) => (
                            <FilterPill
                              key={
                                option.value
                              }
                              active={(
                                selectedFacets[
                                  facet.key
                                ] ??
                                []
                              ).includes(
                                option.value
                              )}
                              onClick={() =>
                                toggleFacet(
                                  facet.key,
                                  option.value
                                )
                              }
                            >
                              {
                                option.label
                              }
                            </FilterPill>
                          )
                        )}
                      </div>
                    </FilterSection>
                  );
                }
              )}


              {/* PRICE */}

              <FilterSection
                eyebrow="€"
                title="Prezzo massimo / giorno"
              >
                <div className="flex items-end justify-between gap-5">
                  <div className="text-[14px] font-medium text-black/45">
                    Fino a
                  </div>

                  <div className="text-[30px] font-semibold leading-none tracking-[-0.045em]">
                    €
                    {
                      maxPrice
                    }
                  </div>
                </div>

                <input
                  type="range"
                  min={0}
                  max={
                    rangeMax
                  }
                  step={5}
                  value={
                    maxPrice
                  }
                  onChange={(
                    event
                  ) =>
                    setMaxPrice(
                      Number(
                        event.target
                          .value
                      )
                    )
                  }
                  className="mt-6 w-full accent-[#ff5a1f]"
                />

                <div className="mt-3 flex justify-between text-[12px] font-semibold text-black/35">
                  <span>
                    €0
                  </span>

                  <span>
                    €
                    {
                      rangeMax
                    }
                  </span>
                </div>
              </FilterSection>
            </div>
          </div>
        )}
      </section>


      {/* =====================================================
          RESULTS HEADER
          ===================================================== */}

      <div className="flex flex-col gap-5 py-9 sm:flex-row sm:items-end sm:justify-between lg:py-11">
        <div>
          <div className="text-[13px] font-bold uppercase tracking-[0.13em] text-[#ff5a1f]">
            {
              activeCategoryName
            }
          </div>

          <div className="mt-2 text-[36px] font-semibold leading-none tracking-[-0.05em] sm:text-[42px]">
            {
              filteredProducts.length
            }{" "}
            {filteredProducts.length ===
            1
              ? "prodotto"
              : "prodotti"}
          </div>
        </div>

        {(search ||
          activeFilters >
            0) && (
          <button
            type="button"
            onClick={
              clearEverything
            }
            className="self-start rounded-[14px] border border-black/10 bg-white px-5 py-3.5 text-[14px] font-semibold text-black/55 transition hover:border-black/25 hover:text-black sm:self-auto"
          >
            Cancella ricerca e filtri
          </button>
        )}
      </div>


      {/* =====================================================
          PRODUCTS
          ===================================================== */}

      {filteredProducts.length >
      0 ? (
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
          {filteredProducts.map(
            (product) => (
              <ProductCard
                key={
                  product.id
                }
                product={
                  product
                }
              />
            )
          )}
        </div>
      ) : (
        <div className="overflow-hidden rounded-[28px] border border-black/10 bg-white">
          <div className="grid min-h-[440px] lg:grid-cols-[1fr_320px]">

            <div className="flex items-center p-8 sm:p-12">
              <div className="max-w-[600px]">
                <div className="text-[13px] font-bold uppercase tracking-[0.13em] text-[#ff5a1f]">
                  Nessun risultato
                </div>

                <h2 className="mt-3 text-[42px] font-semibold leading-[0.95] tracking-[-0.055em] sm:text-[52px]">
                  Prova ad ampliare
                  <br />
                  la ricerca.
                </h2>

                <p className="mt-5 text-[17px] leading-8 text-black/50">
                  Rimuovi uno o più
                  filtri oppure aumenta
                  il prezzo massimo.
                </p>

                <button
                  type="button"
                  onClick={
                    clearEverything
                  }
                  className="mt-8 h-[56px] rounded-[16px] bg-[#181818] px-6 text-[15px] font-semibold text-white transition hover:bg-[#ff5a1f]"
                >
                  Reset ricerca
                </button>
              </div>
            </div>

            <div className="relative hidden overflow-hidden bg-[#181818] lg:block">
              <div className="absolute -right-20 -top-20 h-[230px] w-[230px] rounded-full bg-[#ff5a1f]/20" />

              <div className="absolute bottom-10 left-10">
                <div className="text-[12px] font-bold uppercase tracking-[0.12em] text-[#ff7b4a]">
                  LAP GEAR
                </div>

                <div className="mt-2 text-[24px] font-semibold text-white">
                  Equipment
                  <br />
                  Library.
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}


/* =========================================================
   ATTRIBUTE HELPERS
   ========================================================= */

function getAttributeValues(
  product: Product,
  key: string
) {
  const attributes =
    product.attributes ??
    {};

  const value =
    attributes[
      key
    ];

  if (
    value === null ||
    value === undefined ||
    value === ""
  ) {
    return [];
  }

  if (
    Array.isArray(
      value
    )
  ) {
    return value.map(
      (item) =>
        normalizeValue(
          item
        )
    );
  }

  return [
    normalizeValue(
      value
    ),
  ];
}


function normalizeValue(
  value: unknown
) {
  return String(
    value
  )
    .trim()
    .toLowerCase();
}


function normalizeFacetOption(
  option: unknown
): NormalizedOption | null {
  if (
    typeof option ===
      "string" ||
    typeof option ===
      "number"
  ) {
    const value =
      String(
        option
      );

    return {
      value,
      label:
        humanize(
          value
        ),
    };
  }

  if (
    !option ||
    typeof option !==
      "object"
  ) {
    return null;
  }

  const record =
    option as Record<
      string,
      unknown
    >;

  const value =
    record.value ??
    record.id ??
    record.key;

  if (
    value === null ||
    value === undefined
  ) {
    return null;
  }

  const stringValue =
    String(
      value
    );

  return {
    value:
      stringValue,

    label:
      String(
        record.label ??
          record.name ??
          humanize(
            stringValue
          )
      ),
  };
}


function humanize(
  value: string
) {
  return value
    .replace(
      /[_-]+/g,
      " "
    )
    .replace(
      /\b\w/g,
      (letter) =>
        letter.toUpperCase()
    );
}


/* =========================================================
   UI
   ========================================================= */

function CategoryButton({
  active,
  count,
  onClick,
  children,
}: {
  active: boolean;
  count: number;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={
        onClick
      }
      className={`
        group
        flex
        h-[50px]
        shrink-0
        items-center
        gap-3
        rounded-full
        border
        px-5
        text-[15px]
        font-semibold
        transition

        ${
          active
            ? "border-[#181818] bg-[#181818] text-white"
            : "border-black/10 bg-[#f3f2ed] text-black/55 hover:border-[#ff5a1f]/35 hover:bg-[#fff2ec] hover:text-black"
        }
      `}
    >
      {children}

      <span
        className={`
          rounded-full
          px-2
          py-1
          text-[11px]
          font-bold

          ${
            active
              ? "bg-[#ff5a1f] text-white"
              : "bg-white text-black/40"
          }
        `}
      >
        {count}
      </span>
    </button>
  );
}


function FilterSection({
  eyebrow,
  title,
  children,
}: {
  eyebrow: string;
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="rounded-[21px] border border-black/10 bg-white p-5 sm:p-6">
      <div className="flex items-start gap-4">
        <div className="flex h-8 min-w-8 items-center justify-center rounded-full bg-[#fff0e9] px-2 text-[11px] font-bold text-[#ff5a1f]">
          {
            eyebrow
          }
        </div>

        <div>
          <h4 className="text-[17px] font-semibold tracking-[-0.02em]">
            {
              title
            }
          </h4>
        </div>
      </div>

      <div className="mt-5">
        {
          children
        }
      </div>
    </section>
  );
}


function FilterPill({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={
        onClick
      }
      className={`
        rounded-full
        border
        px-4
        py-2.5
        text-[14px]
        font-semibold
        transition

        ${
          active
            ? "border-[#ff5a1f] bg-[#fff0e9] text-[#e94b12]"
            : "border-black/10 bg-[#f3f2ed] text-black/55 hover:border-black/25 hover:bg-white hover:text-black"
        }
      `}
    >
      {active && (
        <span className="mr-2 text-[#ff5a1f]">
          ✓
        </span>
      )}

      {
        children
      }
    </button>
  );
}


function SearchIcon() {
  return (
    <svg
      width="21"
      height="21"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <circle
        cx="11"
        cy="11"
        r="6.5"
        stroke="currentColor"
        strokeWidth="1.8"
      />

      <path
        d="M16 16L21 21"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}


function FilterIcon() {
  return (
    <svg
      width="19"
      height="19"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M4 6H20"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />

      <path
        d="M7 12H17"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />

      <path
        d="M10 18H14"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}


function getSearchPlaceholder(
  category: string
) {
  switch (category) {
    case "camere":
      return "Cerca Sony A7 IV, cinema camera, Full Frame...";

    case "ottiche":
      return "Cerca ottiche, focali, attacchi...";

    case "audio":
      return "Cerca microfoni, mixer, interfacce audio...";

    case "luci":
      return "Cerca luci, COB, pannelli...";

    case "video":
      return "Cerca wireless video, monitor, converter...";

    case "live":
      return "Cerca switcher, regia, streaming...";

    case "accessori":
      return "Cerca supporti, batterie, adattatori...";

    default:
      return "Cerca nel catalogo LAP GEAR...";
  }
}


export default CatalogClient;