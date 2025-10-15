import Link from "next/link";
import type { SVGProps } from "react";

const legalLinks = [
  { label: "Pie de imprenta", href: "#" },
  { label: "Terminos y condiciones", href: "#" },
  { label: "Politicas de privacidad", href: "#" },
];

const socialLinks = [
  { label: "Facebook", href: "#", Icon: FacebookIcon },
  { label: "Instagram", href: "#", Icon: InstagramIcon },
];

export function Footer() {
  return (
    <footer className="bg-[#1B64E2] text-white">
      <div className="mx-auto flex w-full max-w-[1200px] flex-col gap-10 px-6 py-12 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <div className="text-3xl font-black italic tracking-[0.14em] text-white md:text-4xl">
            Mexsana
          </div>
        </div>
        <div className="flex flex-col gap-2 text-sm text-white/80">
          {legalLinks.map((link) => (
            <Link key={link.label} href={link.href} className="transition hover:text-white">
              {link.label}
            </Link>
          ))}
        </div>
        <div className="flex flex-col gap-2 text-sm text-white/80">
          <span>Disenado por: DENICOLAS\\TBWA</span>
          <span>2025 (C) MEXSANA</span>
        </div>
        <div className="flex flex-col gap-3 text-sm">
          <span className="font-semibold uppercase tracking-[0.32em] text-white/80">
            Conectate con lo ultimo:
          </span>
          <div className="flex gap-3">
            {socialLinks.map(({ label, href, Icon }) => (
              <Link
                key={label}
                href={href}
                aria-label={label}
                className="flex h-12 w-12 items-center justify-center rounded-full border border-white/40 text-white transition hover:bg-white/10"
              >
                <Icon className="h-5 w-5" />
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}

function FacebookIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}>
      <path
        d="M21 12a9 9 0 1 0-10.406 8.917v-6.309H8.5V12h2.094V9.797c0-2.066 1.233-3.209 3.12-3.209.904 0 1.848.162 1.848.162v2.032h-1.04c-1.024 0-1.343.638-1.343 1.29V12H15.5l-.333 2.608h-2.156v6.309A9.001 9.001 0 0 0 21 12Z"
        fill="currentColor"
      />
    </svg>
  );
}

function InstagramIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}>
      <path
        d="M16.75 3h-9.5A4.25 4.25 0 0 0 3 7.25v9.5A4.25 4.25 0 0 0 7.25 21h9.5A4.25 4.25 0 0 0 21 16.75v-9.5A4.25 4.25 0 0 0 16.75 3Zm2.75 13.75A2.75 2.75 0 0 1 16.75 19h-9.5A2.75 2.75 0 0 1 4.5 16.75v-9.5A2.75 2.75 0 0 1 7.25 4.5h9.5A2.75 2.75 0 0 1 19.5 7.25v9.5Z"
        fill="currentColor"
      />
      <path
        d="M12 7.5A4.51 4.51 0 0 0 7.5 12 4.51 4.51 0 0 0 12 16.5 4.51 4.51 0 0 0 16.5 12 4.51 4.51 0 0 0 12 7.5Zm0 7a2.51 2.51 0 0 1-2.5-2.5A2.51 2.51 0 0 1 12 9.5a2.51 2.51 0 0 1 2.5 2.5A2.51 2.51 0 0 1 12 14.5ZM17.5 7a1 1 0 1 1-2.001.002A1 1 0 0 1 17.5 7Z"
        fill="currentColor"
      />
    </svg>
  );
}
