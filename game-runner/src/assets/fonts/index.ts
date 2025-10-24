import localFont from "next/font/local";

export const futura = localFont({
  src: [
    {
      path: "./FuturaPTLight.ttf",
      weight: "300",
      style: "normal",
    },
    {
      path: "./FuturaPTMedium.otf",
      weight: "500",
      style: "normal",
    },
    {
      path: "./FuturaPTBold.otf",
      weight: "700",
      style: "normal",
    },
    {
      path: "./FuturaExtraBold.otf",
      weight: "800",
      style: "normal",
    },
  ],
  display: "swap",
  variable: "--font-futura",
  fallback: ["Arial", "Helvetica", "sans-serif"],
});
