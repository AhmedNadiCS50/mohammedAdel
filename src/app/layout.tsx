import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "مادة التكنولوجيا مع الخبير مستر محمد عادل",
  description: "المنصة التعليمية الرسمية لمادة التكنولوجيا والبرمجة للمرحلة الثانوية مع الخبير مستر محمد عادل - دفعة 2027",
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
      <body className="min-h-screen flex flex-col antialiased">
        <Navbar />
        <main className="flex-grow">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
