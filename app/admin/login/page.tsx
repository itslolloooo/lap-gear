"use client";

import {
  FormEvent,
  useState,
} from "react";

import Link from "next/link";

import {
  useRouter,
} from "next/navigation";

import {
  createSupabaseAuthBrowserClient,
} from "@/lib/supabase-auth-client";


export default function AdminLoginPage() {
  const router =
    useRouter();


  const [
    email,
    setEmail,
  ] =
    useState("");


  const [
    password,
    setPassword,
  ] =
    useState("");


  const [
    loading,
    setLoading,
  ] =
    useState(false);


  const [
    error,
    setError,
  ] =
    useState("");


  async function handleSubmit(
    event:
      FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();


    setLoading(
      true
    );

    setError(
      ""
    );


    const supabase =
      createSupabaseAuthBrowserClient();


    const {
      error:
        loginError,
    } =
      await supabase.auth
        .signInWithPassword({
          email,
          password,
        });


    if (
      loginError
    ) {
      setError(
        "Email o password non corretti."
      );

      setLoading(
        false
      );

      return;
    }


    router.replace(
      "/admin"
    );

    router.refresh();
  }


  return (
    <main className="min-h-screen bg-[#ebeae4] px-5 py-8 text-[#111111] sm:px-8 lg:px-10 lg:py-12 xl:px-14">

      <div className="mx-auto flex min-h-[calc(100vh-96px)] max-w-[1440px] items-center">

        <section className="w-full overflow-hidden rounded-[30px] border border-black/10 bg-white shadow-[0_22px_80px_rgba(0,0,0,0.07)]">

          <div className="grid lg:grid-cols-[1.05fr_0.95fr]">

            {/* =====================================
                BRAND / INTRO
                ===================================== */}

            <div className="relative overflow-hidden bg-[#181818] p-8 text-white sm:p-10 lg:min-h-[650px] lg:p-12 xl:p-14">

              <div className="pointer-events-none absolute -right-28 -top-28 h-[360px] w-[360px] rounded-full bg-[#ff5a1f]/20" />

              <div className="pointer-events-none absolute -bottom-40 -left-32 h-[380px] w-[380px] rounded-full border border-white/[0.06]" />


              <div className="relative flex h-full flex-col">

                <div>

                  <Link
                    href="/"
                    className="group inline-flex items-center gap-3.5"
                  >
                    <div className="flex h-[48px] w-[48px] items-center justify-center rounded-[14px] bg-[#ff5a1f] text-[15px] font-black tracking-[-0.03em] text-white transition duration-300 group-hover:rotate-[-4deg] group-hover:scale-[1.03]">
                      LAP
                    </div>


                    <div className="leading-none">

                      <div className="text-[20px] font-black tracking-[-0.045em]">
                        LAP GEAR
                      </div>


                      <div className="mt-1.5 text-[11px] font-bold uppercase tracking-[0.13em] text-white/40">
                        Rental Management
                      </div>

                    </div>

                  </Link>


                  <div className="mt-14 text-[12px] font-bold uppercase tracking-[0.13em] text-[#ff7b4a]">
                    Area amministrativa
                  </div>


                  <h1 className="mt-4 max-w-[620px] text-[48px] font-semibold leading-[0.93] tracking-[-0.06em] sm:text-[62px] lg:text-[72px]">
                    Gestisci il rental.
                  </h1>


                  <p className="mt-6 max-w-[560px] text-[16px] leading-7 text-white/50">
                    Prodotti, inventario,
                    richieste, consegne e
                    riconsegne in un unico
                    pannello operativo.
                  </p>

                </div>


                <div className="mt-12 grid gap-3 sm:grid-cols-3 lg:mt-auto lg:grid-cols-1 xl:grid-cols-3">

                  <AdminFeature
                    number="01"
                    title="Richieste"
                    description="Controlla e conferma i noleggi."
                  />

                  <AdminFeature
                    number="02"
                    title="Inventario"
                    description="Gestisci unità, seriali e disponibilità."
                  />

                  <AdminFeature
                    number="03"
                    title="Controlli"
                    description="Checklist in uscita e al rientro."
                  />

                </div>

              </div>

            </div>


            {/* =====================================
                LOGIN
                ===================================== */}

            <div className="flex items-center p-7 sm:p-10 lg:p-12 xl:p-14">

              <div className="mx-auto w-full max-w-[500px]">

                <div className="text-[12px] font-bold uppercase tracking-[0.12em] text-[#ff5a1f]">
                  Accesso riservato
                </div>


                <h2 className="mt-3 text-[38px] font-semibold tracking-[-0.05em] sm:text-[46px]">
                  Bentornato.
                </h2>


                <p className="mt-4 max-w-[440px] text-[15px] leading-7 text-black/45">
                  Inserisci le credenziali
                  amministratore per accedere
                  alla dashboard LAP GEAR.
                </p>


                <form
                  onSubmit={
                    handleSubmit
                  }
                  className="mt-9 space-y-5"
                >

                  <label className="block">

                    <span className="text-[12px] font-bold uppercase tracking-[0.08em] text-black/45">
                      Email
                    </span>


                    <input
                      type="email"
                      value={
                        email
                      }
                      onChange={(
                        event
                      ) =>
                        setEmail(
                          event.target
                            .value
                        )
                      }
                      autoComplete="email"
                      required
                      placeholder="admin@lapequipment.it"
                      className="mt-2 h-[56px] w-full rounded-[16px] border border-black/10 bg-[#f5f4ef] px-4 text-[15px] text-[#181818] outline-none transition placeholder:text-black/25 focus:border-[#ff5a1f]/50 focus:bg-white focus:shadow-[0_0_0_4px_rgba(255,90,31,0.08)]"
                    />

                  </label>


                  <label className="block">

                    <span className="text-[12px] font-bold uppercase tracking-[0.08em] text-black/45">
                      Password
                    </span>


                    <input
                      type="password"
                      value={
                        password
                      }
                      onChange={(
                        event
                      ) =>
                        setPassword(
                          event.target
                            .value
                        )
                      }
                      autoComplete="current-password"
                      required
                      placeholder="••••••••"
                      className="mt-2 h-[56px] w-full rounded-[16px] border border-black/10 bg-[#f5f4ef] px-4 text-[15px] text-[#181818] outline-none transition placeholder:text-black/25 focus:border-[#ff5a1f]/50 focus:bg-white focus:shadow-[0_0_0_4px_rgba(255,90,31,0.08)]"
                    />

                  </label>


                  {error && (
                    <div className="rounded-[15px] border border-[#cf3d32]/15 bg-[#fff0ee] px-4 py-4">

                      <div className="flex items-start gap-3">

                        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#cf3d32] text-[12px] font-bold text-white">
                          !
                        </div>


                        <div>

                          <div className="text-[11px] font-bold uppercase tracking-[0.08em] text-[#b7352b]">
                            Accesso non riuscito
                          </div>


                          <div className="mt-1 text-[13px] leading-6 text-[#9d352c]">
                            {error}
                          </div>

                        </div>

                      </div>

                    </div>
                  )}


                  <button
                    type="submit"
                    disabled={
                      loading
                    }
                    className="flex h-[56px] w-full items-center justify-center rounded-[16px] bg-[#181818] px-5 text-[15px] font-semibold text-white transition hover:bg-[#ff5a1f] disabled:cursor-wait disabled:opacity-50"
                  >
                    {loading
                      ? "Accesso in corso..."
                      : "Accedi alla dashboard"}
                  </button>

                </form>


                <div className="mt-7 border-t border-black/10 pt-6">

                  <Link
                    href="/"
                    className="inline-flex items-center gap-2 text-[14px] font-semibold text-black/45 transition hover:text-[#ff5a1f]"
                  >
                    <span>
                      ←
                    </span>

                    <span>
                      Torna al sito
                    </span>
                  </Link>

                </div>


                <div className="mt-7 rounded-[15px] bg-[#f3f2ed] px-4 py-4 text-[12px] leading-5 text-black/40">
                  Area riservata allo staff
                  LAP GEAR. L'accesso richiede
                  credenziali autorizzate.
                </div>

              </div>

            </div>

          </div>

        </section>

      </div>

    </main>
  );
}


function AdminFeature({
  number,
  title,
  description,
}: {
  number:
    string;

  title:
    string;

  description:
    string;
}) {
  return (
    <div className="rounded-[18px] border border-white/10 bg-white/[0.05] p-4">

      <div className="text-[10px] font-bold uppercase tracking-[0.1em] text-[#ff7b4a]">
        {number}
      </div>


      <div className="mt-2 text-[15px] font-semibold text-white">
        {title}
      </div>


      <div className="mt-1 text-[12px] leading-5 text-white/35">
        {description}
      </div>

    </div>
  );
}
