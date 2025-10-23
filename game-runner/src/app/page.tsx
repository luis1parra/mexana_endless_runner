'use client';

import Link from "next/link";
import { useState } from "react";
import { Header } from "./components/layout/Header";
import { Footer } from "./components/layout/Footer";
import { LoginModal } from "../components/modals/LoginModal";
import { RegistrationModal } from "../components/modals/RegistrationModal";

export default function Home() {

  const [isRegistrationOpen, setIsRegistrationOpen] = useState(false);
  const [isLoginOpen, setIsLoginOpen] = useState(false);

  return (
    <div className="flex min-h-screen flex-col bg-white text-[#0B1E52]">
      <main className="flex mx-auto w-full flex-1 px-2 py-6 lg:px-10 lg:py-16">
        <section className="w-full bg-white bg-[url('../assets/images/homebackground_mobile.png')] sm:bg-[url('../assets/images/homebackground.png')] bg-cover bg-no-repeat bg-center relative rounded-[24px] px-3 py-12 pt-2 text-white md:px-8 lg:px-12 lg:rounded-[48px]">

          <Header
            activeHref="/"
          />

          <div className="relative mt-16 grid items-center gap-14 lg:grid-cols-12">
            <div className="md:col-span-6 xl:col-span-7">
              <h1 className="text-[48px] font-black leading-[1.05] tracking-tight text-white drop-shadow-md md:text-[56px] lg:text-[64px]">
                FRESH GAME
              </h1>
              <p className="mt-4 text-lg leading-relaxed text-white/85 md:text-xl">
                Con la Big Promo de Mexsana podrás demostrar que cuando se trata
                de frescura, tu eres el mejor.
              </p>
              <p className="mt-6 text-2xl font-extrabold text-white md:text-[28px]">
                Participa y juega acumulando puntos por tus compras!
              </p>
              <div className="mt-8 flex flex-wrap gap-4">
                <button
                  type="button"
                  onClick={() => setIsRegistrationOpen(true)}
                  className="cursor-pointer rounded-full bg-white px-8 py-3 text-base font-semibold text-[#1D3FCE] shadow-[0_15px_35px_rgba(16,38,109,0.3)] transition hover:bg-[#F2F6FF]"
                >
                  Registrarme
                </button>
                <Link
                  href="/dinamica"
                  className="rounded-full border border-white/70 px-8 py-3 text-base font-semibold text-white transition hover:bg-white/10"
                >
                  Conocer dinámica
                </Link>
              </div>
              <p className="mt-6 text-sm text-white/80">
                Aplican términos y condiciones.{" "}
                <Link
                  href="#"
                  className="font-semibold underline underline-offset-4 hover:text-white"
                >
                  Consúltalos aquí
                </Link>
              </p>
            </div>
          </div>

          {/* <div className="absolute bottom-6 right-8 hidden flex-col rounded-xl bg-white px-5 py-3 text-xs text-[#495784] shadow-lg sm:flex">
            <span className="font-semibold text-[#0F1F5B]">reCAPTCHA</span>
            <span>Privacidad - Condiciones</span>
          </div> */}
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
