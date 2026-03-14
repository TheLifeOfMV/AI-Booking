import type { Metadata } from "next";
import "./globals.css";
import RouteGuardProvider from "@/domains/shared/components/RouteGuardProvider";
import BottomNavigation from "@/domains/shared/components/BottomNavigation";
import AuthInitializer from "@/domains/shared/components/AuthInitializer";
import ConditionalLayout from "@/domains/shared/components/ConditionalLayout";

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
        <AuthInitializer>
          <RouteGuardProvider>
            <ConditionalLayout>
              {children}
            </ConditionalLayout>
            <BottomNavigation />
          </RouteGuardProvider>
        </AuthInitializer>
      </body>
    </html>
  );
}
