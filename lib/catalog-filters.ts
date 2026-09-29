import type {
  Product,
  ProductAttributeValue,
} from "@/lib/types";

export type CatalogFacetDefinition = {
  key: string;
  label: string;
};

export type CatalogFacetOption = {
  value: string;
  label: string;
};

const FILTERS_BY_CATEGORY: Record<
  string,
  CatalogFacetDefinition[]
> = {
  camere: [
    {
      key: "camera_type",
      label: "Tipo di camera",
    },
    {
      key: "sensor",
      label: "Sensore",
    },
    {
      key: "mount",
      label: "Attacco",
    },
    {
      key: "resolution",
      label: "Risoluzione",
    },
    {
      key: "max_fps",
      label: "Frame rate",
    },
  ],

  ottiche: [
    {
      key: "lens_type",
      label: "Tipo di ottica",
    },
    {
      key: "mount",
      label: "Attacco",
    },
    {
      key: "coverage",
      label: "Copertura",
    },
    {
      key: "focal_min",
      label: "Focale minima",
    },
    {
      key: "focal_max",
      label: "Focale massima",
    },
    {
      key: "aperture",
      label: "Apertura",
    },
  ],

  audio: [
    {
      key: "audio_type",
      label: "Tipologia",
    },
    {
      key: "microphone_type",
      label: "Tipo microfono",
    },
    {
      key: "channels",
      label: "Canali",
    },
    {
      key: "connection",
      label: "Connessione",
    },
  ],

  luci: [
    {
      key: "light_type",
      label: "Tipo di luce",
    },
    {
      key: "color_mode",
      label: "Colore",
    },
    {
      key: "power",
      label: "Potenza",
    },
    {
      key: "mount",
      label: "Attacco",
    },
  ],

  video: [
    {
      key: "video_type",
      label: "Tipologia",
    },
    {
      key: "max_resolution",
      label: "Risoluzione",
    },
    {
      key: "inputs",
      label: "Ingressi",
    },
    {
      key: "outputs",
      label: "Uscite",
    },
  ],

  live: [
    {
      key: "live_type",
      label: "Tipologia",
    },
    {
      key: "inputs",
      label: "Ingressi",
    },
    {
      key: "outputs",
      label: "Uscite",
    },
    {
      key: "channels",
      label: "Canali",
    },
  ],

  accessori: [
    {
      key: "accessory_type",
      label: "Tipologia",
    },
    {
      key: "compatibility",
      label: "Compatibilità",
    },
  ],
};

const ATTRIBUTE_LABELS: Record<
  string,
  string
> = {
  camera_type: "Tipo di camera",
  sensor: "Sensore",
  mount: "Attacco",
  resolution: "Risoluzione",
  max_resolution: "Risoluzione massima",
  max_fps: "Frame rate massimo",

  lens_type: "Tipo di ottica",
  coverage: "Copertura sensore",
  focal_min: "Focale minima",
  focal_max: "Focale massima",
  aperture: "Apertura",

  audio_type: "Tipologia audio",
  microphone_type: "Tipo microfono",
  channels: "Canali",
  connection: "Connessioni",

  light_type: "Tipo di luce",
  color_mode: "Modalità colore",
  power: "Potenza",

  video_type: "Tipologia video",
  live_type: "Tipologia live",

  inputs: "Ingressi",
  outputs: "Uscite",

  accessory_type: "Tipo accessorio",
  compatibility: "Compatibilità",
};

const VALUE_LABELS: Record<
  string,
  string
