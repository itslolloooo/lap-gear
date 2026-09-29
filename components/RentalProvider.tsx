"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { CartItem, Product } from "@/lib/types";

type RentalContextValue = {
  items: CartItem[];
  add: (product: Product) => void;
  remove: (productId: number) => void;
  changeQuantity: (productId: number, quantity: number) => void;
  clear: () => void;
  count: number;
};

const RentalContext = createContext<RentalContextValue | null>(null);
const STORAGE_KEY = "lap-equipment-rental-cart-v1";

export function RentalProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) setItems(JSON.parse(stored));
    } catch {}
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [hydrated, items]);

  const value = useMemo<RentalContextValue>(() => ({
    items,
    add(product) {
      setItems((current) => {
        const existing = current.find((item) => item.product.id === product.id);
        if (existing) {
          return current.map((item) =>
            item.product.id === product.id
              ? { ...item, quantity: Math.min(product.quantity, item.quantity + 1) }
              : item
          );
        }
        return [...current, { product, quantity: 1 }];
      });
    },
    remove(productId) {
      setItems((current) => current.filter((item) => item.product.id !== productId));
    },
    changeQuantity(productId, quantity) {
      setItems((current) => current.map((item) =>
        item.product.id === productId
          ? { ...item, quantity: Math.max(1, Math.min(item.product.quantity, quantity)) }
          : item
      ));
    },
    clear() { setItems([]); },
    count: items.reduce((sum, item) => sum + item.quantity, 0)
  }), [items]);

  return <RentalContext.Provider value={value}>{children}</RentalContext.Provider>;
}

export function useRental() {
  const value = useContext(RentalContext);
  if (!value) throw new Error("useRental deve essere usato dentro RentalProvider");
  return value;
}
