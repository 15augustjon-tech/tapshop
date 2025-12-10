import type { Metadata } from "next";
import { Inter } from "next/font/google";
import localFont from "next/font/local";
import "./globals.css";
import { I18nProvider } from "@/lib/i18n";

// English font (Inter from Google)
const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

// Thai font (Grab's Inter Thai Extension - loopless variant)
const interThai = localFont({
  src: "../../public/fonts/InterThaiLoopless-Variable.ttf",
  variable: "--font-inter-thai",
  display: "swap",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "TapShop - ขายของออนไลน์ง่ายๆ",
  description: "สร้างร้านค้าออนไลน์ของคุณ ส่งด่วนทั่วกรุงเทพ",
  keywords: ["ขายของออนไลน์", "ร้านค้าออนไลน์", "social commerce", "TapShop"],
  authors: [{ name: "TapShop" }],
  openGraph: {
    title: "TapShop - ขายของออนไลน์ง่ายๆ",
    description: "สร้างร้านค้าออนไลน์ของคุณ ส่งด่วนทั่วกรุงเทพ",
    type: "website",
    locale: "th_TH",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="th">
      <body
        className={`${inter.variable} ${interThai.variable} font-sans antialiased bg-white text-black`}
      >
        <I18nProvider>
          {children}
        </I18nProvider>
      </body>
    </html>
  );
}
