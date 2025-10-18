'use client';

import Link from "next/link";

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
  const renderRegisterAction = () => {
    if (onRegisterClick) {
      return (
        <button
          type="button"
          onClick={onRegisterClick}
          className="rounded-full bg-white px-6 py-2 text-sm font-semibold text-[#1D3FCE] shadow-[0_10px_30px_rgba(16,38,109,0.25)] transition hover:bg-[#F2F6FF] lg:px-8 lg:py-2.5 lg:text-base"
        >
          Registrarse
        </button>
      );
    }

    return (
      <Link
        href={registerHref}
        className="rounded-full bg-white px-6 py-2 text-sm font-semibold text-[#1D3FCE] shadow-[0_10px_30px_rgba(16,38,109,0.25)] transition hover:bg-[#F2F6FF] lg:px-8 lg:py-2.5 lg:text-base"
      >
        Registrarse
      </Link>
    );
  };

  const renderLoginAction = () => {
    if (onLoginClick) {
      return (
        <button
          type="button"
          onClick={onLoginClick}
          className="rounded-full border border-white/70 px-6 py-2 text-sm font-semibold text-white transition hover:bg-white/10 lg:px-8 lg:py-2.5 lg:text-base"
        >
          Ingresar
        </button>
      );
    }

    return (
      <Link
        href={loginHref}
        className="rounded-full border border-white/70 px-6 py-2 text-sm font-semibold text-white transition hover:bg-white/10 lg:px-8 lg:py-2.5 lg:text-base"
      >
        Ingresar
      </Link>
    );
  };

  return (
    <nav className="relative grid grid-cols-[auto_1fr_auto] items-center gap-6 text-sm font-semibold uppercase tracking-[0.08em] text-white/80 lg:text-base">
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
      {logoHref ? (
        <Link
          href={logoHref}
          className="justify-self-center text-3xl font-black italic tracking-[0.14em] text-white drop-shadow-lg md:text-4xl"
        >
          Mexsana
        </Link>
      ) : (
        <div className="justify-self-center text-3xl font-black italic tracking-[0.14em] text-white drop-shadow-lg md:text-4xl">
          Mexsana
        </div>
      )}
      <div className="flex items-center gap-3 justify-self-end">
        {renderRegisterAction()}
        {renderLoginAction()}
      </div>
    </nav>
  );
}
