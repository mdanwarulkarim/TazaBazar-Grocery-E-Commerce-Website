import { useRoute, useLocation } from "wouter";
import { ArrowLeft, Plus, Minus, ShoppingCart, Package } from "lucide-react";
import { useGetProduct, useGetCart } from "@workspace/api-client-react";
import { useCart } from "@/context/CartContext";
import { useLang, formatPrice, getCatName } from "@/context/LanguageContext";

export default function ProductDetail() {
  const [, params] = useRoute("/product/:id");
  const [, navigate] = useLocation();
  const { t, lang } = useLang();
  const id = parseInt(params?.id ?? "0");

  const { data: product, isLoading } = useGetProduct(id, { query: { enabled: !!id } } as any);
  const { data: cart } = useGetCart();
  const { addItem, updateItem, removeItem } = useCart();

  const cartItem = cart?.items?.find((i) => i.productId === id);
  const qty = cartItem?.quantity ?? 0;

  const discount = product?.originalPrice && product.originalPrice > product.price
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : null;

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="grid md:grid-cols-2 gap-8">
          <div className="aspect-square bg-muted rounded-2xl animate-pulse" />
          <div className="space-y-4">{Array.from({ length: 4 }).map((_, i) => (<div key={i} className="h-6 bg-muted rounded animate-pulse" />))}</div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <p className="text-4xl mb-4">📦</p>
        <h2 className="text-xl font-bold mb-2">{lang === "bn" ? "পণ্য পাওয়া যায়নি" : "Product not found"}</h2>
        <button onClick={() => navigate("/")} className="text-primary text-sm hover:underline">{lang === "bn" ? "হোমে যান" : "Go home"}</button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      <button onClick={() => history.back()} className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-6 transition">
        <ArrowLeft className="w-4 h-4" /> {t.back}
      </button>

      <div className="grid md:grid-cols-2 gap-8">
        <div className="aspect-square rounded-2xl overflow-hidden bg-gray-50 relative">
          <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
          {discount && (
            <span className="absolute top-3 left-3 bg-accent text-accent-foreground text-sm font-bold px-2 py-1 rounded">
              -{discount}% {lang === "bn" ? "ছাড়" : "OFF"}
            </span>
          )}
        </div>

        <div className="flex flex-col gap-4">
          <div>
            <p className="text-sm text-muted-foreground mb-1">{getCatName(product.categoryName ?? "", lang)}</p>
            <h1 className="text-2xl font-bold text-foreground leading-tight">
              {lang === "bn" && (product as any).nameBn ? (product as any).nameBn : product.name}
            </h1>
            <p className="text-sm text-muted-foreground mt-1">{product.unit}</p>
          </div>

          <div className="flex items-baseline gap-3">
            <span className="text-3xl font-bold text-primary">{formatPrice(product.price, lang)}</span>
            {product.originalPrice && product.originalPrice > product.price && (
              <span className="text-lg text-muted-foreground line-through">{formatPrice(product.originalPrice, lang)}</span>
            )}
            {discount && (
              <span className="text-sm bg-green-100 text-green-700 font-semibold px-2 py-0.5 rounded-full">
                {t.save} {formatPrice(product.originalPrice! - product.price, lang)}
              </span>
            )}
          </div>

          <div className={`flex items-center gap-2 text-sm font-medium ${product.inStock ? "text-green-600" : "text-destructive"}`}>
            <Package className="w-4 h-4" />
            {product.inStock ? t.inStock : t.outOfStock}
          </div>

          {product.description && (
            <p className="text-sm text-muted-foreground border-t border-border pt-4">{product.description}</p>
          )}

          <div className="flex items-center gap-4 mt-2">
            {qty === 0 ? (
              <button onClick={() => addItem(product.id, 1)} disabled={!product.inStock}
                className="flex items-center gap-2 bg-primary text-white font-semibold px-6 py-3 rounded-full hover:bg-primary/90 transition disabled:opacity-50">
                <ShoppingCart className="w-4 h-4" />
                {t.addToCart}
              </button>
            ) : (
              <div className="flex items-center gap-3">
                <button onClick={() => cartItem && (qty <= 1 ? removeItem(cartItem.id) : updateItem(cartItem.id, qty - 1))}
                  className="w-10 h-10 rounded-full border border-primary text-primary flex items-center justify-center hover:bg-primary hover:text-white transition">
                  <Minus className="w-4 h-4" />
                </button>
                <span className="text-xl font-bold text-primary w-8 text-center">{qty}</span>
                <button onClick={() => cartItem && updateItem(cartItem.id, qty + 1)}
                  className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center hover:bg-primary/90 transition">
                  <Plus className="w-4 h-4" />
                </button>
                <span className="text-sm text-muted-foreground ml-2">{lang === "bn" ? "কার্টে আছে" : "in cart"}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
