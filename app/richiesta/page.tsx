import type {
  Metadata,
} from "next";

import {
  RequestStatusLookup,
} from "@/components/RequestStatusLookup";


export const metadata:
  Metadata = {
    title:
      "Stato richiesta | LAP GEAR",

    description:
      "Consulta lo stato della tua richiesta di noleggio LAP GEAR.",

    robots: {
      index:
        false,

      follow:
        false,

      nocache:
        true,
    },
  };


type SearchParams = {
  reference?:
    string;
};


export default async function RequestStatusPage({
  searchParams,
}: {
  searchParams?:
    Promise<SearchParams>;
}) {

  const query =
    searchParams
      ? await searchParams
      : {};


  const initialReference =
    String(
      query.reference ??
      ""
    )
      .trim()
      .toUpperCase();


  return (
    <main className="min-h-screen bg-[#ebeae4] px-5 pb-20 pt-8 text-[#111111] sm:px-8 lg:px-10 xl:px-14">

      <div className="mx-auto max-w-[1400px]">

        <RequestStatusLookup
          initialReference={
            initialReference
          }
        />

      </div>

    </main>
  );
}
