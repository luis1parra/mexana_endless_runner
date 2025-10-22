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
    <div className="flex min-h-screen flex-col bg-white text-[#0B1E52]">
      <main className="flex mx-auto w-full flex-1 px-2 py-6 lg:px-10 lg:py-16">
        <section className="w-full bg-white bg-[url('../assets/images/rankingbackground_mobile.png')] md:bg-[url('../assets/images/gamedinamicbackground.png')] bg-cover bg-no-repeat bg-center relative rounded-[24px] px-3 py-12 pt-2 text-white md:px-8 lg:px-12 lg:rounded-[48px]">

          <Header
            activeHref="/"
          />

          <div className="relative mt-8">
            
            <div className="relative rounded-[36px] px-4 py-6 md:px-8 md:py-10">
              <p className="text-lg font-semibold text-white/90">Dinámica para jugar</p>
              <h1 className="mt-2 text-[44px] font-black italic leading-[1.05] tracking-tight text-white drop-shadow-md md:text-[56px]">
                Así de fácil es jugar
              </h1>

              {/* Tabs */}
              <div className="mt-6 inline-flex rounded-full bg-white/15 p-1 text-sm font-semibold backdrop-blur">
                <button
                  type="button"
                  onClick={() => setActiveTab("steps")}
                  className={`rounded-full px-4 py-2 transition md:px-6 ${
                    activeTab === "steps"
                      ? "bg-white text-[#1D3FCE] shadow-[0_8px_18px_rgba(16,38,109,0.25)]"
                      : "text-white/80 hover:text-white"
                  }`}
                >
                  Paso a paso
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("prizes")}
                  className={`rounded-full px-4 py-2 transition md:px-6 ${
                    activeTab === "prizes"
                      ? "bg-white text-[#1D3FCE] shadow-[0_8px_18px_rgba(16,38,109,0.25)]"
                      : "text-white/80 hover:text-white"
                  }`}
                >
                  Premios
                </button>
              </div>

              {/* Steps */}
              {activeTab === "steps" ? (
                <>
                  <div className="mt-10 px-12 grid gap-4 sm:grid-cols-4 sm:px-2">
                    {steps.map((s) => (
                      <div
                        key={s.number}
                        style={{ aspectRatio: "529 / 561" }}
                        className="relative text-[#0B1E52]"
                      >
                        <Image
                          src={frameStep}
                          alt="Marco decorativo paso"
                          fill
                          className="object-contain"
                          sizes="(max-width: 960px) 50vw, 20vw"
                          priority={s.number === 1}
                        />
                        <div className="relative z-10 flex h-full flex-col px-5 py-6">
                          <div className="absolute top-0 left-0 flex h-17/100 w-18/100 items-center justify-center rounded-full text-lg font-bold text-[#0B1E52] shadow-md">
                            {s.number}
                          </div>
                          <div className="mb-4 mt-8 sm:mt-1 xl:mt-8 flex items-center justify-center gap-3">
                            <div className="relative w-1/2 aspect-square">
                              <Image
                                src={s.image}
                                alt={`Paso ${s.number}`}
                                fill
                                className="object-contain"
                              />
                            </div>
                          </div>
                          <p className="my-auto px-0 text-[3.5vw] sm:text-[1.5vw] leading-[110%] sm:leading-[90%] font-semibold text-[#11308F]">
                            {s.text}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <p className="mt-8 text-center text-sm text-white/95">
                    Se mostrará en tiempo real el ranking de clasificación. Al final de la promo, quienes califiquen en los 3 primeros puestos serán los ganadores.
                  </p>
                </>
              ) : (
                <div className="mt-12 grid gap-5 md:grid-cols-3">
                  {prizes.map((prize) => (
                    <div
                      key={prize.number}
                      className="relative flex flex-col items-center rounded-[28px] bg-white/75 px-6 py-8 text-center text-[#0B1E52] shadow-[0_18px_40px_rgba(25,53,140,0.22)] backdrop-blur"
                    >
                      <div className="absolute -top-5 left-6 flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-[#FFD86F] to-[#FFAE34] text-lg font-bold text-[#0B1E52] shadow-md">
                        {prize.number}
                      </div>
                      <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-[#3C6BFF] via-[#4E84FF] to-[#7AAEFF] shadow-[0_12px_24px_rgba(22,61,163,0.35)]">
                        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white text-3xl font-black text-[#1D3FCE] shadow-inner">
                          {prize.number}
                        </div>
                      </div>
                      <p className="text-base font-semibold text-[#11308F]">{prize.label}</p>
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

