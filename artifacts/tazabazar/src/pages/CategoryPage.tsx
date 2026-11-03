import { useState } from "react";
import { useRoute } from "wouter";
import { useListProducts, useListCategories } from "@workspace/api-client-react";
import ProductCard from "@/components/ProductCard";
import { Link } from "wouter";
import { useLang, getCatName } from "@/context/LanguageContext";

// Subcategory config per category slug
const subcategoryConfig: Record<string, { key: string; en: string; bn: string; icon: string; image: string }[]> = {
  "food-beverages": [
    {
      key: "cooking",
      en: "Cooking",
      bn: "রান্নার উপকরণ",
      icon: "🍛",
      image: "https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=300&q=80",
    },
    {
      key: "sauces-pickles",
      en: "Sauces & Pickles",
      bn: "সস ও আচার",
      icon: "🫙",
      image: "https://images.unsplash.com/photo-1607623814075-e51df1bdc82f?w=300&q=80",
    },
    {
      key: "candy-chocolate",
      en: "Candy & Chocolate",
      bn: "ক্যান্ডি ও চকলেট",
      icon: "🍫",
      image: "https://images.unsplash.com/photo-1606312619070-d48b4c652a52?w=300&q=80",
    },
    {
      key: "frozen-food",
      en: "Frozen Food",
      bn: "ফ্রোজেন খাবার",
      icon: "🧊",
      image: "https://images.unsplash.com/photo-1562967914-608f82629710?w=300&q=80",
    },
    {
      key: "cooking-oil",
      en: "Cooking Oil",
      bn: "রান্নার তেল",
      icon: "🫒",
      image: "https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=300&q=80",
    },
  ],
  "snacks": [
    {
      key: "chips",
      en: "Chips & Crisps",
      bn: "চিপস ও ক্রিসপস",
      icon: "🥔",
      image: "https://images.unsplash.com/photo-1566478989037-eec170784d0b?w=300&q=80",
    },
    {
      key: "biscuits",
      en: "Biscuits & Cookies",
      bn: "বিস্কুট ও কুকিজ",
      icon: "🍪",
      image: "https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=300&q=80",
    },
    {
      key: "noodles",
      en: "Noodles & Pasta",
      bn: "নুডলস ও পাস্তা",
      icon: "🍜",
      image: "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=300&q=80",
    },
    {
      key: "bakery",
      en: "Bakery & Bread",
      bn: "বেকারি ও পাউরুটি",
      icon: "🍞",
      image: "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=300&q=80",
    },
    {
      key: "confectionery",
      en: "Chocolates & Candy",
      bn: "চকলেট ও ক্যান্ডি",
      icon: "🍬",
      image: "https://images.unsplash.com/photo-1549007994-cb92caebd54b?w=300&q=80",
    },
  ],
  "personal-care": [
    {
      key: "women",
      en: "Women's Care",
      bn: "মহিলাদের যত্ন",
      icon: "👩",
      image: "https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=300&q=80",
    },
    {
      key: "men",
      en: "Men's Care",
      bn: "পুরুষদের যত্ন",
      icon: "👨",
      image: "https://images.unsplash.com/photo-1621607505405-7c58e7df34a8?w=300&q=80",
    },
    {
      key: "general",
      en: "General Care",
      bn: "সাধারণ যত্ন",
      icon: "🧴",
      image: "https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=300&q=80",
    },
  ],
};

