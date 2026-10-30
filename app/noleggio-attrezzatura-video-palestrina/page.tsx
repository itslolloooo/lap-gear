import type { Metadata } from "next";
import { LocalSeoPage } from "@/components/LocalSeoPage";

const canonical = "https://lapgear.it/noleggio-attrezzatura-video-palestrina";

export const metadata: Metadata = {
  title: "Noleggio attrezzatura video a Palestrina",
  description:
    "Noleggio videocamere, ottiche, audio, luci e attrezzatura video professionale a Palestrina. Ritiro su appuntamento e richiesta online con LAP GEAR.",
  alternates: {
    canonical,
  },
  openGraph: {
    title: "Noleggio attrezzatura video a Palestrina | LAP GEAR",
    description:
      "Camere, ottiche, audio, luci e gear professionale con ritiro su appuntamento a Palestrina.",
    url: canonical,
    type: "website",
  },
};

export default function PalestrinaRentalPage() {
  return (
    <LocalSeoPage
      eyebrow="Video rental · Palestrina"
      title="Noleggio video"
      accent="con ritiro a Palestrina."
      intro="LAP GEAR opera da Palestrina con un catalogo di videocamere, ottiche, audio, luci, monitor e attrezzatura per live e streaming. Il materiale viene richiesto online e preparato per il ritiro su appuntamento dopo la verifica di disponibilità."
      areaLabel="Palestrina, RM"
      areaDescription="È il punto di ritiro del servizio LAP GEAR. Qui vengono organizzate le richieste e il materiale viene preparato in base al kit, alle quantità e alle date indicate."
      practicalTitle="Ritiro locale, kit preparato prima dell'appuntamento."
      practicalPoints={[
        "Scegli i prodotti dal catalogo e aggiungili al tuo kit di noleggio.",
        "Imposta le date: il sistema verifica la disponibilità delle unità richieste.",
        "Invia i dati e le eventuali note sul progetto; la richiesta viene salvata con un riferimento.",
        "Dopo la conferma organizziamo il ritiro su appuntamento a Palestrina.",
      ]}
      useCases={[
        "Videomaker locali",
        "Fotografi e creator",
        "Eventi e cerimonie",
        "Produzioni aziendali",
        "Streaming e live",
        "Shooting e contenuti social",
      ]}
      faq={[
        {
          question: "Il ritiro è direttamente a Palestrina?",
          answer:
            "Sì. Il servizio indica il ritiro su appuntamento a Palestrina, RM, dopo la verifica e la conferma della richiesta.",
        },
        {
          question: "Posso passare senza prenotazione?",
          answer:
            "No. Il ritiro è organizzato su appuntamento: prima conviene comporre il kit e inviare la richiesta dal sito.",
        },
        {
          question: "Il prezzo mostrato sul sito è una stima?",
          answer:
            "Sì. Il sito mostra una stima basata sulla tariffa giornaliera e sulle date selezionate; la richiesta non costituisce una prenotazione confermata.",
        },
        {
          question: "Che tipo di attrezzatura posso richiedere?",
          answer:
            "Il catalogo comprende videocamere, ottiche, audio, illuminazione, monitor, accessori e materiale per live e streaming, in base alla disponibilità.",
        },
      ]}
      canonical={canonical}
      breadcrumbLabel="Noleggio attrezzatura video Palestrina"
    />
  );
}
