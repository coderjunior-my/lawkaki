import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Law Kaki · Dashboard",
  description: "Conveyancing job dispatch platform for lawyers in Malaysia.",
};

// Without this, mobile browsers render the page in a virtual desktop-width
// viewport and zoom it down to fit — every isMobile()/window.innerWidth
// check in the app then sees a desktop width and never switches to the
// mobile layout, which is why things "don't fit" on a phone.
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
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
