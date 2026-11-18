/*
 * Guide e articoli del blog: /guide e /guide/{slug}
 * Per aggiungere un articolo basta aggiungere un elemento a GUIDE_POSTS
 * (il piu' recente per primo). Niente prezzi o specifiche nel testo: per
 * quelli si rimanda alle schede prodotto, che restano la fonte aggiornata.
 */

export type GuideSection = {
  heading: string;
  paragraphs: string[];
};

export type GuidePost = {
  slug: string;
  title: string;
  description: string;
  /** ISO date, es. 2026-11-18 */
  date: string;
  /** Slug di una categoria in CATEGORY_PAGES, per il link correlato */
  relatedCategories: string[];
  intro: string;
  sections: GuideSection[];
};

export const GUIDE_POSTS: GuidePost[] = [
  {
    slug: "quale-camera-noleggiare-intervista-video",
    title: "Quale camera noleggiare per un'intervista video",
    description:
      "Come scegliere camera, ottica, audio e luci per girare un'intervista video pulita, senza noleggiare più materiale del necessario.",
    date: "2026-11-18",
    relatedCategories: ["camere", "ottiche", "audio", "luci"],
    intro:
      "Per un'intervista video la camera conta meno di quanto si pensi: audio, luce e inquadratura fanno la differenza. Ecco come ragionare prima di noleggiare, per scegliere solo ciò che serve davvero.",
    sections: [
      {
        heading: "Parti dalla durata e dalle condizioni di ripresa",
        paragraphs: [
          "Un'intervista dura spesso da venti minuti a più di un'ora senza interruzioni. Cerca una camera che consenta riprese lunghe in continuo e che gestisca bene la luce degli ambienti interni, dove di solito si gira.",
          "Se hai bisogno di due inquadrature (una frontale e una laterale), noleggia due camere compatibili tra loro, in modo da avere colori simili in montaggio.",
        ],
      },
      {
        heading: "L'ottica: meglio una focale versatile",
        paragraphs: [
          "Per un'intervista in spazi medio-piccoli una focale standard luminosa permette di staccare il soggetto dallo sfondo senza dover allontanare la camera.",
          "Se hai poco spazio, una focale più corta evita di dover arretrare. Se vuoi un'immagine più compressa, una focale media o un piccolo tele funziona bene, a patto di avere la distanza.",
        ],
      },
      {
        heading: "L'audio viene prima dell'immagine",
        paragraphs: [
          "Chi guarda tollera un'immagine imperfetta, ma non un audio rumoroso. Un microfono lavalier o una serie di microfoni wireless vicini alla bocca dà risultati molto migliori del microfono della camera.",
          "Porta sempre cuffie per controllare il suono mentre registri e, se possibile, registra un secondo audio di riserva.",
        ],
      },
      {
        heading: "La luce: poca ma ben posizionata",
        paragraphs: [
          "Una sola luce morbida laterale, più un riempimento leggero, basta per un'intervista professionale. Un modificatore (softbox o pannello diffusore) rende la luce più naturale sul volto.",
          "Se c'è una finestra, usala come luce principale e usa la luce artificiale solo per bilanciare, evitando di mescolare temperature di colore diverse.",
        ],
      },
      {
        heading: "Cosa noleggiare in pratica",
        paragraphs: [
          "Per una singola intervista bastano in genere una camera, un'ottica luminosa, un microfono lavalier, una luce con modificatore e un cavalletto stabile. Aggiungi una seconda camera solo se serve il doppio punto di vista.",
          "Se non sei sicuro della combinazione, descrivi il tuo progetto nella richiesta: ti aiutiamo a costruire un kit adatto e ti inviamo un preventivo prima di qualsiasi conferma.",
        ],
      },
    ],
  },
];

export function getGuidePost(slug: string) {
  return GUIDE_POSTS.find((post) => post.slug === slug);
}

export function formatGuideDate(isoDate: string) {
  return new Date(isoDate).toLocaleDateString("it-IT", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}
