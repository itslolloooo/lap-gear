"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import type {
  CartItem,
  Product,
} from "@/lib/types";

type RentalContextValue = {
  items: CartItem[];
  add: (product: Product) => void;
  remove: (productId: number) => void;
  changeQuantity: (productId: number, quantity: number) => void;
  clear: () => void;
  count: number;
};

type AnalyticsConsent =
  | "granted"
  | "denied"
  | null;

type AnalyticsEventParams =
  Record<string, unknown>;

declare global {
  interface Window {
    dataLayer?: unknown[][];
    gtag?: (...args: unknown[]) => void;
  }
}

const RentalContext =
  createContext<RentalContextValue | null>(null);

const STORAGE_KEY =
  "lap-equipment-rental-cart-v1";

const ANALYTICS_CONSENT_KEY =
  "lapgear-analytics-consent-v1";

const GA_ID =
  "G-M04NE37VQQ";

function ensureGtag() {
  window.dataLayer =
    window.dataLayer || [];

  window.gtag =
    window.gtag ||
    function gtag(
      ...args: unknown[]
    ) {
      window.dataLayer?.push(
        args
      );
    };
}

function setGoogleConsent(
  value: "granted" | "denied"
) {
  ensureGtag();

  window.gtag?.(
    "consent",
    "update",
    {
      analytics_storage:
        value,
      ad_storage:
        "denied",
      ad_user_data:
        "denied",
      ad_personalization:
        "denied",
    }
  );
}

function loadGoogleAnalytics() {
  ensureGtag();

  if (
    !document.getElementById(
      "lapgear-ga4"
    )
  ) {
    const script =
      document.createElement(
        "script"
      );

    script.id =
      "lapgear-ga4";

    script.async =
      true;

    script.src =
      `https://www.googletagmanager.com/gtag/js?id=${GA_ID}`;

    document.head.appendChild(
      script
    );
  }

  if (
    !document.documentElement.dataset
      .gaConfigured
  ) {
    window.gtag?.(
      "js",
      new Date()
    );

    window.gtag?.(
      "config",
      GA_ID,
      {
        anonymize_ip:
          true,
        send_page_view:
          false,
      }
    );

    document.documentElement.dataset
      .gaConfigured =
      "true";
  }
}

export function trackAnalyticsEvent(
  name: string,
  params:
    AnalyticsEventParams = {}
) {
  if (
    typeof window ===
      "undefined" ||
    window.localStorage.getItem(
      ANALYTICS_CONSENT_KEY
    ) !== "granted"
  ) {
    return;
  }

  ensureGtag();

  window.gtag?.(
    "event",
    name,
    params
  );
}

export function ProductViewTracker({
  product,
}: {
  product: Product;
}) {
  useEffect(() => {
    function sendViewItem() {
      trackAnalyticsEvent(
        "view_item",
        {
        currency:
          "EUR",
        value:
          Number(
            product.priceDay ||
              0
          ),
        items: [
          {
            item_id:
              String(
                product.id
              ),
            item_name:
              product.name,
            item_brand:
              product.brand ||
              undefined,
            item_category:
              product.categoryLabel,
            price:
              Number(
                product.priceDay ||
                  0
              ),
            quantity:
              1,
          },
          ],
        }
      );
    }

    sendViewItem();

    window.addEventListener(
      "lapgear-analytics-consent-granted",
      sendViewItem
    );

    return () => {
      window.removeEventListener(
        "lapgear-analytics-consent-granted",
        sendViewItem
      );
    };
  }, [product]);

  return null;
}

