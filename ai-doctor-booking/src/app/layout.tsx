import type { Metadata } from "next";
import "./globals.css";
import RouteGuardProvider from "@/components/RouteGuardProvider";
import BottomNavigation from "@/components/BottomNavigation";

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
        <RouteGuardProvider>
          <main className="min-h-screen pb-16">
            {children}
          </main>
          <BottomNavigation />
        </RouteGuardProvider>
      </body>
    </html>
  );
}
