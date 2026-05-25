import "../styles/globals.css";
import Navbar from "@/components/Navbar";

export const metadata = {
  title: "PhyCalcPro",
  description: "Engineering Calculation & Design Platform",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full">
      <body className="min-h-screen bg-slate-50 text-slate-900 antialiased dark:bg-slate-950 dark:text-slate-100">
        <Navbar />
        <main className="min-h-screen">{children}</main>
      </body>
    </html>
  );
}
