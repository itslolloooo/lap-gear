import type { Metadata } from "next";
import { LocalSeoPage } from "@/components/LocalSeoPage";

const canonical = "https://lapgear.it/noleggio-attrezzatura-video-roma-est";

export const metadata: Metadata = {
  title: "Noleggio attrezzatura video Roma Est",
  description:
    "Noleggio videocamere, ottiche, audio, luci e gear professionale per produzioni nell'area di Roma Est. Ritiro su appuntamento a Palestrina con LAP GEAR.",
  alternates: {
    canonical,
  },
  openGraph: {
    title: "Noleggio attrezzatura video Roma Est | LAP GEAR",
    description:
      "Gear video professionale per produzioni a Roma Est, con ritiro su appuntamento a Palestrina.",
    url: canonical,
    type: "website",
  },
};

export default function RomeEastRentalPage() {
  return (
    <LocalSeoPage
      eyebrow="Video rental · Roma Est"
      title="Gear professionale"
      accent="per set a Roma Est."
      intro="Per chi lavora nella zona est di Roma, LAP GEAR permette di comporre online un kit con camere, ottiche, audio, luci e attrezzatura live, con ritiro su appuntamento a Palestrina. La disponibilità viene verificata sulle date richieste prima della conferma."
      areaLabel="Roma Est"
      areaDescription="La vicinanza del punto di ritiro a Palestrina rende il servizio particolarmente pratico per produzioni che operano nell'area orientale di Roma e nei comuni limitrofi."
      practicalTitle="Un flusso pensato per chi prepara il set."
      practicalPoints={[
        "Consulta disponibilità, caratteristiche e tariffa giornaliera dei prodotti nel catalogo.",
        "Componi il kit in base alla produzione: camera, ottiche, audio, luci, monitor e accessori possono essere richiesti insieme.",
        "Seleziona il periodo e invia la richiesta; il materiale viene controllato sulle date e sulle quantità.",
        "Dopo la conferma, il ritiro viene organizzato su appuntamento a Palestrina.",
      ]}
      useCases={[
        "Interviste e contenuti aziendali",
        "Produzioni social e digital",
        "Shooting in location",
        "Eventi e conferenze",
        "Live streaming",
        "Piccole troupe e videomaker",
      ]}
      faq={[
        {
          question: "Perché scegliere il ritiro a Palestrina per un set a Roma Est?",
          answer:
            "Per produzioni che lavorano nell'area est può essere una soluzione pratica perché il ritiro è organizzato su appuntamento fuori dal centro di Roma e il materiale viene preparato in anticipo sulla richiesta.",
        },
        {
          question: "Posso verificare la disponibilità prima di inviare i dati?",
          answer:
            "Nel kit selezioni le date e il sito verifica la disponibilità del materiale richiesto. La conferma definitiva arriva comunque dopo l'invio della richiesta.",
        },
        {
          question: "Posso richiedere più pezzi dello stesso prodotto?",
          answer:
            "Sì, quando il prodotto dispone di più unità puoi indicare la quantità desiderata; il sistema controlla la disponibilità nel periodo selezionato.",
        },
        {
          question: "Fate consegna automatica a Roma Est?",
          answer:
            "Il flusso attuale del sito prevede ritiro su appuntamento a Palestrina. Eventuali esigenze particolari possono essere indicate nelle note della richiesta.",
        },
      ]}
      canonical={canonical}
      breadcrumbLabel="Noleggio attrezzatura video Roma Est"
    />
  );
}
