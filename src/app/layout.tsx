import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Yoga.ai — Gentle movement guidance",
  description:
    "Non-medical, supportive yoga-style movement suggestions based on your intake.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen antialiased">{children}</body>
    </html>
  );
}