export function RentalProvider({
  children,
}: {
  children:
    React.ReactNode;
}) {
  const pathname =
    usePathname();

  const [
    items,
    setItems,
  ] =
    useState<CartItem[]>(
      []
    );

  const [
    hydrated,
    setHydrated,
  ] =
    useState(false);

  const [
    analyticsConsent,
    setAnalyticsConsent,
  ] =
    useState<AnalyticsConsent>(
      null
    );

  useEffect(() => {
    try {
      const stored =
        localStorage.getItem(
          STORAGE_KEY
        );

      if (stored) {
        setItems(
          JSON.parse(
            stored
          )
        );
      }
    } catch {}

    setHydrated(true);
  }, []);

  useEffect(() => {
    ensureGtag();

    window.gtag?.(
      "consent",
      "default",
      {
        analytics_storage:
          "denied",
        ad_storage:
          "denied",
        ad_user_data:
          "denied",
        ad_personalization:
          "denied",
      }
    );

    const saved =
      localStorage.getItem(
        ANALYTICS_CONSENT_KEY
      );

    if (
      saved ===
      "granted"
    ) {
      setGoogleConsent(
        "granted"
      );

      loadGoogleAnalytics();

      setAnalyticsConsent(
        "granted"
      );
    } else if (
      saved ===
      "denied"
    ) {
      setGoogleConsent(
        "denied"
      );

      setAnalyticsConsent(
        "denied"
      );
    }
  }, []);

  useEffect(() => {
    if (!hydrated) {
      return;
    }

    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(
        items
      )
    );
  }, [
    hydrated,
    items,
  ]);

  useEffect(() => {
    if (
      analyticsConsent !==
      "granted"
    ) {
      return;
    }

    trackAnalyticsEvent(
      "page_view",
      {
        page_path:
          pathname,
        page_location:
          window.location.href,
        page_title:
          document.title,
      }
    );
  }, [
    analyticsConsent,
    pathname,
  ]);

  function acceptAnalytics() {
    localStorage.setItem(
      ANALYTICS_CONSENT_KEY,
      "granted"
    );

    setGoogleConsent(
      "granted"
    );

    loadGoogleAnalytics();

    setAnalyticsConsent(
      "granted"
    );

    window.dispatchEvent(
      new Event(
        "lapgear-analytics-consent-granted"
      )
    );
  }

  function rejectAnalytics() {
    localStorage.setItem(
      ANALYTICS_CONSENT_KEY,
      "denied"
    );

    setGoogleConsent(
      "denied"
    );

    setAnalyticsConsent(
      "denied"
    );
  }

  const value =
    useMemo<RentalContextValue>(
      () => ({
        items,

        add(product) {
          setItems(
            (
              current
            ) => {
              const existing =
                current.find(
                  (item) =>
                    item
                      .product
                      .id ===
                    product.id
                );

              if (
                existing
              ) {
                return current.map(
                  (item) =>
                    item
                      .product
                      .id ===
                    product.id
                      ? {
                          ...item,
                          quantity:
                            Math.min(
                              product.quantity,
                              item.quantity +
                                1
                            ),
                        }
                      : item
                );
              }

              return [
                ...current,
                {
                  product,
                  quantity:
                    1,
                },
              ];
            }
          );
        },

        remove(
          productId
        ) {
          setItems(
            (
              current
            ) =>
              current.filter(
                (
                  item
                ) =>
                  item
                    .product
                    .id !==
                  productId
              )
          );
        },

        changeQuantity(
          productId,
          quantity
        ) {
          setItems(
            (
              current
            ) =>
              current.map(
                (
                  item
                ) =>
                  item
                    .product
                    .id ===
                  productId
                    ? {
                        ...item,
                        quantity:
                          Math.max(
                            1,
                            Math.min(
                              item
                                .product
                                .quantity,
                              quantity
                            )
                          ),
                      }
                    : item
              )
          );
        },

        clear() {
          setItems(
            []
          );
        },

        count:
          items.reduce(
            (
              sum,
              item
            ) =>
              sum +
              item.quantity,
            0
          ),
      }),
      [items]
    );

  return (
    <RentalContext.Provider
      value={
        value
      }
    >
      {children}

      {analyticsConsent ===
        null && (
        <div className="fixed inset-x-4 bottom-4 z-[100] mx-auto max-w-[760px] rounded-[22px] border border-black/10 bg-[#181818] p-5 text-white shadow-[0_22px_70px_rgba(0,0,0,0.28)] sm:p-6">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="max-w-[500px]">
              <div className="text-[15px] font-semibold">
                Cookie analytics
              </div>

              <p className="mt-2 text-[13px] leading-5 text-white/55">
                Usiamo Google Analytics
                per capire come viene
                utilizzato LAP GEAR e
                migliorare il servizio.
                Puoi accettare o
                continuare senza
                analytics.{" "}
                <Link
                  href="/privacy"
                  className="font-semibold text-[#ff7b4a] underline underline-offset-4"
                >
                  Privacy
                </Link>
              </p>
            </div>

            <div className="flex shrink-0 gap-2">
              <button
                type="button"
                onClick={
                  rejectAnalytics
                }
                className="h-11 rounded-[13px] border border-white/15 px-4 text-[13px] font-semibold text-white/70 transition hover:bg-white/10 hover:text-white"
              >
                Rifiuta
              </button>

              <button
                type="button"
                onClick={
                  acceptAnalytics
                }
                className="h-11 rounded-[13px] bg-[#ff5a1f] px-5 text-[13px] font-semibold text-white transition hover:bg-white hover:text-[#181818]"
              >
                Accetta
              </button>
            </div>
          </div>
        </div>
      )}
    </RentalContext.Provider>
  );
}

export function useRental() {
  const value =
    useContext(
      RentalContext
    );

  if (!value) {
    throw new Error(
      "useRental deve essere usato dentro RentalProvider"
    );
  }

  return value;
}
