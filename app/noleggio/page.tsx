"use client";







import Link from "next/link";







import {



  FormEvent,



  useEffect,



  useMemo,



  useState,



} from "react";







import {



  useRental,



} from "@/components/RentalProvider";







import {



  rentalDays,



  rentalPrice,



} from "@/lib/pricing";











type AvailabilityMap =



  Record<



    number,



    boolean | null



  >;











export default function RentalPage() {



  const {



    items,



    remove,



    changeQuantity,



    clear,



  } =



    useRental();







  const [



    from,



    setFrom,



  ] =



    useState("");







  const [



    to,



    setTo,



  ] =



    useState("");







  const [



    message,



    setMessage,



  ] =



    useState("");







  const [



    sending,



    setSending,



  ] =



    useState(false);







  const [



    availability,



    setAvailability,



  ] =



    useState<AvailabilityMap>(



      {}



    );







  const [



    availabilityLoading,



    setAvailabilityLoading,



  ] =



    useState(false);











  /* =========================================================



     CALCULATIONS



     ========================================================= */







  const days =



    rentalDays(



      from,



      to



    );







  const total =



    useMemo(



      () =>



        items.reduce(



          (



            sum,



            item



          ) =>



            sum +



            rentalPrice(



              item.product



                .priceDay,



              days



            ) *



              item.quantity,



          0



        ),



      [



        items,



        days,



      ]



    );







  const totalQuantity =



    items.reduce(



      (



        total,



        item



      ) =>



        total +



        item.quantity,



      0



    );







  const hasDates =



    Boolean(



      from &&



      to &&



      to >= from



    );







  const allVerified =



    hasDates &&



    items.length > 0 &&



    items.every(



      (item) =>



        typeof availability[



          item.product.id



        ] === "boolean"



    );







  const allAvailable =



    allVerified &&



    items.every(



      (item) =>



        availability[



          item.product.id



        ] === true



    );







  const hasUnavailable =



    items.some(



      (item) =>



        availability[



          item.product.id



        ] === false



    );











  /* =========================================================



     AVAILABILITY



     ========================================================= */







  useEffect(() => {



    if (



      !from ||



      !to ||



      items.length ===



        0 ||



      to < from



    ) {



      setAvailability(



        {}



      );







      setAvailabilityLoading(



        false



      );







      return;



    }







    let cancelled =



      false;







    async function loadAvailability() {



      setAvailabilityLoading(



        true



      );







      const results =



        await Promise.all(



          items.map(



            async (



              item



            ) => {



              try {



                const params =



                  new URLSearchParams(



                    {



                      productId:



                        String(



                          item



                            .product



                            .id



                        ),







                      quantity:



                        String(



                          item



                            .quantity



                        ),







                      from,



                      to,



                    }



                  );







                const response =



                  await fetch(



                    `/api/availability?${params.toString()}`,



                    {



                      cache:



                        "no-store",



                    }



                  );







                const result =



                  await response.json();







                if (



                  !response.ok



                ) {



                  throw new Error(



                    result.error ||



                      "Errore disponibilità"



                  );



                }







                return {



                  productId:



                    item



                      .product



                      .id,







                  available:



                    Boolean(



                      result.available



                    ),



                };



              } catch (



                error



              ) {



                console.error(



                  "Errore disponibilità:",



                  error



                );







                return {



                  productId:



                    item



                      .product



                      .id,







                  available:



                    null,



                };



              }



            }



          )



        );







      if (



        cancelled



      ) {



        return;



      }







      const next:



        AvailabilityMap =



          {};







      results.forEach(



        (



          result



        ) => {



          next[



            result.productId



          ] =



            result.available;



        }



      );







      setAvailability(



        next



      );







      setAvailabilityLoading(



        false



      );



    }







    void loadAvailability();







    return () => {



      cancelled =



        true;



    };



  }, [



    from,



    to,



    items,



  ]);











  /* =========================================================



     SUBMIT



     ========================================================= */







  async function submit(



    event:



      FormEvent<HTMLFormElement>



  ) {



    event.preventDefault();







    const form =



      event.currentTarget;







    if (



      !items.length



    ) {



      return;



    }







    setMessage("");







    const unavailableItem =



      items.find(



        (item) =>



          availability[



            item.product.id



          ] === false



      );







    if (



      unavailableItem



    ) {



      setMessage(



        `La quantità richiesta di ${unavailableItem.product.name} non è disponibile nelle date selezionate.`



      );







      return;



    }







    const unverifiableItem =



      items.find(



        (item) =>



          availability[



            item.product.id



          ] === null ||



          typeof availability[



            item.product.id



          ] ===



            "undefined"



      );







    if (



      from &&



      to &&



      unverifiableItem



    ) {



      setMessage(



        `Impossibile verificare la disponibilità di ${unverifiableItem.product.name}.`



      );







      return;



    }







    setSending(



      true



    );







    const data =



      new FormData(



        form



      );







    const payload = {



      customer: {



        name:



          String(



            data.get(



              "name"



            ) ?? ""



          ).trim(),







        email:



          String(



            data.get(



              "email"



            ) ?? ""



          ).trim(),







        phone:



          String(



            data.get(



              "phone"



            ) ?? ""



          ).trim(),



      },







      from,



      to,







      notes:



        String(



          data.get(



            "notes"



          ) ?? ""



        ).trim(),







      items:



        items.map(



          (item) => ({



            productId:



              item.product



                .id,







            quantity:



              item.quantity,







            priceDay:



              item.product



                .priceDay,



          })



        ),



    };







    try {



      const response =



        await fetch(



          "/api/request",



          {



            method:



              "POST",







            headers: {



              "Content-Type":



                "application/json",



            },







            body:



              JSON.stringify(



                payload



              ),



          }



        );







      const result =



        await response.json();







      if (



        !response.ok



      ) {



        throw new Error(



          result.error ||



            "Errore invio richiesta"



        );



      }







      setMessage(



        `Richiesta inviata · riferimento ${result.reference}`



      );







      clear();







      form.reset();







      setFrom("");



      setTo("");







      setAvailability(



        {}



      );



    } catch (



      error



    ) {



      setMessage(



        error instanceof Error



          ? error.message



          : "Errore invio richiesta"



      );



    } finally {



      setSending(



        false



      );



    }



  }











  const success =



    message.startsWith(



      "Richiesta inviata"



    );











  return (



    <main className="min-h-screen bg-[#ebeae4] px-5 pb-16 pt-6 text-[#111111] sm:px-8 lg:px-10 lg:pb-20 xl:px-14">



      <div className="mx-auto max-w-[1680px]">







        {/* =====================================================



            HERO



            ===================================================== */}







        <section className="overflow-hidden rounded-[30px] border border-black/10 bg-white shadow-[0_18px_60px_rgba(0,0,0,0.06)]">



          <div className="grid xl:grid-cols-[1fr_430px]">







            <div className="relative overflow-hidden p-8 sm:p-10 lg:p-12">



              <div className="pointer-events-none absolute -right-32 -top-36 h-[380px] w-[380px] rounded-full bg-[#ff5a1f]/[0.07]" />







              <div className="relative">



                <div className="inline-flex items-center gap-2.5 rounded-full bg-[#fff0e9] px-4 py-2 text-[13px] font-bold uppercase tracking-[0.12em] text-[#e94b12]">



                  <span className="h-2 w-2 rounded-full bg-[#ff5a1f]" />







                  Il tuo kit



                </div>







                <h1 className="mt-7 max-w-[900px] text-[52px] font-semibold leading-[0.9] tracking-[-0.062em] sm:text-[68px] lg:text-[78px]">



                  Costruisci il kit.



                  <br />







                  <span className="text-[#ff5a1f]">



                    Poi scegli le date.



                  </span>



                </h1>







                <p className="mt-7 max-w-[720px] text-[18px] leading-8 text-black/55">



                  La richiesta non è un



                  checkout automatico.



                  Verifichiamo il materiale



                  sulle date indicate e



                  confermiamo successivamente



                  il noleggio.



                </p>



              </div>



            </div>







            <div className="bg-[#181818] p-8 text-white sm:p-10">



              <div className="text-[12px] font-bold uppercase tracking-[0.13em] text-[#ff7b4a]">



                Richiesta noleggio



              </div>







              <div className="mt-8 space-y-4">



                <ProcessLine



                  number="01"



                  title="Kit & date"



                  text="Materiale, quantità e periodo"



                  active



                />







                <ProcessLine



                  number="02"



                  title="I tuoi dati"



                  text="Contatto e dettagli produzione"



                />







                <ProcessLine



                  number="03"



                  title="Conferma"



                  text="Verifica finale LAP GEAR"



                />



              </div>



            </div>



          </div>



        </section>











        {/* =====================================================



            MESSAGE



            ===================================================== */}







        {message && (



          <div



            className={`



              mt-6



              rounded-[18px]



              border



              px-5



              py-4



              text-[15px]



              font-semibold







              ${



                success



                  ? "border-[#168a50]/20 bg-[#e9f6ee] text-[#126f41]"



                  : "border-[#ff5a1f]/20 bg-[#fff0e9] text-[#a83b14]"



              }



            `}



          >



            {



              message



            }



          </div>



        )}











        {/* =====================================================



            EMPTY



            ===================================================== */}







        {items.length ===



        0 ? (



          <section className="mt-7 overflow-hidden rounded-[28px] border border-black/10 bg-white">



            <div className="grid min-h-[480px] lg:grid-cols-[1fr_340px]">



              <div className="flex items-center p-8 sm:p-12">



                <div className="max-w-[620px]">



                  <div className="text-[13px] font-bold uppercase tracking-[0.13em] text-[#ff5a1f]">



                    {success



                      ? "Richiesta ricevuta"



                      : "Kit vuoto"}



                  </div>







                  <h2 className="mt-3 text-[44px] font-semibold leading-[0.95] tracking-[-0.055em] sm:text-[56px]">



                    {success



                      ? "Perfetto. Ora tocca a noi."



                      : "Aggiungi il gear che ti serve."}



                  </h2>







                  <p className="mt-5 max-w-[540px] text-[17px] leading-8 text-black/50">



                    {success



                      ? "Verificheremo la richiesta e ti contatteremo per la conferma."



                      : "Esplora il catalogo, scegli l’attrezzatura e torna qui per indicare le date."}



                  </p>







                  <Link



                    href="/catalogo"



                    className="mt-8 inline-flex h-[58px] items-center justify-center rounded-[16px] bg-[#181818] px-7 text-[15px] font-semibold text-white transition hover:bg-[#ff5a1f]"



                  >



                    Vai al catalogo →



                  </Link>



                </div>



              </div>







              <div className="relative hidden overflow-hidden bg-[#181818] lg:block">



                <div className="absolute -right-20 -top-20 h-[240px] w-[240px] rounded-full bg-[#ff5a1f]/20" />







                <div className="absolute bottom-10 left-10 text-white">



                  <div className="text-[12px] font-bold uppercase tracking-[0.13em] text-[#ff7b4a]">



                    LAP GEAR



                  </div>







                  <div className="mt-2 text-[28px] font-semibold leading-tight">



                    Equipment



                    <br />



                    Rental.



                  </div>



                </div>



              </div>



            </div>



          </section>



        ) : (







          /* ===================================================



             KIT + REQUEST



             =================================================== */







          <div className="mt-7 grid items-start gap-6 xl:grid-cols-[minmax(0,1.15fr)_minmax(420px,.85fr)]">







            {/* ===============================================



                KIT



                =============================================== */}







            <section>



              <div className="mb-5 flex items-end justify-between gap-5">



                <div>



                  <div className="text-[13px] font-bold uppercase tracking-[0.12em] text-[#ff5a1f]">



                    01 · Kit



                  </div>







                  <h2 className="mt-2 text-[38px] font-semibold tracking-[-0.05em]">



                    Il materiale.



                  </h2>



                </div>







                <div className="rounded-full bg-white px-4 py-2 text-[13px] font-semibold text-black/50">



                  {totalQuantity}{" "}



                  {totalQuantity ===



                  1



                    ? "articolo"



                    : "articoli"}



                </div>



              </div>







              <div className="space-y-4">



                {items.map(



                  (item) => {



                    const available =



                      availability[



                        item.product



                          .id



                      ];







                    return (



                      <article



                        key={



                          item.product



                            .id



                        }



                        className="overflow-hidden rounded-[24px] border border-black/10 bg-white"



                      >



                        <div className="grid sm:grid-cols-[190px_1fr]">







                          {/* IMAGE */}







                          <Link



                            href={`/prodotto/${item.product.slug}`}



                            className="flex min-h-[190px] items-center justify-center bg-[#f1f0ea] p-5"



                          >



                            {item.product



                              .image ? (



                              // eslint-disable-next-line @next/next/no-img-element



                              <img



                                src={



                                  item



                                    .product



                                    .image



                                }



                                alt={



                                  item



                                    .product



                                    .name



                                }



                                className="h-[150px] w-full object-contain"



                              />



                            ) : (



                              <span className="text-[11px] font-bold uppercase tracking-[0.12em] text-black/20">



                                LAP GEAR



                              </span>



                            )}



                          </Link>







                          {/* INFO */}







                          <div className="flex min-w-0 flex-col p-5 sm:p-6">



                            <div className="flex items-start justify-between gap-5">



                              <div className="min-w-0">



                                <div className="text-[12px] font-bold uppercase tracking-[0.1em] text-[#ff5a1f]">



                                  {



                                    item



                                      .product



                                      .categoryLabel



                                  }



                                </div>







                                <Link



                                  href={`/prodotto/${item.product.slug}`}



                                >



                                  <h3 className="mt-2 text-[27px] font-semibold leading-none tracking-[-0.045em] transition hover:text-[#ff5a1f]">



                                    {



                                      item



                                        .product



                                        .name



                                    }



                                  </h3>



                                </Link>







                                <div className="mt-3 text-[15px] font-medium text-black/48">



                                  €



                                  {



                                    item



                                      .product



                                      .priceDay



                                  }



                                  {" "}



                                  / giorno



                                </div>



                              </div>







                              <button



                                type="button"



                                onClick={() =>



                                  remove(



                                    item



                                      .product



                                      .id



                                  )



                                }



                                className="shrink-0 rounded-[12px] px-3 py-2 text-[13px] font-semibold text-black/35 transition hover:bg-[#fff0e9] hover:text-[#ff5a1f]"



                              >



                                Rimuovi



                              </button>



                            </div>











                            {/* AVAILABILITY */}







                            {hasDates && (



                              <div



                                className={`



                                  mt-5



                                  flex



                                  items-center



                                  gap-3



                                  rounded-[14px]



                                  px-4



                                  py-3



                                  text-[13px]



                                  font-semibold







                                  ${



                                    availabilityLoading



                                      ? "bg-[#f3f2ed] text-black/45"



                                      : available === true



                                        ? "bg-[#e9f6ee] text-[#126f41]"



                                        : available === false



                                          ? "bg-[#fff0e9] text-[#a83b14]"



                                          : "bg-[#f3f2ed] text-black/45"



                                  }



                                `}



                              >



                                <span



                                  className={`



                                    h-2.5



                                    w-2.5



                                    shrink-0



                                    rounded-full







                                    ${



                                      availabilityLoading



                                        ? "bg-black/25"



                                        : available === true



                                          ? "bg-[#168a50]"



                                          : available === false



                                            ? "bg-[#ff5a1f]"



                                            : "bg-black/25"



                                    }



                                  `}



                                />







                                {availabilityLoading



                                  ? "Verifica disponibilità in corso…"



                                  : available === true



                                    ? "Disponibile per la quantità e le date richieste"



                                    : available === false



                                      ? "Quantità richiesta non disponibile per queste date"



                                      : "Disponibilità non verificabile"}



                              </div>



                            )}











                            {/* QUANTITY */}







                            <div className="mt-auto flex items-center justify-between gap-5 pt-5">



                              <div className="flex h-[50px] items-center overflow-hidden rounded-[15px] border border-black/10 bg-[#f3f2ed]">



                                <button



                                  type="button"



                                  aria-label="Riduci quantità"



                                  onClick={() =>



                                    changeQuantity(



                                      item



                                        .product



                                        .id,



                                      item.quantity -



                                        1



                                    )



                                  }



                                  className="flex h-full w-12 items-center justify-center text-[20px] text-black/45 transition hover:bg-white hover:text-black"



                                >



                                  −



                                </button>







                                <div className="flex h-full min-w-[52px] items-center justify-center border-x border-black/10 bg-white text-[16px] font-semibold">



                                  {



                                    item.quantity



                                  }



                                </div>







                                <button



                                  type="button"



                                  aria-label="Aumenta quantità"



                                  onClick={() =>



                                    changeQuantity(



                                      item



                                        .product



                                        .id,



                                      item.quantity +



                                        1



                                    )



                                  }



                                  className="flex h-full w-12 items-center justify-center text-[20px] text-black/45 transition hover:bg-white hover:text-black"



                                >



                                  +



                                </button>



                              </div>







                              <div className="text-right">



                                <div className="text-[11px] font-bold uppercase tracking-[0.08em] text-black/35">



                                  Quantità



                                </div>







                                <div className="mt-1 text-[14px] font-semibold">



                                  {



                                    item.quantity



                                  }{" "}



                                  richieste



                                </div>



                              </div>



                            </div>



                          </div>



                        </div>



                      </article>



                    );



                  }



                )}



              </div>







              <Link



                href="/catalogo"



                className="mt-5 flex h-[58px] items-center justify-center rounded-[17px] border border-black/10 bg-white text-[15px] font-semibold text-black/55 transition hover:border-[#ff5a1f]/30 hover:text-[#ff5a1f]"



              >



                + Aggiungi altro gear



              </Link>



            </section>











            {/* ===============================================



                REQUEST FORM



                =============================================== */}







            <form



              onSubmit={



                submit



              }



              className="overflow-hidden rounded-[26px] border border-black/10 bg-white shadow-[0_18px_55px_rgba(0,0,0,0.055)] xl:sticky xl:top-[112px]"



            >







              {/* DATES */}







              <div className="border-b border-black/10 p-6 sm:p-7">



                <div className="flex items-center gap-4">



                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#ff5a1f] text-[12px] font-bold text-white">



                    01



                  </div>







                  <div>



                    <div className="text-[12px] font-bold uppercase tracking-[0.1em] text-[#ff5a1f]">



                      Kit & date



                    </div>







                    <h2 className="mt-1 text-[25px] font-semibold tracking-[-0.035em]">



                      Quando ti serve?



                    </h2>



                  </div>



                </div>







                <div className="mt-6 grid gap-3 sm:grid-cols-2">



                  <Field



                    label="Ritiro"



                  >



                    <input



                      required



                      type="date"



                      value={



                        from



                      }



                      onChange={(



                        event



                      ) => {



                        const value =



                          event



                            .target



                            .value;







                        setFrom(



                          value



                        );







                        if (



                          to &&



                          value > to



                        ) {



                          setTo("");



                        }



                      }}



                      className={inputClass}



                    />



                  </Field>







                  <Field



                    label="Riconsegna"



                  >



                    <input



                      required



                      type="date"



                      min={



                        from ||



                        undefined



                      }



                      value={



                        to



                      }



                      onChange={(



                        event



                      ) =>



                        setTo(



                          event



                            .target



                            .value



                        )



                      }



                      className={inputClass}



                    />



                  </Field>



                </div>







                <AvailabilitySummary



                  hasDates={



                    hasDates



                  }



                  loading={



                    availabilityLoading



                  }



                  allVerified={



                    allVerified



                  }



                  allAvailable={



                    allAvailable



                  }



                  hasUnavailable={



                    hasUnavailable



                  }



                />



              </div>











              {/* CUSTOMER */}







              <div className="p-6 sm:p-7">



                <div className="flex items-center gap-4">



                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#181818] text-[12px] font-bold text-white">



                    02



                  </div>







                  <div>



                    <div className="text-[12px] font-bold uppercase tracking-[0.1em] text-black/35">



                      I tuoi dati



                    </div>







                    <h2 className="mt-1 text-[25px] font-semibold tracking-[-0.035em]">



                      Parliamo del progetto.



                    </h2>



                  </div>



                </div>







                <div className="mt-6 space-y-4">



                  <Field



                    label="Nome e cognome"



                  >



                    <input



                      required



                      name="name"



                      autoComplete="name"



                      className={inputClass}



                    />



                  </Field>







                  <div className="grid gap-4 sm:grid-cols-2">



                    <Field



                      label="Email"



                    >



                      <input



                        required



                        type="email"



                        name="email"



                        autoComplete="email"



                        className={inputClass}



                      />



                    </Field>







                    <Field



                      label="Telefono"



                    >



                      <input



                        required



                        type="tel"



                        name="phone"



                        autoComplete="tel"



                        className={inputClass}



                      />



                    </Field>



                  </div>







                  <Field



                    label="Note sulla produzione"



                  >



                    <textarea



                      name="notes"



                      rows={4}



                      placeholder="Descrivi brevemente il progetto, eventuali accessori o esigenze particolari."



                      className={`${inputClass} min-h-[120px] resize-y py-4`}



                    />



                  </Field>



                </div>



              </div>











              {/* SUMMARY */}







              <div className="border-t border-black/10 bg-[#f3f2ed] p-6 sm:p-7">



                <div className="grid grid-cols-2 gap-3">



                  <SummaryBox



                    label="Durata"



                    value={



                      hasDates



                        ? `${days} ${



                            days ===



                            1



                              ? "giorno"



                              : "giorni"



                          }`



                        : "—"



                    }



                  />







                  <SummaryBox



                    label="Stima noleggio"



                    value={



                      hasDates



                        ? formatMoney(



                            total



                          )



                        : "—"



                    }



                  />



                </div>







                <p className="mt-5 text-[13px] leading-6 text-black/48">



                  La richiesta non



                  costituisce una



                  prenotazione



                  confermata. Eventuali



                  garanzie o cauzioni



                  vengono comunicate



                  prima della conferma.



                  {" "}



                  <Link



                    href="/termini-noleggio"



                    className="font-semibold text-[#ff5a1f] underline underline-offset-4"



                  >



                    Termini di noleggio



                  </Link>



                </p>







                <p className="mt-4 text-[12px] leading-5 text-black/40">

                  Inviando la richiesta dichiari di aver letto la{" "}

                  <Link

                    href="/privacy"

                    className="font-semibold text-[#ff5a1f] underline underline-offset-4"

                  >

                    Informativa privacy

                  </Link>

                  .

                </p>







                <button



                  type="submit"



                  disabled={



                    sending ||



                    availabilityLoading ||



                    !hasDates ||



                    !allVerified ||



                    hasUnavailable



                  }



                  className="mt-6 flex h-[62px] w-full items-center justify-center rounded-[17px] bg-[#181818] px-6 text-[16px] font-semibold text-white transition hover:bg-[#ff5a1f] disabled:cursor-not-allowed disabled:bg-black/20"



                >



                  {sending



                    ? "Invio richiesta…"



                    : availabilityLoading



                      ? "Verifica disponibilità…"



                      : hasUnavailable



                        ? "Modifica il kit"



                        : "Invia richiesta →"}



                </button>



              </div>



            </form>



          </div>



        )}



      </div>



    </main>



  );



}











