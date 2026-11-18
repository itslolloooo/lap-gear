/*
 * Pagine locali di LAP GEAR. Usate per i collegamenti interni
 * (footer, home, schede prodotto, pagine locali tra loro).
 */

export type LocalArea = {
  href: string;
  label: string;
  description: string;
};

export const LOCAL_AREAS: LocalArea[] = [
  {
    href: "/noleggio-attrezzatura-video-palestrina",
    label: "Noleggio a Palestrina",
    description: "Ritiro su appuntamento in Via Prenestina Nuova 291.",
  },
  {
    href: "/noleggio-attrezzatura-video-roma-est",
    label: "Noleggio a Roma Est",
    description: "Prenestino, Casilino, Tuscolano e zone vicine.",
  },
  {
    href: "/noleggio-attrezzatura-video-roma",
    label: "Noleggio a Roma",
    description: "Per produzioni, shooting ed eventi in città.",
  },
];
