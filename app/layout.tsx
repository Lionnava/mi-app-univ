// app/layout.tsx
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Gestión Académica UPTMA",
  description: "App para la gestión de notas y asistencia.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className={inter.className}>
        <div className="flex flex-col min-h-screen bg-gray-50">
          <main className="flex-grow container mx-auto p-4 md:p-8">
            {children}
          </main>
          <footer className="w-full text-center p-4 bg-gray-200 text-gray-600 text-sm mt-auto">
            <p>&copy; 2025 - Desarrollado por Ing. LionellNava21</p>
            <p>Aplicación para la gestión académica del PNF en Informática, UPTMA.</p>
          </footer>
        </div>
      </body>
    </html>
  );
}