> = {
  mirrorless: "Mirrorless",
  cinema: "Cinema Camera",
  camcorder: "Camcorder",

  "full-frame": "Full Frame",
  "super-35": "Super 35",
  "aps-c": "APS-C",
  aps_c: "APS-C",
  mft: "Micro 4/3",

  "sony-e": "Sony E",
  "canon-ef": "Canon EF",
  "canon-rf": "Canon RF",
  "l-mount": "L-Mount",
  pl: "PL",

  zoom: "Zoom",
  prime: "Focale fissa",

  "4k": "4K",
  "6k": "6K",
  "8k": "8K",

  "4k30": "4K 30 fps",
  "4k60": "4K 60 fps",
  "4k120": "4K 120 fps",

  microphone: "Microfono",
  dynamic: "Dinamico",
  condenser: "Condensatore",

  wireless: "Wireless",
  lavalier: "Lavalier",
  shotgun: "Shotgun",
  handheld: "Palmare",
  recorder: "Recorder",
  mixer: "Mixer",
  "audio-interface": "Interfaccia audio",

  cob: "COB",
  panel: "Pannello",
  tube: "Tube",
  fresnel: "Fresnel",

  rgbww: "RGBWW",
  daylight: "Daylight",
  bicolor: "Bi-Color",

  monitor: "Monitor",
  "wireless-video": "Wireless Video",
  switcher: "Switcher",
  switching: "Regia / Switching",
  streaming: "Streaming",
  intercom: "Intercom",
  converter: "Converter",

  hdmi: "HDMI",
  sdi: "SDI",
  usb: "USB",
  "usb-c": "USB-C",
  xlr: "XLR",
  midi: "MIDI",
  aes50: "AES50",
  "3.5mm": "3.5 mm",

  support: "Supporto",
  rig: "Rig / Cage",
  battery: "Alimentazione",
  cables: "Cavi / Adattatori",
  storage: "Storage",
};

export function getCategoryFacets(
  category: string
) {
  if (category === "tutti") {
    return [];
  }

  return (
    FILTERS_BY_CATEGORY[
      category
    ] ?? []
  );
}

export function getFacetOptions(
  products: Product[],
  key: string
): CatalogFacetOption[] {
  const values =
    new Set<string>();

  products.forEach(
    (product) => {
      extractValues(
        product.attributes?.[
          key
        ]
      ).forEach(
        (value) =>
          values.add(value)
      );
    }
  );

  return Array.from(
    values
  )
    .sort((a, b) =>
      a.localeCompare(
        b,
        undefined,
        {
          numeric: true,
        }
      )
    )
    .map((value) => ({
      value,
      label:
        formatAttributeValue(
          value
        ),
    }));
}

export function productMatchesFacet(
  product: Product,
  key: string,
  selectedValues: string[]
) {
  if (
    selectedValues.length ===
    0
  ) {
    return true;
  }

  const values =
    extractValues(
      product.attributes?.[
        key
      ]
    );

  return selectedValues.some(
    (selectedValue) =>
      values.includes(
        selectedValue
      )
  );
}

export function getProductSearchText(
  product: Product
) {
  const attributeValues =
    Object.values(
      product.attributes ??
        {}
    ).flatMap(
      (value) =>
        extractValues(value)
    );

  return [
    product.name,
    product.brand,
    product.categoryLabel,
    product.shortDescription,
    product.description,
    ...product.specs,
    ...product.includes,
    ...attributeValues,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
}

export function formatAttributeKey(
  key: string
) {
  return (
    ATTRIBUTE_LABELS[
      key
    ] ??
    key
      .replaceAll(
        "_",
        " "
      )
      .replace(
        /\b\w/g,
        (letter) =>
          letter.toUpperCase()
      )
  );
}

export function formatAttributeValue(
  value: string | number
) {
  const stringValue =
    String(value);

  if (
    VALUE_LABELS[
      stringValue
    ]
  ) {
    return VALUE_LABELS[
      stringValue
    ];
  }

  return stringValue
    .replaceAll(
      "_",
      " "
    )
    .replaceAll(
      "-",
      " "
    )
    .replace(
      /\b\w/g,
      (letter) =>
        letter.toUpperCase()
    );
}

export function formatProductAttribute(
  value:
    | ProductAttributeValue
    | undefined
) {
  if (
    value === null ||
    value === undefined
  ) {
    return "";
  }

  if (
    Array.isArray(value)
  ) {
    return value
      .map(
        (
          item
        ) =>
          formatAttributeValue(
            item
          )
      )
      .join(" · ");
  }

  if (
    typeof value ===
    "boolean"
  ) {
    return value
      ? "Sì"
      : "No";
  }

  return formatAttributeValue(
    value
  );
}

function extractValues(
  value:
    | ProductAttributeValue
    | undefined
): string[] {
  if (
    value === null ||
    value === undefined
  ) {
    return [];
  }

  if (
    Array.isArray(value)
  ) {
    return value.map(
      (item) =>
        String(item)
    );
  }

  return [
    String(value),
  ];
}