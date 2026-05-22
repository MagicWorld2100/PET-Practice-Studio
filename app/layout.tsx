import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "PET Practice Studio",
  description:
    "A browser-based Cambridge B1 Preliminary for Schools practice studio for children and parents.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN" className="h-full antialiased">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
