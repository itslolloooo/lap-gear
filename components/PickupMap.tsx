"use client";

import { useEffect, useRef, useState } from "react";

/*
 * Mappa del punto di ritiro (Google Maps, Locator Plus).
 *
 * Per rispettare la privacy, i contenuti di Google vengono caricati solo
 * dopo un clic esplicito dell'utente. La chiave è una chiave browser di
 * Google Maps: va limitata ai domini del sito dalla Google Cloud Console.
 */

const MAPS_API_KEY = "AIzaSyAKN20wmR3LbqQLa365Q2godycmT-ef4Bs";
const LIBRARY_URL =
  "https://ajax.googleapis.com/ajax/libs/@googlemaps/extended-component-library/0.6.15/index.min.js";

const CONFIGURATION = {
  locations: [
    {
      title: "LAP GEAR · Via Prenestina Nuova, 291",
      address1: "Via Prenestina Nuova",
      address2: "291, 00036 Palestrina RM, Italia",
      coords: { lat: 41.82444379255846, lng: 12.866355907969291 },
      placeId: "ChIJuaFStu1_JRMRBPmeCDy7X3k",
    },
  ],
  mapOptions: {
    center: { lat: 41.82444379255846, lng: 12.866355907969291 },
    fullscreenControl: true,
    mapTypeControl: false,
    streetViewControl: false,
    zoom: 12,
    zoomControl: true,
    maxZoom: 17,
    mapId: "",
  },
  mapsApiKey: MAPS_API_KEY,
  capabilities: {
    input: false,
    autocomplete: false,
    directions: false,
    distanceMatrix: false,
    details: false,
    actions: false,
  },
};

export function PickupMap() {
  const [enabled, setEnabled] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!enabled) return;
    const container = containerRef.current;
    if (!container) return;
    let cancelled = false;

    const script = document.createElement("script");
    script.type = "module";
    script.src = LIBRARY_URL;
    document.head.appendChild(script);

    (async () => {
      await customElements.whenDefined("gmpx-store-locator");
      if (cancelled) return;

      const loader = document.createElement("gmpx-api-loader");
      loader.setAttribute("key", MAPS_API_KEY);
      loader.setAttribute("solution-channel", "GMP_QB_locatorplus_v11_c");

      const locator = document.createElement("gmpx-store-locator");
      locator.setAttribute("map-id", "DEMO_MAP_ID");
      locator.style.width = "100%";
      locator.style.height = "100%";

      container.replaceChildren(loader, locator);
      (
        locator as HTMLElement & {
          configureFromQuickBuilder: (config: unknown) => void;
        }
      ).configureFromQuickBuilder(CONFIGURATION);
    })();

    return () => {
      cancelled = true;
    };
  }, [enabled]);

  return (
    <div className="overflow-hidden rounded-[22px] border border-black/10 bg-[#f3f2ed]">
      <div ref={containerRef} className="h-[460px] w-full">
        {!enabled && (
          <div className="flex h-full flex-col items-center justify-center gap-4 px-6 text-center">
            <p className="max-w-[420px] text-[14px] leading-6 text-black/55">
              La mappa è fornita da Google Maps. Caricandola, Google può
              impostare cookie e ricevere dati tecnici del tuo dispositivo.
            </p>
            <button
              type="button"
              onClick={() => setEnabled(true)}
              className="inline-flex h-[48px] items-center justify-center rounded-[14px] bg-[#181818] px-6 text-[14px] font-semibold text-white transition hover:bg-[#ff5a1f]"
            >
              Mostra la mappa
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
