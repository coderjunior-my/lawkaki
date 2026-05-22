import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Law Kaki · Dashboard",
  description: "Conveyancing job dispatch platform for lawyers in Malaysia.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" style={{ height: "100%" }}>
      <body style={{ height: "100%", margin: 0, overflow: "hidden" }}>
        {children}
      </body>
    </html>
  );
}
