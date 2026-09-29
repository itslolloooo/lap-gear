import type { Product } from "@/lib/types";

export const categories = [
  { slug: "camere", label: "Camere", mark: "CAM" },
  { slug: "ottiche", label: "Ottiche", mark: "OPT" },
  { slug: "audio", label: "Audio", mark: "AUD" },
  { slug: "luci", label: "Luci", mark: "LUX" },
  { slug: "video", label: "Video", mark: "VID" },
  { slug: "live", label: "Live", mark: "LIVE" },
  { slug: "accessori", label: "Accessori", mark: "ACC" }
] as const;

export const products: Product[] = [
  {
    brand: "",
attributes: {},
    id: 1,
    slug: "sony-a7-iv",
    name: "Sony A7 IV",
    category: "camere",
    categoryLabel: "Camere",
    shortDescription: "Full frame 33 MP · 4K 60p",
    description:
      "Corpo macchina full frame ibrido per produzioni foto e video. Configurazione ideale per eventi, interviste e produzioni leggere.",
    priceDay: 65,
    deposit: 500,
    quantity: 2,
    image:
      "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=1400&q=85",
    featured: true,
    specs: ["Sensore full frame 33 MP", "4K fino a 60p", "10-bit 4:2:2", "Attacco Sony E"],
    includes: ["Corpo Sony A7 IV", "2 batterie", "Caricatore", "Cinghia", "Borsa"]
  },
  {
    brand: "",
attributes: {},
    id: 2,
    slug: "hollyland-pyro-s",
    name: "Hollyland Pyro S",
    category: "video",
    categoryLabel: "Video",
    shortDescription: "Trasmissione video wireless 4K",
    description:
      "Sistema TX/RX wireless per monitoraggio, regia e live production. Pensato per setup mobili e collegamenti camera-regia.",
    priceDay: 45,
    deposit: 300,
    quantity: 1,
    image:
      "https://images.unsplash.com/photo-1589872307379-0ffdf9829123?auto=format&fit=crop&w=1400&q=85",
    featured: true,
    specs: ["Trasmissione wireless", "HDMI / SDI", "Supporto workflow 4K", "Bassa latenza"],
    includes: ["Trasmettitore", "Ricevitore", "Antenne", "Alimentatori", "Case"]
  },
  {
    brand: "",
attributes: {},
    id: 3,
    slug: "atem-mini",
    name: "ATEM Mini",
    category: "live",
    categoryLabel: "Live",
    shortDescription: "Switcher HDMI per streaming e regia",
    description:
      "Switcher compatto per multicamera, streaming, eventi e piccoli setup regia. Perfetto con OBS, Zoom e piattaforme social.",
    priceDay: 35,
    deposit: 200,
    quantity: 1,
    image:
      "https://images.unsplash.com/photo-1593697821252-0c9137d9fc45?auto=format&fit=crop&w=1400&q=85",
    featured: true,
    specs: ["4 ingressi HDMI", "USB webcam output", "Mixer audio integrato", "Transizioni hardware"],
    includes: ["ATEM Mini", "Alimentatore", "Cavo USB-C", "Custodia"]
  },
  {
    brand: "",
attributes: {},
    id: 4,
    slug: "rode-podmic",
    name: "RØDE PodMic",
    category: "audio",
    categoryLabel: "Audio",
    shortDescription: "Microfono dinamico broadcast",
    description:
      "Microfono dinamico robusto e controllato, adatto a podcast, voice-over, interviste e streaming.",
    priceDay: 12,
    deposit: 80,
    quantity: 2,
    image:
      "https://images.unsplash.com/photo-1590602847861-f357a9332bbc?auto=format&fit=crop&w=1400&q=85",
    specs: ["Capsula dinamica", "Pattern cardioide", "Connessione XLR", "Filtro antipop interno"],
    includes: ["RØDE PodMic", "Supporto", "Cavo XLR"]
  },
  {
    brand: "",
attributes: {},
    id: 5,
    slug: "behringer-x32-compact",
    name: "Behringer X32 Compact",
    category: "audio",
    categoryLabel: "Audio",
    shortDescription: "Mixer digitale 40 input",
    description:
      "Console digitale compatta per live, eventi e produzioni con numerosi ingressi, scene richiamabili e controllo remoto.",
    priceDay: 85,
    deposit: 600,
    quantity: 1,
    image:
      "https://images.unsplash.com/photo-1524368535928-5b5e00ddc76b?auto=format&fit=crop&w=1400&q=85",
    specs: ["40 canali input", "25 bus", "16 preamp", "Controllo remoto"],
    includes: ["X32 Compact", "Cavo alimentazione", "Flight case"]
  },
  {
    brand: "",
attributes: {},
    id: 6,
    slug: "steinberg-ur22c",
    name: "Steinberg UR22C",
    category: "audio",
    categoryLabel: "Audio",
    shortDescription: "Interfaccia audio USB-C 2×2",
    description:
      "Interfaccia audio compatta per registrazione, podcast, streaming e piccoli setup desktop.",
    priceDay: 15,
    deposit: 100,
    quantity: 1,
    image:
      "https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?auto=format&fit=crop&w=1400&q=85",
    specs: ["2 ingressi combo", "USB-C", "24-bit / 192 kHz", "MIDI I/O"],
    includes: ["UR22C", "Cavo USB-C", "Custodia"]
  }
];

export function getProduct(slug: string) {
  return products.find((product) => product.slug === slug) ?? null;
}
