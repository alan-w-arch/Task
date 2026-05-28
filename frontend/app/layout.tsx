import type { Metadata } from "next";
import "./globals.css";
import Providers from "../components/providers";

export const metadata: Metadata = {
  title: "Social Media Scraper Dashboard",
  description: "NLP-powered real-time social intelligence monitoring portal",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased dark">
      <body className="min-h-full flex flex-col bg-slate-950 text-slate-100">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
