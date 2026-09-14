import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ScrollProgress from "@/components/ScrollProgress";
import { Cairo } from "next/font/google";

const cairo = Cairo({
  subsets: ["arabic"],
  weight: ["400", "600", "700", "800", "900"],
  variable: "--font-cairo",
  display: "swap",
});

export const metadata: Metadata = {
  title: "مادة التكنولوجيا مع الخبير مستر عمرو شاهين",
  description: "المنصة التعليمية الرسمية لمادة التكنولوجيا والبرمجة للمرحلة الثانوية مع الخبير مستر عمرو شاهين - دفعة 2027",
  icons: {
    icon: "/images/teacher.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl">
      <head>
        <meta name="theme-color" content="#ffffff" />
      </head>
      <body className={`min-h-screen flex flex-col antialiased ${cairo.className} ${cairo.variable}`}>
        <ScrollProgress />
        <Navbar />
        <main className="flex-grow">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
