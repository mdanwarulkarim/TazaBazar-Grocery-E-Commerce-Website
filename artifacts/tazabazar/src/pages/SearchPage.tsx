import { useSearch, useLocation } from "wouter";
import { useListProducts } from "@workspace/api-client-react";
import ProductCard from "@/components/ProductCard";
import { Search } from "lucide-react";
import { useState, useEffect } from "react";
import { useLang, toBn } from "@/context/LanguageContext";

export default function SearchPage() {
  const search = useSearch();
  const params = new URLSearchParams(search);
  const q = params.get("q") ?? "";
  const [inputValue, setInputValue] = useState(q);
  const [, navigate] = useLocation();
  const { t, lang } = useLang();

  const { data: products, isLoading } = useListProducts({ q });

  useEffect(() => { setInputValue(q); }, [q]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim()) navigate(`/search?q=${encodeURIComponent(inputValue.trim())}`);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <div className="mb-6">
        <form onSubmit={handleSearch} className="max-w-xl">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input type="text" value={inputValue} onChange={(e) => setInputValue(e.target.value)}
              placeholder={t.searchGroceries}
              className="w-full pl-10 pr-4 py-3 rounded-full border border-border focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition text-sm" />
          </div>
        </form>
        {q && (
          <p className="mt-3 text-sm text-muted-foreground">
            {isLoading ? t.searching : lang === "bn"
              ? `"${q}" — ${toBn(products?.length ?? 0)} ${t.searchResults}`
              : `${products?.length ?? 0} ${t.searchResults} "${q}"`}
          </p>
        )}
      </div>

      {!q ? (
        <div className="text-center py-20">
          <Search className="w-12 h-12 text-muted mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-foreground mb-1">{t.searchForProducts}</h3>
          <p className="text-sm text-muted-foreground">{t.typeToFind}</p>
        </div>
      ) : isLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
          {Array.from({ length: 10 }).map((_, i) => (<div key={i} className="aspect-square bg-muted rounded-xl animate-pulse" />))}
        </div>
      ) : products && products.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
          {products.map((product, i) => (<ProductCard key={product.id} product={product} index={i} />))}
        </div>
      ) : (
        <div className="text-center py-20">
          <p className="text-4xl mb-4">🔍</p>
          <h3 className="text-lg font-semibold text-foreground mb-1">{t.noResultsTitle}</h3>
          <p className="text-sm text-muted-foreground">{t.tryDifferentKeywords}</p>
        </div>
      )}
    </div>
  );
}
