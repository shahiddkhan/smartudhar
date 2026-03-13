import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SmartUdhar",
  description: "Digital Udhar Ledger for Indian Shopkeepers",
  icons: {
    icon: "/icon.png",
    apple: "/apple-icon.png",
  },
  themeColor: "#F5F5F7",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-[#F5F5F7] text-[#111111]">{children}</body>
    </html>
  );
}
