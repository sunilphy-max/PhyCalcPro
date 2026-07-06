import "../styles/globals.css";
import Navbar from "@/components/Navbar";
import ValidationModeBanner from "@/components/licensing/ValidationModeBanner";
import { EntitlementProvider } from "@/contexts/EntitlementContext";
import { AuthProvider } from "@/contexts/AuthContext";
import { PersistenceProvider } from "@/contexts/PersistenceContext";

export const metadata = {
  title: "PhyCalcPro",
  description: "Engineering Calculation & Design Platform",
  icons: {
    icon: [{ url: "/logo.svg", type: "image/svg+xml" }],
    apple: "/phycalcpro-logo.png",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full">
      <body className="min-h-screen bg-slate-50 text-slate-900 antialiased dark:bg-slate-950 dark:text-slate-100">
        <EntitlementProvider>
          <AuthProvider>
            <PersistenceProvider>
              <ValidationModeBanner />
              <Navbar />
              <main className="min-h-screen">{children}</main>
            </PersistenceProvider>
          </AuthProvider>
        </EntitlementProvider>
      </body>
    </html>
  );
}
