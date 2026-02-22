import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SmartUdhar",
  description: "Digital Udhar Ledger for Indian Shopkeepers",
  icons: {
    icon: "/icon.png",
    apple: "/apple-icon.png",
  },
  themeColor: "#0f172a",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}