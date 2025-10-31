'use client';

import Link from "next/link";
import { Header } from "./components/layout/Header";
import { Footer } from "./components/layout/Footer";

export default function NotAllowed() {
  return (
    <div className="flex min-h-screen flex-col bg-white text-white">
      <main className="flex mx-auto w-full flex-1 flex-col px-3 py-10 md:px-10">
        <section className="w-full min-h-[calc(100vw*(1258/662))] sm:min-h-0 bg-white bg-[url('../assets/images/403background_mobile.png')] sm:bg-[url('../assets/images/403background.png')] bg-cover bg-no-repeat bg-center relative rounded-[24px] px-3 py-12 pt-2 text-white md:px-8 lg:px-12 lg:rounded-[48px]">
        
          <Header activeHref={undefined} />
          
          <div className="relative z-10 flex h-full flex-col gap-12 px-8 py-15 md:px-12 md:py-0 lg:px-16">
            <div className="mt-8 flex flex-1 flex-col items-center justify-center text-center">
              <h1 className="text-[115px] font-extrabold italic tracking-tight text-white md:text-[200px]">
                403
              </h1>
              <h2 className="mt-0 text-[25px] font-bold text-white/95 md:text-[40px]">
                No tienes acceso a esta parte
              </h2>
              <p className="mt-4 max-w-[520px] font-light text-white text-[17px] md:text-[20px]">
                ¿Tal vez te saltaste un paso? Vuelve al camino correcto y sigue acumulando puntos.
              </p>
              <Link
                href="/"
                className="mt-8 inline-flex items-center justify-center rounded-full bg-white px-8 py-3 text-lg font-semibold text-[var(--cpdblue)] shadow-[0_22px_44px_rgba(12,35,106,0.35)] transition hover:bg-[#F2F6FF]"
              >
                Volver al inicio
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
