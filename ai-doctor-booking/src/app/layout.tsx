import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AI Doctor Booking",
  description: "Multi-channel platform for patients to book medical appointments via app, WhatsApp or phone",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
