import {
  createBrowserClient,
} from "@supabase/ssr";

export function createSupabaseAuthBrowserClient() {
  const url =
    process.env
      .NEXT_PUBLIC_SUPABASE_URL;

  const publishableKey =
    process.env
      .NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (
    !url ||
    !publishableKey
  ) {
    throw new Error(
      "Configurazione Supabase mancante."
    );
  }

  return createBrowserClient(
    url,
    publishableKey
  );
}