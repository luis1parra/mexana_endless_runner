'use client';

import { useState } from "react";
import Link from "next/link";
import Image, { type StaticImageData } from "next/image";
import { Menu } from "@/assets/icons";
import logo from "@/assets/images/logo_mexsana.png";

const navLinks = [
  { label: "Inicio", href: "/" },
  { label: "Dinamica del juego", href: "/dinamica" },
  { label: "Ranking", href: "/ranking" },
];

type HeaderProps = {
  activeHref?: string;
  onRegisterClick?: () => void;
  onLoginClick?: () => void;
  registerHref?: string;
  loginHref?: string;
  logoHref?: string;
};

export function Header({
  activeHref,
  onRegisterClick,
  onLoginClick,
  registerHref = "#",
  loginHref = "#",
  logoHref = "/",
}: HeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => setIsMenuOpen((prev) => !prev);
  const closeMenu = () => setIsMenuOpen(false);

  const renderLogo = (className: string) =>
    logoHref ? (
      <Image
        src={logo}
        alt="Mexsana"
      />
    ) : (
      <div className={className}>Mexsana</div>
    );

  const renderRegisterAction = (
    variant: "desktop" | "mobile" = "desktop",
    onAction?: () => void,
  ) => {
    const desktopClasses =
      "rounded-full bg-white px-6 py-2 text-sm font-semibold text-[#1D3FCE] shadow-[0_10px_30px_rgba(16,38,109,0.25)] transition hover:bg-[#F2F6FF] lg:px-8 lg:py-2.5 lg:text-base";
    const mobileClasses =
      "inline-flex w-full items-center justify-center rounded-full bg-[#1D3FCE] px-6 py-3 text-base font-semibold text-white shadow-[0_12px_32px_rgba(16,38,109,0.3)] transition hover:bg-[#1532A8]";
    const className = variant === "mobile" ? mobileClasses : desktopClasses;

    if (onRegisterClick) {
      return (
        <button
          type="button"
          onClick={() => {
            onRegisterClick();
            onAction?.();
          }}
          className={className}
        >
          Registrarse
        </button>
      );
    }

    return (
      <Link
        href={registerHref}
        onClick={onAction}
        className={className}
      >
        Registrarse
      </Link>
    );
  };

  const renderLoginAction = (onAction?: () => void) => {
    if (onLoginClick) {
      return (
        <button
          type="button"
          onClick={() => {
            onLoginClick();
            onAction?.();
          }}
          className="rounded-full border border-white/70 px-6 py-2 text-sm font-semibold text-white transition hover:bg-white/10 lg:px-8 lg:py-2.5 lg:text-base"
        >
          Ingresaraaaa
        </button>
      );
    }

    return (
      <Link
        href={loginHref}
        onClick={onAction}
        className="rounded-full border border-white/70 px-6 py-2 text-sm font-semibold text-white transition hover:bg-white/10 lg:px-8 lg:py-2.5 lg:text-base"
      >
        Ingresardsa
      </Link>
    );
  };

  return (
    <nav className="relative text-sm font-semibold uppercase tracking-[0.08em] text-white/80 lg:text-base">
      <div className="flex items-center justify-between lg:hidden">
        {renderLogo("text-2xl font-black italic tracking-[0.14em] text-white drop-shadow-lg normal-case")}
        <button
          type="button"
          onClick={toggleMenu}
          aria-expanded={isMenuOpen}
          aria-controls="mobile-navigation"
          aria-label={isMenuOpen ? "Cerrar menu" : "Abrir menu"}
          className="flex h-11 w-11 items-center justify-center rounded-full border border-white/30 bg-white/10 backdrop-blur transition hover:bg-white/20"
        >
          <Menu className="h-5 w-5 text-white" />
        </button>
      </div>
      <div className="hidden grid-cols-[auto_1fr_auto] items-center gap-6 lg:grid">
        <div className="flex flex-wrap items-center gap-6">
          {navLinks.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className={`transition-colors hover:text-white ${link.href === activeHref ? "text-white" : ""}`}
            >
              {link.label}
            </Link>
          ))}
        </div>
        {renderLogo("justify-self-center text-3xl font-black italic tracking-[0.14em] text-white drop-shadow-lg normal-case md:text-4xl")}
        <div className="flex items-center gap-3 justify-self-end">
          {renderRegisterAction()}
          {renderLoginAction()}
        </div>
      </div>
      {isMenuOpen ? (
        <div
          id="mobile-navigation"
          className="absolute z-10 left-0 top-full mt-4 w-full rounded-3xl bg-white px-6 py-6 text-left text-base font-semibold text-[#0D0D0D] shadow-[0_24px_48px_rgba(13,32,94,0.18)] normal-case lg:hidden"
        >
          <div className="pb-4">
            {renderLogo("text-3xl font-black italic tracking-[0.14em] text-[#1D3FCE] drop-shadow-none")}
          </div>
          <div className="h-px w-full bg-[#1D3FCE]/40" />
          <div className="mt-6 flex flex-col gap-5 text-lg">
            {navLinks.map((link) => (
              <Link
                key={`mobile-${link.label}`}
                href={link.href}
                onClick={closeMenu}
                className={`transition-colors hover:text-[#1D3FCE] ${
                  link.href === activeHref ? "text-[#1D3FCE]" : "text-[#0D0D0D]"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>
          <div className="mt-8">
            {renderRegisterAction("mobile", closeMenu)}
          </div>
        </div>
      ) : null}
    </nav>
  );
}
