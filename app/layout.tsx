import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "System Design Workbook",
  description:
    "System Design পড়াশোনার ব্যক্তিগত ট্র্যাকার — Google ইন্টারভিউ প্রস্তুতির জন্য",
};

// Dark mode localStorage-এ থাকে, কিন্তু React hydrate হওয়ার আগেই `.dark` class
// বসাতে হয় — নাহলে প্রথম পেইন্টে সাদা ফ্ল্যাশ (FOUC) দেখা যায়।
const themeScript = `
try {
  if (JSON.parse(localStorage.getItem('sd_dark_mode') || 'false')) {
    document.documentElement.classList.add('dark');
  }
} catch (e) {}
`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="bn"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