const inputClass =



  "h-[56px] w-full rounded-[15px] border border-black/10 bg-[#f6f5f0] px-4 text-[15px] outline-none transition placeholder:text-black/30 focus:border-[#ff5a1f]/45 focus:bg-white focus:shadow-[0_0_0_4px_rgba(255,90,31,0.06)]";











function Field({



  label,



  children,



}: {



  label: string;



  children:



    React.ReactNode;



}) {



  return (



    <label className="block">



      <span className="mb-2 block text-[13px] font-semibold text-black/55">



        {



          label



        }



      </span>







      {



        children



      }



    </label>



  );



}











function SummaryBox({



  label,



  value,



}: {



  label: string;



  value: string;



}) {



  return (



    <div className="rounded-[16px] border border-black/10 bg-white p-4">



      <div className="text-[11px] font-bold uppercase tracking-[0.08em] text-black/35">



        {



          label



        }



      </div>







      <div className="mt-2 text-[19px] font-semibold tracking-[-0.025em]">



        {



          value



        }



      </div>



    </div>



  );



}











function AvailabilitySummary({



  hasDates,



  loading,



  allVerified,



  allAvailable,



  hasUnavailable,



}: {



  hasDates: boolean;



  loading: boolean;



  allVerified: boolean;



  allAvailable: boolean;



  hasUnavailable: boolean;



}) {



  let text =



    "Seleziona ritiro e riconsegna per verificare il kit.";







  let style =



    "bg-[#f3f2ed] text-black/45";







  let dot =



    "bg-black/25";







  if (



    hasDates &&



    loading



  ) {



    text =



      "Verifica del kit in corso…";



  } else if (



    hasDates &&



    allAvailable



  ) {



    text =



      "Il kit richiesto risulta disponibile per le date selezionate.";







    style =



      "bg-[#e9f6ee] text-[#126f41]";







    dot =



      "bg-[#168a50]";



  } else if (



    hasDates &&



    hasUnavailable



  ) {



    text =



      "Una o più quantità richieste non risultano disponibili.";







    style =



      "bg-[#fff0e9] text-[#a83b14]";







    dot =



      "bg-[#ff5a1f]";



  } else if (



    hasDates &&



    !loading &&



    !allVerified



  ) {



    text =



      "Non è stato possibile completare la verifica automatica.";



  }







  return (



    <div



      className={`mt-4 flex items-start gap-3 rounded-[15px] px-4 py-3.5 text-[13px] font-semibold leading-5 ${style}`}



    >



      <span



        className={`mt-1 h-2.5 w-2.5 shrink-0 rounded-full ${dot}`}



      />







      {



        text



      }



    </div>



  );



}











function ProcessLine({



  number,



  title,



  text,



  active = false,



}: {



  number: string;



  title: string;



  text: string;



  active?: boolean;



}) {



  return (



    <div className="flex gap-4 border-b border-white/10 pb-4 last:border-b-0 last:pb-0">



      <div



        className={`



          flex



          h-9



          w-9



          shrink-0



          items-center



          justify-center



          rounded-full



          text-[11px]



          font-bold







          ${



            active



              ? "bg-[#ff5a1f] text-white"



              : "bg-white/[0.08] text-white/45"



          }



        `}



      >



        {



          number



        }



      </div>







      <div>



        <div className="text-[16px] font-semibold">



          {



            title



          }



        </div>







        <div className="mt-1 text-[13px] text-white/40">



          {



            text



          }



        </div>



      </div>



    </div>



  );



}











function formatMoney(



  value: number



) {



  return new Intl.NumberFormat(



    "it-IT",



    {



      style:



        "currency",







      currency:



        "EUR",







      maximumFractionDigits:



        0,



    }



  ).format(



    value



  );



}