'use client';

import { useState } from "react";
import Link from "next/link";
import Image, { type StaticImageData } from "next/image";
import { Menu } from "@/assets/icons";
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
    const source = isTerminos ? logo2 : logo;

    return (
      <div className={wrapperClass}>
        <Image
          src={source}
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
      "cursor-pointer rounded-full bg-white px-6 py-2 text-sm font-semibold text-[var(--cpdblue)] shadow-[0_10px_30px_rgba(16,38,109,0.25)] transition hover:bg-[#F2F6FF] lg:px-8 lg:py-2.5 lg:text-base";
    const mobileClasses =
      "cursor-pointer items-center justify-center rounded-full bg-[var(--cpdblue)] px-6 py-3 text-base font-semibold text-white shadow-[0_12px_32px_rgba(16,38,109,0.3)] transition hover:bg-[#1532A8]";
    const className = variant === "mobile" ? mobileClasses : desktopClasses;

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
      "cursor-pointer rounded-full border border-white/70 px-6 py-2 text-sm font-semibold text-white transition hover:bg-white/10 lg:px-8 lg:py-2.5 lg:text-base"
    const mobileClasses =
      "cursor-pointer inline-flex w-full items-center justify-center rounded-full bg-[#1D3FCE] px-6 py-3 text-base font-semibold text-white shadow-[0_12px_32px_rgba(16,38,109,0.3)] transition hover:bg-[#1532A8]";
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
        className={className}
      >
        Ingresar
      </button>
    );
    // }
  };

  return (
    <nav className="relative text-sm font-semibold  text-white/80 lg:text-base">
      {/*renderLogo(
        "w-1/5 min-w-[130px] max-w-[550px] absolute left-1/2 -top-3 transform -translate-x-1/2 bg-white px-8 py-2 rounded-b-[50px] lg:px-10",
        "w-full h-auto"
      )
      renderLogo(
        "w-1/5 min-w-[100px] max-w-[550px] absolute left-1/2 -top-6 transform -translate-x-1/2 rounded-b-[50px] lg:px-10",
        "w-full h-auto"
      )*/
        renderLogo(
          "w-1/5 min-w-[100px] max-w-[550px] absolute left-1/2 -top-6 transform -translate-x-1/2 rounded-b-[50px] lg:min-w-[130px] lg:-top-3 lg:bg-white lg:px-8 lg:py-2 lg:px-10",
          "w-full h-auto"
        )

      }
      <div className="flex items-center justify-between md:hidden">
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
        <div>{renderLoginAction()}</div>
      </div>
      <div className="hidden justify-between items-center gap-6 md:flex">
        <div className="flex flex-wrap items-center gap-6 xl:gap-12">
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
        {/* {renderLogo("justify-self-center text-3xl font-black italic tracking-[0.14em] text-white drop-shadow-lg normal-case md:text-4xl")} */}
        <div className="flex items-center gap-3 justify-self-end">
          {renderRegisterAction()}
          {renderLoginAction()}
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
