"use client";

import Image from "next/image";
import { useState } from "react";
import { Header } from "../components/layout/Header";
import { Footer } from "../components/layout/Footer";
import frameStep from "../../assets/images/contpaso.png";
import step1 from "../../assets/images/step1.png";
import step2 from "../../assets/images/step2.png";
import step3 from "../../assets/images/step3.png";
import step4 from "../../assets/images/step4.png";
import prize1 from "../../assets/images/prize1.png";
import prize2 from "../../assets/images/prize2.png";
import prize3 from "../../assets/images/prize3.png";

export default function DinamicaPage() {
  const [activeTab, setActiveTab] = useState<"steps" | "prizes">("steps");

  const steps = [
    {
      number: 1,
      text: "Realiza una compra Mexsana y guarda tu factura.",
      image: step1,
    },
    {
      number: 2,
      text: "Registra tu factura de compra junto a tus datos y selecciona tu avatar.",
      image: step2,
    },
    {
      number: 3,
      text: "Por cada factura podrás jugar una sesión con 3 vidas.",
      image: step3,
    },
    {
      number: 4,
      text: "En la semana solo podrás jugar un máximo de 3 veces (3 facturas).",
      image: step4,
    },
  ];

  const prizes = [
    {
      number: 1,
      label: "Nombre premio 1",
      image: prize1,
    },
    {
      number: 2,
      label: "Nombre premio 2",
      image: prize2,
    },
    {
      number: 3,
      label: "Nombre premio 3",
      image: prize3,
    },
  ];

  return (
    <div className="flex min-h-screen flex-col bg-white overflow-x-hidden">
      <main className="flex mx-auto w-full flex-1 flex-col px-3 py-10 md:px-10">
        <section className="w-full
                            min-h-[calc(100vw*(1258/662))] 
                            sm:flex-1 
                            sm:min-h-full
                            h-full
                            bg-[url('../assets/images/dinamicabackground_mobile.png')] 
                            sm:bg-[url('../assets/images/gamedinamicbackground.png')] 
                            bg-cover 
                            bg-no-repeat 
                            bg-top
                            sm:bg-center 
                            relative 
                            rounded-[24px] 
                            px-3 
                            py-12 
                            pt-2 
                            text-white 
                            lg:px-8
                            lg:rounded-[48px]
                            ">

          <Header activeHref="/dinamica" />

          <div className="relative w-full mt-0">
            
            <div className="relative rounded-[36px] px-4 py-6 md:px-8 md:py-6">
              <h3 className="text-[20px] font-bold text-white/90 md:text-[22px]">
                Dinámica para jugar
              </h3>
              <h1 className="mt-2 text-[32px] font-extrabold leading-[1.05] tracking-tight text-white drop-shadow-md md:text-[52px]">
                Así de fácil es jugar
              </h1>

              {/* Tabs */}
              <div className="flex justify-center">
                <div className="mt-6 inline-flex w-[252px] rounded-full bg-white/100 p-0 text-[16px] font-semibold backdrop-blur md:w-[332px] md:text-[18px]">
                  <button
                    type="button"
                    onClick={() => setActiveTab("steps")}
                    className={`cursor-pointer w-1/2 rounded-full px-4 py-2 transition md:px-6 ${
                      activeTab === "steps"
                        ? "bg-[var(--cplblue)] text-white shadow-[0_8px_18px_rgba(16,38,109,0.25)]"
                        : "text-[var(--cplblue)]"
                    }`}
                  >
                    Paso a paso
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab("prizes")}
                    className={`cursor-pointer w-1/2 rounded-full px-4 py-2 transition md:px-6 ${
                      activeTab === "prizes"
                        ? "bg-[var(--cplblue)] text-white shadow-[0_8px_18px_rgba(16,38,109,0.25)]"
                        : "text-[var(--cplblue)]"
                    }`}
                  >
                    Premios
                  </button>
                </div>
              </div>

              {/* Steps */}
              {activeTab === "steps" ? (
                <>
                  <div className="mt-10 px-[10%] grid gap-4 sm:grid-cols-4 sm:px-[0%] lg:px-[3%]">
                    {steps.map((s) => (
                      <div
                        key={s.number}
                        style={{ aspectRatio: "529 / 561" }}
                        className="relative text-[var(--cpdblue)]"
                      >
                        <Image
                          src={s.image}
                          alt={`Paso ${s.number}`}
                          fill
                          className="object-contain"
                          sizes="(max-width: 960px) 50vw, 20vw"
                          priority={s.number === 1}
                        />
                        {/* <Image
                          src={frameStep}
                          alt="Marco decorativo paso"
                          fill
                          className="object-contain"
                          sizes="(max-width: 960px) 50vw, 20vw"
                          priority={s.number === 1}
                        />
                        <div className="relative z-10 flex h-full flex-col px-[10%] pt-[10%]">
                          <div className="absolute top-0 left-0 flex h-18/100 w-19/100 items-center justify-center rounded-full text-[180%] font-semibold text-[var(--cpdblue)] shadow-md">
                            {s.number}
                          </div>
                          <div className="bg-red-400 h-1/2 flex items-center justify-center">
                            <div className="bg-red-700 relative h-full aspect-square">
                              <Image
                                src={s.image}
                                alt={`Paso ${s.number}`}
                                fill
                                className="object-contain"
                              />
                            </div>
                          </div>
                          <div className="bg-blue-400 px-0 h-1/2">
                            <p className="text-[clamp(8px,3vw,24px)] leading-[100%] font-base text-[var(--cpdblue)]">
                              {s.text}
                            </p>  
                          </div>
                          
                        </div> */}
                      </div>
                    ))}
                  </div>

                  <p className="mt-8 text-center text-[17px] text-white/95 font-light lg:text-[20px]">
                    Se mostrará en tiempo real el ranking de clasificación. Al final de la promo, quienes califiquen en los 3 primeros puestos serán los ganadores.
                  </p>
                </>
              ) : (
                <div className="mt-10 px-[10%] grid gap-4 sm:grid-cols-3 sm:px-[0%] lg:px-[9.5%]">
                  {prizes.map((prize) => (
                    <div
                        key={prize.number}
                        style={{ aspectRatio: "529 / 561" }}
                        className="relative text-[#0B1E52]"
                      >
                        <Image
                          src={prize.image}
                          alt={`Paso ${prize.number}`}
                          fill
                          className="object-contain"
                          sizes="(max-width: 960px) 50vw, 20vw"
                          priority={prize.number === 1}
                        />
                        {/* <Image
                          src={frameStep}
                          alt="Marco decorativo paso"
                          fill
                          className="object-contain"
                          sizes="(max-width: 960px) 50vw, 20vw"
                          priority={prize.number === 1}
                        />
                        <div className="relative z-10 flex h-full flex-col px-5 py-6">
                          <div className="absolute top-0 left-0 flex h-17/100 w-18/100 items-center justify-center rounded-full text-lg font-bold text-[#0B1E52] shadow-md">
                            {prize.number}
                          </div>
                          <div className="mb-4 mt-8 flex items-center justify-center gap-3">
                            <div className="relative w-1/2 aspect-square">
                              <Image
                                src={prize.image}
                                alt={`Premio ${prize.number}`}
                                fill
                                className="object-contain"
                              />
                            </div>
                          </div>
                          <p className="my-auto px-0 text-[3.5vw] sm:text-[2.2vw] sm:leading-[90%] font-semibold text-[#11308F] text-center">
                            {prize.label}
                          </p>
                        </div> */}
                      </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* <div className="absolute bottom-6 right-8 hidden flex-col rounded-xl bg-white px-5 py-3 text-xs text-[#495784] shadow-lg sm:flex">
            <span className="font-semibold text-[#0F1F5B]">reCAPTCHA</span>
            <span>Privacidad - Condiciones</span>
          </div> */}
        </section>
      </main>
      <Footer />
    </div>
  );
}

