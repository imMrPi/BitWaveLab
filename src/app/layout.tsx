import type { Metadata } from "next";
import { Geist_Mono, Vazirmatn } from "next/font/google";
import "@/styles/styles.css";
import "@/features/workbench/module/workbench.mobile.css";

const vazirmatn = Vazirmatn({
  variable: "--font-vazirmatn",
  subsets: ["arabic"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "BitWaveLab — Visual Signal Workflow Studio",
  description:
    "آزمایشگاه تعاملی پردازش سیگنال و مخابرات با Workflowهای بصری و خروجی زنده.",
  other: {
    "codex-preview": "development",
  },
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fa" dir="rtl">
      <body className={`${vazirmatn.variable} ${geistMono.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}