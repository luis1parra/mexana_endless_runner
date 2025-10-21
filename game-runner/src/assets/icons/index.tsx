import type { SVGProps } from "react";

export const UserIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}>
    <circle cx="12" cy="8" r="4" fill="currentColor" />
    <path d="M5 19.5c0-3.038 2.69-5.5 7-5.5s7 2.462 7 5.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

export const MailIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}>
    <rect x="3" y="5" width="18" height="14" rx="2.5" stroke="currentColor" strokeWidth="2" />
    <path d="M4 7.5 10.9 12c.65.433 1.55.433 2.2 0L20 7.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export const CartIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}>
    <path d="M4 6h2l2 11h9.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M8 9h11l-1.2 6H9.4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <circle cx="10" cy="19" r="1.5" fill="currentColor" />
    <circle cx="17" cy="19" r="1.5" fill="currentColor" />
  </svg>
);

export const ReceiptIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}>
    <path d="M7 3.5h10a1.5 1.5 0 0 1 1.5 1.5V21l-3-2-3 2-3-2-3 2V5A1.5 1.5 0 0 1 7 3.5Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
    <path d="M9.5 8.5h5M9.5 12h5M9.5 15.5h3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

export const PlusCircleIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}>
    <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" />
    <path d="M12 8v8M8 12h8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

export const ArrowDownIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}>
    <path d="m7 10 5 5 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export const CloseIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}>
    <path d="m7 7 10 10M17 7 7 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

export const ErrorLoupe = (props: SVGProps<SVGSVGElement>) => (
  <svg width="67" height="67" viewBox="0 0 67 67" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M23.3333 0C29.5217 0 35.4566 2.45833 39.8325 6.83417C44.2083 11.21 46.6667 17.1449 46.6667 23.3333C46.6667 28.3333 45 33.3333 42.0333 37.3L44.7 40H46.6667L66.6667 60L60 66.6667L40 46.6667V44.7L37.3 42.0333C33.2583 45.0289 28.3641 46.6525 23.3333 46.6667C17.1449 46.6667 11.21 44.2083 6.83417 39.8325C2.45833 35.4566 0 29.5217 0 23.3333C0 17.1449 2.45833 11.21 6.83417 6.83417C11.21 2.45833 17.1449 0 23.3333 0ZM30.4 11.5333L23.3333 18.6333L16.2667 11.5333L11.5333 16.2667L18.6333 23.3333L11.5333 30.4L16.2667 35.1333L23.3333 28.0333L30.4 35.1333L35.1333 30.4L28.0333 23.3333L35.1333 16.2667L30.4 11.5333Z"
      fill="white"
    />
  </svg>
);

export const Menu = (props: SVGProps<SVGSVGElement>) => (
  <svg width="36" height="36" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M5.625 15.75C5.32663 15.75 5.04048 15.6315 4.82951 15.4205C4.61853 15.2095 4.5 14.9234 4.5 14.625V5.62726C4.5 5.32889 4.61853 5.04274 4.82951 4.83176C5.04048 4.62078 5.32663 4.50226 5.625 4.50226H14.625C14.9234 4.50226 15.2095 4.62078 15.4205 4.83176C15.6315 5.04274 15.75 5.32889 15.75 5.62726V14.625C15.75 14.9234 15.6315 15.2095 15.4205 15.4205C15.2095 15.6315 14.9234 15.75 14.625 15.75H5.625ZM21.375 15.75C21.0766 15.75 20.7905 15.6315 20.5795 15.4205C20.3685 15.2095 20.25 14.9234 20.25 14.625V5.62726C20.25 5.32889 20.3685 5.04274 20.5795 4.83176C20.7905 4.62078 21.0766 4.50226 21.375 4.50226H30.3727C30.6711 4.50226 30.9573 4.62078 31.1682 4.83176C31.3792 5.04274 31.4977 5.32889 31.4977 5.62726V14.625C31.4977 14.9234 31.3792 15.2095 31.1682 15.4205C30.9573 15.6315 30.6711 15.75 30.3727 15.75H21.375ZM5.625 31.5C5.32663 31.5 5.04048 31.3815 4.82951 31.1705C4.61853 30.9595 4.5 30.6734 4.5 30.375V21.375C4.5 21.0766 4.61853 20.7905 4.82951 20.5795C5.04048 20.3685 5.32663 20.25 5.625 20.25H14.625C14.9234 20.25 15.2095 20.3685 15.4205 20.5795C15.6315 20.7905 15.75 21.0766 15.75 21.375V30.375C15.75 30.6734 15.6315 30.9595 15.4205 31.1705C15.2095 31.3815 14.9234 31.5 14.625 31.5H5.625ZM21.375 31.5C21.0766 31.5 20.7905 31.3815 20.5795 31.1705C20.3685 30.9595 20.25 30.6734 20.25 30.375V21.375C20.25 21.0766 20.3685 20.7905 20.5795 20.5795C20.7905 20.3685 21.0766 20.25 21.375 20.25H30.3727C30.6711 20.25 30.9573 20.3685 31.1682 20.5795C31.3792 20.7905 31.4977 21.0766 31.4977 21.375V30.375C31.4977 30.6734 31.3792 30.9595 31.1682 31.1705C30.9573 31.3815 30.6711 31.5 30.3727 31.5H21.375Z"
      fill="white"
    />
  </svg>
);
