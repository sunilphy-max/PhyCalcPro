import "../styles/globals.css";
import Navbar from "@/components/Navbar";
import SiteFooter from "@/components/SiteFooter";
import ValidationModeBanner from "@/components/licensing/ValidationModeBanner";
import { EntitlementProvider } from "@/contexts/EntitlementContext";
import { AuthProvider } from "@/contexts/AuthContext";
import { PersistenceProvider } from "@/contexts/PersistenceContext";
import { rootMetadata } from "@/lib/seo/site";

export const metadata = rootMetadata;

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
              <SiteFooter />
            </PersistenceProvider>
          </AuthProvider>
        </EntitlementProvider>
      </body>
    </html>
  );
}
