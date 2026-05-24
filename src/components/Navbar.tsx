import Link from "next/link";
import SearchBar from "@/components/SearchBar";

export default function Navbar() {
  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/95 backdrop-blur-sm shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        <Link href="/" className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-900 text-white font-semibold">
            P
          </div>
          <div className="hidden sm:block">
            <div className="text-slate-900 font-semibold">PhyCalcPro</div>
            <div className="text-xs uppercase tracking-[0.22em] text-slate-500">Engineering Platform</div>
          </div>
        </Link>

        <div className="hidden lg:flex flex-1 items-center justify-center">
          <SearchBar />
        </div>

        <nav className="hidden md:flex items-center gap-6 text-sm text-slate-600">
          <Link href="/" className="transition-colors hover:text-slate-900">
            Home
          </Link>
          <Link href="/products" className="transition-colors hover:text-slate-900">
            Products
          </Link>
          <Link href="/support" className="transition-colors hover:text-slate-900">
            Support
          </Link>
          <Link href="/documentation" className="transition-colors hover:text-slate-900">
            Docs
          </Link>
        </nav>
      </div>
    </header>
  );
}
