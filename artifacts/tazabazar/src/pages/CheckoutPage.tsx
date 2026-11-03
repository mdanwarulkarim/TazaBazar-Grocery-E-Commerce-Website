import { useState } from "react";
import { useLocation } from "wouter";
import { MapPin, Phone, FileText, CheckCircle } from "lucide-react";
import { useGetCart, useCreateOrder, getGetCartQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { useLang, formatPrice } from "@/context/LanguageContext";

export default function CheckoutPage() {
  const [, navigate] = useLocation();
  const queryClient = useQueryClient();
  const { data: cart } = useGetCart();
  const createOrder = useCreateOrder();
  const { t, lang } = useLang();
  const [form, setForm] = useState({ deliveryAddress: "", phone: "", note: "" });
  const [error, setError] = useState("");

  const items = cart?.items ?? [];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!form.deliveryAddress.trim() || !form.phone.trim()) {
      setError(lang === "bn" ? "অনুগ্রহ করে সব প্রয়োজনীয় তথ্য পূরণ করুন" : "Please fill in all required fields");
      return;
    }
    try {
      const order = await createOrder.mutateAsync({
        data: { deliveryAddress: form.deliveryAddress, phone: form.phone, note: form.note || undefined },
      });
      queryClient.invalidateQueries({ queryKey: getGetCartQueryKey() });
      navigate(`/orders/${order.id}`);
    } catch {
      setError(lang === "bn" ? "অর্ডার দিতে ব্যর্থ হয়েছে। আবার চেষ্টা করুন।" : "Failed to place order. Please try again.");
    }
  };

  if (items.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <p className="text-4xl mb-4">🛒</p>
        <h2 className="text-xl font-bold mb-2">{t.cartEmptyCheckout}</h2>
        <button onClick={() => navigate("/")} className="text-primary text-sm hover:underline">{t.continueShopping}</button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold text-foreground mb-6">{t.checkout}</h1>

      <div className="grid md:grid-cols-5 gap-6">
        <form onSubmit={handleSubmit} className="md:col-span-3 space-y-4">
          <div className="bg-white rounded-xl border border-border p-5 space-y-4">
            <h2 className="font-semibold text-foreground">{t.deliveryDetails}</h2>
            <div>
              <label className="text-sm font-medium text-foreground flex items-center gap-1.5 mb-1.5">
                <MapPin className="w-3.5 h-3.5 text-primary" /> {t.deliveryAddress}
              </label>
              <textarea value={form.deliveryAddress} onChange={(e) => setForm({ ...form, deliveryAddress: e.target.value })}
                rows={3} placeholder={t.enterFullAddress}
                className="w-full px-3 py-2 rounded-lg border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none" required />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground flex items-center gap-1.5 mb-1.5">
                <Phone className="w-3.5 h-3.5 text-primary" /> {t.phoneNumber}
              </label>
              <input type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })}
                placeholder={t.enterPhone}
                className="w-full px-3 py-2 rounded-lg border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" required />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground flex items-center gap-1.5 mb-1.5">
                <FileText className="w-3.5 h-3.5 text-muted-foreground" /> {t.note}
              </label>
              <input type="text" value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value })}
                placeholder={t.specialInstructions}
                className="w-full px-3 py-2 rounded-lg border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
            </div>
          </div>

          {error && <p className="text-sm text-destructive bg-destructive/10 px-3 py-2 rounded-lg">{error}</p>}

          <button type="submit" disabled={createOrder.isPending}
            className="w-full bg-primary text-white font-semibold py-3 rounded-full flex items-center justify-center gap-2 hover:bg-primary/90 transition disabled:opacity-60">
            <CheckCircle className="w-4 h-4" />
            {createOrder.isPending ? t.placingOrder : t.placeOrder}
          </button>
        </form>

        <div className="md:col-span-2">
          <div className="bg-white rounded-xl border border-border p-4 sticky top-24">
            <h3 className="font-semibold text-foreground mb-3">{t.orderSummary}</h3>
            <div className="space-y-2 max-h-60 overflow-y-auto mb-3">
              {items.map((item) => (
                <div key={item.id} className="flex justify-between text-sm">
                  <span className="text-muted-foreground line-clamp-1 flex-1 mr-2">{item.name} ×{item.quantity}</span>
                  <span className="font-medium flex-shrink-0">{formatPrice(item.price * item.quantity, lang)}</span>
                </div>
              ))}
            </div>
            <div className="border-t border-border pt-3 flex justify-between font-bold">
              <span>{t.total}</span>
              <span className="text-primary">{formatPrice(cart?.totalPrice ?? 0, lang)}</span>
            </div>
            <p className="text-xs text-green-600 mt-2">{t.freeDeliveryIncluded}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
