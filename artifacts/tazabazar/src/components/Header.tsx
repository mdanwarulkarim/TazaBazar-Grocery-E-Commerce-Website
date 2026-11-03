import { useState } from "react";
import { Link, useLocation } from "wouter";
import { ShoppingCart, Search, User, LogOut, Menu, X, Globe } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { useLang } from "@/context/LanguageContext";

export default function Header() {
  const [searchQuery, setSearchQuery] = useState("");
  const [, navigate] = useLocation();
  const { totalItems, bounceBadge } = useCart();
  const { user, logout } = useAuth();
  const { t, lang, setLang } = useLang();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-white shadow-sm border-b border-border">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center gap-4">
        {/* Logo */}
        <Link href="/" className="flex-shrink-0">
          <div className="flex items-center gap-1.5">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <span className="text-white font-bold text-sm">T</span>
            </div>
            <span className="text-xl font-bold text-primary tracking-tight">TazaBazar</span>
          </div>
        </Link>

        {/* Search */}
        <form onSubmit={handleSearch} className="flex-1 max-w-xl hidden sm:flex">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder={t.searchPlaceholder}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-full border border-border bg-muted/40 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition"
            />
          </div>
        </form>

        <div className="flex items-center gap-1.5 ml-auto">
          {/* Language switcher */}
          <div className="hidden sm:flex items-center gap-0.5 border border-border rounded-full px-1 py-0.5">
            <Globe className="w-3.5 h-3.5 text-muted-foreground ml-1 mr-0.5" />
            <button
              onClick={() => setLang("en")}
              className={`text-xs px-2 py-1 rounded-full font-medium transition ${lang === "en" ? "bg-primary text-white" : "text-muted-foreground hover:text-foreground"}`}
            >
              EN
            </button>
            <button
              onClick={() => setLang("bn")}
              className={`text-xs px-2 py-1 rounded-full font-medium transition ${lang === "bn" ? "bg-primary text-white" : "text-muted-foreground hover:text-foreground"}`}
            >
              বাং
            </button>
          </div>

          {/* Auth */}
          {user ? (
            <div className="hidden sm:flex items-center gap-2">
              <span className="text-sm font-medium text-foreground">{user.name}</span>
              <button
                onClick={() => logout()}
                className="p-2 rounded-full hover:bg-muted transition text-muted-foreground"
                title={t.logout}
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <Link
              href="/login"
              className="hidden sm:flex items-center gap-1.5 text-sm font-medium px-3 py-1.5 rounded-full border border-primary text-primary hover:bg-primary hover:text-white transition"
            >
              <User className="w-4 h-4" />
              {t.login}
            </Link>
          )}

          {/* Cart */}
          <Link href="/cart" className="relative p-2 rounded-full hover:bg-muted transition">
            <ShoppingCart className="w-5 h-5 text-foreground" />
            {totalItems > 0 && (
              <span
                className={`absolute -top-1 -right-1 w-5 h-5 rounded-full bg-primary text-white text-xs flex items-center justify-center font-bold ${bounceBadge ? "animate-cart-bounce" : ""}`}
              >
                {totalItems > 9 ? "9+" : totalItems}
              </span>
            )}
          </Link>

          {/* Mobile menu */}
          <button
            className="sm:hidden p-2 rounded-full hover:bg-muted transition"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile expanded */}
      {menuOpen && (
        <div className="sm:hidden px-4 pb-3 border-t border-border bg-white flex flex-col gap-3">
          <form onSubmit={handleSearch} className="flex mt-3">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder={t.searchGroceries}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 rounded-full border border-border bg-muted/40 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>
          </form>

          {/* Mobile language switcher */}
          <div className="flex items-center gap-1.5">
            <Globe className="w-4 h-4 text-muted-foreground" />
            <button
              onClick={() => setLang("en")}
              className={`text-sm px-3 py-1 rounded-full font-medium transition ${lang === "en" ? "bg-primary text-white" : "border border-border text-foreground"}`}
            >
              English
            </button>
            <button
              onClick={() => setLang("bn")}
              className={`text-sm px-3 py-1 rounded-full font-medium transition ${lang === "bn" ? "bg-primary text-white" : "border border-border text-foreground"}`}
            >
              বাংলা
            </button>
          </div>

          {user ? (
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">{user.name}</span>
              <button onClick={() => logout()} className="text-sm text-destructive">{t.logout}</button>
            </div>
          ) : (
            <Link href="/login" className="text-sm font-medium text-primary" onClick={() => setMenuOpen(false)}>
              {t.login} / {t.register}
            </Link>
          )}
        </div>
      )}
    </header>
  );
}
