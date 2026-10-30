import type { Metadata } from "next";
import { LocalSeoPage } from "@/components/LocalSeoPage";

const canonical = "https://lapgear.it/noleggio-attrezzatura-video-roma";

export const metadata: Metadata = {
  title: "Noleggio attrezzatura video a Roma",
  description:
    "Noleggio di videocamere, ottiche, audio, luci e attrezzatura per produzioni video a Roma. Componi il kit e richiedi disponibilità con LAP GEAR.",
  alternates: {
    canonical,
  },
  openGraph: {
    title: "Noleggio attrezzatura video a Roma | LAP GEAR",
    description:
      "Camere, ottiche, audio, luci e gear per produzioni video a Roma. Richiedi disponibilità e componi il kit con LAP GEAR.",
    url: canonical,
    type: "website",
  },
};

export default function RomeRentalPage() {
  return (
    <LocalSeoPage
      eyebrow="Video rental · Roma"
      title="Noleggio attrezzatura video"
      accent="per produzioni a Roma."
      intro="LAP GEAR mette a disposizione videocamere, ottiche, audio, illuminazione, monitor e attrezzatura per live e streaming per produzioni che lavorano a Roma. Il kit si costruisce online, poi disponibilità e quantità vengono verificate sulle date richieste."
      areaLabel="Roma"
      areaDescription="Una pagina pensata per produzioni, videomaker, fotografi e creator che lavorano a Roma e cercano un kit video professionale da preparare prima del set."
      practicalTitle="Dal catalogo al set, senza checkout automatico."
      practicalPoints={[
        "Scegli dal catalogo soltanto il materiale che serve al progetto, senza pacchetti obbligatori.",
        "Indica ritiro e riconsegna: il sistema verifica il materiale sulle date e sulle quantità richieste.",
        "Invia la richiesta con i tuoi dati e le note di produzione; la conferma arriva dopo la verifica.",
        "Il ritiro del materiale avviene su appuntamento a Palestrina, RM.",
      ]}
      useCases={[
        "Produzioni video e branded content",
        "Interviste e corporate",
        "Shooting foto e video",
        "Eventi e contenuti live",
        "Streaming e regia video",
        "Creator e produzioni social",
      ]}
      faq={[
        {
          question: "Posso noleggiare solo una videocamera o una singola ottica?",
          answer:
            "Sì. Il catalogo è modulare: puoi richiedere un singolo articolo oppure costruire un kit completo con camere, ottiche, audio, luci e accessori.",
        },
        {
          question: "La richiesta online conferma subito il noleggio?",
          answer:
            "No. La richiesta è non vincolante: LAP GEAR verifica disponibilità, quantità e dettagli prima della conferma.",
        },
        {
          question: "Come viene calcolata la durata?",
          answer:
            "Indichi le date di ritiro e riconsegna nel kit. La stima mostrata sul sito usa il prezzo giornaliero dei prodotti e il periodo selezionato.",
        },
        {
          question: "Dove si ritira il materiale?",
          answer:
            "Il ritiro è previsto su appuntamento a Palestrina, in provincia di Roma, dopo la conferma della richiesta.",
        },
      ]}
      canonical={canonical}
      breadcrumbLabel="Noleggio attrezzatura video Roma"
    />
  );
}
