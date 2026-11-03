import { Link, useLocation } from "wouter";
import { Minus, Plus, Trash2, ShoppingCart, ArrowRight } from "lucide-react";
import { useGetCart } from "@workspace/api-client-react";
import { useCart } from "@/context/CartContext";
import { useLang, formatPrice, toBn } from "@/context/LanguageContext";

export default function CartPage() {
  const { data: cart, isLoading } = useGetCart();
  const { updateItem, removeItem, clearCart } = useCart();
  const { t, lang } = useLang();
  const [, navigate] = useLocation();

  if (isLoading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-8 space-y-3">
        {Array.from({ length: 3 }).map((_, i) => (<div key={i} className="h-24 bg-muted rounded-xl animate-pulse" />))}
      </div>
    );
  }

  const items = cart?.items ?? [];

  if (items.length === 0) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center">
        <ShoppingCart className="w-16 h-16 text-muted mx-auto mb-4" />
        <h2 className="text-xl font-bold text-foreground mb-2">{t.emptyCart}</h2>
        <p className="text-sm text-muted-foreground mb-6">{t.emptyCartSub}</p>
        <Link href="/" className="inline-flex items-center gap-2 bg-primary text-white font-semibold px-6 py-3 rounded-full hover:bg-primary/90 transition">
          {t.startShopping} <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-foreground">{t.yourCart}</h1>
        <button onClick={() => clearCart()} className="text-sm text-destructive hover:underline">{t.clearAll}</button>
      </div>

      <div className="space-y-3 mb-6">
        {items.map((item) => (
          <div key={item.id} className="bg-white rounded-xl border border-border p-4 flex items-center gap-4 animate-fade-in-up">
            <img src={item.imageUrl} alt={item.name} className="w-16 h-16 object-cover rounded-lg bg-gray-50 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-semibold text-foreground line-clamp-1">{item.name}</h3>
              <p className="text-xs text-muted-foreground">{item.unit}</p>
              <p className="text-sm font-bold text-primary mt-0.5">{formatPrice(item.price * item.quantity, lang)}</p>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <button onClick={() => item.quantity <= 1 ? removeItem(item.id) : updateItem(item.id, item.quantity - 1)}
                className="w-7 h-7 rounded-full border border-border flex items-center justify-center hover:bg-muted transition">
                {item.quantity <= 1 ? <Trash2 className="w-3.5 h-3.5 text-destructive" /> : <Minus className="w-3.5 h-3.5" />}
              </button>
              <span className="text-sm font-bold w-6 text-center">{lang === "bn" ? toBn(item.quantity) : item.quantity}</span>
              <button onClick={() => updateItem(item.id, item.quantity + 1)}
                className="w-7 h-7 rounded-full bg-primary text-white flex items-center justify-center hover:bg-primary/90 transition">
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-border p-5 sticky bottom-4">
        <h3 className="text-sm font-semibold text-muted-foreground mb-3">{t.orderSummary}</h3>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">{t.subtotal} ({lang === "bn" ? `${toBn(cart?.totalItems ?? 0)} ${t.items}` : `${cart?.totalItems} ${t.items}`})</span>
            <span>{formatPrice(cart?.totalPrice ?? 0, lang)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">{t.deliveryFee}</span>
            <span className="text-green-600 font-medium">{t.free}</span>
          </div>
          <div className="border-t border-border pt-2 flex justify-between font-bold text-base">
            <span>{t.total}</span>
            <span className="text-primary">{formatPrice(cart?.totalPrice ?? 0, lang)}</span>
          </div>
        </div>
        <button onClick={() => navigate("/checkout")}
          className="mt-4 w-full bg-primary text-white font-semibold py-3 rounded-full flex items-center justify-center gap-2 hover:bg-primary/90 transition">
          {t.proceedToCheckout} <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
