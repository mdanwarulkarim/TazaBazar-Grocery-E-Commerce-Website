import { Link, useLocation } from "wouter";
import { ArrowRight, Zap, Tag, Heart, Package, Star } from "lucide-react";
import { useListCategories, useListPopularProducts, useListDeals } from "@workspace/api-client-react";
import ProductCard from "@/components/ProductCard";
import { useLang, getCatName, formatPrice } from "@/context/LanguageContext";

export default function Home() {
  const { t, lang } = useLang();
  const [, navigate] = useLocation();
  const { data: categories, isLoading: catLoading } = useListCategories();
  const { data: popular, isLoading: popLoading } = useListPopularProducts();
  const { data: deals } = useListDeals();

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 flex gap-6">
      {/* Left Sidebar (Chaldal-style) */}
      <aside className="hidden lg:flex flex-col w-52 flex-shrink-0 gap-1">
        {/* Promo box */}
        <div className="bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200 rounded-xl p-3 mb-2">
          <p className="text-xs font-bold text-amber-800 mb-0.5">🎉 {t.promoTitle}</p>
          <p className="text-xs text-amber-700 font-mono font-bold">TAZA10</p>
        </div>

        <Link href="/orders">
          <div className="flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-muted cursor-pointer transition text-sm text-foreground">
            <Package className="w-4 h-4 text-primary" />
            <span>{t.myOrders}</span>
          </div>
        </Link>
        <div className="flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-muted cursor-pointer transition text-sm text-foreground">
          <Tag className="w-4 h-4 text-orange-500" />
          <span>{t.coupons}</span>
        </div>
        <div className="flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-muted cursor-pointer transition text-sm text-foreground">
          <Star className="w-4 h-4 text-yellow-500" />
          <span>{t.offers}</span>
        </div>
        <div className="flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-muted cursor-pointer transition text-sm text-foreground">
          <Heart className="w-4 h-4 text-rose-500" />
          <span>{t.favourites}</span>
        </div>

        <div className="border-t border-border my-2" />

        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide px-3 mb-1">{t.allCategories}</p>

        {catLoading ? (
          Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-8 bg-muted rounded-lg animate-pulse mx-1" />
          ))
        ) : (
          categories?.map((cat) => (
            <Link key={cat.id} href={`/category/${cat.slug}`}>
              <div className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-muted cursor-pointer transition text-sm text-foreground group">
                <span className="text-base">{cat.icon}</span>
                <span className="flex-1 leading-tight">{getCatName(cat.slug, lang)}</span>
                <ArrowRight className="w-3 h-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition" />
              </div>
            </Link>
          ))
        )}
      </aside>

      {/* Main Content */}
      <div className="flex-1 min-w-0 space-y-8">
        {/* Hero Banner */}
        <div className="rounded-2xl bg-gradient-to-br from-primary to-green-600 p-8 text-white flex flex-col sm:flex-row items-center justify-between gap-6 overflow-hidden relative">
          <div className="relative z-10">
            <p className="text-green-100 text-sm font-medium mb-1">{t.heroTagline}</p>
            <h1 className="text-3xl sm:text-4xl font-bold leading-tight mb-3 whitespace-pre-line">{t.heroTitle}</h1>
            <p className="text-green-100 text-sm mb-5 max-w-xs">{t.heroSubtitle}</p>
            <Link href="/category/food-beverages"
              className="inline-flex items-center gap-2 bg-white text-primary font-semibold px-5 py-2.5 rounded-full hover:bg-green-50 transition text-sm">
              {t.shopNow} <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="text-[120px] leading-none select-none opacity-20 absolute right-4 top-1/2 -translate-y-1/2 hidden sm:block">🛒</div>
        </div>

        {/* Stats bar (like Chaldal) */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { icon: "🛍️", title: lang === "bn" ? "১৫,০০০+ পণ্য" : "15,000+ products", sub: lang === "bn" ? "থেকে কেনাকাটা করুন" : "to shop from" },
            { icon: "💳", title: lang === "bn" ? "পণ্য পাওয়ার পর" : "Pay after", sub: lang === "bn" ? "পরিশোধ করুন" : "receiving products" },
            { icon: "⚡", title: lang === "bn" ? "১ ঘণ্টার মধ্যে" : "Within 1 hour", sub: lang === "bn" ? "ডেলিভারি পান" : "get your delivery" },
            { icon: "💰", title: lang === "bn" ? "সাশ্রয়ী মূল্যে" : "Best prices", sub: lang === "bn" ? "অফার পান" : "save money" },
          ].map((s, i) => (
            <div key={i} className="bg-white rounded-xl border border-border px-4 py-3 flex items-center gap-3">
              <span className="text-2xl">{s.icon}</span>
              <div>
                <p className="text-xs font-bold text-foreground">{s.title}</p>
                <p className="text-xs text-muted-foreground">{s.sub}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Categories grid */}
        <section>
          <h2 className="text-xl font-bold text-foreground mb-4">{t.shopByCategory}</h2>
          {catLoading ? (
            <div className="grid grid-cols-4 sm:grid-cols-8 gap-3">
              {Array.from({ length: 8 }).map((_, i) => (<div key={i} className="h-20 bg-muted rounded-xl animate-pulse" />))}
            </div>
          ) : (
            <div className="grid grid-cols-4 sm:grid-cols-8 gap-3">
              {categories?.map((cat, i) => (
                <Link key={cat.id} href={`/category/${cat.slug}`}>
                  <div className={`flex flex-col items-center gap-1.5 p-3 rounded-xl bg-white border border-border hover:border-primary/40 hover:shadow-sm cursor-pointer transition animate-fade-in-up stagger-${Math.min(i + 1, 6)}`}>
                    <span className="text-2xl">{cat.icon}</span>
                    <span className="text-xs text-center font-medium text-foreground leading-tight">{getCatName(cat.slug, lang)}</span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>

        {/* Flash Deals */}
        {deals && deals.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-accent fill-accent" />
                <h2 className="text-xl font-bold text-foreground">{t.flashDeals}</h2>
                <span className="text-xs bg-red-100 text-red-600 font-semibold px-2 py-0.5 rounded-full animate-pulse">
                  {lang === "bn" ? "লাইভ মূল্য" : "Live prices"}
                </span>
              </div>
              <Link href="/category/flash-sales" className="text-sm text-primary font-medium flex items-center gap-1 hover:underline">
                {t.viewAll} <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 gap-3">
              {deals.slice(0, 8).map((product, i) => (
                <ProductCard key={product.id} product={product} index={i} />
              ))}
            </div>
          </section>
        )}

        {/* Popular Products */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-foreground">{t.popularRightNow}</h2>
            <Link href="/category/food-beverages" className="text-sm text-primary font-medium flex items-center gap-1 hover:underline">
              {t.viewAll} <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          {popLoading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {Array.from({ length: 8 }).map((_, i) => (<div key={i} className="aspect-square bg-muted rounded-xl animate-pulse" />))}
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {popular?.map((product, i) => (
                <ProductCard key={product.id} product={product} index={i} />
              ))}
            </div>
          )}
        </section>

        {/* Promo Banner */}
        <div className="rounded-2xl bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 p-6 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-amber-900 mb-1">{t.promoTitle}</h3>
            <p className="text-sm text-amber-700">{t.promoSub}</p>
          </div>
          <Link href="/register" className="flex-shrink-0 bg-amber-500 text-white text-sm font-semibold px-4 py-2 rounded-full hover:bg-amber-600 transition">
            {t.registerNow}
          </Link>
        </div>
      </div>
    </div>
  );
}
