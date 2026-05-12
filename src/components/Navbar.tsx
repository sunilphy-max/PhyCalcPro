import Link from "next/link";
import SearchBar from "@/components/SearchBar";

export default function Navbar() {
  return (
    <header className="sticky top-0 z-50 border-b border-slate-800 bg-slate-950/95 backdrop-blur">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between gap-6">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 shrink-0">
          <div className="w-9 h-9 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold">
            P
          </div>

          <div>
            <div className="text-white font-bold text-lg">
              PhyCalcPro
            </div>
            <div className="text-[10px] text-slate-400 leading-none">
              Engineering Platform
            </div>
          </div>
        </Link>

        {/* Search */}
        <div className="flex-1 max-w-2xl">
          <SearchBar />
        </div>

        {/* Menu */}
        <nav className="flex items-center gap-6 text-sm text-slate-300 shrink-0">
          <Link href="/" className="hover:text-white transition-colors">
            Home
          </Link>

          <Link href="/products" className="hover:text-white transition-colors">
            Products
          </Link>

          <Link href="/support" className="hover:text-white transition-colors">
            Support
          </Link>

          <Link href="/documentation" className="hover:text-white transition-colors">
            Documentation
          </Link>
        </nav>
      </div>
    </header>
  );
}