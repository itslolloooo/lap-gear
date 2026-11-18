/*
 * Pagine di categoria ottimizzate per la ricerca:
 * /noleggio-attrezzatura/{slug}
 * Lo slug coincide con quello della categoria nel catalogo.
 */

export type CategoryFaq = { question: string; answer: string };

export type CategoryPage = {
  slug: string;
  /** Nome breve usato nei link ("Camere") */
  label: string;
  /** Frase per titolo e H1: "Noleggio {noun} a Roma e Palestrina" */
  noun: string;
  intro: string;
  uses: string[];
  faq: CategoryFaq[];
};

const COMMON_FAQ: CategoryFaq[] = [
  {
    question: "Come funziona la richiesta di noleggio?",
    answer:
      "Aggiungi il materiale al kit, scegli le date e invia la richiesta dal sito. Verifichiamo la disponibilità e ti inviamo un preventivo prima di qualsiasi conferma.",
  },
  {
    question: "Dove si ritira il materiale?",
    answer:
      "Il ritiro è su appuntamento a Palestrina (RM), in Via Prenestina Nuova 291. Puoi richiedere il materiale anche per lavori a Roma Est e a Roma.",
  },
  {
    question: "I prezzi sono con IVA?",
    answer:
      "No, i prezzi indicati sono IVA esclusa. L'IVA, se dovuta, viene aggiunta in fattura.",
  },
];

export const CATEGORY_PAGES: CategoryPage[] = [
  {
    slug: "camere",
    label: "Camere",
    noun: "camere video e fotocamere",
    intro:
      "Mirrorless Sony full frame e APS-C per video, interviste, eventi e shooting: dalle compatte per gimbal alle camere più adatte a produzioni e riprese lunghe. Il catalogo si aggiorna con il materiale disponibile.",
    uses: ["Interviste e video aziendali", "Eventi e cerimonie", "Contenuti per social e YouTube", "Riprese su gimbal"],
    faq: COMMON_FAQ,
  },
  {
    slug: "ottiche",
    label: "Ottiche",
    noun: "obiettivi per Sony E",
    intro:
      "Zoom luminosi, tele e grandangolari per fotocamere mirrorless Sony E: dagli standard 24-70 ai tele 70-200 fino agli ultra grandangoli. Scegli l'ottica in base al lavoro senza comprarla.",
    uses: ["Matrimoni ed eventi", "Ritratti e interviste", "Immobili e interni", "Riprese video con zoom o focale fissa"],
    faq: COMMON_FAQ,
  },
  {
    slug: "audio",
    label: "Audio",
    noun: "attrezzatura audio",
    intro:
      "Microfoni wireless, microfoni da podcast, interfacce audio e mixer digitali per interviste, riprese video, live ed eventi. Un buon audio fa la differenza in ogni produzione.",
    uses: ["Interviste e video aziendali", "Podcast e registrazioni", "Live ed eventi", "Riprese in location"],
    faq: COMMON_FAQ,
  },
  {
    slug: "luci",
    label: "Luci",
    noun: "luci per video e foto",
    intro:
      "Luci LED e flash portatili per set video, interviste e shooting: pannelli bi-color, luci RGB, COB con attacco Bowens e flash a batteria per lavorare anche in location.",
    uses: ["Interviste e set video", "Shooting in studio", "Riprese in location", "Effetti colore e sfondi"],
    faq: COMMON_FAQ,
  },
  {
    slug: "video",
    label: "Video",
    noun: "monitor e trasmissione video wireless",
    intro:
      "Monitor esterni e sistemi di trasmissione video wireless per controllare l'immagine su set, eventi e live: inquadratura, messa a fuoco e regia a distanza.",
    uses: ["Set cinematografici", "Regia e cliente a distanza", "Eventi e live", "Controllo di messa a fuoco ed esposizione"],
    faq: COMMON_FAQ,
  },
  {
    slug: "stativi-cavalletti",
    label: "Stativi e cavalletti",
    noun: "stativi e cavalletti",
    intro:
      "Treppiedi video con testa fluida, treppiedi fotografici e stativi per luci, per riprese stabili e set ordinati.",
    uses: ["Interviste e riprese statiche", "Eventi", "Illuminazione su set", "Time-lapse e panoramiche"],
    faq: COMMON_FAQ,
  },
  {
    slug: "modificatori",
    label: "Modificatori",
    noun: "softbox e modificatori di luce",
    intro:
      "Softbox, beauty dish e altri modificatori per ammorbidire e direzionare la luce di flash e lampade LED, per ritratti, interviste e video più curati.",
    uses: ["Ritratti e beauty", "Interviste", "Moda e prodotto", "Video in studio"],
    faq: COMMON_FAQ,
  },
];

export function getCategoryPage(slug: string) {
  return CATEGORY_PAGES.find((page) => page.slug === slug) ?? null;
}
