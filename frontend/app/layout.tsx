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
  title: "AgentCivic",
  description: "AgentCivic Zone1 + Zone2 operational dashboard",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <div className="min-h-screen bg-zinc-950 text-zinc-50">
          <header className="sticky top-0 z-50 border-b border-zinc-800 bg-zinc-950/80 backdrop-blur-md">
            <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-lg bg-emerald-500 flex items-center justify-center font-bold text-zinc-950 shadow-[0_0_15px_rgba(16,185,129,0.4)]">
                  AC
                </div>
                <div>
                  <h1 className="text-lg font-bold tracking-tight text-white leading-none">AgentCivic</h1>
                  <p className="mt-1 text-[10px] font-medium uppercase tracking-[0.2em] text-emerald-400">
                    City Equity Command Hub
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-6">
                <nav className="hidden items-center gap-5 md:flex">
                  <a href="/" className="text-sm font-medium text-zinc-400 transition-colors hover:text-white">Dashboard</a>
                  <a href="/map" className="text-sm font-medium text-zinc-400 transition-colors hover:text-white">Equity Map</a>
                  <a href="/feed" className="text-sm font-medium text-zinc-400 transition-colors hover:text-white">Live Feed</a>
                  <a href="/report" className="text-sm font-medium text-zinc-400 transition-colors hover:text-white">Report Card</a>
                  <a href="/agents" className="text-sm font-medium text-zinc-400 transition-colors hover:text-white">Agent Network</a>
                  <div className="h-4 w-[1px] bg-zinc-800"></div>
                  <div className="flex items-center gap-2">
                    <div className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]"></div>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-500">System Ready</span>
                  </div>
                </nav>
              </div>
            </div>
          </header>
          <main className="mx-auto max-w-7xl px-6 py-10">{children}</main>
        </div>
      </body>
    </html>
  );
}
