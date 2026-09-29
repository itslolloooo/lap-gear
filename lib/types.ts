export type CategorySlug =
  | "camere"
  | "ottiche"
  | "audio"
  | "luci"
  | "video"
  | "live"
  | "accessori";

export type ProductAttributeValue =
  | string
  | number
  | boolean
  | string[]
  | number[]
  | null;

export type ProductAttributes =
  Record<
    string,
    ProductAttributeValue
  >;

export type Product = {
  id: number;

  slug: string;

  name: string;

  category: CategorySlug;

  categoryLabel: string;

  shortDescription: string;

  description: string;

  priceDay: number;

  deposit: number;

  quantity: number;

  image: string;

  featured?: boolean;

  specs: string[];

  includes: string[];

  /*
   * ==========================================
   * CATALOG METADATA
   * ==========================================
   */

  brand: string | null;

  attributes: ProductAttributes;
};

export type CartItem = {
  product: Product;

  quantity: number;
};