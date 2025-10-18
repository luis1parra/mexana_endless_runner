"use client";

import Image from "next/image";
import { useState } from "react";
import { Header } from "../components/layout/Header";
import { Footer } from "../components/layout/Footer";
import dynamicBackground from "../../assets/images/gamedinamicbackground.png";

export default function DinamicaPage() {
  const [activeTab, setActiveTab] = useState<"steps" | "prizes">("steps");

  const steps = [
    {
      number: 1,
      text: "Realiza una compra Mexsana y guarda tu factura.",
    },
    {
      number: 2,
      text: "Registra tu factura de compra junto a tus datos y selecciona tu avatar.",
    },
    {
      number: 3,
      text: "Por cada factura podrás jugar una sesión con 3 vidas.",
    },
    {
      number: 4,
      text: "En la semana solo podrás jugar un máximo de 3 veces (3 facturas).",
    },
  ];

  const prizes = [
    {
      number: 1,
      label: "Nombre premio 1",
    },
    {
      number: 2,
      label: "Nombre premio 2",
    },
    {
      number: 3,
      label: "Nombre premio 3",
    },
  ];

  return (
    <div className="flex min-h-screen flex-col bg-[#E6F1FF] text-[#0B1E52]">
      <main className="mx-auto w-full max-w-[1200px] flex-1 px-6 py-12 lg:px-10 lg:py-16">
        <section className="relative overflow-hidden rounded-[48px] bg-gradient-to-r from-[#1A2798] via-[#2F4DD7] to-[#4065FF] px-8 py-12 text-white shadow-[0_30px_60px_rgba(25,53,140,0.28)] md:px-12 lg:px-16">
          {/* Soft glow accents */}
          <div className="pointer-events-none absolute -left-28 top-24 h-64 w-64 rounded-full bg-white/15 blur-3xl" />
          <div className="pointer-events-none absolute -right-28 -top-24 h-80 w-80 rounded-full bg-[#6AA4FF]/40 blur-3xl" />
          <div className="pointer-events-none absolute right-28 bottom-24 h-48 w-48 rounded-full bg-[#9FC0FF]/30 blur-2xl" />

          <Header activeHref="/dinamica" registerHref="#" loginHref="#" />

          {/* Background image */}
          <div className="relative mt-8">
            <div className="absolute inset-0 -z-10">
              <Image
                src={dynamicBackground}
                alt="Calles de ciudad estilo Mexsana"
                className="h-full w-full rounded-[36px] object-cover opacity-95"
                sizes="100vw"
                priority
                fill
              />
            </div>

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
                  <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    {steps.map((s) => (
                      <div
                        key={s.number}
                        className="relative rounded-[24px] bg-white/75 px-5 py-6 text-[#0B1E52] shadow-[0_15px_35px_rgba(25,53,140,0.20)] backdrop-blur"
                      >
                        <div className="absolute -top-4 left-4 flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-[#FFD86F] to-[#FFAE34] text-lg font-bold text-[#0B1E52] shadow-md">
                          {s.number}
                        </div>
                        <div className="mb-3 flex items-center gap-3">
                          <div className="h-14 w-14 rounded-[14px] bg-gradient-to-br from-white/50 to-white/20 shadow-inner" />
                          <div className="h-10 w-10 rounded-full bg-gradient-to-br from-[#E6F1FF] to-[#C6DAFF]" />
                        </div>
                        <p className="text-sm font-semibold leading-relaxed text-[#11308F]">{s.text}</p>
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

          {/* Fake reCAPTCHA badge to match mockup */}
          <div className="absolute bottom-6 right-8 hidden flex-col rounded-xl bg-white px-5 py-3 text-xs text-[#495784] shadow-lg sm:flex">
            <span className="font-semibold text-[#0F1F5B]">reCAPTCHA</span>
            <span>Privacidad - Condiciones</span>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
