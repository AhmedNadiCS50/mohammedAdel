import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ScrollProgress from "@/components/ScrollProgress";
import WhatsAppButton from "@/components/WhatsAppButton";
import { Cairo } from "next/font/google";

const cairo = Cairo({
  subsets: ["arabic"],
  weight: ["400", "600", "700", "800", "900"],
  variable: "--font-cairo",
  display: "swap",
});

const siteUrl = "https://amr-shaheen.vercel.app";
const siteName = "منصة مادة التكنولوجيا مع مستر عمرو شاهين";
const siteDescription =
  "المنصة التعليمية الرسمية لشرح مناهج مادة التكنولوجيا والبرمجة للمرحلة الثانوية (عام وتخصصي بكالوريا) مع الخبير مستر عمرو شاهين — محاضرات فيديو، امتحانات إلكترونية بتصحيح فوري، بنوك أسئلة الوزارة، وكتاب البكالوريا الورقي مع توصيل لكل المحافظات.";

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": `${siteUrl}/#organization`,
      name: siteName,
      url: siteUrl,
      logo: `${siteUrl}/images/teacher.png`,
      description: siteDescription,
      founder: { "@type": "Person", name: "مستر عمرو شاهين" },
      contactPoint: {
        "@type": "ContactPoint",
        telephone: "+201030585226",
        contactType: "customer support",
        availableLanguage: "ar",
      },
    },
    {
      "@type": "WebSite",
      "@id": `${siteUrl}/#website`,
      url: siteUrl,
      name: siteName,
      inLanguage: "ar-EG",
      publisher: { "@id": `${siteUrl}/#organization` },
    },
    {
      "@type": "Product",
      "@id": `${siteUrl}/#product-book`,
      name: "كتاب الصف الثاني الثانوي البكالوريا - تكنولوجيا وبرمجة",
      description:
        "المرجع الشامل لطلاب الصف الثاني الثانوي بكالوريا في مادة التكنولوجيا والبرمجة، يشمل أسئلة الامتحانات الوزارية وبنوك الأسئلة والتدريبات العملية.",
      image: `${siteUrl}/images/book-cover.jpg`,
      brand: { "@type": "Brand", name: siteName },
      offers: {
        "@type": "Offer",
        url: `${siteUrl}/products`,
        priceCurrency: "EGP",
        availability: "https://schema.org/InStock",
      },
    },
    {
      "@type": "FAQPage",
      "@id": `${siteUrl}/#faq`,
      mainEntity: [
        {
          "@type": "Question",
          name: "كيف أحصل على كود تفعيل الاشتراك؟",
          acceptedAnswer: {
            "@type": "Answer",
            text: "تواصل معنا عبر الواتساب وسنرسل لك كود التفعيل الخاص بصفك الدراسي خلال دقائق بعد سداد الاشتراك.",
          },
        },
        {
          "@type": "Question",
          name: "هل المحاضرات تعمل على الموبايل والتابلت؟",
          acceptedAnswer: {
            "@type": "Answer",
            text: "نعم، المنصة متوافقة مع الجوال والتابلت والكمبيوتر ويعود تقدمك في المحاضرات تلقائياً على كل الأجهزة.",
          },
        },
      ],
    },
  ],
};

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: siteName,
    template: `%s | ${siteName}`,
  },
  description: siteDescription,
  applicationName: siteName,
  authors: [{ name: "مستر عمرو شاهين" }],
  generator: "Next.js",
  keywords: [
    "مادة التكنولوجيا",
    "حاسب الي الثانوية العامة",
    "مستر عمرو شاهين",
    "منهج البرمجة أولى ثانوي",
    "كتاب البكالوريا تكنولوجيا",
    "شرح تكنولوجيا ثانوية عامة",
    "امتحانات بنك أسئلة الوزارة",
    "تفعيل اشتراك دورات المذكرات",
  ],
  icons: {
    icon: "/images/teacher.png",
    apple: "/images/teacher.png",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large" },
  },
  openGraph: {
    type: "website",
    locale: "ar_EG",
    url: "/",
    siteName,
    title: siteName,
    description: siteDescription,
    images: [
      {
        url: "/images/teacher.png",
        width: 834,
        height: 1024,
        alt: "مستر عمرو شاهين - منصة مادة التكنولوجيا",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: siteName,
    description: siteDescription,
    images: ["/images/teacher.png"],
  },
  alternates: {
    canonical: "/",
  },
  category: "education",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl">
      <head>
        <meta name="theme-color" id="theme-color-meta" content="#ffffff" />
        <meta name="format-detection" content="telephone=no" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('madrasa-theme');if(t!=='dark'&&t!=='light'){t=window.matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light';}var r=document.documentElement;r.classList.toggle('dark',t==='dark');r.style.colorScheme=t;var m=document.getElementById('theme-color-meta');if(m){m.setAttribute('content',t==='dark'?'#0B1120':'#ffffff');}}catch(e){}})();`,
          }}
        />
      </head>
      <body className={`min-h-screen flex flex-col antialiased ${cairo.className} ${cairo.variable}`}>
        <ScrollProgress />
        <Navbar />
        <main className="flex-grow">
          {children}
        </main>
        <Footer />
        <WhatsAppButton />
      </body>
    </html>
  );
}
