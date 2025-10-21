import Link from "next/link";
import Image, { type StaticImageData } from "next/image";
import type { SVGProps } from "react";
import logo from "@/assets/images/logo_footer.png";

const legalLinks = [
  { label: "Pie de imprenta", href: "#" },
  { label: "Términos y condiciones", href: "#" },
  { label: "Políticas de privacidad", href: "#" },
];

const socialLinks = [
  { label: "Facebook", href: "#", Icon: FacebookIcon },
  { label: "Instagram", href: "#", Icon: InstagramIcon },
];

export function Footer() {
  return (
    <footer className="bg-[#00A4FF] text-white">
      <div className="mx-auto flex w-full flex-col gap-10 px-6 py-12 items-center lg:flex-row lg:items-start lg:justify-evenly">
        <div className="w-60 self-center text-3xl font-black italic tracking-[0.14em] text-white md:text-4xl">
          <Image src={logo} alt="Mexsana" />
        </div>
        <div className="flex flex-col gap-2 text-sm text-white/80 text-center lg:text-left">
          {legalLinks.map((link) => (
            <Link key={link.label} href={link.href} className="transition hover:text-white">
              {link.label}
            </Link>
          ))}
        </div>
        <div className="flex flex-col gap-2 text-sm text-white/80 text-center lg:text-left">
          <span>Diseñado por: DENICOLÁS\TBWA</span>
          <span>2025 © MEXSANA</span>
        </div>
        <div className="flex flex-col gap-3 text-sm items-center lg:items-start">
          <span className="font-bold text-lg text-white">Conéctate con lo último:</span>
          <div className="flex gap-3">
            {socialLinks.map(({ label, href, Icon }) => (
              <Link key={label} href={href} aria-label={label} className="flex h-12 w-12 items-center justify-center rounded-full border border-white/40 text-white transition hover:bg-white/10">
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
    <svg width="38" height="38" viewBox="0 0 38 38" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M38 19.1164C38 8.55718 29.4927 -0.00231934 19 -0.00231934C8.5025 5.56642e-05 -0.00475311 8.55718 -0.00475311 19.1188C-0.00475311 28.6592 6.9445 36.5679 16.0265 38.0024V24.6431H11.2052V19.1188H16.0312V14.9032C16.0312 10.1128 18.8694 7.46706 23.2085 7.46706C25.289 7.46706 27.4621 7.83993 27.4621 7.83993V12.5424H25.0657C22.7074 12.5424 21.9711 14.0173 21.9711 15.5302V19.1164H27.2389L26.3981 24.6407H21.9687V38.0001C31.0507 36.5656 38 28.6568 38 19.1164Z"
        fill="white"
      />
      <defs>
        <clipPath id="clip0_835_724">
          <rect width="38" height="38" fill="white" />
        </clipPath>
      </defs>
    </svg>
  );
}

function InstagramIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg width="38" height="38" viewBox="0 0 38 38" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M13.3 19C13.3 20.5117 13.9005 21.9616 14.9695 23.0305C16.0384 24.0995 17.4883 24.7 19 24.7C20.5117 24.7 21.9616 24.0995 23.0305 23.0305C24.0995 21.9616 24.7 20.5117 24.7 19C24.6987 18.6745 24.6677 18.3578 24.6069 18.05H26.6V25.6443C26.6 26.1725 26.1725 26.6 25.6443 26.6H12.3538C12.1007 26.5995 11.8581 26.4986 11.6792 26.3194C11.5004 26.1402 11.4 25.8974 11.4 25.6443V18.05H13.3931C13.3323 18.3578 13.3013 18.6745 13.3 19ZM19 22.8C18.5009 22.7999 18.0066 22.7014 17.5455 22.5103C17.0844 22.3192 16.6655 22.0391 16.3126 21.6861C15.9597 21.333 15.6799 20.9139 15.489 20.4527C15.2981 19.9915 15.1999 19.4973 15.2 18.9981C15.2001 18.499 15.2986 18.0047 15.4897 17.5436C15.6808 17.0825 15.9609 16.6636 16.3139 16.3107C16.667 15.9578 17.0861 15.678 17.5473 15.4871C18.0085 15.2962 18.5028 15.198 19.0019 15.1981C20.01 15.1984 20.9767 15.5991 21.6893 16.3121C22.4019 17.025 22.8022 17.9919 22.8019 19C22.8016 20.0081 22.4009 20.9748 21.688 21.6874C20.975 22.4 20.0081 22.8003 19 22.8ZM14.44 15.01H12.1619C12.0869 15.0103 12.0126 14.9957 11.9432 14.9672C11.8738 14.9386 11.8107 14.8967 11.7576 14.8437C11.7045 14.7908 11.6623 14.7279 11.6336 14.6586C11.6048 14.5893 11.59 14.515 11.59 14.44V12.1619C11.5897 12.0867 11.6044 12.0123 11.633 11.9428C11.6617 11.8733 11.7038 11.8101 11.7569 11.757C11.8101 11.7038 11.8732 11.6617 11.9427 11.633C12.0122 11.6044 12.0867 11.5898 12.1619 11.59H14.44C14.5152 11.5898 14.5897 11.6044 14.6592 11.633C14.7286 11.6617 14.7918 11.7038 14.845 11.757C14.8981 11.8101 14.9402 11.8733 14.9689 11.9428C14.9975 12.0123 15.0121 12.0867 15.0119 12.1619V14.44C15.01 14.7535 14.7535 15.01 14.44 15.01ZM19 0.76001C23.8375 0.76001 28.477 2.68172 31.8976 6.10238C35.3183 9.52305 37.24 14.1625 37.24 19C37.24 23.8376 35.3183 28.477 31.8976 31.8976C28.477 35.3183 23.8375 37.24 19 37.24C16.6047 37.24 14.2328 36.7682 12.0199 35.8516C9.80687 34.9349 7.79611 33.5914 6.10237 31.8976C4.40863 30.2039 3.06508 28.1931 2.14844 25.9802C1.23179 23.7672 0.759996 21.3953 0.759996 19C0.759996 16.6047 1.23179 14.2328 2.14844 12.0199C3.06508 9.80689 4.40863 7.79612 6.10237 6.10238C7.79611 4.40864 9.80687 3.06509 12.0199 2.14845C14.2328 1.2318 16.6047 0.76001 19 0.76001ZM9.5 26.3891C9.5 27.55 10.45 28.5 11.6109 28.5H26.3891C27.55 28.5 28.5 27.55 28.5 26.3891V11.6109C28.5 10.45 27.55 9.50001 26.3891 9.50001H11.6109C10.45 9.50001 9.5 10.45 9.5 11.6109V26.3891Z"
        fill="white"
      />
    </svg>
  );
}
