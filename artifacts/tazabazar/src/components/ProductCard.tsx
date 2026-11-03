import { useState } from "react";
import { Link } from "wouter";
import { Plus, Minus, TrendingUp, TrendingDown } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useGetCart } from "@workspace/api-client-react";
import { useLang, formatPrice } from "@/context/LanguageContext";

interface Product {
  id: number;
  name: string;
  nameBn?: string | null;
  price: number;
  originalPrice?: number | null;
  basePrice?: number;
  priceChange?: "up" | "down" | "same";
  unit: string;
  imageUrl: string;
  inStock: boolean;
  isOnSale?: boolean;
  categoryName?: string;
}

export default function ProductCard({ product, index = 0 }: { product: Product; index?: number }) {
  const { addItem, updateItem, removeItem } = useCart();
  const { data: cart } = useGetCart();
  const { lang, t } = useLang();
  const [adding, setAdding] = useState(false);

  const cartItem = cart?.items?.find((i) => i.productId === product.id);
  const qty = cartItem?.quantity ?? 0;

  const discount =
    product.originalPrice && product.originalPrice > product.price
      ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
      : null;

  const handleAdd = async (e: React.MouseEvent) => {
    e.preventDefault(); e.stopPropagation();
    if (!product.inStock) return;
    setAdding(true);
    await addItem(product.id, 1);
    setAdding(false);
  };

  const handleIncrease = async (e: React.MouseEvent) => {
    e.preventDefault(); e.stopPropagation();
    if (cartItem) await updateItem(cartItem.id, qty + 1);
  };

  const handleDecrease = async (e: React.MouseEvent) => {
    e.preventDefault(); e.stopPropagation();
    if (!cartItem) return;
    if (qty <= 1) await removeItem(cartItem.id);
    else await updateItem(cartItem.id, qty - 1);
  };

  return (
    <Link href={`/product/${product.id}`}>
      <div className={`group bg-white rounded-xl border border-border hover:border-primary/40 hover:shadow-md transition-all duration-200 overflow-hidden cursor-pointer animate-fade-in-up stagger-${Math.min(index + 1, 6)}`}>
        <div className="relative aspect-square overflow-hidden bg-gray-50">
          <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" loading="lazy" />
          {discount && (
            <span className="absolute top-2 left-2 bg-accent text-accent-foreground text-xs font-bold px-1.5 py-0.5 rounded">
              -{lang === "bn" ? `${toBn(discount)}%` : `${discount}%`}
            </span>
          )}
          {product.priceChange === "up" && (
            <span className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-0.5">
              <TrendingUp className="w-3 h-3" />
            </span>
          )}
          {product.priceChange === "down" && (
            <span className="absolute top-2 right-2 bg-green-500 text-white rounded-full p-0.5">
              <TrendingDown className="w-3 h-3" />
            </span>
          )}
          {!product.inStock && (
            <div className="absolute inset-0 bg-white/70 flex items-center justify-center">
              <span className="text-xs font-semibold text-muted-foreground">{t.outOfStock}</span>
            </div>
          )}
        </div>

        <div className="p-3">
          <p className="text-xs text-muted-foreground mb-0.5">{product.unit}</p>
          <h3 className="text-sm font-medium text-foreground line-clamp-2 leading-tight mb-2">
            {lang === "bn" && product.nameBn ? product.nameBn : product.name}
          </h3>

          <div className="flex items-center justify-between gap-2">
            <div>
              <span className="text-base font-bold text-primary">{formatPrice(product.price, lang)}</span>
              {product.originalPrice && product.originalPrice > product.price && (
                <span className="text-xs text-muted-foreground line-through ml-1">{formatPrice(product.originalPrice, lang)}</span>
              )}
            </div>

            {qty === 0 ? (
              <button onClick={handleAdd} disabled={!product.inStock || adding}
                className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center hover:bg-primary/90 transition disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0">
                <Plus className="w-4 h-4" />
              </button>
            ) : (
              <div className="flex items-center gap-1.5 flex-shrink-0" onClick={(e) => e.preventDefault()}>
                <button onClick={handleDecrease} className="w-7 h-7 rounded-full border border-primary text-primary flex items-center justify-center hover:bg-primary hover:text-white transition">
                  <Minus className="w-3 h-3" />
                </button>
                <span className="text-sm font-bold text-primary w-5 text-center">{lang === "bn" ? toBn(qty) : qty}</span>
                <button onClick={handleIncrease} className="w-7 h-7 rounded-full bg-primary text-white flex items-center justify-center hover:bg-primary/90 transition">
                  <Plus className="w-3 h-3" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}

function toBn(n: number): string {
  const d = ["০", "১", "২", "৩", "৪", "৫", "৬", "৭", "৮", "৯"];
  return String(n).replace(/[0-9]/g, (c) => d[parseInt(c)]);
}
