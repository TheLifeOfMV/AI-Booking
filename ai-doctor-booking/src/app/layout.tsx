import type { Metadata } from "next";
import "./globals.css";
import RouteGuardProvider from "@/components/RouteGuardProvider";
import BottomNavigation from "@/components/BottomNavigation";

export const metadata: Metadata = {
  title: "AI Doctor Booking",
  description: "Plataforma multicanal para que los pacientes reserven citas médicas a través de la aplicación, WhatsApp o teléfono",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
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
