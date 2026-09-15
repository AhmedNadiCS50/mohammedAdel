import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "كتاب البكالوريا الورقي - التكنولوجيا والبرمجة",
  description:
    "اطلب كتاب الصف الثاني الثانوي البكالوريا في مادة التكنولوجيا والبرمجة مع الخبير مستر عمرو شاهين — أكثر من 500 سؤال وتدريب بنماذج الامتحانات الوزارية، توصيل سريع لجميع محافظات مصر.",
  openGraph: {
    type: "website",
    locale: "ar_EG",
    url: "/products",
    title: "كتاب البكالوريا الورقي - التكنولوجيا والبرمجة",
    description:
      "المرجع الشامل لطلاب الصف الثاني الثانوي بكالوريا. اطلب الآن مع التوصيل لجميع المحافظات.",
    images: [{ url: "/images/book-cover.jpg", width: 600, height: 800, alt: "كتاب الصف الثاني البكالوريا" }],
  },
  alternates: { canonical: "/products" },
};

export default function ProductsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}