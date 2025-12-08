import type { Metadata } from "next";
import { Inter, Noto_Sans_Thai } from "next/font/google";
import "./globals.css";
import { I18nProvider } from "@/lib/i18n";

// English font
const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

// Thai font
const notoSansThai = Noto_Sans_Thai({
  variable: "--font-noto-thai",
  subsets: ["thai"],
  display: "swap",
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
        className={`${inter.variable} ${notoSansThai.variable} font-sans antialiased bg-white text-black`}
      >
        <I18nProvider>
          {children}
        </I18nProvider>
      </body>
    </html>
  );
}
