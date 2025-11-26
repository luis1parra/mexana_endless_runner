'use client';

import { useState } from "react";
import Link from "next/link";
import Image, { type StaticImageData } from "next/image";
import { Header } from "./components/layout/Header";
import { Footer } from "./components/layout/Footer";
import { LoginModal } from "../components/modals/LoginModal";
import { RegistrationModal } from "../components/modals/RegistrationModal";
import children from "../assets/images/childrenhome.png"

export default function Home() {

  const [isRegistrationOpen, setIsRegistrationOpen] = useState(false);
  const [isLoginOpen, setIsLoginOpen] = useState(false);

  return (
    <div className="flex min-h-screen flex-col bg-white overflow-x-hidden">
      <main className="flex mx-auto w-full flex-1 flex-col px-3 py-10 md:px-10">
        <section className="w-full 
                            min-h-[calc(100vw*(1258/662))] 
                            sm:flex-1 
                            sm:min-h-full
                            h-full
                            bg-[url('../assets/images/homebackground_mobile.png')] 
                            sm:bg-[url('../assets/images/homebackground.png')] 
                            bg-cover 
                            bg-no-repeat 
                            bg-center 
                            relative 
                            rounded-[24px] 
                            px-3 
                            py-12 
                            pt-2 
                            text-white  
                            lg:px-8
                            lg:rounded-[48px]
                            ">

          <Header activeHref="/" />

          <Image 
            src={children} 
            alt="children" 
            className="hidden absolute w-7/10 h-auto max-h-9/10 object-contain right-0 bottom-0 sm:flex"
          />

          <div className="relative top-0 bottom-0 my-14 grid items-center gap-14 sm:grid-cols-15 lg:my-18 sm:px-6">
            <div className="sm:col-span-10 lg:col-span-9 xl:col-span-8">
              <h2 className="text-[30px] font-extrabold leading-[1.05] text-white drop-shadow-md sm:text-[50px]">
                FRESH GAME
              </h2>
              <p className="mt-2 text-[17px] font-light leading-[1.2] text-white/85 sm:text-[20px]">
                Con la Big Promo de Mexsana podrás demostrar que cuando se trata
                de frescura, tu eres el mejor.
              </p>
              <h3 className="mt-4 text-[20px] font-bold text-white sm:text-[22px] w-[75%]">
                ¡Participa y juega acumulando puntos por tus compras!
              </h3>
              <div className="mt-4 flex flex-row sm:flex-col lg:flex-row w-full sm:w-1/2 lg:w-3/4 gap-3 text-center sm:gap-3 xl:gap-6">
                <button
                  type="button"
                  onClick={() => setIsRegistrationOpen(true)}
                  className="cursor-pointer flex-1/2 mr-0 rounded-full bg-white px-4 py-3 text-[14px] md:text-[18px] font-semibold text-[var(--cpdblue)] shadow-[0_15px_35px_rgba(16,38,109,0.3)] transition hover:bg-[#F2F6FF] sm:px-[24px]"
                >
                  Registrarme
                </button>
                <Link
                  href="/dinamica"
                  className="cursor-pointer flex-1/2 ml-0 rounded-full border border-white/70 px-0 py-3 text-[14px] md:text-[18px] font-semibold text-white transition hover:bg-white/10"
                >
                  Conocer dinámica
                </Link>
              </div>
              <p className="mt-6 text-[12px] text-white/80 md:text-[14px]">
                Aplican términos y condiciones.{" "}
                <Link
                  href="/terminos"
                  className="font-semibold underline underline-offset-2 hover:text-white"
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
