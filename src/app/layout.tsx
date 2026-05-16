import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "SynthoR&D — AI-Powered Multi-LLM Research Platform",
  description: "Eliminate inconsistent LLM outputs and fragmented research. Run parallel queries across multiple LLMs, compare side-by-side, and synthesize superior insights — all in one unified workspace.",
  keywords: ["SynthoR&D", "LLM", "Multi-LLM", "AI Research", "Research Platform", "Synthesis", "Next.js", "TypeScript"],
  authors: [{ name: "SynthoR&D Team" }],
  icons: {
    icon: "https://z-cdn.chatglm.cn/z-ai/static/logo.svg",
  },
  openGraph: {
    title: "SynthoR&D — AI-Powered Multi-LLM Research Platform",
    description: "Run parallel queries, compare side-by-side, and synthesize superior insights with multiple LLMs.",
    url: "https://chat.z.ai",
    siteName: "SynthoR&D",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "SynthoR&D — AI-Powered Multi-LLM Research Platform",
    description: "Run parallel queries, compare side-by-side, and synthesize superior insights with multiple LLMs.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
