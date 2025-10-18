'use client';

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { Header } from "./components/layout/Header";
import { Footer } from "./components/layout/Footer";
import { LoginModal } from "../components/modals/LoginModal";
import { RegistrationModal } from "../components/modals/RegistrationModal";
import homeBackground from "../assets/images/homebackground.png";

export default function Home() {

  const [isRegistrationOpen, setIsRegistrationOpen] = useState(false);
  const [isLoginOpen, setIsLoginOpen] = useState(false);

  return (
    <div className="flex min-h-screen flex-col bg-[#E6F1FF] text-[#0B1E52]">
      <main className="mx-auto w-full max-w-[1200px] flex-1 px-6 py-12 lg:px-10 lg:py-16">
        <section className="relative overflow-hidden rounded-[48px] bg-gradient-to-r from-[#1A2798] via-[#2F4DD7] to-[#4065FF] px-8 py-12 text-white shadow-[0_30px_60px_rgba(25,53,140,0.28)] md:px-12 lg:px-16">
          <div className="pointer-events-none absolute -left-28 top-24 h-64 w-64 rounded-full bg-white/15 blur-3xl" />
          <div className="pointer-events-none absolute -right-28 -top-24 h-80 w-80 rounded-full bg-[#6AA4FF]/40 blur-3xl" />
          <div className="pointer-events-none absolute right-28 bottom-24 h-48 w-48 rounded-full bg-[#9FC0FF]/30 blur-2xl" />
          <Header
            activeHref="/"
            onRegisterClick={() => setIsRegistrationOpen(true)}
            onLoginClick={() => setIsLoginOpen(true)}
          />

          <div className="relative mt-16 grid items-center gap-14 lg:grid-cols-12">
            <div className="lg:col-span-6 xl:col-span-5">
              <h1 className="text-[48px] font-black leading-[1.05] tracking-tight text-white drop-shadow-md md:text-[56px] lg:text-[64px]">
                FRESH GAME
              </h1>
              <p className="mt-4 text-lg leading-relaxed text-white/85 md:text-xl">
                Con la Big Promo de Mexsana podras demostrar que cuando se trata
                de frescura, tu eres el mejor.
              </p>
              <p className="mt-6 text-2xl font-extrabold text-white md:text-[28px]">
                Participa y juega acumulando puntos por tus compras!
              </p>
              <div className="mt-8 flex flex-wrap gap-4">
                <button
                  type="button"
                  onClick={() => setIsRegistrationOpen(true)}
                  className="rounded-full bg-white px-8 py-3 text-base font-semibold text-[#1D3FCE] shadow-[0_15px_35px_rgba(16,38,109,0.3)] transition hover:bg-[#F2F6FF]"
                >
                  Registrarme
                </button>
                <Link
                  href="/dinamica"
                  className="rounded-full border border-white/70 px-8 py-3 text-base font-semibold text-white transition hover:bg-white/10"
                >
                  Conocer dinamica
                </Link>
              </div>
              <p className="mt-6 text-sm text-white/80">
                Aplican terminos y condiciones.{" "}
                <Link
                  href="#"
                  className="font-semibold underline underline-offset-4 hover:text-white"
                >
                  Consultalos aqui
                </Link>
              </p>
            </div>
            <div className="relative z-10 lg:col-span-6 lg:col-start-7 xl:col-span-7">
              <div className="relative mx-auto w-full max-w-[520px] overflow-hidden rounded-[36px] shadow-[0_25px_45px_rgba(25,53,140,0.35)]">
                <Image
                  src={homeBackground}
                  alt="Jugadores celebrando la frescura Mexsana"
                  className="h-auto w-full object-cover"
                  sizes="(max-width: 1024px) 100vw, 520px"
                  priority
                />
              </div>
            </div>
          </div>

          <div className="absolute bottom-6 right-8 hidden flex-col rounded-xl bg-white px-5 py-3 text-xs text-[#495784] shadow-lg sm:flex">
            <span className="font-semibold text-[#0F1F5B]">reCAPTCHA</span>
            <span>Privacidad - Condiciones</span>
          </div>
        </section>
      </main>
      <Footer />
      <RegistrationModal
        open={isRegistrationOpen}
        onClose={() => setIsRegistrationOpen(false)}
      />
      <LoginModal open={isLoginOpen} onClose={() => setIsLoginOpen(false)} />
    </div>
  );
}
