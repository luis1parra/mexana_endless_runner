'use client';

import { useState } from "react";
import Link from "next/link";
import Image, { type StaticImageData } from "next/image";
import { Menu, Rec } from "@/assets/icons";
import logo from "@/assets/images/logo_mexsana.png";
import logo2 from "@/assets/images/logo_footer.png";
import { LoginModal } from "@/components/modals/LoginModal";
import { RegistrationModal } from "../../../components/modals/RegistrationModal";

const navLinks = [
  { label: "Inicio", href: "/" },
  { label: "Dinámica del juego", href: "/dinamica" },
  { label: "Ranking", href: "/ranking" },
];

type HeaderProps = {
  activeHref?: string;
  // onRegisterClick?: () => void;
  // onLoginClick?: () => void;
  registerHref?: string;
  loginHref?: string;
  logoHref?: string;
};

export function Header({
  activeHref,
  // onRegisterClick,
  // onLoginClick,
  registerHref = "#",
  loginHref = "#",
  logoHref = "/",
}: HeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isRegistrationOpen, setIsRegistrationOpen] = useState(false);
  const [isLoginOpen, setIsLoginOpen] = useState(false);

  const toggleMenu = () => setIsMenuOpen((prev) => !prev);
  const closeMenu = () => setIsMenuOpen(false);

  const renderLogo = (wrapperClass: string, imageClass = "w-full h-auto") => {
    const isTerminos = activeHref === "/terminos";

    return (
      <div className={isTerminos ? "w-1/5 min-w-[130px] max-w-[550px] absolute left-1/2 -top-3 transform -translate-x-1/2 px-8 py-2 lg:px-10" : wrapperClass}>
        <Image
          src={isTerminos ? logo2 : logo}
          alt="Mexsana"
          className={imageClass}
          priority
        />
      </div>
    );
  };

  const renderRegisterAction = (
    variant: "desktop" | "mobile" = "desktop",
    onAction?: () => void,
  ) => {
    const desktopClasses =
      "cursor-pointer rounded-full border border-white/70 bg-white px-6 py-2 text-sm font-semibold text-[var(--cpdblue)] lg:px-[30px] lg:py-[12px] lg:text-[18px]";
    const mobileClasses =
      "cursor-pointer items-center justify-center rounded-full bg-[var(--cpdblue)] px-6 py-3 text-base font-semibold text-white shadow-[0_12px_32px_rgba(16,38,109,0.3)] transition hover:bg-[#1532A8]";
    const hoverClasses = "transition hover:bg-white/0 hover:text-white";
    const className = variant === "mobile" ? mobileClasses : desktopClasses + " " + hoverClasses;
    

    // if (onRegisterClick) {
    return (
      <button
        type="button"
        onClick={() => {
          setIsRegistrationOpen(true);
          //onRegisterClick();
          onAction?.();
        }}
        className={className}
      >
        Registrarse
      </button>
    );
    // }
  };

  const renderLoginAction = (
    variant: "desktop" | "mobile" = "desktop",
    onAction?: () => void
  ) => {
    const desktopClasses =
      "cursor-pointer rounded-full border border-white/70 bg-white/0 px-6 py-2 text-sm font-semibold text-white lg:px-[30px] lg:py-[12px] lg:text-[18px]"
    const mobileClasses =
      "cursor-pointer inline-flex w-full items-center justify-center rounded-full bg-[#1D3FCE] px-6 py-3 text-base font-semibold text-white shadow-[0_12px_32px_rgba(16,38,109,0.3)]";
    const hoverClasses = "transition hover:bg-white hover:text-[var(--cpdblue)]";
    const className = variant === "mobile" ? mobileClasses : desktopClasses;


    // if (onLoginClick) {
    return (
      <button
        type="button"
        onClick={() => {
          setIsLoginOpen(true);
          //onLoginClick();
          onAction?.();
        }}
        className={className + " " + hoverClasses}
      >
        Ingresar
      </button>
    );
    // }
  };

  return (
    <nav className="z-200 relative text-sm font-semibold text-white/80 lg:text-base">
      {
        renderLogo(
          "w-2/9 min-w-[100px] max-w-[210px] absolute z-10 left-1/2 -top-1/2 transform -translate-x-1/2 lg:min-w-[130px]",
          "w-full h-auto"
        )
      }
      {
        activeHref !== "/terminos" &&
          <div className="absolute w-full min-w-[390px] max-w-[1000px] -z-1 -top-2 left-1/2 transform -translate-x-1/2 flex justify-center ">
            <Rec className="w-full h-auto"/>
          </div>
      }
      
      <div className="flex items-center justify-between lg:hidden">
        <button
          type="button"
          onClick={toggleMenu}
          aria-expanded={isMenuOpen}
          aria-controls="mobile-navigation"
          aria-label={isMenuOpen ? "Cerrar menu" : "Abrir menu"}
          className="flex h-11 w-11 items-center justify-center rounded-full transition hover:bg-white/20"
        >
          <Menu className="h-5 w-5 text-white" />
        </button>
        <div>{renderLoginAction()}</div>
      </div>
      <div className="hidden justify-between items-center lg:flex">
        <div className="flex flex-wrap items-center gap-6 xl:gap-12">
          {navLinks.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className={`transition-colors hover:text-white hover:underline underline-offset-6 ${link.href === activeHref ? "text-white" : ""}`}
            >
              {link.label}
            </Link>
          ))}
        </div>
        <div className="flex items-center gap-5 justify-self-end xl:gap-10">
          {renderRegisterAction("desktop")}
          {renderLoginAction("desktop")}
        </div>
      </div>
      {isMenuOpen ? (
        <div className="fixed z-99 inset-0 bg-black/50" onClick={closeMenu}>
          <div
            id="mobile-navigation"
            className="z-100 left-0 top-full w-full bg-white px-9 py-8 text-left text-base font-semibold shadow-[0_24px_48px_rgba(13,32,94,0.18)] normal-case lg:hidden"
          >
            <div className="pb-4">
              {renderLogo(
                "inline-block max-w-[220px] text-[var(--cpdblue)] drop-shadow-none",
                "w-full h-auto"
              )}
            </div>
            <div className="h-[2px] w-full bg-[var(--cpdblue)]/40" />
            <div className="mt-6 flex flex-col gap-5 text-lg">
              {navLinks.map((link) => (
                <Link
                  key={`mobile-${link.label}`}
                  href={link.href}
                  onClick={closeMenu}
                  className={`transition-colors hover:text-[var(--cpdblue)] ${link.href === activeHref ? "text-[var(--cpdblue)]" : "text-[var(--cngray)]"
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
        </div>
      ) : null}
      <div className="flex flex-col bg-white text-[#0B1E52]">
        <RegistrationModal
          open={isRegistrationOpen}
          onClose={() => setIsRegistrationOpen(false)}
        />
        <LoginModal
          open={isLoginOpen}
          onClose={() => setIsLoginOpen(false)}
        />
      </div>
    </nav>
  );
}