export default function CategoryPage() {
  const [, params] = useRoute("/category/:slug");
  const slug = params?.slug ?? "";
  const { t, lang } = useLang();
  const [activeSubcat, setActiveSubcat] = useState<string | null>(null);

  const { data: categories } = useListCategories();
  const { data: products, isLoading } = useListProducts({
    category: slug,
    ...(activeSubcat ? { subcategory: activeSubcat } : {}),
  });

  const currentCat = categories?.find((c) => c.slug === slug);
  const subcats = subcategoryConfig[slug] ?? [];

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 flex gap-6">
      {/* Sidebar */}
      <aside className="hidden md:block w-52 flex-shrink-0">
        <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3 px-1">{t.allCategories}</h3>
        <nav className="space-y-0.5">
          {categories?.map((cat) => (
            <Link key={cat.id} href={`/category/${cat.slug}`}>
              <div
                className={`flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer transition text-sm ${
                  cat.slug === slug
                    ? "bg-primary text-white font-semibold"
                    : "hover:bg-muted text-foreground"
                }`}
                onClick={() => setActiveSubcat(null)}
              >
                <span>{cat.icon}</span>
                <span className="flex-1 leading-tight">{getCatName(cat.slug, lang)}</span>
              </div>
            </Link>
          ))}
        </nav>

        {/* Sub-category list in sidebar */}
        {subcats.length > 0 && (
          <div className="mt-4">
            <div className="border-t border-border pt-3">
              <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2 px-1">
                {lang === "bn" ? "উপবিভাগ" : "Sub-categories"}
              </h4>
              <div className="space-y-0.5">
                <button
                  onClick={() => setActiveSubcat(null)}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm transition ${
                    activeSubcat === null ? "bg-primary/10 text-primary font-semibold" : "hover:bg-muted text-foreground"
                  }`}
                >
                  {lang === "bn" ? "সব" : "All"}
                </button>
                {subcats.map((s) => (
                  <button
                    key={s.key}
                    onClick={() => setActiveSubcat(activeSubcat === s.key ? null : s.key)}
                    className={`w-full text-left flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition ${
                      activeSubcat === s.key ? "bg-primary/10 text-primary font-semibold" : "hover:bg-muted text-foreground"
                    }`}
                  >
                    <span>{s.icon}</span>
                    <span>{lang === "bn" ? s.bn : s.en}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </aside>

      {/* Main */}
      <main className="flex-1 min-w-0">
        <div className="mb-5">
          <h1 className="text-2xl font-bold text-foreground">
            {currentCat ? getCatName(currentCat.slug, lang) : (lang === "bn" ? "পণ্যসমূহ" : "Products")}
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {lang === "bn"
              ? `${products?.length ?? 0} ${t.productsAvailable}`
              : `${products?.length ?? 0} ${t.productsAvailable}`}
          </p>
        </div>

        {/* Chaldal-style subcategory image tiles */}
        {subcats.length > 0 && (
          <div className="mb-6">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
              {subcats.map((s) => (
                <button
                  key={s.key}
                  onClick={() => setActiveSubcat(activeSubcat === s.key ? null : s.key)}
                  className={`group rounded-xl overflow-hidden border-2 transition-all ${
                    activeSubcat === s.key
                      ? "border-primary shadow-md scale-[1.02]"
                      : "border-border hover:border-primary/50 hover:shadow-sm"
                  }`}
                >
                  <div className="aspect-[4/3] overflow-hidden bg-gray-50">
                    <img
                      src={s.image}
                      alt={s.en}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <div className={`py-2 px-2 text-center text-xs font-semibold ${
                    activeSubcat === s.key ? "bg-primary text-white" : "bg-white text-foreground"
                  }`}>
                    {s.icon} {lang === "bn" ? s.bn : s.en}
                  </div>
                </button>
              ))}
            </div>
            {activeSubcat && (
              <button
                onClick={() => setActiveSubcat(null)}
                className="mt-2 text-xs text-primary hover:underline"
              >
                {lang === "bn" ? "× ফিল্টার সরান" : "× Clear filter"}
              </button>
            )}
          </div>
        )}

        {/* Mobile category scroll */}
        <div className="md:hidden flex gap-2 overflow-x-auto pb-3 mb-4">
          {categories?.map((cat) => (
            <Link key={cat.id} href={`/category/${cat.slug}`}>
              <div
                className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium cursor-pointer transition border ${
                  cat.slug === slug
                    ? "bg-primary text-white border-primary"
                    : "bg-white text-foreground border-border"
                }`}
              >
                <span>{cat.icon}</span>
                {getCatName(cat.slug, lang)}
              </div>
            </Link>
          ))}
        </div>

        {/* Mobile subcategory filter pills */}
        {subcats.length > 0 && (
          <div className="md:hidden flex gap-2 overflow-x-auto pb-3 mb-4">
            <button
              onClick={() => setActiveSubcat(null)}
              className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition border ${
                activeSubcat === null
                  ? "bg-primary text-white border-primary"
                  : "bg-white text-foreground border-border"
              }`}
            >
              {lang === "bn" ? "সব" : "All"}
            </button>
            {subcats.map((s) => (
              <button
                key={s.key}
                onClick={() => setActiveSubcat(activeSubcat === s.key ? null : s.key)}
                className={`flex-shrink-0 flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium transition border ${
                  activeSubcat === s.key
                    ? "bg-primary text-white border-primary"
                    : "bg-white text-foreground border-border"
                }`}
              >
                {s.icon} {lang === "bn" ? s.bn : s.en}
              </button>
            ))}
          </div>
        )}

        {isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="aspect-square bg-muted rounded-xl animate-pulse" />
            ))}
          </div>
        ) : products && products.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {products.map((product, i) => (
              <ProductCard key={product.id} product={product} index={i} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <p className="text-4xl mb-4">📦</p>
            <h3 className="text-lg font-semibold text-foreground mb-1">{t.noProducts}</h3>
            <p className="text-sm text-muted-foreground">{t.tryDifferentCat}</p>
          </div>
        )}
      </main>
    </div>
  );
}
