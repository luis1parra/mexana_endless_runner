'use client';

import Image from "next/image";
import Link from "next/link";
import notFoundBackground from "@/assets/images/404background.png";
import { Header } from "./components/layout/Header";
import { Footer } from "./components/layout/Footer";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col bg-[#4FA6FF] text-white bg-white">
      <main className="mx-auto flex w-full flex-1 flex-col px-6 py-10 md:px-10">
        <section className="relative flex-1 overflow-hidden rounded-[48px] text-white">
          <Image
            src={notFoundBackground}
            alt="Ciudad nocturna de Mexsana con calle vacia"
            fill
            priority
            className="absolute inset-0 h-full w-full object-cover"
            sizes="100vw"
          />
          <div className="absolute inset-0" />

          <div className="relative z-10 flex h-full flex-col gap-12 px-8 py-10 md:px-12 lg:px-16">
            <Header activeHref={undefined} />

            <div className="mt-8 flex flex-1 flex-col items-center justify-center text-center">
              <h1 className="text-[128px] font-black tracking-tight text-white drop-shadow-[0_25px_45px_rgba(5,21,76,0.45)] md:text-[160px]">
                404
              </h1>
              <h2 className="mt-4 text-3xl font-bold text-white/95 md:text-[40px]">
                Obstaculo no encontrado
              </h2>
              <p className="mt-4 max-w-[520px] text-base text-white/80 md:text-lg">
                Vuelve al camino correcto y sigue esquivando obstaculos.
              </p>
              <Link
                href="/"
                className="mt-8 inline-flex items-center justify-center rounded-full bg-white px-8 py-3 text-lg font-semibold text-[#1D3FCE] shadow-[0_22px_44px_rgba(12,35,106,0.35)] transition hover:bg-[#F2F6FF]"
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
