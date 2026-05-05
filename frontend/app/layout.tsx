import type { Metadata } from "next";
import { Roboto_Mono } from "next/font/google";
import "./globals.css";

const robotoMono = Roboto_Mono({
  variable: "--font-roboto-mono",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Nidaan — Rare Disease Clinical Decision Support",
  description: "Multi-agent specialist case conference for first-line Indian physicians. Ranked differential, expert disagreements, and next tests in under 90 seconds.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${robotoMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-mono" suppressHydrationWarning>{children}</body>
    </html>
  );
}
